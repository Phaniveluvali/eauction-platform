package com.eauction.core.shared.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class PaymentEventPayload implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "Payment ID cannot be null")
    private UUID paymentId;

    @NotNull(message = "Auction ID cannot be null")
    private UUID auctionId;

    @NotNull(message = "Payer ID cannot be null")
    private UUID payerId;

    @NotBlank(message = "Gateway cannot be blank")
    private String gateway;

    @NotBlank(message = "Gateway order ID cannot be blank")
    private String gatewayOrderId;

    private String gatewayPaymentId;

    private String gatewaySignature;

    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Currency cannot be blank")
    private String currency;

    @NotBlank(message = "Status cannot be blank")
    private String status;

    @NotNull(message = "Timestamp cannot be null")
    private Long timestamp;

    public PaymentEventPayload() {
    }

    @JsonCreator
    public PaymentEventPayload(
            @JsonProperty("paymentId") UUID paymentId,
            @JsonProperty("auctionId") UUID auctionId,
            @JsonProperty("payerId") UUID payerId,
            @JsonProperty("gateway") String gateway,
            @JsonProperty("gatewayOrderId") String gatewayOrderId,
            @JsonProperty("gatewayPaymentId") String gatewayPaymentId,
            @JsonProperty("gatewaySignature") String gatewaySignature,
            @JsonProperty("amount") BigDecimal amount,
            @JsonProperty("currency") String currency,
            @JsonProperty("status") String status,
            @JsonProperty("timestamp") Long timestamp) {
        this.paymentId = paymentId;
        this.auctionId = auctionId;
        this.payerId = payerId;
        this.gateway = gateway;
        this.gatewayOrderId = gatewayOrderId;
        this.gatewayPaymentId = gatewayPaymentId;
        this.gatewaySignature = gatewaySignature;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.timestamp = timestamp;
    }

    public UUID getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(UUID paymentId) {
        this.paymentId = paymentId;
    }

    public UUID getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(UUID auctionId) {
        this.auctionId = auctionId;
    }

    public UUID getPayerId() {
        return payerId;
    }

    public void setPayerId(UUID payerId) {
        this.payerId = payerId;
    }

    public String getGateway() {
        return gateway;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public String getGatewayOrderId() {
        return gatewayOrderId;
    }

    public void setGatewayOrderId(String gatewayOrderId) {
        this.gatewayOrderId = gatewayOrderId;
    }

    public String getGatewayPaymentId() {
        return gatewayPaymentId;
    }

    public void setGatewayPaymentId(String gatewayPaymentId) {
        this.gatewayPaymentId = gatewayPaymentId;
    }

    public String getGatewaySignature() {
        return gatewaySignature;
    }

    public void setGatewaySignature(String gatewaySignature) {
        this.gatewaySignature = gatewaySignature;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
        PaymentEventPayload that = (PaymentEventPayload) o;
        return Objects.equals(paymentId, that.paymentId) &&
                Objects.equals(auctionId, that.auctionId) &&
                Objects.equals(payerId, that.payerId) &&
                Objects.equals(gateway, that.gateway) &&
                Objects.equals(gatewayOrderId, that.gatewayOrderId) &&
                Objects.equals(gatewayPaymentId, that.gatewayPaymentId) &&
                Objects.equals(gatewaySignature, that.gatewaySignature) &&
                Objects.equals(amount, that.amount) &&
                Objects.equals(currency, that.currency) &&
                Objects.equals(status, that.status) &&
                Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(paymentId, auctionId, payerId, gateway, gatewayOrderId, gatewayPaymentId, gatewaySignature, amount, currency, status, timestamp);
    }

    @Override
    public String toString() {
        return "PaymentEventPayload{" +
                "paymentId=" + paymentId +
                ", auctionId=" + auctionId +
                ", payerId=" + payerId +
                ", gateway='" + gateway + '\'' +
                ", gatewayOrderId='" + gatewayOrderId + '\'' +
                ", gatewayPaymentId='" + gatewayPaymentId + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", status='" + status + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
