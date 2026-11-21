package com.eauction.core.auction.service;

import com.eauction.core.auction.repository.AuctionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuctionLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionLifecycleScheduler.class);
    private final AuctionRepository auctionRepository;

    public AuctionLifecycleScheduler(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    @Scheduled(fixedRate = 10000)
    public void sweepExpiredAuctions() {
        try {
            int updated = auctionRepository.endExpiredAuctions(Instant.now());
            if (updated > 0) {
                log.info("[AuctionLifecycleScheduler] Transitioned {} expired active auction(s) to ENDED", updated);
            }
        } catch (Exception ex) {
            log.error("[AuctionLifecycleScheduler] Error sweeping expired auctions: {}", ex.getMessage());
        }
    }
}
