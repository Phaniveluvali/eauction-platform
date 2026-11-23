package com.eauction.core.notification.scheduler;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.notification.service.NotificationService;
import com.eauction.core.notification.service.NotificationSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

// ============================================================================
// CRITICAL LOGIC: PERIODIC AUCTION NOTIFICATION SCHEDULER & CLUSTER DEDUPLICATION
// ============================================================================
// Rules strictly enforced:
// 1. Single email when an auction is started (status == ACTIVE and startTime <= now).
// 2. Single email 60 minutes before the auction closes (status == ACTIVE and endTime is ~60m away).
// 3. Cluster-Wide Deduplication: Uses PostgreSQL table `auction_notification_logs`
//    with unique constraint (auction_id, event_type) to guarantee single delivery
//    even with multiple pod replicas or pod restarts.
// 4. Dynamic Admin Control: Respects NotificationSettingsService (Global switch,
//    Email checkbox, and auction event triggers). If disabled, notifications are STOPPED.
@Component
public class AuctionNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionNotificationScheduler.class);

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationSettingsService notificationSettingsService;
    private final JdbcTemplate jdbcTemplate;

    public AuctionNotificationScheduler(
            AuctionRepository auctionRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            NotificationSettingsService notificationSettingsService,
            JdbcTemplate jdbcTemplate) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.notificationSettingsService = notificationSettingsService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Scheduled(fixedRate = 60000) // Scan every 60 seconds
    public void evaluateAuctionReminders() {
        // Enforce Admin Notification Master Switch & Email Settings
        if (notificationSettingsService != null && !notificationSettingsService.getSettings().isGlobalEnabled()) {
            return;
        }

        Instant now = Instant.now();
        // Optimize: Only query active auctions
        List<Auction> activeAuctions = auctionRepository.findByStatus("ACTIVE");
        if (activeAuctions == null || activeAuctions.isEmpty()) {
            return;
        }

        // Fetch registered active buyers to notify
        List<User> buyers = userRepository.findByRole("BUYER");
        List<String> buyerEmails = buyers.stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .map(User::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .distinct()
                .collect(Collectors.toList());

        if (buyerEmails.isEmpty()) {
            return;
        }

        for (Auction auction : activeAuctions) {
            Instant startTime = auction.getStartTime();
            Instant endTime = auction.getEndTime();

            // 1. Single email once auction is started (Respects admin toggle)
            if (startTime != null && (startTime.isBefore(now) || startTime.equals(now))) {
                if (notificationSettingsService != null && !notificationSettingsService.isAuctionStartedNotificationAllowed()) {
                    // Suppressed by Admin Dashboard setting
                } else {
                    try {
                        int inserted = jdbcTemplate.update(
                            "INSERT INTO auction_notification_logs (auction_id, event_type, recipient_count) VALUES (?, 'AUCTION_STARTED', ?) ON CONFLICT (auction_id, event_type) DO NOTHING",
                            auction.getId(), buyerEmails.size()
                        );
                        if (inserted > 0) {
                            log.info("[SCHEDULED TRIGGER] Firing single Auction Started Notice for Auction: {}", auction.getId());
                            notificationService.sendAuctionStartedNotice(auction, buyerEmails);
                        }
                    } catch (Exception ex) {
                        log.warn("[DEDUP NOTICE] Auction {} AUCTION_STARTED check: {}", auction.getId(), ex.getMessage());
                    }
                }
            }

            // 2. Single email 60 minutes before auction is closed (window: 45m to 75m, respects admin toggle)
            if (endTime != null && endTime.isAfter(now)) {
                Duration untilEnd = Duration.between(now, endTime);
                if (untilEnd.toMinutes() >= 45 && untilEnd.toMinutes() <= 75) {
                    if (notificationSettingsService != null && !notificationSettingsService.isAuctionClosingSoonNotificationAllowed()) {
                        // Suppressed by Admin Dashboard setting
                    } else {
                        try {
                            int inserted = jdbcTemplate.update(
                                "INSERT INTO auction_notification_logs (auction_id, event_type, recipient_count) VALUES (?, 'AUCTION_CLOSING_60M', ?) ON CONFLICT (auction_id, event_type) DO NOTHING",
                                auction.getId(), buyerEmails.size()
                            );
                            if (inserted > 0) {
                                log.info("[SCHEDULED TRIGGER] Firing single 60m Impending Close Notice for Auction: {}", auction.getId());
                                notificationService.sendAuctionEnding1hNotice(auction, buyerEmails);
                            }
                        } catch (Exception ex) {
                            log.warn("[DEDUP NOTICE] Auction {} AUCTION_CLOSING_60M check: {}", auction.getId(), ex.getMessage());
                        }
                    }
                }
            }
        }
    }
}
