package com.eauction.core.identity.controller;

import com.eauction.core.identity.dto.AuthResponse;
import com.eauction.core.identity.dto.LoginRequest;
import com.eauction.core.identity.dto.RegisterRequest;
import com.eauction.core.identity.dto.UserResponse;
import com.eauction.core.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/azure-b2c")
    public ResponseEntity<AuthResponse> azureB2cLogin(@RequestBody com.eauction.core.identity.dto.AzureB2cLoginRequest request) {
        AuthResponse response = authService.handleAzureB2cLogin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/keycloak")
    public ResponseEntity<AuthResponse> keycloakLogin(@RequestBody com.eauction.core.identity.dto.KeycloakLoginRequest request) {
        AuthResponse response = authService.handleKeycloakLogin(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID userId = authService.extractUserId(token);
        UserResponse response = authService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<org.springframework.data.domain.Page<UserResponse>> getUsers(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") int size,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String role,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search) {
        org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        org.springframework.data.domain.Page<UserResponse> users = authService.searchUsers(role, search, pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<java.util.Map<String, Object>> resetPassword(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @org.springframework.web.bind.annotation.PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID adminId = authService.extractUserId(token);
        UserResponse admin = authService.getUserProfile(adminId);
        if (!"ADMIN".equals(admin.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", "Only Administrators can reset passwords."));
        }

        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Password must be at least 6 characters."));
        }

        authService.resetUserPassword(id, newPassword.trim(), admin.getEmail());
        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("message", "Password reset successfully for user.");
        return ResponseEntity.ok(resp);
    }
}
