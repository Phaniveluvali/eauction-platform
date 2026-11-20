package com.eauction.core.identity.controller;

import com.eauction.core.identity.dto.AuthResponse;
import com.eauction.core.identity.dto.LoginRequest;
import com.eauction.core.identity.dto.RegisterRequest;
import com.eauction.core.identity.dto.UpdateUserRequest;
import com.eauction.core.identity.dto.UserResponse;
import com.eauction.core.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
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
    public ResponseEntity<UserResponse> getProfile(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID userId = authService.extractUserId(token);
        UserResponse response = authService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Boolean>> checkFullName(@RequestParam(required = false) String fullName) {
        boolean exists = authService.checkFullNameDuplicate(fullName);
        Map<String, Boolean> res = new HashMap<>();
        res.put("exists", exists);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        boolean initiated = authService.requestForgotPassword(email);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "If your email address is registered on AJ Auctions, a password reset link has been dispatched.");
        res.put("found", initiated);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/users")
    public ResponseEntity<org.springframework.data.domain.Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        org.springframework.data.domain.Page<UserResponse> users = authService.searchUsers(role, search, pageable);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID callerId = authService.extractUserId(token);
        UserResponse caller = authService.getUserProfile(callerId);

        // Only Admin or the user themselves can update their profile
        if (!"ADMIN".equals(caller.getRole()) && !caller.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserResponse updated = authService.updateUser(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/contract")
    public ResponseEntity<UserResponse> updateSellerContract(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID callerId = authService.extractUserId(token);
        UserResponse caller = authService.getUserProfile(callerId);

        if (!"ADMIN".equals(caller.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UpdateUserRequest req = new UpdateUserRequest();
        req.setContractStatus(body.get("contractStatus"));
        if (body.containsKey("contractDocumentUrl")) {
            req.setContractDocumentUrl(body.get("contractDocumentUrl"));
        }

        UserResponse updated = authService.updateUser(id, req);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID adminId = authService.extractUserId(token);
        UserResponse admin = authService.getUserProfile(adminId);
        if (!"ADMIN".equals(admin.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only Administrators can reset passwords."));
        }

        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters."));
        }

        authService.resetUserPassword(id, newPassword.trim(), admin.getEmail());
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Password reset successfully for user.");
        return ResponseEntity.ok(resp);
    }
}
