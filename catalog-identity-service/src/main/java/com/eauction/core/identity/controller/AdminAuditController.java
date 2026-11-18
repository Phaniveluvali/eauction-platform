package com.eauction.core.identity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    private final JdbcTemplate jdbcTemplate;

    public AdminAuditController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "150") int limit) {
        String sql = "SELECT id, admin_user_id, admin_email, action, entity_type, entity_id, details, created_at FROM admin_audit_logs ORDER BY created_at DESC LIMIT ?";
        List<Map<String, Object>> logs = jdbcTemplate.queryForList(sql, limit);
        return ResponseEntity.ok(logs);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable UUID userId,
            @RequestBody Map<String, Object> payload) {
        String newRole = (String) payload.get("role");
        if (newRole != null && !newRole.isBlank()) {
            String roleUpper = newRole.toUpperCase().trim();
            jdbcTemplate.update("UPDATE users SET role = ? WHERE id = ?", roleUpper, userId);
            try {
                jdbcTemplate.update(
                        "INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = ?)) ON CONFLICT (user_id, role_id) DO NOTHING",
                        userId, roleUpper
                );
            } catch (Exception ignored) {}
            // Record in audit log
            try {
                jdbcTemplate.update(
                        "INSERT INTO admin_audit_logs (action, entity_type, entity_id, details) VALUES ('USER_ROLE_UPDATED', 'USER', ?, ?)",
                        userId.toString(), "Updated assigned role to " + roleUpper
                );
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "userId", userId, "role", newRole));
    }
}
