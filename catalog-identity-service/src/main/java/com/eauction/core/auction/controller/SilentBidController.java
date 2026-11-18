package com.eauction.core.auction.controller;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.identity.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@RestController
public class SilentBidController {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final JdbcTemplate jdbcTemplate;

    public SilentBidController(
            AuctionRepository auctionRepository,
            UserRepository userRepository,
            AuthService authService,
            JdbcTemplate jdbcTemplate) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Buyer submits or updates a confidential sealed bid on an ACTIVE SILENT auction.
     */
    @PostMapping("/api/v1/auctions/{auctionId}/silent-bids")
    @PreAuthorize("hasRole('BUYER')")
    @Transactional
    public ResponseEntity<?> submitSilentBid(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID auctionId,
            @RequestBody Map<String, Object> body) {
        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Auction not found."));
        }
        if (!"SILENT".equalsIgnoreCase(auction.getAuctionType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "This auction is not a Silent Auction."));
        }
        if (!"ACTIVE".equalsIgnoreCase(auction.getStatus())
                || (auction.getEndTime() != null && auction.getEndTime().isBefore(Instant.now()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "This Silent Auction has ended and is closed for sealed bids."));
        }
        if (body.get("bidAmount") == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid sealed bid amount."));
        }

        BigDecimal bidAmount;
        try {
            bidAmount = new BigDecimal(body.get("bidAmount").toString().trim());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid numeric bid amount."));
        }
        if (bidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Sealed bid amount must be greater than 0."));
        }
        if (auction.getStartPrice() != null && bidAmount.compareTo(auction.getStartPrice()) < 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", "BID_TOO_LOW",
                    "message", "Your sealed bid of AED " + bidAmount + " must be at least the minimum starting price of AED " + auction.getStartPrice() + "."
            ));
        }

        String token = authHeader.substring(7).trim();
        UUID bidderId = authService.extractUserId(token);
        User buyer = userRepository.findById(bidderId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer account not found."));

        jdbcTemplate.update("""
                INSERT INTO silent_bids (auction_id, bidder_id, bidder_email, bidder_name, bid_amount, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (auction_id, bidder_id) DO UPDATE SET
                    bid_amount = EXCLUDED.bid_amount,
                    bidder_email = EXCLUDED.bidder_email,
                    bidder_name = EXCLUDED.bidder_name,
                    status = 'SUBMITTED',
                    updated_at = CURRENT_TIMESTAMP
                """, auctionId, bidderId, buyer.getEmail(), buyer.getFullName(), bidAmount);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "auctionId", auctionId.toString(),
                "bidderId", bidderId.toString(),
                "bidAmount", bidAmount,
                "status", "SUBMITTED",
                "message", "Confidential sealed bid of AED " + bidAmount + " submitted successfully!"
        ));
    }

    /**
     * Returns ONLY the authenticated buyer's own sealed bid for this silent auction.
     */
    @GetMapping("/api/v1/auctions/{auctionId}/silent-bids/my-bid")
    @PreAuthorize("hasRole('BUYER')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMySilentBid(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID auctionId) {
        UUID bidderId = authService.extractUserId(authHeader.substring(7).trim());
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT id, bid_amount, status, created_at, updated_at
                FROM silent_bids
                WHERE auction_id = ? AND bidder_id = ?
                """, auctionId, bidderId);
        if (rows.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasBid", false));
        }
        Map<String, Object> r = rows.get(0);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("hasBid", true);
        resp.put("id", r.get("id").toString());
        resp.put("bidAmount", r.get("bid_amount"));
        resp.put("status", r.get("status"));
        resp.put("updatedAt", r.get("updated_at") instanceof Timestamp t ? t.toInstant().toString() : null);
        return ResponseEntity.ok(resp);
    }

    /**
     * Admin reviews all confidential sealed bids for a silent auction ranked highest-to-lowest.
     */
    @GetMapping("/api/v1/admin/auctions/{auctionId}/silent-bids")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> listAdminSilentBids(@PathVariable UUID auctionId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT sb.id, sb.auction_id, sb.bidder_id, sb.bidder_email, sb.bidder_name,
                       sb.bid_amount, sb.status, sb.created_at, sb.updated_at
                FROM silent_bids sb
                WHERE sb.auction_id = ?
                ORDER BY sb.bid_amount DESC, sb.updated_at ASC
                """, auctionId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.get("id").toString());
            m.put("auctionId", r.get("auction_id").toString());
            m.put("bidderId", r.get("bidder_id").toString());
            m.put("bidderEmail", r.get("bidder_email"));
            m.put("bidderName", r.get("bidder_name"));
            m.put("bidAmount", r.get("bid_amount"));
            m.put("status", r.get("status"));
            m.put("submittedAt", r.get("updated_at") instanceof Timestamp t ? t.toInstant().toString() : null);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Admin awards a Silent Auction to a winning sealed bid and closes the auction.
     */
    @PostMapping("/api/v1/admin/auctions/{auctionId}/silent-bids/{bidId}/award")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> awardSilentBid(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID auctionId,
            @PathVariable UUID bidId) {
        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Auction not found."));
        }
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT bidder_id, bidder_email, bid_amount FROM silent_bids WHERE id = ? AND auction_id = ?",
                bidId, auctionId);
        if (rows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Sealed bid not found."));
        }
        UUID winnerId = (UUID) rows.get(0).get("bidder_id");
        BigDecimal winAmount = (BigDecimal) rows.get(0).get("bid_amount");

        jdbcTemplate.update("UPDATE silent_bids SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE auction_id = ? AND id <> ?", auctionId, bidId);
        jdbcTemplate.update("UPDATE silent_bids SET status = 'WON', updated_at = CURRENT_TIMESTAMP WHERE id = ?", bidId);

        auction.setHighestBidderId(winnerId);
        auction.setCurrentHighestBid(winAmount);
        auction.setStatus("ENDED");
        auctionRepository.save(auction);

        String token = authHeader.substring(7).trim();
        try {
            jdbcTemplate.update("""
                    INSERT INTO admin_audit_logs (admin_user_id, admin_email, action, entity_type, entity_id, details)
                    VALUES (?, ?, 'AWARD_SILENT_AUCTION', 'AUCTION', ?, ?)
                    """, authService.extractUserId(token), authService.extractEmail(token),
                    auctionId.toString(), "Awarded silent auction to " + rows.get(0).get("bidder_email") + " for AED " + winAmount);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of(
                "success", true,
                "auctionId", auctionId.toString(),
                "winnerId", winnerId.toString(),
                "winnerEmail", rows.get(0).get("bidder_email"),
                "winningAmount", winAmount,
                "status", "ENDED"
        ));
    }
}
