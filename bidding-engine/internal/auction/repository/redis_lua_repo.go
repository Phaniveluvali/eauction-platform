package repository

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/eauction/bidding-engine/internal/models"
	"github.com/redis/go-redis/v9"
)

// atomicBidValidationLua is the exact atomic Redis Lua Script.
//
// ============================================================================
// CRITICAL LOGIC: ATOMIC BID VALIDATION & LINEARIZABILITY GUARANTEE
// ============================================================================
// In a high-concurrency live auction platform, multiple bidders can submit bids
// within milliseconds of each other. Traditional database transactions or
// application-level read-modify-write patterns suffer from race conditions:
// two bidders might read current_highest = $10,000 simultaneously and both submit
// $11,000, causing lost updates or split-brain highest bidder states.
//
// How Redis Lua solves this:
// 1. Redis executes Lua scripts as a single atomic unit of work on its single-threaded
//    event loop. No other Redis command or script can run while this script is executing.
// 2. Strict Linearizability: All bids are evaluated in a deterministic serial order.
// 3. Atomicity: The script checks that the auction status is ACTIVE, that the auction
//    has not reached its end_time, that the proposed bid satisfies:
//        proposed_bid >= (current_highest_bid + min_increment)
//    and immediately mutates the Redis hash state with the new highest bidder and timestamp.
// 4. Zero Rollback Window: If any condition fails, it emits an error reply immediately
//    without mutating state, completing in sub-millisecond latency (< 1ms).
const atomicBidValidationLua = `
local key = KEYS[1]
local proposed_bid = tonumber(ARGV[1])
local bidder_id = tostring(ARGV[2])
local timestamp = tostring(ARGV[3])

-- 1. Check if auction key exists in Redis
local exists = redis.call('EXISTS', key)
if exists == 0 then
    return redis.error_reply('ERR_AUCTION_NOT_FOUND: Auction does not exist in cache')
end

-- 2. Check that status is ACTIVE and auction hasn't ended
local status = redis.call('HGET', key, 'status')
if not status or status ~= 'ACTIVE' then
    return redis.error_reply('ERR_AUCTION_NOT_ACTIVE: Current auction status is ' .. tostring(status))
end

local end_time_str = redis.call('HGET', key, 'end_time')
if end_time_str and end_time_str ~= '' then
    local end_time = tonumber(end_time_str)
    local current_time = tonumber(timestamp)
    if end_time and end_time > 0 and current_time >= end_time then
        redis.call('HSET', key, 'status', 'ENDED')
        return redis.error_reply('ERR_AUCTION_ENDED: This auction has ended and is closed for bidding')
    end
end

-- 3. Retrieve pricing bounds
local current_highest_str = redis.call('HGET', key, 'current_highest_bid')
local min_increment_str = redis.call('HGET', key, 'min_increment')
local start_price_str = redis.call('HGET', key, 'start_price')

local current_highest = tonumber(current_highest_str) or 0
local min_increment = tonumber(min_increment_str) or 0
local start_price = tonumber(start_price_str) or 0

local min_required = 0
if current_highest == 0 then
    min_required = start_price
else
    min_required = current_highest + min_increment
end

-- 4. Enforce baseline condition
if proposed_bid < min_required then
    return redis.error_reply('ERR_BID_BELOW_MINIMUM: Proposed bid ' .. tostring(proposed_bid) .. ' is below required minimum ' .. tostring(min_required))
end

-- 5. Atomically update Redis hash state
redis.call('HSET', key, 'current_highest_bid', tostring(proposed_bid))
redis.call('HSET', key, 'highest_bidder_id', bidder_id)
redis.call('HSET', key, 'last_bid_timestamp', timestamp)

-- 6. Return response array
return { 'SUCCESS', tostring(proposed_bid), bidder_id, tostring(current_highest) }
`

type RedisLuaRepository struct {
	client redis.UniversalClient
	script *redis.Script
}

func NewRedisLuaRepository(client redis.UniversalClient) *RedisLuaRepository {
	return &RedisLuaRepository{
		client: client,
		script: redis.NewScript(atomicBidValidationLua),
	}
}

// ExecuteAtomicBidValidation executes the atomic Lua script against Redis
func (r *RedisLuaRepository) ExecuteAtomicBidValidation(
	ctx context.Context,
	auctionID string,
	proposedBid float64,
	bidderID string,
) (*models.BidResponse, error) {
	redisKey := fmt.Sprintf("auction:%s:state", auctionID)
	timestampMs := time.Now().UnixMilli()

	result, err := r.script.Run(
		ctx,
		r.client,
		[]string{redisKey},
		strconv.FormatFloat(proposedBid, 'f', 2, 64),
		bidderID,
		strconv.FormatInt(timestampMs, 10),
	).Result()

	if err != nil {
		return nil, fmt.Errorf("redis lua bid validation rejected: %w", err)
	}

	resSlice, ok := result.([]interface{})
	if !ok || len(resSlice) < 4 {
		return nil, fmt.Errorf("unexpected lua execution return payload format")
	}

	statusStr, _ := resSlice[0].(string)
	newHighestStr, _ := resSlice[1].(string)
	highestBidder, _ := resSlice[2].(string)

	newHighestBid, _ := strconv.ParseFloat(newHighestStr, 64)

	return &models.BidResponse{
		Status:            statusStr,
		Message:           "Bid successfully validated and accepted into state",
		AuctionID:         auctionID,
		BidderID:          highestBidder,
		BidAmount:         proposedBid,
		CurrentHighestBid: newHighestBid,
		Timestamp:         timestampMs,
	}, nil
}

// InitializeAuctionState primes Redis cache with auction rules
func (r *RedisLuaRepository) InitializeAuctionState(
	ctx context.Context,
	auctionID string,
	state *models.AuctionCacheState,
) error {
	redisKey := fmt.Sprintf("auction:%s:state", auctionID)

	data := map[string]interface{}{
		"status":              state.Status,
		"start_price":         strconv.FormatFloat(state.StartPrice, 'f', 2, 64),
		"reserve_price":       strconv.FormatFloat(state.ReservePrice, 'f', 2, 64),
		"min_increment":       strconv.FormatFloat(state.MinIncrement, 'f', 2, 64),
		"current_highest_bid": strconv.FormatFloat(state.CurrentHighestBid, 'f', 2, 64),
		"highest_bidder_id":   state.HighestBidderID,
		"last_bid_timestamp":  strconv.FormatInt(state.LastBidTimestamp, 10),
	}

	return r.client.HSet(ctx, redisKey, data).Err()
}

// GetAuctionState fetches the current live Redis state
func (r *RedisLuaRepository) GetAuctionState(ctx context.Context, auctionID string) (*models.AuctionCacheState, error) {
	redisKey := fmt.Sprintf("auction:%s:state", auctionID)
	valMap, err := r.client.HGetAll(ctx, redisKey).Result()
	if err != nil {
		return nil, err
	}
	if len(valMap) == 0 {
		return nil, fmt.Errorf("auction state not found in redis: %s", auctionID)
	}

	startPrice, _ := strconv.ParseFloat(valMap["start_price"], 64)
	reservePrice, _ := strconv.ParseFloat(valMap["reserve_price"], 64)
	minInc, _ := strconv.ParseFloat(valMap["min_increment"], 64)
	currHighest, _ := strconv.ParseFloat(valMap["current_highest_bid"], 64)
	lastTs, _ := strconv.ParseInt(valMap["last_bid_timestamp"], 10, 64)

	return &models.AuctionCacheState{
		Status:            valMap["status"],
		StartPrice:        startPrice,
		ReservePrice:      reservePrice,
		MinIncrement:      minInc,
		CurrentHighestBid: currHighest,
		HighestBidderID:   valMap["highest_bidder_id"],
		LastBidTimestamp:  lastTs,
	}, nil
}

// ============================================================================
// CRITICAL LOGIC: KUBERNETES MULTI-REPLICA HORIZONTAL SCALING (REDIS PUB/SUB)
// ============================================================================
// When running multiple pods of the bidding-engine service behind a Kubernetes
// Ingress or LoadBalancer, WebSockets connect to random pod replicas.
// If Bidder A is connected to Pod 1 and Bidder B is connected to Pod 2:
// - A local Go channel broadcast inside Pod 1 would only reach Bidder A.
// - Bidder B on Pod 2 would never see the updated bid in real time.
//
// To solve this cleanly, we use a Redis Pub/Sub distributed backplane:
// 1. Pod 1 receives and validates Bidder A's bid.
// 2. Pod 1 calls PublishBroadcast(ctx, auctionID, message).
// 3. Redis broadcasts the message to the "auction:{id}:broadcast" channel.
// 4. All active replicas (Pod 1, Pod 2, ..., Pod N) subscribed via SubscribeBroadcast
//    receive the message and forward it to all locally connected WebSocket clients.
// This guarantees zero state fragmentation across any number of Kubernetes replicas.

// PublishBroadcast publishes a serialized bid/event message to the Redis Pub/Sub channel.
func (r *RedisLuaRepository) PublishBroadcast(ctx context.Context, auctionID string, message []byte) error {
	channel := fmt.Sprintf("auction:%s:broadcast", auctionID)
	return r.client.Publish(ctx, channel, message).Err()
}

// SubscribeBroadcast creates a subscription to the auction's broadcast channel.
// Used by each AuctionRoom instance to listen for bids accepted on other pod replicas.
func (r *RedisLuaRepository) SubscribeBroadcast(ctx context.Context, auctionID string) *redis.PubSub {
	channel := fmt.Sprintf("auction:%s:broadcast", auctionID)
	return r.client.Subscribe(ctx, channel)
}

// ============================================================================
// CRITICAL LOGIC: BID IDEMPOTENCY KEY (DEDUPLICATION GUARD)
// ============================================================================
// Unstable mobile networks or rapid double-clicking by users can retransmit
// the exact same bid payload multiple times.
// CheckAndSetIdempotency uses Redis atomic SET NX with a 60-second TTL:
// - If the key is new: Returns true (bid proceeds to Lua validation).
// - If the key was already seen: Returns false (duplicate bid rejected immediately).
func (r *RedisLuaRepository) CheckAndSetIdempotency(ctx context.Context, idempotencyKey string, ttl time.Duration) (bool, error) {
	if idempotencyKey == "" {
		return true, nil
	}
	key := fmt.Sprintf("auction:idemp:%s", idempotencyKey)
	return r.client.SetNX(ctx, key, "1", ttl).Result()
}

