package models

import (
	"github.com/golang-jwt/jwt/v5"
)

// BidRequest represents an incoming client message over WebSocket
type BidRequest struct {
	AuctionID      string  `json:"auctionId"`
	BidAmount      float64 `json:"bidAmount"`
	IdempotencyKey string  `json:"idempotencyKey,omitempty"`
}

// BidResponse represents the server push payload sent back to WebSocket clients
type BidResponse struct {
	Status            string  `json:"status"` // SUCCESS, REJECTED, ERROR, INFO
	Message           string  `json:"message"`
	AuctionID         string  `json:"auctionId"`
	BidderID          string  `json:"bidderId,omitempty"`
	BidAmount         float64 `json:"bidAmount,omitempty"`
	CurrentHighestBid float64 `json:"currentHighestBid"`
	Timestamp         int64   `json:"timestamp"`
}

// BidEventPayload represents the Kafka event payload aligning with the Java consumer contract
type BidEventPayload struct {
	EventID   string  `json:"eventId"`
	AuctionID string  `json:"auctionId"`
	BidderID  string  `json:"bidderId"`
	BidAmount float64 `json:"bidAmount"`
	Timestamp int64   `json:"timestamp"`
}

// UserClaims models the decoded payload from the shared HS256 JWT
type UserClaims struct {
	jwt.RegisteredClaims
	UserID      string `json:"userId"`
	Role        string `json:"role"`
	KYCVerified bool   `json:"kycVerified"`
	FullName    string `json:"fullName"`
}

// AuctionCacheState represents the data structure stored in Redis hash auction:{id}:state
type AuctionCacheState struct {
	Status            string  `redis:"status"`
	StartPrice        float64 `redis:"start_price"`
	ReservePrice      float64 `redis:"reserve_price"`
	MinIncrement      float64 `redis:"min_increment"`
	CurrentHighestBid float64 `redis:"current_highest_bid"`
	HighestBidderID   string  `redis:"highest_bidder_id"`
	LastBidTimestamp  int64   `redis:"last_bid_timestamp"`
}
