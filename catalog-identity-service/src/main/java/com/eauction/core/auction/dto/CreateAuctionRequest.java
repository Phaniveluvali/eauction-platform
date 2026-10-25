package com.eauction.core.auction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class CreateAuctionRequest {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Start price is required")
    @DecimalMin(value = "1.00", message = "Start price must be > 0")
    private BigDecimal startPrice;

    @NotNull(message = "Reserve price is required")
    @DecimalMin(value = "1.00", message = "Reserve price must be > 0")
    private BigDecimal reservePrice;

    @NotNull(message = "Minimum bid increment is required")
    @DecimalMin(value = "1.00", message = "Minimum increment must be > 0")
    private BigDecimal minBidIncrement;

    @NotNull(message = "Start time is required")
    private Instant startTime;

    @NotNull(message = "End time is required")
    private Instant endTime;

    private String auctionType = "ONLINE";

    public CreateAuctionRequest() {
    }

    public String getAuctionType() {
        return auctionType != null ? auctionType : "ONLINE";
    }

    public void setAuctionType(String auctionType) {
        this.auctionType = auctionType;
    }

    public UUID getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(UUID vehicleId) {
        this.vehicleId = vehicleId;
    }

    public BigDecimal getStartPrice() {
        return startPrice;
    }

    public void setStartPrice(BigDecimal startPrice) {
        this.startPrice = startPrice;
    }

    public BigDecimal getReservePrice() {
        return reservePrice;
    }

    public void setReservePrice(BigDecimal reservePrice) {
        this.reservePrice = reservePrice;
    }

    public BigDecimal getMinBidIncrement() {
        return minBidIncrement;
    }

    public void setMinBidIncrement(BigDecimal minBidIncrement) {
        this.minBidIncrement = minBidIncrement;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }
}
