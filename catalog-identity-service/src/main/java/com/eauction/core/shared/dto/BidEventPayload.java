package com.eauction.core.shared.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class BidEventPayload implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "Event ID cannot be null")
    private UUID eventId;

    @NotNull(message = "Auction ID cannot be null")
    private UUID auctionId;

    @NotNull(message = "Bidder ID cannot be null")
    private UUID bidderId;

    @NotNull(message = "Bid amount cannot be null")
    @DecimalMin(value = "0.01", message = "Bid amount must be positive")
    private BigDecimal bidAmount;

    @NotNull(message = "Timestamp cannot be null")
    private Long timestamp;

    public BidEventPayload() {
    }

    @JsonCreator
    public BidEventPayload(
            @JsonProperty("eventId") UUID eventId,
            @JsonProperty("auctionId") UUID auctionId,
            @JsonProperty("bidderId") UUID bidderId,
            @JsonProperty("bidAmount") BigDecimal bidAmount,
            @JsonProperty("timestamp") Long timestamp) {
        this.eventId = eventId;
        this.auctionId = auctionId;
        this.bidderId = bidderId;
        this.bidAmount = bidAmount;
        this.timestamp = timestamp;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public UUID getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(UUID auctionId) {
        this.auctionId = auctionId;
    }

    public UUID getBidderId() {
        return bidderId;
    }

    public void setBidderId(UUID bidderId) {
        this.bidderId = bidderId;
    }

    public BigDecimal getBidAmount() {
        return bidAmount;
    }

    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BidEventPayload that = (BidEventPayload) o;
        return Objects.equals(eventId, that.eventId) &&
                Objects.equals(auctionId, that.auctionId) &&
                Objects.equals(bidderId, that.bidderId) &&
                Objects.equals(bidAmount, that.bidAmount) &&
                Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(eventId, auctionId, bidderId, bidAmount, timestamp);
    }

    @Override
    public String toString() {
        return "BidEventPayload{" +
                "eventId=" + eventId +
                ", auctionId=" + auctionId +
                ", bidderId=" + bidderId +
                ", bidAmount=" + bidAmount +
                ", timestamp=" + timestamp +
                '}';
    }
}
