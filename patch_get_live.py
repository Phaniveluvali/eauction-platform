path = '/home/nodejs/eauction-workspace/catalog-identity-service/src/main/java/com/eauction/core/identity/controller/UserSessionController.java'
with open(path, 'r') as f:
    c = f.read()

# Replace getLiveSessions method
old_get_live_start = '    @GetMapping("/live")\n    public ResponseEntity<Map<String, Object>> getLiveSessions() {'
old_get_live_end = '        return ResponseEntity.ok(resp);\n    }'

new_get_live = '''    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getLiveSessions() {
        String query = """
            SELECT id, user_id, user_name, email, role, ip_address, client_ip, location, country_code,
                   device_type, browser, os, protocol, pod_name, pod_ip, current_screen,
                   security_deposit, bidding_limit, used_bidding_limit, bids_placed_in_session,
                   EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_heartbeat))::int AS seconds_ago,
                   ping_ms, status
            FROM user_sessions
            WHERE last_heartbeat >= CURRENT_TIMESTAMP - INTERVAL '120 SECONDS'
            ORDER BY last_heartbeat DESC
            LIMIT 1500;
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
                String cIp = rs.getString("client_ip");
                m.put("clientIp", cIp != null && !cIp.isBlank() ? cIp : rs.getString("ip_address"));
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
        } catch (Exception ignored) {}

        long activeBidders = sessions.stream()
                .filter(s -> ((Number) s.getOrDefault("bidsPlacedInSession", 0)).intValue() > 0)
                .count();

        Map<String, Object> resp = new HashMap<>();
        resp.put("sessions", sessions);
        resp.put("totalUsers", sessions.size());
        resp.put("activeBidders", activeBidders);
        return ResponseEntity.ok(resp);
    }'''

start_idx = c.find(old_get_live_start)
if start_idx != -1:
    end_idx = c.find(old_get_live_end, start_idx)
    if end_idx != -1:
        end_idx += len(old_get_live_end)
        c = c[:start_idx] + new_get_live + c[end_idx:]
        with open(path, 'w') as f:
            f.write(c)
        print("Successfully updated getLiveSessions to query all active sessions from PostgreSQL!")
    else:
        print("Could not find end of getLiveSessions")
else:
    print("Could not find start of getLiveSessions")
