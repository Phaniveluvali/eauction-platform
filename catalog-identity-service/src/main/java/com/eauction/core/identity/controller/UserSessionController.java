package com.eauction.core.identity.controller;

import com.eauction.core.identity.service.UserSessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
public class UserSessionController {

    private final UserSessionService userSessionService;

    public UserSessionController(UserSessionService userSessionService) {
        this.userSessionService = userSessionService;
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, String>> heartbeat(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        userSessionService.processHeartbeat(payload, request);
        return ResponseEntity.ok(Map.of("status", "OK"));
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getLiveSessions() {
        return ResponseEntity.ok(userSessionService.getLiveSessions());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String deviceType = payload.get("deviceType");
        userSessionService.logout(userId, deviceType);
        return ResponseEntity.ok(Map.of("status", "LOGGED_OUT"));
    }

    @PostMapping("/migrate")
    public ResponseEntity<Map<String, Object>> migrateSession(@RequestBody Map<String, String> payload) {
        String sessionId = payload.get("sessionId");
        String targetPod = payload.get("targetPod");
        if (sessionId == null || targetPod == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "sessionId and targetPod required"));
        }
        Map<String, Object> result = userSessionService.migrateSession(sessionId, targetPod);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/migrate-bulk")
    public ResponseEntity<Map<String, Object>> bulkMigrateSessions(@RequestBody Map<String, Object> payload) {
        String sourcePod = (String) payload.get("sourcePod");
        String targetPod = (String) payload.get("targetPod");
        int count = payload.get("count") instanceof Number ? ((Number) payload.get("count")).intValue() : 500;

        if (sourcePod == null || targetPod == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "sourcePod and targetPod required"));
        }

        Map<String, Object> result = userSessionService.bulkMigrateSessions(sourcePod, targetPod, count);
        return ResponseEntity.ok(result);
    }
}
