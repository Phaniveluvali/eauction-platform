package com.eauction.core.auction.controller;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.catalog.model.Vehicle;
import com.eauction.core.catalog.repository.VehicleRepository;
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
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/auction-batches")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuctionBatchController {

    private final JdbcTemplate jdbcTemplate;
    private final VehicleRepository vehicleRepository;
    private final AuctionRepository auctionRepository;
    private final AuthService authService;

    public AdminAuctionBatchController(
            JdbcTemplate jdbcTemplate,
            VehicleRepository vehicleRepository,
            AuctionRepository auctionRepository,
            AuthService authService) {
        this.jdbcTemplate = jdbcTemplate;
        this.vehicleRepository = vehicleRepository;
        this.auctionRepository = auctionRepository;
        this.authService = authService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> listBatches() {
        List<Map<String, Object>> batches = jdbcTemplate.queryForList("""
                SELECT id, batch_code, title, auction_type, start_time, end_time,
                       min_bid_increment, status, created_by, created_by_email, created_at, updated_at
                FROM auction_batches
                ORDER BY created_at DESC
                """);

        List<Map<String, Object>> enriched = new ArrayList<>();
        for (Map<String, Object> row : batches) {
            UUID batchId = (UUID) row.get("id");
            List<Map<String, Object>> batchVehicles = jdbcTemplate.queryForList("""
                    SELECT abv.vehicle_id, abv.start_price, abv.reserve_price, abv.added_at,
                           v.make, v.model, v.manufacturing_year, v.vin, v.registration_number,
                           v.lot_no, v.branch, v.location, v.target_selling_price, v.minimum_selling_price,
                           v.status AS vehicle_status, v.client_name,
                           a.id AS auction_id, a.status AS auction_status, a.current_highest_bid
                    FROM auction_batch_vehicles abv
                    JOIN vehicles v ON v.id = abv.vehicle_id
                    LEFT JOIN auctions a ON a.vehicle_id = v.id
                    WHERE abv.batch_id = ?
                    ORDER BY abv.added_at DESC
                    """, batchId);

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", batchId.toString());
            dto.put("batchCode", row.get("batch_code"));
            dto.put("title", row.get("title"));
            dto.put("auctionType", row.get("auction_type"));
            dto.put("startTime", toIso(row.get("start_time")));
            dto.put("endTime", toIso(row.get("end_time")));
            dto.put("minBidIncrement", row.get("min_bid_increment"));
            dto.put("status", row.get("status"));
            dto.put("createdByEmail", row.get("created_by_email"));
            dto.put("createdAt", toIso(row.get("created_at")));
            dto.put("vehicleCount", batchVehicles.size());

            List<Map<String, Object>> vList = new ArrayList<>();
            for (Map<String, Object> bv : batchVehicles) {
                Map<String, Object> vDto = new LinkedHashMap<>();
                vDto.put("vehicleId", bv.get("vehicle_id").toString());
                vDto.put("make", bv.get("make"));
                vDto.put("model", bv.get("model"));
                vDto.put("manufacturingYear", bv.get("manufacturing_year"));
                vDto.put("vin", bv.get("vin"));
                vDto.put("registrationNumber", bv.get("registration_number"));
                vDto.put("lotNo", bv.get("lot_no"));
                vDto.put("branch", bv.get("branch"));
                vDto.put("location", bv.get("location"));
                vDto.put("targetSellingPrice", bv.get("target_selling_price"));
                vDto.put("minimumSellingPrice", bv.get("minimum_selling_price"));
                vDto.put("startPrice", bv.get("start_price"));
                vDto.put("reservePrice", bv.get("reserve_price"));
                vDto.put("vehicleStatus", bv.get("vehicle_status"));
                vDto.put("clientName", bv.get("client_name"));
                vDto.put("auctionId", bv.get("auction_id") != null ? bv.get("auction_id").toString() : null);
                vDto.put("auctionStatus", bv.get("auction_status"));
                vDto.put("currentHighestBid", bv.get("current_highest_bid"));
                vList.add(vDto);
            }
            dto.put("vehicles", vList);
            enriched.add(dto);
        }
        return ResponseEntity.ok(enriched);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createBatch(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody Map<String, Object> body) {
        String title = body.get("title") != null ? body.get("title").toString().trim() : "";
        String auctionType = body.get("auctionType") != null ? body.get("auctionType").toString().trim().toUpperCase() : "ONLINE";
        if (title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Batch title is required."));
        }
        if (!"ONLINE".equals(auctionType) && !"SILENT".equals(auctionType)) {
            return ResponseEntity.badRequest().body(Map.of("message", "auctionType must be ONLINE or SILENT."));
        }

        Instant startTime = parseInstant(body.get("startTime"), Instant.now());
        Instant endTime = parseInstant(body.get("endTime"), startTime.plus(7, ChronoUnit.DAYS));
        if (!endTime.isAfter(startTime)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Batch endTime must be after startTime."));
        }

        BigDecimal minInc = parseBigDecimal(body.get("minBidIncrement"), new BigDecimal("1000.00"));
        if (minInc.compareTo(BigDecimal.ONE) < 0) {
            minInc = new BigDecimal("1000.00");
        }

        String token = authHeader.substring(7).trim();
        UUID adminId = authService.extractUserId(token);
        String adminEmail = authService.extractEmail(token);

        UUID batchId = UUID.randomUUID();
        String prefix = "SILENT".equals(auctionType) ? "SIL" : "ONL";
        String batchCode = "BATCH-" + prefix + "-" + (100000 + new Random().nextInt(900000));

        jdbcTemplate.update("""
                INSERT INTO auction_batches (id, batch_code, title, auction_type, start_time, end_time, min_bid_increment, status, created_by, created_by_email)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)
                """,
                batchId, batchCode, title, auctionType,
                Timestamp.from(startTime), Timestamp.from(endTime), minInc, adminId, adminEmail
        );

        audit(adminId, adminEmail, "CREATE_AUCTION_BATCH", "AUCTION_BATCH", batchId.toString(),
                "Created " + auctionType + " batch " + batchCode + " (" + title + ")");

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", batchId.toString());
        resp.put("batchCode", batchCode);
        resp.put("title", title);
        resp.put("auctionType", auctionType);
        resp.put("startTime", startTime.toString());
        resp.put("endTime", endTime.toString());
        resp.put("minBidIncrement", minInc);
        resp.put("status", "DRAFT");
        resp.put("vehicleCount", 0);
        resp.put("vehicles", Collections.emptyList());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/{batchId}/vehicles")
    @Transactional
    public ResponseEntity<?> addVehiclesToBatch(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID batchId,
            @RequestBody Map<String, Object> body) {
        List<Map<String, Object>> batchRows = jdbcTemplate.queryForList(
                "SELECT id, batch_code, status, auction_type FROM auction_batches WHERE id = ?", batchId);
        if (batchRows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Auction batch not found."));
        }
        String batchStatus = String.valueOf(batchRows.get(0).get("status"));
        if (!"DRAFT".equalsIgnoreCase(batchStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vehicles can only be added while batch is in DRAFT status."));
        }

        List<UUID> vehicleIds = new ArrayList<>();
        Object idsObj = body.get("vehicleIds");
        if (idsObj instanceof List<?> list) {
            for (Object item : list) {
                vehicleIds.add(UUID.fromString(item.toString()));
            }
        }
        if (vehicleIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select at least one vehicle to add to the batch."));
        }

        int added = 0;
        List<String> skipped = new ArrayList<>();
        for (UUID vid : vehicleIds) {
            Optional<Vehicle> opt = vehicleRepository.findById(vid);
            if (opt.isEmpty()) {
                skipped.add("Vehicle not found: " + vid);
                continue;
            }
            Vehicle v = opt.get();
            if (!"INACTIVE_AUCTION".equalsIgnoreCase(v.getStatus()) && !"FIA".equalsIgnoreCase(v.getWfActivityId())) {
                skipped.add("Vehicle " + v.getVin() + " is not in Inactive Auctions queue (current status: " + v.getStatus() + ")");
                continue;
            }
            Integer existingInOtherBatch = jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM auction_batch_vehicles abv
                    JOIN auction_batches ab ON ab.id = abv.batch_id
                    WHERE abv.vehicle_id = ? AND ab.status IN ('DRAFT', 'SCHEDULED', 'ACTIVE') AND ab.id <> ?
                    """, Integer.class, vid, batchId);
            if (existingInOtherBatch != null && existingInOtherBatch > 0) {
                skipped.add("Vehicle " + v.getVin() + " is already assigned to another active/draft auction batch.");
                continue;
            }

            BigDecimal[] prices = computeSafePrices(v);
            int inserted = jdbcTemplate.update("""
                    INSERT INTO auction_batch_vehicles (batch_id, vehicle_id, start_price, reserve_price)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT (batch_id, vehicle_id) DO NOTHING
                    """, batchId, vid, prices[0], prices[1]);
            if (inserted > 0) added++;
        }

        if (added == 0 && !skipped.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", String.join("; ", skipped),
                    "skipped", skipped
            ));
        }

        String token = authHeader.substring(7).trim();
        audit(authService.extractUserId(token), authService.extractEmail(token),
                "ADD_BATCH_VEHICLES", "AUCTION_BATCH", batchId.toString(),
                "Added " + added + " vehicle(s) to batch " + batchRows.get(0).get("batch_code"));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "batchId", batchId.toString(),
                "addedCount", added,
                "skipped", skipped
        ));
    }

    @DeleteMapping("/{batchId}/vehicles/{vehicleId}")
    @Transactional
    public ResponseEntity<?> removeVehicleFromBatch(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID batchId,
            @PathVariable UUID vehicleId) {
        List<Map<String, Object>> batchRows = jdbcTemplate.queryForList(
                "SELECT status, batch_code FROM auction_batches WHERE id = ?", batchId);
        if (batchRows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Auction batch not found."));
        }
        if (!"DRAFT".equalsIgnoreCase(String.valueOf(batchRows.get(0).get("status")))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot remove vehicles after batch has been published."));
        }
        jdbcTemplate.update("DELETE FROM auction_batch_vehicles WHERE batch_id = ? AND vehicle_id = ?", batchId, vehicleId);
        String token = authHeader.substring(7).trim();
        audit(authService.extractUserId(token), authService.extractEmail(token),
                "REMOVE_BATCH_VEHICLE", "AUCTION_BATCH", batchId.toString(),
                "Removed vehicle " + vehicleId + " from batch " + batchRows.get(0).get("batch_code"));
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{batchId}/publish")
    @Transactional
    public ResponseEntity<?> publishBatch(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID batchId) {
        List<Map<String, Object>> batchRows = jdbcTemplate.queryForList("""
                SELECT id, batch_code, title, auction_type, start_time, end_time, min_bid_increment, status
                FROM auction_batches WHERE id = ?
                """, batchId);
        if (batchRows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Auction batch not found."));
        }
        Map<String, Object> batch = batchRows.get(0);
        if (!"DRAFT".equalsIgnoreCase(String.valueOf(batch.get("status")))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Batch is already published (status: " + batch.get("status") + ")."));
        }

        List<Map<String, Object>> assigned = jdbcTemplate.queryForList(
                "SELECT vehicle_id, start_price, reserve_price FROM auction_batch_vehicles WHERE batch_id = ?", batchId);
        if (assigned.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot publish an empty batch. Please add at least one vehicle first."));
        }

        String auctionType = String.valueOf(batch.get("auction_type")).toUpperCase();
        Instant startTime = ((Timestamp) batch.get("start_time")).toInstant();
        Instant endTime = ((Timestamp) batch.get("end_time")).toInstant();
        if (!endTime.isAfter(Instant.now())) {
            endTime = Instant.now().plus(7, ChronoUnit.DAYS);
        }
        if (!endTime.isAfter(startTime)) {
            startTime = Instant.now();
            endTime = startTime.plus(7, ChronoUnit.DAYS);
        }
        BigDecimal minInc = (BigDecimal) batch.get("min_bid_increment");
        if (minInc == null || minInc.compareTo(BigDecimal.ONE) < 0) {
            minInc = new BigDecimal("1000.00");
        }

        List<String> createdAuctionIds = new ArrayList<>();
        for (Map<String, Object> item : assigned) {
            UUID vid = (UUID) item.get("vehicle_id");
            Vehicle v = vehicleRepository.findById(vid)
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vid));

            BigDecimal[] defaults = computeSafePrices(v);
            BigDecimal startPrice = item.get("start_price") != null && ((BigDecimal) item.get("start_price")).compareTo(BigDecimal.ONE) >= 0
                    ? (BigDecimal) item.get("start_price") : defaults[0];
            BigDecimal reservePrice = item.get("reserve_price") != null && ((BigDecimal) item.get("reserve_price")).compareTo(startPrice) >= 0
                    ? (BigDecimal) item.get("reserve_price") : startPrice.max(defaults[1]);

            Auction auction = auctionRepository.findByVehicleId(vid).orElseGet(Auction::new);
            auction.setVehicleId(vid);
            auction.setBatchId(batchId);
            auction.setAuctionType(auctionType);
            auction.setStartPrice(startPrice);
            auction.setReservePrice(reservePrice);
            auction.setMinBidIncrement(minInc);
            if (auction.getCurrentHighestBid() == null) {
                auction.setCurrentHighestBid(BigDecimal.ZERO);
            }
            auction.setStartTime(startTime);
            auction.setEndTime(endTime);
            auction.setStatus("ACTIVE");
            Auction savedAuc = auctionRepository.save(auction);
            createdAuctionIds.add(savedAuc.getId().toString());

            v.setStatus("IN_AUCTION");
            v.setWfActivityId("ACTIVE_AUCTION");
            vehicleRepository.save(v);
        }

        jdbcTemplate.update(
                "UPDATE auction_batches SET status = 'ACTIVE', start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                Timestamp.from(startTime), Timestamp.from(endTime), batchId
        );

        String token = authHeader.substring(7).trim();
        audit(authService.extractUserId(token), authService.extractEmail(token),
                "PUBLISH_AUCTION_BATCH", "AUCTION_BATCH", batchId.toString(),
                "Published " + auctionType + " batch " + batch.get("batch_code") + " with " + createdAuctionIds.size() + " vehicle(s)");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "batchId", batchId.toString(),
                "batchCode", batch.get("batch_code"),
                "auctionType", auctionType,
                "status", "ACTIVE",
                "publishedCount", createdAuctionIds.size(),
                "auctionIds", createdAuctionIds
        ));
    }

    @DeleteMapping("/{batchId}")
    @Transactional
    public ResponseEntity<?> deleteBatch(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID batchId) {
        List<Map<String, Object>> batchRows = jdbcTemplate.queryForList(
                "SELECT status, batch_code FROM auction_batches WHERE id = ?", batchId);
        if (batchRows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Auction batch not found."));
        }
        if (!"DRAFT".equalsIgnoreCase(String.valueOf(batchRows.get(0).get("status")))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only DRAFT batches can be deleted."));
        }
        jdbcTemplate.update("DELETE FROM auction_batches WHERE id = ?", batchId);
        String token = authHeader.substring(7).trim();
        audit(authService.extractUserId(token), authService.extractEmail(token),
                "DELETE_AUCTION_BATCH", "AUCTION_BATCH", batchId.toString(),
                "Deleted draft batch " + batchRows.get(0).get("batch_code"));
        return ResponseEntity.ok(Map.of("success", true));
    }

    private BigDecimal[] computeSafePrices(Vehicle v) {
        BigDecimal target = (v.getTargetSellingPrice() != null && v.getTargetSellingPrice().compareTo(new BigDecimal("100")) >= 0)
                ? v.getTargetSellingPrice()
                : new BigDecimal("50000.00");
        BigDecimal start = target.multiply(new BigDecimal("0.70")).setScale(2, java.math.RoundingMode.HALF_UP);
        if (start.compareTo(new BigDecimal("100")) < 0) {
            start = new BigDecimal("1000.00");
        }
        BigDecimal reserve = (v.getMinimumSellingPrice() != null && v.getMinimumSellingPrice().compareTo(start) >= 0)
                ? v.getMinimumSellingPrice().setScale(2, java.math.RoundingMode.HALF_UP)
                : target.multiply(new BigDecimal("0.90")).setScale(2, java.math.RoundingMode.HALF_UP);
        if (reserve.compareTo(start) < 0) {
            reserve = start;
        }
        return new BigDecimal[]{start, reserve};
    }

    private Instant parseInstant(Object raw, Instant fallback) {
        if (raw == null || raw.toString().isBlank()) return fallback;
        try {
            return Instant.parse(raw.toString().trim());
        } catch (Exception e) {
            try {
                return java.time.LocalDateTime.parse(raw.toString().trim()).atZone(java.time.ZoneOffset.UTC).toInstant();
            } catch (Exception ignored) {
                return fallback;
            }
        }
    }

    private BigDecimal parseBigDecimal(Object raw, BigDecimal fallback) {
        if (raw == null || raw.toString().isBlank()) return fallback;
        try {
            return new BigDecimal(raw.toString().trim());
        } catch (Exception e) {
            return fallback;
        }
    }

    private String toIso(Object ts) {
        if (ts == null) return null;
        if (ts instanceof Timestamp t) return t.toInstant().toString();
        return ts.toString();
    }

    private void audit(UUID adminId, String adminEmail, String action, String entityType, String entityId, String details) {
        try {
            jdbcTemplate.update("""
                    INSERT INTO admin_audit_logs (admin_user_id, admin_email, action, entity_type, entity_id, details)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, adminId, adminEmail, action, entityType, entityId, details);
        } catch (Exception ignored) {}
    }
}
