package handler

import (
	"context"
	"time"

	"github.com/eauction/bidding-engine/internal/models"
	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)

// BiddingStore defines contracts for atomic transactional bid execution & deduplication (ISP & DIP)
type BiddingStore interface {
	CheckAndSetIdempotency(ctx context.Context, key string, ttl time.Duration) (bool, error)
	ExecuteAtomicBidValidation(ctx context.Context, auctionID string, proposedBid float64, bidderID string) (*models.BidResponse, error)
	PublishBroadcast(ctx context.Context, auctionID string, message []byte) error
}

// BroadcastSubscriber defines pub/sub real-time cluster broadcast contracts
type BroadcastSubscriber interface {
	SubscribeBroadcast(ctx context.Context, auctionID string) *redis.PubSub
}

// EventStreamProducer defines asynchronous streaming event bus messaging contracts
type EventStreamProducer interface {
	WriteMessages(ctx context.Context, msgs ...kafka.Message) error
	GetTopic() string
}

// KafkaProducerAdapter adapts *kafka.Writer to EventStreamProducer
type KafkaProducerAdapter struct {
	Writer *kafka.Writer
}

func NewKafkaProducerAdapter(w *kafka.Writer) EventStreamProducer {
	if w == nil {
		return nil
	}
	return &KafkaProducerAdapter{Writer: w}
}

func (a *KafkaProducerAdapter) WriteMessages(ctx context.Context, msgs ...kafka.Message) error {
	if a == nil || a.Writer == nil {
		return nil
	}
	return a.Writer.WriteMessages(ctx, msgs...)
}

func (a *KafkaProducerAdapter) GetTopic() string {
	if a == nil || a.Writer == nil {
		return "vehicle-bids-topic"
	}
	return a.Writer.Topic
}
