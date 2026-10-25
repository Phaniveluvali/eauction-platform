package com.eauction.core.identity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/sessions")
public class UserSessionController {

    private final JdbcTemplate jdbcTemplate;

    public UserSessionController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, Object>> heartbeat(
            @RequestBody Map<String, Object> payload,
            jakarta.servlet.http.HttpServletRequest request) {
        String userId = (String) payload.get("userId");
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId required"));
        }

        String userName = (String) payload.getOrDefault("userName", "User");
        String email = (String) payload.getOrDefault("email", "user@eauction.in");
        String role = (String) payload.getOrDefault("role", "BUYER");
        String currentScreen = (String) payload.getOrDefault("currentScreen", "Home");
        String deviceType = (String) payload.getOrDefault("deviceType", "Desktop");
        String browser = (String) payload.getOrDefault("browser", "Chrome");
        String os = (String) payload.getOrDefault("os", "Android");
        String protocol = (String) payload.getOrDefault("protocol", "HTTPS");
        String location = (String) payload.getOrDefault("location", "Dubai, UAE");
        String countryCode = (String) payload.getOrDefault("countryCode", "AE");
        String podName = System.getenv().getOrDefault("HOSTNAME", "eauction-catalog-identity-78f898c76f");
        String podIp = "172.16.138.78";

        // Accurate Client Public IP Extraction: prioritize Ingress X-Forwarded-For header
        String ipAddress = null;
        if (request != null) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank() && !"unknown".equalsIgnoreCase(forwarded)) {
                ipAddress = forwarded.split(",")[0].trim();
            }
            if (ipAddress == null || ipAddress.isBlank()) {
                ipAddress = request.getHeader("X-Real-IP");
            }
            if (ipAddress == null || ipAddress.isBlank()) {
                ipAddress = request.getRemoteAddr();
            }
        }
        if (ipAddress == null || ipAddress.isBlank() || "127.0.0.1".equals(ipAddress) || ipAddress.startsWith("10.") || ipAddress.startsWith("172.")) {
            if (payload.get("clientIp") != null && !payload.get("clientIp").toString().isBlank()) {
                ipAddress = payload.get("clientIp").toString();
            } else if (payload.get("ipAddress") != null && !payload.get("ipAddress").toString().isBlank()) {
                ipAddress = payload.get("ipAddress").toString();
            }
        }
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = "202.153.35.221";
        }

        BigDecimal deposit = BigDecimal.ZERO;
        if (payload.get("securityDeposit") != null) {
            try {
                deposit = new BigDecimal(payload.get("securityDeposit").toString());
            } catch (Exception ignored) {}
        }

        BigDecimal biddingLimit = deposit.multiply(new BigDecimal("200"));
        BigDecimal usedLimit = BigDecimal.ZERO;
        if (payload.get("usedBiddingLimit") != null) {
            try {
                usedLimit = new BigDecimal(payload.get("usedBiddingLimit").toString());
            } catch (Exception ignored) {}
        }

        int bidsPlaced = 0;
        if (payload.get("bidsPlacedInSession") instanceof Number) {
            bidsPlaced = ((Number) payload.get("bidsPlacedInSession")).intValue();
        }

        String sessId = "sess-" + (userId.length() > 6 ? userId.substring(0, 6) : userId) + "-" + deviceType.toLowerCase();

        String upsertSql = """
            INSERT INTO user_sessions (
                id, user_id, user_name, email, role, ip_address, location, country_code,
                device_type, browser, os, protocol, pod_name, pod_ip, current_screen,
                security_deposit, bidding_limit, used_bidding_limit, bids_placed_in_session,
                last_heartbeat, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'ONLINE')
            ON CONFLICT (user_id, device_type) DO UPDATE SET
                user_name = EXCLUDED.user_name,
                email = EXCLUDED.email,
                role = EXCLUDED.role,
                ip_address = EXCLUDED.ip_address,
                location = EXCLUDED.location,
                country_code = EXCLUDED.country_code,
                browser = EXCLUDED.browser,
                os = EXCLUDED.os,
                protocol = EXCLUDED.protocol,
                current_screen = EXCLUDED.current_screen,
                security_deposit = EXCLUDED.security_deposit,
                bidding_limit = EXCLUDED.bidding_limit,
                used_bidding_limit = EXCLUDED.used_bidding_limit,
                bids_placed_in_session = EXCLUDED.bids_placed_in_session,
                last_heartbeat = CURRENT_TIMESTAMP,
                status = 'ONLINE';
        """;

        try {
            jdbcTemplate.update(
                upsertSql,
                sessId, userId, userName, email, role, ipAddress, location, countryCode,
                deviceType, browser, os, protocol, podName, podIp, currentScreen,
                deposit, biddingLimit, usedLimit, bidsPlaced
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("status", "OK"));
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getLiveSessions() {
        String query = """
            SELECT id, user_id, user_name, email, role, ip_address, location, country_code,
                   device_type, browser, os, protocol, pod_name, pod_ip, current_screen,
                   security_deposit, bidding_limit, used_bidding_limit, bids_placed_in_session,
                   EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_heartbeat))::int AS seconds_ago,
                   ping_ms, status
            FROM user_sessions
            WHERE last_heartbeat >= CURRENT_TIMESTAMP - INTERVAL '60 SECONDS'
            ORDER BY last_heartbeat DESC;
        """;

        List<Map<String, Object>> sessions = new ArrayList<>();
        try {
            sessions = jdbcTemplate.query(query, (rs, rowNum) -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", rs.getString("id"));
                m.put("userId", rs.getString("user_id"));
                m.put("userName", rs.getString("user_name"));
                m.put("email", rs.getString("email"));
                m.put("role", rs.getString("role"));
                m.put("ipAddress", rs.getString("ip_address"));
                m.put("location", rs.getString("location"));
                m.put("countryCode", rs.getString("country_code"));
                m.put("deviceType", rs.getString("device_type"));
                m.put("browser", rs.getString("browser"));
                m.put("os", rs.getString("os"));
                m.put("protocol", rs.getString("protocol"));
                m.put("podName", rs.getString("pod_name"));
                m.put("podIp", rs.getString("pod_ip"));
                m.put("currentScreen", rs.getString("current_screen"));
                m.put("securityDeposit", rs.getBigDecimal("security_deposit") != null ? rs.getBigDecimal("security_deposit").doubleValue() : 0);
                m.put("biddingLimit", rs.getBigDecimal("bidding_limit") != null ? rs.getBigDecimal("bidding_limit").doubleValue() : 0);
                m.put("usedBiddingLimit", rs.getBigDecimal("used_bidding_limit") != null ? rs.getBigDecimal("used_bidding_limit").doubleValue() : 0);
                int bids = rs.getInt("bids_placed_in_session");
                m.put("bidsPlacedInSession", bids);
                int sec = rs.getInt("seconds_ago");
                m.put("lastHeartbeat", sec <= 1 ? "1s ago" : sec + "s ago");
                m.put("loginTime", "Active now");
                m.put("pingMs", rs.getDouble("ping_ms"));
                m.put("status", bids > 0 ? "BIDDING" : rs.getString("status"));
                return m;
            });
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }

        long activeBidders = sessions.stream()
                .filter(s -> ((Number) s.getOrDefault("bidsPlacedInSession", 0)).intValue() > 0)
                .count();

        Map<String, Object> resp = new HashMap<>();
        resp.put("sessions", sessions);
        resp.put("totalUsers", sessions.size());
        resp.put("activeBidders", activeBidders);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String deviceType = payload.get("deviceType");
        if (userId != null && !userId.isBlank()) {
            try {
                if (deviceType != null && !deviceType.isBlank()) {
                    jdbcTemplate.update("DELETE FROM user_sessions WHERE user_id = ? AND device_type = ?", userId, deviceType);
                } else {
                    jdbcTemplate.update("DELETE FROM user_sessions WHERE user_id = ?", userId);
                }
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("status", "LOGGED_OUT"));
    }
}
