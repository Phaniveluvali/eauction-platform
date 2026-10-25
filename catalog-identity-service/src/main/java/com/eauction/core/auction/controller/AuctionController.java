package com.eauction.core.auction.controller;

import com.eauction.core.auction.dto.CreateAuctionRequest;
import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.model.Bid;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.auction.repository.BidRepository;
import com.eauction.core.catalog.repository.VehicleRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auctions")
public class AuctionController {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final VehicleRepository vehicleRepository;
    private final com.eauction.core.identity.service.AuthService authService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public AuctionController(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            VehicleRepository vehicleRepository,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.eauction.core.identity.service.AuthService authService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.vehicleRepository = vehicleRepository;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Auction> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        if (!vehicleRepository.existsById(request.getVehicleId())) {
            throw new IllegalArgumentException("Vehicle does not exist with ID: " + request.getVehicleId());
        }

        if (auctionRepository.findByVehicleId(request.getVehicleId()).isPresent()) {
            throw new IllegalArgumentException("An auction already exists for vehicle ID: " + request.getVehicleId());
        }

        if (request.getReservePrice().compareTo(request.getStartPrice()) < 0) {
            throw new IllegalArgumentException("Reserve price cannot be less than start price");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Auction auction = new Auction();
        auction.setVehicleId(request.getVehicleId());
        auction.setStartPrice(request.getStartPrice());
        auction.setReservePrice(request.getReservePrice());
        auction.setMinBidIncrement(request.getMinBidIncrement());
        auction.setCurrentHighestBid(BigDecimal.ZERO);
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setStatus("PENDING");
        auction.setAuctionType(request.getAuctionType() != null && !request.getAuctionType().isBlank() ? request.getAuctionType().toUpperCase().trim() : "ONLINE");

        Auction saved = auctionRepository.save(auction);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    @Transactional
    public ResponseEntity<List<Auction>> listAuctions(@RequestParam(required = false) String status) {
        List<Auction> all = auctionRepository.findAll();
        java.time.Instant now = java.time.Instant.now();
        boolean modified = false;
        for (Auction a : all) {
            if ("ACTIVE".equalsIgnoreCase(a.getStatus()) && a.getEndTime() != null && a.getEndTime().isBefore(now)) {
                a.setStatus("ENDED");
                auctionRepository.save(a);
                modified = true;
            }
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(auctionRepository.findByStatus(status.toUpperCase().trim()));
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Auction> getAuctionById(@PathVariable UUID id) {
        return auctionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/bids")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Bid>> getAuctionBids(@PathVariable UUID id) {
        return ResponseEntity.ok(bidRepository.findByAuctionIdOrderByBidAmountDesc(id));
    }

    @PostMapping("/{id}/bids")
    @Transactional
    public ResponseEntity<?> placeBid(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, Object> payload,
            jakarta.servlet.http.HttpServletRequest request) {

        Auction auction = auctionRepository.findById(id).orElse(null);
        if (auction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Auction not found with ID: " + id));
        }

        // Validate lifecycle
        if (!"ACTIVE".equalsIgnoreCase(auction.getStatus())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "This auction has ended and is closed for bidding."));
        }
        if (auction.getEndTime() != null && auction.getEndTime().isBefore(java.time.Instant.now())) {
            auction.setStatus("ENDED");
            auctionRepository.save(auction);
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "This auction has ended and is closed for bidding."));
        }

        // Determine Bidder Identity
        String bidderId = null;
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ") && authService != null) {
            try {
                String token = authHeader.substring(7);
                bidderId = authService.extractUserId(token).toString();
            } catch (Exception ignored) {}
        }
        if (bidderId == null && payload.get("bidderId") != null) {
            bidderId = payload.get("bidderId").toString();
        }
        if (bidderId == null || bidderId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Please log in to submit a bid."));
        }

        // Parse proposed bid amount
        if (payload.get("bidAmount") == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Missing required bidAmount"));
        }

        BigDecimal proposedBid;
        try {
            proposedBid = new BigDecimal(payload.get("bidAmount").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid numeric bid amount"));
        }

        // Pricing bounds validation: Bid must be higher than current highest bid (or >= startPrice if first bid)
        BigDecimal currentHighest = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : BigDecimal.ZERO;
        if (currentHighest.compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal startPrice = auction.getStartPrice() != null ? auction.getStartPrice() : BigDecimal.ZERO;
            if (proposedBid.compareTo(startPrice) < 0) {
                return ResponseEntity.badRequest().body(java.util.Map.of(
                    "code", "BID_TOO_LOW",
                    "message", "Your bid of AED " + proposedBid + " is less than the starting price of AED " + startPrice + ". Please enter a higher bid."
                ));
            }
        } else if (proposedBid.compareTo(currentHighest) <= 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "code", "BID_TOO_LOW",
                "message", "Your bid of AED " + proposedBid + " is less than or equal to the existing bid of AED " + currentHighest + ". Please enter a higher bid."
            ));
        }

        // Determine bidder UUID (support standard UUID or deterministic UUID from custom string)
        UUID bidderUuid;
        try {
            bidderUuid = UUID.fromString(bidderId);
        } catch (Exception e) {
            bidderUuid = UUID.nameUUIDFromBytes(bidderId.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }

        // Safety Guard: Check if user is already the leading bidder
        boolean isLeading = auction.getHighestBidderId() != null && (
            auction.getHighestBidderId().toString().equalsIgnoreCase(bidderId) ||
            auction.getHighestBidderId().equals(bidderUuid)
        );
        boolean confirmedSelfOutbid = Boolean.TRUE.equals(payload.get("confirmSelfOutbid"));
        if (isLeading && !confirmedSelfOutbid) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of(
                "code", "ALREADY_HIGHEST_BIDDER",
                "message", "You are already the highest bidder for this vehicle! Are you sure you want to outbid yourself?",
                "currentHighestBid", currentHighest
            ));
        }

        // Commit new highest bid to auction
        auction.setCurrentHighestBid(proposedBid);
        auction.setHighestBidderId(bidderUuid);
        auctionRepository.save(auction);

        // Commit to bid ledger
        Bid acceptedBid = new Bid();
        acceptedBid.setAuctionId(id);
        acceptedBid.setBidderId(bidderUuid);
        acceptedBid.setBidAmount(proposedBid);
        acceptedBid.setStatus("ACCEPTED");
        acceptedBid.setCreatedAt(java.time.Instant.now());
        bidRepository.save(acceptedBid);

        // Update user session activity if present
        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.update(
                    "UPDATE user_sessions SET bids_placed_in_session = bids_placed_in_session + 1, used_bidding_limit = used_bidding_limit + ?, last_heartbeat = CURRENT_TIMESTAMP WHERE user_id = ?",
                    proposedBid, bidderId
                );
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(java.util.Map.of(
            "status", "SUCCESS",
            "message", "Bid placed successfully!",
            "auctionId", id.toString(),
            "bidderId", bidderId,
            "bidAmount", proposedBid,
            "currentHighestBid", proposedBid,
            "timestamp", System.currentTimeMillis()
        ));
    }

    @PatchMapping("/{id}/activate")
    @Transactional
    public ResponseEntity<Auction> activateAuction(@PathVariable UUID id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found with ID: " + id));
        auction.setStatus("ACTIVE");
        return ResponseEntity.ok(auctionRepository.save(auction));
    }

    @PatchMapping("/{id}/close")
    @Transactional
    public ResponseEntity<Auction> closeAuction(@PathVariable UUID id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found with ID: " + id));
        auction.setStatus("ENDED");
        return ResponseEntity.ok(auctionRepository.save(auction));
    }
}
