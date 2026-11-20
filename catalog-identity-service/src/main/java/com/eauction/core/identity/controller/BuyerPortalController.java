package com.eauction.core.identity.controller;

import com.eauction.core.identity.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.Array;
import java.sql.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/api/v1/buyer")
@PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'ACCOUNTANT')")
public class BuyerPortalController {

    private final JdbcTemplate jdbcTemplate;
    private final AuthService authService;

    public BuyerPortalController(JdbcTemplate jdbcTemplate, AuthService authService) {
        this.jdbcTemplate = jdbcTemplate;
        this.authService = authService;
    }

    @GetMapping("/favorites")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getFavorites(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        List<String> ids = jdbcTemplate.queryForList(
                "SELECT vehicle_id::text FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC",
                String.class, buyerId
        );
        return ResponseEntity.ok(Map.of("vehicleIds", ids));
    }

    @PostMapping("/favorites/{vehicleId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> addFavorite(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID vehicleId) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        jdbcTemplate.update(
                "INSERT INTO user_favorites (user_id, vehicle_id) VALUES (?, ?) ON CONFLICT (user_id, vehicle_id) DO NOTHING",
                buyerId, vehicleId
        );
        List<String> ids = jdbcTemplate.queryForList(
                "SELECT vehicle_id::text FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC",
                String.class, buyerId
        );
        return ResponseEntity.ok(Map.of("success", true, "vehicleIds", ids));
    }

    @DeleteMapping("/favorites/{vehicleId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID vehicleId) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        jdbcTemplate.update(
                "DELETE FROM user_favorites WHERE user_id = ? AND vehicle_id = ?",
                buyerId, vehicleId
        );
        List<String> ids = jdbcTemplate.queryForList(
                "SELECT vehicle_id::text FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC",
                String.class, buyerId
        );
        return ResponseEntity.ok(Map.of("success", true, "vehicleIds", ids));
    }

    /**
     * Returns all vehicles won or paid for by the authenticated buyer along with pricing and payment status.
     */
    @GetMapping("/purchases")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getBuyerPurchases(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT DISTINCT ON (a.id)
                       a.id AS auction_id, a.auction_type, a.current_highest_bid AS winning_price,
                       a.start_price, a.end_time, a.status AS auction_status, a.updated_at AS won_at,
                       v.id AS vehicle_id, v.make, v.model, v.manufacturing_year, v.vin,
                       v.registration_number, v.lot_no, v.color, v.fuel_type, v.odometer_reading_km,
                       v.branch, v.location, v.media_paths, v.inspection_report_url,
                       p.id AS payment_id, p.amount AS paid_amount, p.currency, p.gateway,
                       p.gateway_order_id, p.gateway_payment_id, p.status AS payment_status,
                       p.created_at AS payment_date
                FROM auctions a
                JOIN vehicles v ON v.id = a.vehicle_id
                LEFT JOIN payments p ON p.auction_id = a.id AND p.payer_id = ?
                WHERE (a.highest_bidder_id = ? AND (a.status = 'ENDED' OR a.end_time < CURRENT_TIMESTAMP))
                   OR p.payer_id = ?
                ORDER BY a.id, p.created_at DESC NULLS LAST
                """, buyerId, buyerId, buyerId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("auctionId", str(r.get("auction_id")));
            m.put("auctionType", r.get("auction_type") != null ? r.get("auction_type") : "ONLINE");
            m.put("winningPrice", r.get("winning_price"));
            m.put("startPrice", r.get("start_price"));
            m.put("wonAt", iso(r.get("won_at")));
            m.put("auctionStatus", r.get("auction_status"));
            m.put("vehicleId", str(r.get("vehicle_id")));
            m.put("make", r.get("make"));
            m.put("model", r.get("model"));
            m.put("manufacturingYear", r.get("manufacturing_year"));
            m.put("vin", r.get("vin"));
            m.put("registrationNumber", r.get("registration_number"));
            m.put("lotNo", r.get("lot_no"));
            m.put("color", r.get("color"));
            m.put("fuelType", r.get("fuel_type"));
            m.put("odometerReadingKm", r.get("odometer_reading_km"));
            m.put("location", r.get("location") != null ? r.get("location") : r.get("branch"));
            m.put("mediaPaths", extractStringArray(r.get("media_paths")));
            m.put("inspectionReportUrl", r.get("inspection_report_url"));
            m.put("paymentId", str(r.get("payment_id")));
            m.put("paidAmount", r.get("paid_amount"));
            m.put("currency", r.get("currency") != null ? r.get("currency") : "AED");
            m.put("gateway", r.get("gateway"));
            m.put("orderId", r.get("gateway_order_id"));
            m.put("transactionId", r.get("gateway_payment_id"));
            m.put("paymentStatus", r.get("payment_status") != null ? r.get("payment_status") : "PENDING_PAYMENT");
            m.put("paymentDate", iso(r.get("payment_date")));
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Returns full chronological payment history for the authenticated buyer.
     */
    @GetMapping("/payments")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getBuyerPayments(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT p.id, p.auction_id, p.gateway, p.gateway_order_id, p.gateway_payment_id,
                       p.amount, p.currency, p.status, p.created_at, p.updated_at,
                       v.id AS vehicle_id, v.make, v.model, v.manufacturing_year, v.lot_no, v.vin,
                       a.auction_type
                FROM payments p
                LEFT JOIN auctions a ON a.id = p.auction_id
                LEFT JOIN vehicles v ON v.id = a.vehicle_id
                WHERE p.payer_id = ?
                ORDER BY p.created_at DESC
                """, buyerId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", str(r.get("id")));
            m.put("auctionId", str(r.get("auction_id")));
            m.put("vehicleId", str(r.get("vehicle_id")));
            m.put("vehicleTitle", r.get("make") != null
                    ? (r.get("manufacturing_year") + " " + r.get("make") + " " + r.get("model"))
                    : "Auction Settlement");
            m.put("lotNo", r.get("lot_no"));
            m.put("vin", r.get("vin"));
            m.put("auctionType", r.get("auction_type") != null ? r.get("auction_type") : "ONLINE");
            m.put("gateway", r.get("gateway"));
            m.put("orderId", r.get("gateway_order_id"));
            m.put("transactionId", r.get("gateway_payment_id"));
            m.put("amount", r.get("amount"));
            m.put("currency", r.get("currency") != null ? r.get("currency") : "AED");
            m.put("status", r.get("status"));
            m.put("createdAt", iso(r.get("created_at")));
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Returns all online & sealed bids placed by the authenticated buyer.
     */
    @GetMapping("/bids")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getBuyerBids(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        List<Map<String, Object>> result = new ArrayList<>();

        List<Map<String, Object>> onlineRows = jdbcTemplate.queryForList("""
                SELECT DISTINCT ON (b.auction_id)
                       b.id, b.auction_id, b.bid_amount, b.created_at,
                       a.current_highest_bid, a.highest_bidder_id, a.status AS auction_status, a.end_time,
                       v.id AS vehicle_id, v.make, v.model, v.manufacturing_year, v.lot_no, v.vin, v.media_paths
                FROM bids b
                JOIN auctions a ON a.id = b.auction_id
                JOIN vehicles v ON v.id = a.vehicle_id
                WHERE b.bidder_id = ?
                ORDER BY b.auction_id, b.bid_amount DESC, b.created_at DESC
                """, buyerId);

        for (Map<String, Object> r : onlineRows) {
            boolean isHighest = r.get("highest_bidder_id") != null && buyerId.equals(r.get("highest_bidder_id"));
            String aucStatus = String.valueOf(r.get("auction_status"));
            String bidState = "ENDED".equalsIgnoreCase(aucStatus)
                    ? (isHighest ? "WON" : "LOST")
                    : (isHighest ? "LEADING" : "OUTBID");
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", str(r.get("id")));
            m.put("auctionId", str(r.get("auction_id")));
            m.put("vehicleId", str(r.get("vehicle_id")));
            m.put("auctionType", "ONLINE");
            m.put("vehicleTitle", r.get("manufacturing_year") + " " + r.get("make") + " " + r.get("model"));
            m.put("lotNo", r.get("lot_no"));
            m.put("vin", r.get("vin"));
            m.put("myBidAmount", r.get("bid_amount"));
            m.put("currentHighestBid", r.get("current_highest_bid"));
            m.put("bidState", bidState);
            m.put("auctionStatus", aucStatus);
            m.put("endTime", iso(r.get("end_time")));
            m.put("createdAt", iso(r.get("created_at")));
            m.put("mediaPaths", extractStringArray(r.get("media_paths")));
            result.add(m);
        }

        List<Map<String, Object>> silentRows = jdbcTemplate.queryForList("""
                SELECT sb.id, sb.auction_id, sb.bid_amount, sb.status AS bid_status, sb.updated_at,
                       a.status AS auction_status, a.end_time,
                       v.id AS vehicle_id, v.make, v.model, v.manufacturing_year, v.lot_no, v.vin, v.media_paths
                FROM silent_bids sb
                JOIN auctions a ON a.id = sb.auction_id
                JOIN vehicles v ON v.id = a.vehicle_id
                WHERE sb.bidder_id = ?
                ORDER BY sb.updated_at DESC
                """, buyerId);

        for (Map<String, Object> r : silentRows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", str(r.get("id")));
            m.put("auctionId", str(r.get("auction_id")));
            m.put("vehicleId", str(r.get("vehicle_id")));
            m.put("auctionType", "SILENT");
            m.put("vehicleTitle", r.get("manufacturing_year") + " " + r.get("make") + " " + r.get("model"));
            m.put("lotNo", r.get("lot_no"));
            m.put("vin", r.get("vin"));
            m.put("myBidAmount", r.get("bid_amount"));
            m.put("currentHighestBid", null);
            m.put("bidState", r.get("bid_status"));
            m.put("auctionStatus", r.get("auction_status"));
            m.put("endTime", iso(r.get("end_time")));
            m.put("createdAt", iso(r.get("updated_at")));
            m.put("mediaPaths", extractStringArray(r.get("media_paths")));
            result.add(m);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Buyer submits payment slip (wire transfer receipt / deposit voucher) for a won vehicle.
     * Transitions vehicle to 'FBPV' (Buyer Invoice Pending Acknowledgement).
     */
    @PostMapping("/purchases/{vehicleId}/payment-slip")
    @Transactional
    public ResponseEntity<?> uploadPaymentSlip(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID vehicleId,
            @RequestBody Map<String, Object> body) {
        UUID buyerId = authService.extractUserId(authHeader.substring(7).trim());
        java.math.BigDecimal amount = java.math.BigDecimal.ZERO;
        if (body.get("amount") != null) {
            try {
                amount = new java.math.BigDecimal(body.get("amount").toString());
            } catch (Exception ignored) {}
        }
        String bankReference = body.get("bankReference") != null ? body.get("bankReference").toString() : "";
        String slipFileUrl = body.get("slipFileUrl") != null ? body.get("slipFileUrl").toString() : "";

        jdbcTemplate.update("""
                INSERT INTO buyer_payment_slips (vehicle_id, buyer_id, amount, bank_reference, slip_file_url, status)
                VALUES (?, ?, ?, ?, ?, 'PENDING_ACKNOWLEDGEMENT')
                """, vehicleId, buyerId, amount, bankReference, slipFileUrl);

        jdbcTemplate.update("""
                UPDATE vehicles SET wf_activity_id = 'FBPV', status = 'BUYER_INVOICE_PENDING', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """, vehicleId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment slip uploaded successfully. Awaiting business acknowledgement in Buyer Invoice List.",
                "vehicleId", vehicleId.toString(),
                "status", "PENDING_ACKNOWLEDGEMENT"
        ));
    }

    /**
     * Business/Admin acknowledges payment from the Buyer Invoice List.
     * Once acknowledged:
     * - Vehicle transitions to 'FSL' (Sold Undelivered).
     * - Gatepass and Sale Document buttons are unlocked for handover.
     */
    @PutMapping("/purchases/{vehicleId}/payment-acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    @Transactional
    public ResponseEntity<?> acknowledgePayment(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID vehicleId) {
        UUID adminId = authService.extractUserId(authHeader.substring(7).trim());

        jdbcTemplate.update("""
                UPDATE buyer_payment_slips
                SET status = 'ACKNOWLEDGED', acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE vehicle_id = ?
                """, adminId, vehicleId);

        jdbcTemplate.update("""
                UPDATE vehicles SET wf_activity_id = 'FSL', status = 'SOLD_UNDELIVERED', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """, vehicleId);

        // Fetch buyer_id from latest slip or auction
        List<Map<String, Object>> slipRows = jdbcTemplate.queryForList(
                "SELECT buyer_id FROM buyer_payment_slips WHERE vehicle_id = ? ORDER BY created_at DESC LIMIT 1",
                vehicleId
        );
        UUID buyerId = (!slipRows.isEmpty() && slipRows.get(0).get("buyer_id") != null)
                ? (UUID) slipRows.get(0).get("buyer_id")
                : adminId;

        // Auto-generate official Gate Pass voucher
        String gatePassNo = "GP-" + java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd").format(java.time.LocalDate.now()) +
                "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        jdbcTemplate.update("""
                INSERT INTO vehicle_gate_passes (vehicle_id, buyer_id, gate_pass_no, issued_by, issued_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT (gate_pass_no) DO NOTHING
                """, vehicleId, buyerId, gatePassNo, adminId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment acknowledged! Vehicle transitioned to Sold Undelivered (FSL). Gate Pass generated.",
                "vehicleId", vehicleId.toString(),
                "gatePassNo", gatePassNo,
                "wfActivityId", "FSL"
        ));
    }

    /**
     * Lists all buyer payment slips for the Buyer Invoice List view in Accountant & Operations.
     */
    @GetMapping("/purchases/slips")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getPaymentSlips() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT s.id, s.vehicle_id, s.buyer_id, s.amount, s.bank_reference, s.slip_file_url,
                       s.status, s.acknowledged_at, s.created_at,
                       v.make, v.model, v.manufacturing_year, v.lot_no, v.vin, v.registration_number, v.client_name,
                       u.full_name AS buyer_name, u.email AS buyer_email, u.phone AS buyer_phone,
                       gp.gate_pass_no, gp.vehicle_released
                FROM buyer_payment_slips s
                JOIN vehicles v ON v.id = s.vehicle_id
                JOIN users u ON u.id = s.buyer_id
                LEFT JOIN vehicle_gate_passes gp ON gp.vehicle_id = s.vehicle_id
                ORDER BY s.created_at DESC
                """);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", str(r.get("id")));
            m.put("vehicleId", str(r.get("vehicle_id")));
            m.put("buyerId", str(r.get("buyer_id")));
            m.put("amount", r.get("amount"));
            m.put("bankReference", r.get("bank_reference"));
            m.put("slipFileUrl", r.get("slip_file_url"));
            m.put("status", r.get("status"));
            m.put("acknowledgedAt", iso(r.get("acknowledged_at")));
            m.put("createdAt", iso(r.get("created_at")));
            m.put("vehicleTitle", r.get("manufacturing_year") + " " + r.get("make") + " " + r.get("model"));
            m.put("lotNo", r.get("lot_no"));
            m.put("vin", r.get("vin"));
            m.put("registrationNumber", r.get("registration_number"));
            m.put("clientName", r.get("client_name"));
            m.put("buyerName", r.get("buyer_name"));
            m.put("buyerEmail", r.get("buyer_email"));
            m.put("buyerPhone", r.get("buyer_phone"));
            m.put("gatePassNo", r.get("gate_pass_no"));
            m.put("vehicleReleased", r.get("vehicle_released"));
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Retrieves gate pass release voucher details for a vehicle.
     */
    @GetMapping("/purchases/{vehicleId}/gatepass")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getGatePass(@PathVariable UUID vehicleId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT gp.id, gp.gate_pass_no, gp.issued_at, gp.vehicle_released, gp.released_at,
                       v.id AS vehicle_id, v.make, v.model, v.manufacturing_year, v.lot_no, v.vin, v.registration_number, v.color, v.branch,
                       u.full_name AS buyer_name, u.email AS buyer_email, u.phone AS buyer_phone
                FROM vehicle_gate_passes gp
                JOIN vehicles v ON v.id = gp.vehicle_id
                JOIN users u ON u.id = gp.buyer_id
                WHERE gp.vehicle_id = ?
                ORDER BY gp.issued_at DESC
                LIMIT 1
                """, vehicleId);

        if (rows.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rows.get(0));
    }

    private String str(Object o) {
        return o != null ? o.toString() : null;
    }

    private String iso(Object ts) {
        if (ts == null) return null;
        if (ts instanceof Timestamp t) return t.toInstant().toString();
        return ts.toString();
    }

    private List<String> extractStringArray(Object obj) {
        if (obj instanceof Array sqlArr) {
            try {
                Object arr = sqlArr.getArray();
                if (arr instanceof String[] sArr) return Arrays.asList(sArr);
            } catch (Exception ignored) {}
        }
        return Collections.emptyList();
    }
}
