package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/eauction/bidding-engine/internal/auction/handler"
	"github.com/eauction/bidding-engine/internal/auction/repository"
	"github.com/eauction/bidding-engine/internal/config"
	"github.com/eauction/bidding-engine/internal/models"
	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)

func main() {
	log.Println("[Bidding Engine] Initializing vehicle e-auction bidding core...")

	// 1. Load Environment Configuration
	cfg := config.LoadConfig()
	log.Printf("[Config] ServerPort: %s | RedisAddr: %s | KafkaBrokers: %v | KafkaTopic: %s",
		cfg.ServerPort, cfg.RedisAddr, cfg.KafkaBrokers, cfg.KafkaTopic)

	// 2. Initialize Redis Connection (HA Sentinel or Standalone with High-Concurrency Pool)
	var rdb redis.UniversalClient
	if len(cfg.RedisSentinelAddrs) > 0 && cfg.RedisSentinelAddrs[0] != "" {
		log.Printf("[Redis-HA] Initializing Sentinel Failover Client for Master: %s | Sentinels: %v",
			cfg.RedisMasterName, cfg.RedisSentinelAddrs)
		rdb = redis.NewFailoverClient(&redis.FailoverOptions{
			MasterName:    cfg.RedisMasterName,
			SentinelAddrs: cfg.RedisSentinelAddrs,
			Password:      cfg.RedisPassword,
			DB:            cfg.RedisDB,
			PoolSize:      100,
			MinIdleConns:  25,
			MaxRetries:    3,
			DialTimeout:   3 * time.Second,
			ReadTimeout:   2 * time.Second,
			WriteTimeout:  2 * time.Second,
			PoolTimeout:   4 * time.Second,
		})
	} else {
		log.Printf("[Redis] Initializing Standalone Client at: %s with 100-connection pool", cfg.RedisAddr)
		rdb = redis.NewClient(&redis.Options{
			Addr:         cfg.RedisAddr,
			Password:     cfg.RedisPassword,
			DB:           cfg.RedisDB,
			PoolSize:     100,
			MinIdleConns: 25,
			MaxRetries:   3,
			DialTimeout:  3 * time.Second,
			ReadTimeout:  2 * time.Second,
			WriteTimeout: 2 * time.Second,
			PoolTimeout:  4 * time.Second,
		})
	}

	rCtx, rCancel := context.WithTimeout(context.Background(), 5*time.Second)
	if err := rdb.Ping(rCtx).Err(); err != nil {
		log.Printf("[WARNING] Redis ping failed (may still be starting up): %v", err)
	} else {
		log.Println("[Redis] Connection successfully verified!")
	}
	rCancel()

	// 3. Initialize Kafka Writer for "vehicle-bids-topic"
	kafkaWriter := &kafka.Writer{
		Addr:         kafka.TCP(cfg.KafkaBrokers...),
		Topic:        cfg.KafkaTopic,
		Balancer:     &kafka.LeastBytes{},
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
		RequiredAcks: kafka.RequireOne,
	}

	// 4. Construct Repository & Domain Handler Hub
	redisRepo := repository.NewRedisLuaRepository(rdb)
	hub := handler.NewHub(redisRepo, kafkaWriter, cfg.JWTSecret)

	// 5. Setup HTTP Router & Middleware
	mux := http.NewServeMux()

	// WebSocket endpoints
	mux.HandleFunc("/ws", hub.HandleWebSocketConnection)
	mux.HandleFunc("/ws/auction/", hub.HandleWebSocketConnection)

	// Liveness & Readiness probe
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "UP",
			"service":   "bidding-engine",
			"timestamp": time.Now().UnixMilli(),
		})
	})

	// Auxiliary endpoint for priming auction cache in Redis directly
	mux.HandleFunc("/api/v1/cache/prime", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			AuctionID         string  `json:"auctionId"`
			Status            string  `json:"status"`
			StartPrice        float64 `json:"startPrice"`
			ReservePrice      float64 `json:"reservePrice"`
			MinIncrement      float64 `json:"minIncrement"`
			CurrentHighestBid float64 `json:"currentHighestBid"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		state := &models.AuctionCacheState{
			Status:            req.Status,
			StartPrice:        req.StartPrice,
			ReservePrice:      req.ReservePrice,
			MinIncrement:      req.MinIncrement,
			CurrentHighestBid: req.CurrentHighestBid,
			HighestBidderID:   "",
			LastBidTimestamp:  time.Now().UnixMilli(),
		}

		if err := redisRepo.InitializeAuctionState(r.Context(), req.AuctionID, state); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message":   "Auction state primed in Redis",
			"auctionId": req.AuctionID,
		})
	})

	server := &http.Server{
		Addr:         ":" + cfg.ServerPort,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 6. Start Server in Background
	go func() {
		log.Printf("[Bidding Engine] Listening and serving WebSocket traffic on :%s", cfg.ServerPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to listen: %v", err)
		}
	}()

	// 7. Graceful Shutdown Listener
	stopSignal := make(chan os.Signal, 1)
	signal.Notify(stopSignal, os.Interrupt, syscall.SIGTERM)
	<-stopSignal

	log.Println("[Bidding Engine] Initiating graceful termination sequence...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced shutdown error: %v", err)
	}

	if err := kafkaWriter.Close(); err != nil {
		log.Printf("Kafka writer shutdown error: %v", err)
	}

	if err := rdb.Close(); err != nil {
		log.Printf("Redis client shutdown error: %v", err)
	}

	log.Println("[Bidding Engine] Microservice safely terminated.")
}
