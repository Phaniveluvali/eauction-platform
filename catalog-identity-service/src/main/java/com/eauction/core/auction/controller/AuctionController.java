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

    public AuctionController(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            VehicleRepository vehicleRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.vehicleRepository = vehicleRepository;
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
