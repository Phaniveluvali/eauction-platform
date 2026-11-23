package com.eauction.core.notification.service;

import com.eauction.core.notification.dto.NotificationSettingsDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;

@Service
public class NotificationSettingsService {

    private static final Logger log = LoggerFactory.getLogger(NotificationSettingsService.class);

    private final JdbcTemplate jdbcTemplate;
    private volatile NotificationSettingsDto cachedSettings;

    public NotificationSettingsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initSettings();
    }

    private void initSettings() {
        try {
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS notification_settings (" +
                "id VARCHAR(50) PRIMARY KEY DEFAULT 'default', " +
                "global_enabled BOOLEAN NOT NULL DEFAULT FALSE, " +
                "email_enabled BOOLEAN NOT NULL DEFAULT FALSE, " +
                "sms_enabled BOOLEAN NOT NULL DEFAULT FALSE, " +
                "whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE, " +
                "auction_started_enabled BOOLEAN NOT NULL DEFAULT FALSE, " +
                "auction_closing_soon_enabled BOOLEAN NOT NULL DEFAULT FALSE, " +
                "outbid_enabled BOOLEAN NOT NULL DEFAULT FALSE, " +
                "auction_won_enabled BOOLEAN NOT NULL DEFAULT TRUE, " +
                "updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, " +
                "updated_by VARCHAR(100) DEFAULT 'admin');"
            );
            refreshCache();
        } catch (Exception ex) {
            log.warn("[NOTIFICATION SETTINGS] Table initialization warning: {}", ex.getMessage());
            this.cachedSettings = new NotificationSettingsDto(false, false, false, true, false, false, false, true, Instant.now(), "fallback");
        }
    }

    public synchronized NotificationSettingsDto refreshCache() {
        try {
            NotificationSettingsDto settings = jdbcTemplate.query(
                "SELECT global_enabled, email_enabled, sms_enabled, whatsapp_enabled, " +
                "auction_started_enabled, auction_closing_soon_enabled, outbid_enabled, auction_won_enabled, " +
                "updated_at, updated_by FROM notification_settings WHERE id = 'default'",
                this::mapRowToDto
            );
            if (settings != null) {
                this.cachedSettings = settings;
                return settings;
            }
        } catch (Exception ex) {
            log.error("[NOTIFICATION SETTINGS] Error reading settings: {}", ex.getMessage());
        }
        if (this.cachedSettings == null) {
            this.cachedSettings = new NotificationSettingsDto(false, false, false, true, false, false, false, true, Instant.now(), "default");
        }
        return this.cachedSettings;
    }

    private NotificationSettingsDto mapRowToDto(ResultSet rs) throws SQLException {
        if (!rs.next()) return null;
        Timestamp ts = rs.getTimestamp("updated_at");
        return new NotificationSettingsDto(
            rs.getBoolean("global_enabled"),
            rs.getBoolean("email_enabled"),
            rs.getBoolean("sms_enabled"),
            rs.getBoolean("whatsapp_enabled"),
            rs.getBoolean("auction_started_enabled"),
            rs.getBoolean("auction_closing_soon_enabled"),
            rs.getBoolean("outbid_enabled"),
            rs.getBoolean("auction_won_enabled"),
            ts != null ? ts.toInstant() : Instant.now(),
            rs.getString("updated_by")
        );
    }

    public NotificationSettingsDto getSettings() {
        if (cachedSettings == null) {
            return refreshCache();
        }
        return cachedSettings;
    }

    public synchronized NotificationSettingsDto updateSettings(NotificationSettingsDto req, String updatedBy) {
        String actor = updatedBy != null && !updatedBy.isBlank() ? updatedBy : "admin";
        jdbcTemplate.update(
            "INSERT INTO notification_settings (id, global_enabled, email_enabled, sms_enabled, whatsapp_enabled, " +
            "auction_started_enabled, auction_closing_soon_enabled, outbid_enabled, auction_won_enabled, updated_at, updated_by) " +
            "VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?) " +
            "ON CONFLICT (id) DO UPDATE SET " +
            "global_enabled = EXCLUDED.global_enabled, " +
            "email_enabled = EXCLUDED.email_enabled, " +
            "sms_enabled = EXCLUDED.sms_enabled, " +
            "whatsapp_enabled = EXCLUDED.whatsapp_enabled, " +
            "auction_started_enabled = EXCLUDED.auction_started_enabled, " +
            "auction_closing_soon_enabled = EXCLUDED.auction_closing_soon_enabled, " +
            "outbid_enabled = EXCLUDED.outbid_enabled, " +
            "auction_won_enabled = EXCLUDED.auction_won_enabled, " +
            "updated_at = CURRENT_TIMESTAMP, " +
            "updated_by = EXCLUDED.updated_by",
            req.isGlobalEnabled(),
            req.isEmailEnabled(),
            req.isSmsEnabled(),
            req.isWhatsappEnabled(),
            req.isAuctionStartedEnabled(),
            req.isAuctionClosingSoonEnabled(),
            req.isOutbidEnabled(),
            req.isAuctionWonEnabled(),
            actor
        );
        log.info("[NOTIFICATION SETTINGS] Settings updated by {}: global={}, email={}, sms={}, wa={}, started={}, closing={}",
            actor, req.isGlobalEnabled(), req.isEmailEnabled(), req.isSmsEnabled(), req.isWhatsappEnabled(),
            req.isAuctionStartedEnabled(), req.isAuctionClosingSoonEnabled());
        return refreshCache();
    }

    public synchronized NotificationSettingsDto toggleGlobal(String updatedBy) {
        NotificationSettingsDto current = getSettings();
        current.setGlobalEnabled(!current.isGlobalEnabled());
        return updateSettings(current, updatedBy);
    }

    public synchronized NotificationSettingsDto stopAll(String updatedBy) {
        NotificationSettingsDto current = getSettings();
        current.setGlobalEnabled(false);
        current.setEmailEnabled(false);
        current.setAuctionStartedEnabled(false);
        current.setAuctionClosingSoonEnabled(false);
        return updateSettings(current, updatedBy);
    }

    public boolean isAuctionStartedNotificationAllowed() {
        NotificationSettingsDto s = getSettings();
        return s.isGlobalEnabled() && s.isEmailEnabled() && s.isAuctionStartedEnabled();
    }

    public boolean isAuctionClosingSoonNotificationAllowed() {
        NotificationSettingsDto s = getSettings();
        return s.isGlobalEnabled() && s.isEmailEnabled() && s.isAuctionClosingSoonEnabled();
    }

    public boolean isEmailAllowed() {
        NotificationSettingsDto s = getSettings();
        return s.isGlobalEnabled() && s.isEmailEnabled();
    }

    public boolean isSmsAllowed() {
        NotificationSettingsDto s = getSettings();
        return s.isGlobalEnabled() && s.isSmsEnabled();
    }

    public boolean isWhatsAppAllowed() {
        NotificationSettingsDto s = getSettings();
        return s.isGlobalEnabled() && s.isWhatsappEnabled();
    }
}
