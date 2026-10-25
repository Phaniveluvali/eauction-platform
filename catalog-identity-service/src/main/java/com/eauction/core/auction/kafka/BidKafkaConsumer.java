package com.eauction.core.auction.kafka;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.model.Bid;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.auction.repository.BidRepository;
import com.eauction.core.shared.dto.BidEventPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Component
public class BidKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(BidKafkaConsumer.class);

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ObjectMapper objectMapper;

    public BidKafkaConsumer(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            ObjectMapper objectMapper) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "${auction.kafka.topics.bid:vehicle-bids-topic}",
            groupId = "${spring.kafka.consumer.group-id:catalog-identity-consumer-group}"
    )
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void consumeBidEvent(@Payload String messagePayload) {
        log.info("Received raw bid event message from Kafka: {}", messagePayload);
        try {
            BidEventPayload payload = objectMapper.readValue(messagePayload, BidEventPayload.class);
            processBidTransaction(payload);
        } catch (Exception e) {
            log.error("Failed to process bid event payload [{}]: {}", messagePayload, e.getMessage(), e);
            throw new RuntimeException("Error processing Kafka bid event: " + e.getMessage(), e);
        }
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void processBidTransaction(BidEventPayload payload) {
        log.info("Executing SERIALIZABLE transaction for auction ID [{}] with incoming bid [{}] by bidder [{}]",
                payload.getAuctionId(), payload.getBidAmount(), payload.getBidderId());

        // 1. Acquire pessimistic write lock on target auction row (SELECT FOR UPDATE)
        Optional<Auction> lockedAuctionOpt = auctionRepository.findByIdWithPessimisticLock(payload.getAuctionId());
        if (lockedAuctionOpt.isEmpty()) {
            log.error("Auction not found with ID [{}]. Rejecting bid event [{}]", payload.getAuctionId(), payload.getEventId());
            throw new IllegalArgumentException("Auction not found with ID: " + payload.getAuctionId());
        }

        Auction auction = lockedAuctionOpt.get();

        // 2. Validate current auction lifecycle status
        if (!"ACTIVE".equalsIgnoreCase(auction.getStatus())) {
            log.warn("Auction [{}] is not in ACTIVE state (current: {}). Rejecting bid", auction.getId(), auction.getStatus());
            recordRejectedBid(payload, "REJECTED_AUCTION_NOT_ACTIVE");
            return;
        }

        // 3. Validate auction timeframe
        Instant now = Instant.now();
        if (now.isBefore(auction.getStartTime()) || now.isAfter(auction.getEndTime())) {
            log.warn("Auction [{}] is outside of active bidding window. Start: {}, End: {}, Now: {}",
                    auction.getId(), auction.getStartTime(), auction.getEndTime(), now);
            recordRejectedBid(payload, "REJECTED_OUTSIDE_WINDOW");
            return;
        }

        // 4. Validate bid increment baseline: bid must be higher than currentHighest (or >= startPrice if first bid)
        BigDecimal currentHighest = auction.getCurrentHighestBid();
        if (currentHighest == null || currentHighest.compareTo(BigDecimal.ZERO) == 0) {
            if (auction.getStartPrice() != null && payload.getBidAmount().compareTo(auction.getStartPrice()) < 0) {
                log.warn("Bid amount [{}] is below start price [{}] for auction [{}]. Rejecting bid",
                        payload.getBidAmount(), auction.getStartPrice(), auction.getId());
                recordRejectedBid(payload, "REJECTED_BID_TOO_LOW");
                return;
            }
        } else if (payload.getBidAmount().compareTo(currentHighest) <= 0) {
            log.warn("Bid amount [{}] is less than or equal to current highest [{}] for auction [{}]. Rejecting bid",
                    payload.getBidAmount(), currentHighest, auction.getId());
            recordRejectedBid(payload, "REJECTED_BID_TOO_LOW");
            return;
        }

        // 5. Update auction state with the new highest bid and leader
        auction.setCurrentHighestBid(payload.getBidAmount());
        auction.setHighestBidderId(payload.getBidderId());
        auctionRepository.save(auction);

        // 6. Append immutable entry to bids ledger
        Bid acceptedBid = new Bid();
        acceptedBid.setAuctionId(payload.getAuctionId());
        acceptedBid.setBidderId(payload.getBidderId());
        acceptedBid.setBidAmount(payload.getBidAmount());
        acceptedBid.setStatus("ACCEPTED");
        acceptedBid.setCreatedAt(Instant.ofEpochMilli(payload.getTimestamp()));
        bidRepository.save(acceptedBid);

        log.info("Successfully committed SERIALIZABLE bid ledger transaction for auction [{}]! New leader: [{}], Amount: INR [{}]",
                auction.getId(), payload.getBidderId(), payload.getBidAmount());
    }

    private void recordRejectedBid(BidEventPayload payload, String statusReason) {
        log.warn("Recording rejected bid event [{}] for auction [{}]: {}", payload.getEventId(), payload.getAuctionId(), statusReason);
        Bid rejectedBid = new Bid();
        rejectedBid.setAuctionId(payload.getAuctionId());
        rejectedBid.setBidderId(payload.getBidderId());
        rejectedBid.setBidAmount(payload.getBidAmount());
        rejectedBid.setStatus("REJECTED");
        rejectedBid.setCreatedAt(Instant.ofEpochMilli(payload.getTimestamp()));
        bidRepository.save(rejectedBid);
    }
}
