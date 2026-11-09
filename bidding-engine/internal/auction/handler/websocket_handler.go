package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/eauction/bidding-engine/internal/auction/repository"
	"github.com/eauction/bidding-engine/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/segmentio/kafka-go"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  2048,
	WriteBufferSize: 2048,
	CheckOrigin: func(r *http.Request) bool {
		return true // Configured for CORS-agnostic reverse proxy deployment
	},
}

// Client represents an authenticated active WebSocket connection
type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	send      chan []byte
	auctionID string
	claims    *models.UserClaims
	mu        sync.Mutex
	isClosed  bool
}

// AuctionRoom manages state and broadcast propagation for a specific auction instance
type AuctionRoom struct {
	auctionID  string
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	cancelSub  context.CancelFunc
	mu         sync.RWMutex
}

func newAuctionRoom(auctionID string) *AuctionRoom {
	return &AuctionRoom{
		auctionID:  auctionID,
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (r *AuctionRoom) subscribeRedisBackplane(ctx context.Context, subscriber BroadcastSubscriber) {
	pubsub := subscriber.SubscribeBroadcast(ctx, r.auctionID)
	defer pubsub.Close()

	ch := pubsub.Channel()
	log.Printf("[Room %s] Subscribed to Redis Pub/Sub backplane channel: auction:%s:broadcast", r.auctionID, r.auctionID)

	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}
			if msg != nil && len(msg.Payload) > 0 {
				r.broadcast <- []byte(msg.Payload)
			}
		}
	}
}

func (r *AuctionRoom) run(ctx context.Context, onEmpty func(string)) {
	for {
		select {
		case <-ctx.Done():
			r.mu.Lock()
			for client := range r.clients {
				close(client.send)
				delete(r.clients, client)
			}
			r.mu.Unlock()
			return

		case client := <-r.register:
			r.mu.Lock()
			r.clients[client] = true
			r.mu.Unlock()
			log.Printf("[Room %s] Client connected (User: %s). Total active in room: %d",
				r.auctionID, client.claims.UserID, len(r.clients))

		case client := <-r.unregister:
			r.mu.Lock()
			if _, ok := r.clients[client]; ok {
				delete(r.clients, client)
				client.close()
				log.Printf("[Room %s] Client disconnected (User: %s). Remaining: %d",
					r.auctionID, client.claims.UserID, len(r.clients))
			}
			empty := len(r.clients) == 0
			r.mu.Unlock()

			if empty && onEmpty != nil {
				onEmpty(r.auctionID)
			}

		case message := <-r.broadcast:
			r.mu.RLock()
			for client := range r.clients {
				select {
				case client.send <- message:
				default:
					// Slow consumer drop protection
					log.Printf("[Room %s] Dropping slow consumer: %s", r.auctionID, client.claims.UserID)
					client.close()
					delete(r.clients, client)
				}
			}
			r.mu.RUnlock()
		}
	}
}

// Hub manages multi-auction rooms and global message distribution via abstracted interfaces (DIP)
type Hub struct {
	rooms        map[string]*AuctionRoom
	roomsMu      sync.RWMutex
	biddingStore BiddingStore
	subscriber   BroadcastSubscriber
	eventStream  EventStreamProducer
	jwtSecret    []byte
	ctx          context.Context
	cancel       context.CancelFunc
}

// NewHub preserves backward compatibility while injecting interface contracts
func NewHub(redisRepo *repository.RedisLuaRepository, kafkaWriter *kafka.Writer, jwtSecret string) *Hub {
	return NewHubWithDependencies(redisRepo, redisRepo, NewKafkaProducerAdapter(kafkaWriter), jwtSecret)
}

// NewHubWithDependencies implements Dependency Inversion Principle
func NewHubWithDependencies(store BiddingStore, subscriber BroadcastSubscriber, eventStream EventStreamProducer, jwtSecret string) *Hub {
	ctx, cancel := context.WithCancel(context.Background())
	return &Hub{
		rooms:        make(map[string]*AuctionRoom),
		biddingStore: store,
		subscriber:   subscriber,
		eventStream:  eventStream,
		jwtSecret:    []byte(jwtSecret),
		ctx:          ctx,
		cancel:       cancel,
	}
}

func (h *Hub) getOrCreateRoom(auctionID string) *AuctionRoom {
	h.roomsMu.Lock()
	defer h.roomsMu.Unlock()

	room, exists := h.rooms[auctionID]
	if !exists {
		roomCtx, cancelSub := context.WithCancel(h.ctx)
		room = &AuctionRoom{
			auctionID:  auctionID,
			clients:    make(map[*Client]bool),
			broadcast:  make(chan []byte, 256),
			register:   make(chan *Client),
			unregister: make(chan *Client),
			cancelSub:  cancelSub,
		}
		h.rooms[auctionID] = room

		// Start distributed Redis Pub/Sub subscription for multi-replica Kubernetes synchronization
		go room.subscribeRedisBackplane(roomCtx, h.subscriber)

		go room.run(roomCtx, func(id string) {
			h.roomsMu.Lock()
			if r, ok := h.rooms[id]; ok {
				if r.cancelSub != nil {
					r.cancelSub()
				}
				delete(h.rooms, id)
			}
			h.roomsMu.Unlock()
			log.Printf("[Hub] Garbage-collected empty room and Redis subscriber for auction: %s", id)
		})
	}
	return room
}

// AuthenticateToken strictly verifies the shared HS256 JWT signature and extracts claims
func (h *Hub) AuthenticateToken(tokenString string) (*models.UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &models.UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return h.jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("jwt parsing/verification error: %w", err)
	}

	claims, ok := token.Claims.(*models.UserClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// HandleWebSocketConnection handles socket upgrades, authentication, and client lifecycles
func (h *Hub) HandleWebSocketConnection(w http.ResponseWriter, r *http.Request) {
	// 1. Strictly extract token from HTTP 'Authorization: Bearer <token>' header
	authHeader := r.Header.Get("Authorization")
	var tokenStr string

	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		// Fallback: check query parameter or Sec-WebSocket-Protocol for browser WS clients
		tokenStr = r.URL.Query().Get("token")
		if tokenStr == "" {
			tokenStr = r.Header.Get("Sec-WebSocket-Protocol")
		}
	}

	var claims *models.UserClaims
	if tokenStr != "" {
		c, err := h.AuthenticateToken(tokenStr)
		if err != nil {
			log.Printf("[WebSocket] Token authentication failed (%v), connecting as spectator", err)
			claims = &models.UserClaims{UserID: "spectator", Role: "SPECTATOR"}
		} else {
			claims = c
		}
	} else {
		claims = &models.UserClaims{UserID: "spectator", Role: "SPECTATOR"}
	}

	// 2. Extract auctionID from URL query path or parameter
	auctionID := r.URL.Query().Get("auction_id")
	if auctionID == "" {
		// Alternatively extract from path /ws/auction/{auction_id}
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 3 && parts[1] == "auction" {
			auctionID = parts[2]
		}
	}

	if auctionID == "" {
		http.Error(w, "Bad Request: missing auction_id parameter or path segment", http.StatusBadRequest)
		return
	}

	// 3. Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	room := h.getOrCreateRoom(auctionID)
	client := &Client{
		hub:       h,
		conn:      conn,
		send:      make(chan []byte, 256),
		auctionID: auctionID,
		claims:    claims,
	}

	room.register <- client

	go client.writePump()
	go client.readPump(room)
}

func (c *Client) close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	if !c.isClosed {
		c.isClosed = true
		c.conn.Close()
	}
}

func (c *Client) readPump(room *AuctionRoom) {
	defer func() {
		room.unregister <- c
	}()

	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error on client %s: %v", c.claims.UserID, err)
			}
			break
		}

		c.handleIncomingBid(message, room)
	}
}

func (c *Client) handleIncomingBid(msgBytes []byte, room *AuctionRoom) {
	var bidReq models.BidRequest
	if err := json.Unmarshal(msgBytes, &bidReq); err != nil {
		c.sendErrorResponse("MALFORMED_JSON", "Payload must be valid JSON with 'auctionId' and 'bidAmount'")
		return
	}

	// Ensure the bid request targets the connected auction room
	if bidReq.AuctionID != "" && bidReq.AuctionID != c.auctionID {
		c.sendErrorResponse("AUCTION_MISMATCH", "Submitted auction ID does not match current socket room")
		return
	}

	// Spectators cannot place bids
	if c.claims == nil || c.claims.UserID == "" || c.claims.UserID == "spectator" {
		c.sendErrorResponse("UNAUTHORIZED", "Please sign in as a verified Buyer to submit bids.")
		return
	}

	// 1. Synchronous Cache Check: Execute atomic Redis Lua script
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// =========================================================================
	// STEP 1: IDEMPOTENCY KEY VERIFICATION (DEDUPLICATION GUARD)
	// =========================================================================
	// Protects against accidental double-clicks, mobile network retries, and
	// replay attacks. Atomically checks Redis SET NX with a 60-second TTL.
	if bidReq.IdempotencyKey != "" {
		isNew, err := c.hub.biddingStore.CheckAndSetIdempotency(ctx, bidReq.IdempotencyKey, 60*time.Second)
		if err != nil {
			log.Printf("[Auction %s] Idempotency check error: %v", c.auctionID, err)
		} else if !isNew {
			log.Printf("[Auction %s] Duplicate bid intercepted with idempotency key: %s", c.auctionID, bidReq.IdempotencyKey)
			c.sendErrorResponse("DUPLICATE_BID", "A bid with this idempotency key was already submitted and processed.")
			return
		}
	}

	// =========================================================================
	// STEP 2: SYNCHRONOUS ATOMIC LUA SCRIPT EVALUATION
	// =========================================================================
	// Executes atomic Redis Lua script enforcing ACTIVE status, positive
	// minimum increments (start_price or current_highest + min_increment), and
	// updates current_highest_bid, highest_bidder_id, and last_bid_timestamp.
	bidResponse, err := c.hub.biddingStore.ExecuteAtomicBidValidation(
		ctx,
		c.auctionID,
		bidReq.BidAmount,
		c.claims.UserID,
	)

	if err != nil {
		log.Printf("[Auction %s] Bid validation failed for user %s: %v", c.auctionID, c.claims.UserID, err)
		c.sendErrorResponse("BID_REJECTED", err.Error())
		return
	}

	// =========================================================================
	// STEP 3: ASYNCHRONOUS KAFKA TRANSACTION STREAMING
	// =========================================================================
	// Emits the accepted bid event to Kafka topic "vehicle-bids-topic" for
	// persistence, downstream audit logging, and payment settlement without
	// blocking the real-time WebSocket response loop.
	eventPayload := models.BidEventPayload{
		EventID:   uuid.New().String(),
		AuctionID: c.auctionID,
		BidderID:  c.claims.UserID,
		BidAmount: bidReq.BidAmount,
		Timestamp: bidResponse.Timestamp,
	}

	kafkaBytes, err := json.Marshal(eventPayload)
	if err != nil {
		log.Printf("Failed to serialize kafka bid payload: %v", err)
	} else if c.hub.eventStream != nil {
		go func(data []byte) {
			kCtx, kCancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer kCancel()

			kErr := c.hub.eventStream.WriteMessages(kCtx, kafka.Message{
				Key:   []byte(c.auctionID),
				Value: data,
				Time:  time.Now(),
			})
			if kErr != nil {
				log.Printf("CRITICAL: Failed to push bid to Kafka topic %s: %v", c.hub.eventStream.GetTopic(), kErr)
			} else {
				log.Printf("[Kafka] Produced validated bid event [%s] for auction [%s] to topic [%s]",
					eventPayload.EventID, c.auctionID, c.hub.eventStream.GetTopic())
			}
		}(kafkaBytes)
	}

	// =========================================================================
	// STEP 4: DISTRIBUTED REDIS PUB/SUB BROADCAST ACROSS KUBERNETES REPLICAS
	// =========================================================================
	// Publishes the accepted bid to channel "auction:{auctionID}:broadcast".
	// All running Kubernetes replica pods receive this message and broadcast
	// it down every connected client WebSocket connection.
	broadcastBytes, err := json.Marshal(bidResponse)
	if err == nil {
		pCtx, pCancel := context.WithTimeout(context.Background(), 2*time.Second)
		if pErr := c.hub.biddingStore.PublishBroadcast(pCtx, c.auctionID, broadcastBytes); pErr != nil {
			log.Printf("[Auction %s] Redis publish error: %v, falling back to local broadcast", c.auctionID, pErr)
			room.broadcast <- broadcastBytes
		}
		pCancel()
	}
}

func (c *Client) sendErrorResponse(code, reason string) {
	errResp := models.BidResponse{
		Status:    "REJECTED",
		Message:   fmt.Sprintf("[%s] %s", code, reason),
		AuctionID: c.auctionID,
		Timestamp: time.Now().UnixMilli(),
	}
	bytes, _ := json.Marshal(errResp)
	select {
	case c.send <- bytes:
	default:
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)

			// Drain queued messages into the current frame
			n := len(c.send)
			for i := 0; i < n; i++ {
				_, _ = w.Write([]byte{'\n'})
				_, _ = w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
