package com.eauction.core.notification.dto;

import java.time.Instant;

public class NotificationSettingsDto {
    private boolean globalEnabled;
    private boolean emailEnabled;
    private boolean smsEnabled;
    private boolean whatsappEnabled;
    private boolean auctionStartedEnabled;
    private boolean auctionClosingSoonEnabled;
    private boolean outbidEnabled;
    private boolean auctionWonEnabled;
    private Instant updatedAt;
    private String updatedBy;

    public NotificationSettingsDto() {
    }

    public NotificationSettingsDto(boolean globalEnabled, boolean emailEnabled, boolean smsEnabled,
                                 boolean whatsappEnabled, boolean auctionStartedEnabled,
                                 boolean auctionClosingSoonEnabled, boolean outbidEnabled,
                                 boolean auctionWonEnabled, Instant updatedAt, String updatedBy) {
        this.globalEnabled = globalEnabled;
        this.emailEnabled = emailEnabled;
        this.smsEnabled = smsEnabled;
        this.whatsappEnabled = whatsappEnabled;
        this.auctionStartedEnabled = auctionStartedEnabled;
        this.auctionClosingSoonEnabled = auctionClosingSoonEnabled;
        this.outbidEnabled = outbidEnabled;
        this.auctionWonEnabled = auctionWonEnabled;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
    }

    public boolean isGlobalEnabled() {
        return globalEnabled;
    }

    public void setGlobalEnabled(boolean globalEnabled) {
        this.globalEnabled = globalEnabled;
    }

    public boolean isEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }

    public boolean isSmsEnabled() {
        return smsEnabled;
    }

    public void setSmsEnabled(boolean smsEnabled) {
        this.smsEnabled = smsEnabled;
    }

    public boolean isWhatsappEnabled() {
        return whatsappEnabled;
    }

    public void setWhatsappEnabled(boolean whatsappEnabled) {
        this.whatsappEnabled = whatsappEnabled;
    }

    public boolean isAuctionStartedEnabled() {
        return auctionStartedEnabled;
    }

    public void setAuctionStartedEnabled(boolean auctionStartedEnabled) {
        this.auctionStartedEnabled = auctionStartedEnabled;
    }

    public boolean isAuctionClosingSoonEnabled() {
        return auctionClosingSoonEnabled;
    }

    public void setAuctionClosingSoonEnabled(boolean auctionClosingSoonEnabled) {
        this.auctionClosingSoonEnabled = auctionClosingSoonEnabled;
    }

    public boolean isOutbidEnabled() {
        return outbidEnabled;
    }

    public void setOutbidEnabled(boolean outbidEnabled) {
        this.outbidEnabled = outbidEnabled;
    }

    public boolean isAuctionWonEnabled() {
        return auctionWonEnabled;
    }

    public void setAuctionWonEnabled(boolean auctionWonEnabled) {
        this.auctionWonEnabled = auctionWonEnabled;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
