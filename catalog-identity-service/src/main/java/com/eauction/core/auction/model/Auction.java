package com.eauction.core.auction.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Vehicle ID cannot be null")
    @Column(name = "vehicle_id", nullable = false, unique = true)
    private UUID vehicleId;

    @NotNull(message = "Start price cannot be null")
    @DecimalMin(value = "1.00", message = "Start price must be greater than 0")
    @Column(name = "start_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal startPrice;

    @NotNull(message = "Reserve price cannot be null")
    @DecimalMin(value = "1.00", message = "Reserve price must be greater than 0")
    @Column(name = "reserve_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal reservePrice;

    @NotNull(message = "Minimum bid increment cannot be null")
    @DecimalMin(value = "1.00", message = "Minimum increment must be greater than 0")
    @Column(name = "min_bid_increment", nullable = false, precision = 15, scale = 2)
    private BigDecimal minBidIncrement;

    @NotNull
    @Column(name = "current_highest_bid", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentHighestBid = BigDecimal.ZERO;

    @Column(name = "highest_bidder_id")
    private UUID highestBidderId;

    @NotNull(message = "Start time cannot be null")
    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @NotNull(message = "End time cannot be null")
    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @NotBlank(message = "Status cannot be blank")
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, ACTIVE, ENDED, CANCELLED

    @Column(name = "auction_type", length = 50)
    private String auctionType = "ONLINE"; // ONLINE, SILENT

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Auction() {
    }

    public Auction(UUID id, UUID vehicleId, BigDecimal startPrice, BigDecimal reservePrice,
                   BigDecimal minBidIncrement, BigDecimal currentHighestBid, UUID highestBidderId,
                   Instant startTime, Instant endTime, String status, Long version,
                   Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.startPrice = startPrice;
        this.reservePrice = reservePrice;
        this.minBidIncrement = minBidIncrement;
        this.currentHighestBid = currentHighestBid != null ? currentHighestBid : BigDecimal.ZERO;
        this.highestBidderId = highestBidderId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status != null ? status : "PENDING";
        this.version = version != null ? version : 0L;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.currentHighestBid == null) {
            this.currentHighestBid = BigDecimal.ZERO;
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.version == null) {
            this.version = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public BigDecimal getCurrentHighestBid() {
        return currentHighestBid;
    }

    public void setCurrentHighestBid(BigDecimal currentHighestBid) {
        this.currentHighestBid = currentHighestBid;
    }

    public UUID getHighestBidderId() {
        return highestBidderId;
    }

    public void setHighestBidderId(UUID highestBidderId) {
        this.highestBidderId = highestBidderId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAuctionType() {
        return auctionType != null ? auctionType : "ONLINE";
    }

    public void setAuctionType(String auctionType) {
        this.auctionType = auctionType != null ? auctionType : "ONLINE";
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Auction auction = (Auction) o;
        return Objects.equals(id, auction.id) && Objects.equals(vehicleId, auction.vehicleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, vehicleId);
    }

    @Override
    public String toString() {
        return "Auction{" +
                "id=" + id +
                ", vehicleId=" + vehicleId +
                ", startPrice=" + startPrice +
                ", reservePrice=" + reservePrice +
                ", minBidIncrement=" + minBidIncrement +
                ", currentHighestBid=" + currentHighestBid +
                ", highestBidderId=" + highestBidderId +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", status='" + status + '\'' +
                ", version=" + version +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
