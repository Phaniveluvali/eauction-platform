package com.eauction.core.auction.kafka;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.model.Bid;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.auction.repository.BidRepository;
import com.eauction.core.shared.dto.BidEventPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidKafkaConsumerTest {

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private BidRepository bidRepository;

    private ObjectMapper objectMapper;
    private BidKafkaConsumer consumer;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        consumer = new BidKafkaConsumer(auctionRepository, bidRepository, objectMapper);
    }

    @Test
    @DisplayName("Should process valid bid, lock row with pessimistic lock, update auction and write ledger entry")
    void shouldProcessValidBidTransaction() {
        // Arrange
        UUID auctionId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        UUID bidderId = UUID.randomUUID();
        BigDecimal startPrice = new BigDecimal("100000.00");
        BigDecimal minIncrement = new BigDecimal("5000.00");
        BigDecimal currentHighestBid = new BigDecimal("105000.00");
        BigDecimal proposedBid = new BigDecimal("115000.00");

        Auction existingAuction = new Auction();
        existingAuction.setId(auctionId);
        existingAuction.setVehicleId(vehicleId);
        existingAuction.setStartPrice(startPrice);
        existingAuction.setReservePrice(new BigDecimal("150000.00"));
        existingAuction.setMinBidIncrement(minIncrement);
        existingAuction.setCurrentHighestBid(currentHighestBid);
        existingAuction.setStatus("ACTIVE");
        existingAuction.setStartTime(Instant.now().minus(1, ChronoUnit.HOURS));
        existingAuction.setEndTime(Instant.now().plus(1, ChronoUnit.HOURS));

        when(auctionRepository.findByIdWithPessimisticLock(auctionId)).thenReturn(Optional.of(existingAuction));

        BidEventPayload payload = new BidEventPayload(
                UUID.randomUUID(),
                auctionId,
                bidderId,
                proposedBid,
                System.currentTimeMillis()
        );

        // Act
        consumer.processBidTransaction(payload);

        // Assert
        assertEquals(proposedBid, existingAuction.getCurrentHighestBid());
        assertEquals(bidderId, existingAuction.getHighestBidderId());
        verify(auctionRepository, times(1)).save(existingAuction);

        ArgumentCaptor<Bid> bidCaptor = ArgumentCaptor.forClass(Bid.class);
        verify(bidRepository, times(1)).save(bidCaptor.capture());

        Bid recordedBid = bidCaptor.getValue();
        assertEquals(auctionId, recordedBid.getAuctionId());
        assertEquals(bidderId, recordedBid.getBidderId());
        assertEquals(proposedBid, recordedBid.getBidAmount());
        assertEquals("ACCEPTED", recordedBid.getStatus());
    }

    @Test
    @DisplayName("Should reject bid and record REJECTED ledger line when bid amount is below minimum increment")
    void shouldRejectBidWhenAmountIsTooLow() {
        UUID auctionId = UUID.randomUUID();
        UUID bidderId = UUID.randomUUID();

        Auction existingAuction = new Auction();
        existingAuction.setId(auctionId);
        existingAuction.setVehicleId(UUID.randomUUID());
        existingAuction.setStartPrice(new BigDecimal("100000.00"));
        existingAuction.setMinBidIncrement(new BigDecimal("5000.00"));
        existingAuction.setCurrentHighestBid(new BigDecimal("105000.00"));
        existingAuction.setStatus("ACTIVE");
        existingAuction.setStartTime(Instant.now().minus(1, ChronoUnit.HOURS));
        existingAuction.setEndTime(Instant.now().plus(1, ChronoUnit.HOURS));

        when(auctionRepository.findByIdWithPessimisticLock(auctionId)).thenReturn(Optional.of(existingAuction));

        // Proposed bid is 108000, but required is 105000 + 5000 = 110000
        BidEventPayload payload = new BidEventPayload(
                UUID.randomUUID(),
                auctionId,
                bidderId,
                new BigDecimal("108000.00"),
                System.currentTimeMillis()
        );

        consumer.processBidTransaction(payload);

        // Auction state must NOT be modified
        assertEquals(new BigDecimal("105000.00"), existingAuction.getCurrentHighestBid());
        verify(auctionRepository, never()).save(existingAuction);

        ArgumentCaptor<Bid> bidCaptor = ArgumentCaptor.forClass(Bid.class);
        verify(bidRepository, times(1)).save(bidCaptor.capture());
        assertEquals("REJECTED_BID_TOO_LOW", bidCaptor.getValue().getStatus());
    }
}
