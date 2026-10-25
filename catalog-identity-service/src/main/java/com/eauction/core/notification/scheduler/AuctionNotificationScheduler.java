package com.eauction.core.notification.scheduler;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

// ============================================================================
// CRITICAL LOGIC: PERIODIC AUCTION NOTIFICATION SCHEDULER & DEDUPLICATION
// ============================================================================
// Proactively keeps registered buyers informed about upcoming auctions and
// impending closing hammers without requiring manual administrative intervention:
// 1. Cron Execution: Runs every 60,000ms (1 minute) scanning all auction lots.
// 2. Tolerance Windows:
//    - 24h Start Reminder: Fires when auction start is 23.5h to 24.5h away.
//    - 1h Start Reminder: Fires when auction start is 45m to 75m away.
//    - 1h End Final Call: Fires when an active auction closing is 45m to 75m away.
// 3. Idempotency Guard:
//    Uses a thread-safe in-memory ConcurrentHashMap set (sentNotificationKeys)
//    with composite keys ("{auctionId}:{eventType}") to guarantee each notification
//    fires exactly once per auction life-cycle, eliminating duplicate email spam.
@Component
public class AuctionNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionNotificationScheduler.class);

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Track sent notifications to guarantee idempotency across periodic scans
    private final Set<String> sentNotificationKeys = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public AuctionNotificationScheduler(
            AuctionRepository auctionRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 60000) // Scan every 60 seconds
    public void evaluateAuctionReminders() {
        Instant now = Instant.now();
        List<Auction> allAuctions = auctionRepository.findAll();
        if (allAuctions.isEmpty()) {
            return;
        }

        // Fetch registered buyers to notify
        List<User> buyers = userRepository.findByRole("BUYER");
        List<String> buyerEmails = buyers.stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .map(User::getEmail)
                .collect(Collectors.toList());

        if (buyerEmails.isEmpty()) {
            return;
        }

        for (Auction auction : allAuctions) {
            String status = auction.getStatus();
            Instant startTime = auction.getStartTime();
            Instant endTime = auction.getEndTime();

            // 1. Check 24 Hours Before Start Reminder (between 23h 30m and 24h 30m)
            if (startTime != null && ("PENDING".equalsIgnoreCase(status) || "ACTIVE".equalsIgnoreCase(status))) {
                Duration untilStart = Duration.between(now, startTime);
                if (untilStart.toMinutes() >= (23 * 60 + 30) && untilStart.toMinutes() <= (24 * 60 + 30)) {
                    String key = auction.getId() + ":24H_START";
                    if (sentNotificationKeys.add(key)) {
                        log.info("[SCHEDULED TRIGGER] Firing 24h Start Reminder for Auction: {}", auction.getId());
                        notificationService.sendAuction24hReminder(auction, buyerEmails);
                    }
                }

                // 2. Check 1 Hour Before Start Reminder (between 45m and 75m)
                if (untilStart.toMinutes() >= 45 && untilStart.toMinutes() <= 75) {
                    String key = auction.getId() + ":1H_START";
                    if (sentNotificationKeys.add(key)) {
                        log.info("[SCHEDULED TRIGGER] Firing 1h Start Reminder for Auction: {}", auction.getId());
                        notificationService.sendAuction1hReminder(auction, buyerEmails);
                    }
                }
            }

            // 3. Check 1 Hour Before End Final Call Reminder (between 45m and 75m before end)
            if (endTime != null && "ACTIVE".equalsIgnoreCase(status)) {
                Duration untilEnd = Duration.between(now, endTime);
                if (untilEnd.toMinutes() >= 45 && untilEnd.toMinutes() <= 75) {
                    String key = auction.getId() + ":1H_END";
                    if (sentNotificationKeys.add(key)) {
                        log.info("[SCHEDULED TRIGGER] Firing 1h Ending Notice for Auction: {}", auction.getId());
                        notificationService.sendAuctionEnding1hNotice(auction, buyerEmails);
                    }
                }
            }
        }
    }
}
