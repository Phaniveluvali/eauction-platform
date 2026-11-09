package com.eauction.core.identity.service;

import com.eauction.core.identity.dto.AuthResponse;
import com.eauction.core.identity.dto.LoginRequest;
import com.eauction.core.identity.dto.RegisterRequest;
import com.eauction.core.identity.dto.UserResponse;
import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.identity.security.TokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final TokenProvider tokenProvider;
    private final com.eauction.core.notification.service.NotificationService notificationService;
    private final long expirationMs;

    @Autowired
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
            TokenProvider tokenProvider,
            @Autowired(required = false) com.eauction.core.notification.service.NotificationService notificationService,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
        this.expirationMs = expirationMs;
    }

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TokenProvider tokenProvider,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this(userRepository, passwordEncoder, null, tokenProvider, null, expirationMs);
    }

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String jwtSecret,
            long expirationMs) {
        this(userRepository, passwordEncoder, null, new com.eauction.core.identity.security.JwtTokenProvider(jwtSecret, expirationMs), null, expirationMs);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        String rawPhone = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "";
        String cleanPhone = rawPhone.replaceAll("[\\s\\-\\(\\)]", "");
        if (cleanPhone.isEmpty()) {
            throw new IllegalArgumentException("Valid phone number is required");
        }
        if (userRepository.existsByPhoneNumber(cleanPhone) || (!rawPhone.equals(cleanPhone) && userRepository.existsByPhoneNumber(rawPhone))) {
            throw new IllegalArgumentException("Phone number is already registered: " + rawPhone);
        }

        // Email OTP verification check
        if (notificationService != null) {
            String code = request.getVerificationCode();
            if (code == null || code.trim().isEmpty()) {
                throw new IllegalArgumentException("Email verification code is required to complete registration");
            }
            boolean verified = notificationService.verifyOtp(normalizedEmail, code.trim());
            if (!verified) {
                throw new IllegalArgumentException("Invalid or expired email verification code. Please request a new code.");
            }
        }

        String normalizedRole = request.getRole().toUpperCase().trim();
        if (!"BUYER".equals(normalizedRole) && !"SELLER".equals(normalizedRole) && !"ADMIN".equals(normalizedRole)) {
            throw new IllegalArgumentException("Invalid role specified. Must be BUYER or SELLER");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(cleanPhone);
        user.setRole(normalizedRole);
        user.setPanNumber(request.getPanNumber() != null && !request.getPanNumber().isBlank() ? request.getPanNumber().trim() : null);
        user.setGstNumber(request.getGstNumber() != null && !request.getGstNumber().isBlank() ? request.getGstNumber().trim() : null);
        // KYC is verified if PAN is present for compliance, otherwise pending
        user.setKycVerified(user.getPanNumber() != null && !user.getPanNumber().isBlank());
        user.setIsActive(true);

        User savedUser = userRepository.saveAndFlush(user);

        // Assign user role in user_roles table
        try {
            if (jdbcTemplate != null) {
                jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = ?)) ON CONFLICT DO NOTHING", savedUser.getId(), normalizedRole);
            }
        } catch (Exception ignored) {}

        String token = generateToken(savedUser);
        List<String> roles = getUserRoles(savedUser.getId());
        List<String> permissions = getUserPermissions(savedUser.getId());
        boolean isSuper = roles.contains("SUPER_ADMIN") || "admin@eauction.in".equalsIgnoreCase(savedUser.getEmail());

        AuthResponse regResp = new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole(),
                savedUser.getKycVerified(),
                expirationMs
        );
        regResp.setRoles(roles);
        regResp.setPermissions(permissions);
        regResp.setSuperAdmin(isSuper);
        return regResp;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("User account has been deactivated");
        }

        String token = generateToken(user);
        List<String> roles = getUserRoles(user.getId());
        List<String> permissions = getUserPermissions(user.getId());
        boolean isSuper = roles.contains("SUPER_ADMIN") || "admin@eauction.in".equalsIgnoreCase(user.getEmail());

        AuthResponse loginResp = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getKycVerified(),
                expirationMs
        );
        loginResp.setRoles(roles);
        loginResp.setPermissions(permissions);
        loginResp.setSuperAdmin(isSuper);
        return loginResp;
    }

    @Transactional
    public AuthResponse handleAzureB2cLogin(com.eauction.core.identity.dto.AzureB2cLoginRequest request) {
        String targetEmail = null;
        String targetName = null;
        String targetPhone = null;

        // 1. If idToken is provided, extract claims from the payload
        if (request.getIdToken() != null && request.getIdToken().contains(".")) {
            try {
                String[] parts = request.getIdToken().split("\\.");
                if (parts.length >= 2) {
                    byte[] decoded = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(decoded);
                    if (root.has("emails") && root.get("emails").isArray() && root.get("emails").size() > 0) {
                        targetEmail = root.get("emails").get(0).asText();
                    } else if (root.has("email")) {
                        targetEmail = root.get("email").asText();
                    }
                    if (root.has("name")) {
                        targetName = root.get("name").asText();
                    } else if (root.has("given_name")) {
                        targetName = root.get("given_name").asText();
                    }
                    if (root.has("extension_MobileNumber")) {
                        targetPhone = root.get("extension_MobileNumber").asText();
                    } else if (root.has("phone_number")) {
                        targetPhone = root.get("phone_number").asText();
                    }
                }
            } catch (Exception ignored) {}
        }

        // Fallbacks if not in JWT
        if (targetEmail == null || targetEmail.isBlank()) {
            targetEmail = request.getEmail();
        }
        if (targetName == null || targetName.isBlank()) {
            targetName = request.getFullName();
        }
        if (targetPhone == null || targetPhone.isBlank()) {
            targetPhone = request.getPhoneNumber();
        }

        if (targetEmail == null || targetEmail.isBlank()) {
            throw new IllegalArgumentException("Azure AD B2C login requires an email address");
        }

        targetEmail = targetEmail.trim().toLowerCase();
        if (targetName == null || targetName.isBlank()) {
            targetName = "Emirates Transport User";
        }
        if (targetPhone == null || targetPhone.isBlank()) {
            targetPhone = "+971-5" + (int)(1000000 + Math.random() * 8999999);
        }

        final String finalEmail = targetEmail;
        final String finalName = targetName;
        final String finalPhone = targetPhone;

        User user = userRepository.findByEmail(targetEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(finalEmail);
                    newUser.setFullName(finalName);
                    newUser.setPasswordHash(passwordEncoder.encode("AZURE_B2C_SSO_" + UUID.randomUUID()));

                    // Prevent duplicate phone collision on auto-provision
                    String phoneToUse = finalPhone;
                    if (userRepository.existsByPhoneNumber(phoneToUse)) {
                        phoneToUse = "+971-5" + (int)(1000000 + Math.random() * 8999999);
                    }
                    newUser.setPhoneNumber(phoneToUse);
                    newUser.setRole("BUYER");
                    newUser.setKycVerified(true);
                    newUser.setIsActive(true);
                    User saved = userRepository.saveAndFlush(newUser);

                    try {
                        if (jdbcTemplate != null) {
                            jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = 'BUYER')) ON CONFLICT DO NOTHING", saved.getId());
                        }
                    } catch (Exception ignored) {}
                    return saved;
                });

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("User account has been deactivated");
        }

        String token = generateToken(user);
        List<String> roles = getUserRoles(user.getId());
        List<String> permissions = getUserPermissions(user.getId());
        boolean isSuper = roles.contains("SUPER_ADMIN") || "admin@eauction.in".equalsIgnoreCase(user.getEmail());

        AuthResponse loginResp = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getKycVerified(),
                expirationMs
        );
        loginResp.setRoles(roles);
        loginResp.setPermissions(permissions);
        loginResp.setSuperAdmin(isSuper);
        return loginResp;
    }

    @Transactional
    public AuthResponse handleKeycloakLogin(com.eauction.core.identity.dto.KeycloakLoginRequest request) {
        String targetEmail = null;
        String targetName = null;
        String targetPhone = null;

        // Extract claims from Keycloak token payload if provided
        String rawToken = request.getIdToken() != null ? request.getIdToken() : request.getAccessToken();
        if (rawToken != null && rawToken.contains(".")) {
            try {
                String[] parts = rawToken.split("\\.");
                if (parts.length >= 2) {
                    byte[] decoded = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(decoded);
                    if (root.has("email")) {
                        targetEmail = root.get("email").asText();
                    } else if (root.has("preferred_username") && root.get("preferred_username").asText().contains("@")) {
                        targetEmail = root.get("preferred_username").asText();
                    }
                    if (root.has("name")) {
                        targetName = root.get("name").asText();
                    } else if (root.has("given_name")) {
                        targetName = root.get("given_name").asText();
                    }
                    if (root.has("phone_number")) {
                        targetPhone = root.get("phone_number").asText();
                    }
                }
            } catch (Exception ignored) {}
        }

        if (targetEmail == null || targetEmail.isBlank()) {
            targetEmail = request.getEmail() != null ? request.getEmail() : request.getUsername();
        }
        if (targetName == null || targetName.isBlank()) {
            targetName = request.getFullName();
        }
        if (targetPhone == null || targetPhone.isBlank()) {
            targetPhone = request.getPhoneNumber();
        }

        if (targetEmail == null || targetEmail.isBlank()) {
            throw new IllegalArgumentException("Keycloak login requires an email address");
        }

        targetEmail = targetEmail.trim().toLowerCase();
        if (targetName == null || targetName.isBlank()) {
            targetName = "Keycloak User";
        }
        if (targetPhone == null || targetPhone.isBlank()) {
            targetPhone = "+971-5" + (int)(1000000 + Math.random() * 8999999);
        }

        final String finalEmail = targetEmail;
        final String finalName = targetName;
        final String finalPhone = targetPhone;

        User user = userRepository.findByEmail(targetEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(finalEmail);
                    newUser.setFullName(finalName);
                    newUser.setPasswordHash(passwordEncoder.encode("KEYCLOAK_SSO_" + UUID.randomUUID()));

                    String phoneToUse = finalPhone;
                    if (userRepository.existsByPhoneNumber(phoneToUse)) {
                        phoneToUse = "+971-5" + (int)(1000000 + Math.random() * 8999999);
                    }
                    newUser.setPhoneNumber(phoneToUse);
                    newUser.setRole("BUYER");
                    newUser.setKycVerified(true);
                    newUser.setIsActive(true);
                    User saved = userRepository.saveAndFlush(newUser);

                    try {
                        if (jdbcTemplate != null) {
                            jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = 'BUYER')) ON CONFLICT DO NOTHING", saved.getId());
                        }
                    } catch (Exception ignored) {}
                    return saved;
                });

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("User account has been deactivated");
        }

        String token = generateToken(user);
        List<String> roles = getUserRoles(user.getId());
        List<String> permissions = getUserPermissions(user.getId());
        boolean isSuper = roles.contains("SUPER_ADMIN") || "admin@eauction.in".equalsIgnoreCase(user.getEmail());

        AuthResponse loginResp = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getKycVerified(),
                expirationMs
        );
        loginResp.setRoles(roles);
        loginResp.setPermissions(permissions);
        loginResp.setSuperAdmin(isSuper);
        return loginResp;
    }

    public String generateToken(User user) {
        return tokenProvider.generateToken(user);
    }

    public Claims parseAndValidateToken(String token) {
        return tokenProvider.parseAndValidateToken(token);
    }

    public UUID extractUserId(String token) {
        return tokenProvider.extractUserId(token);
    }

    public String extractEmail(String token) {
        return tokenProvider.extractEmail(token);
    }

    public String extractRole(String token) {
        return tokenProvider.extractRole(token);
    }

    public List<String> getUserRoles(UUID userId) {
        if (jdbcTemplate == null || userId == null) {
            return Collections.emptyList();
        }
        try {
            return jdbcTemplate.queryForList(
                    "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?",
                    String.class,
                    userId
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public List<String> getUserPermissions(UUID userId) {
        if (jdbcTemplate == null || userId == null) {
            return Collections.emptyList();
        }
        try {
            return jdbcTemplate.queryForList(
                    "SELECT DISTINCT p.code FROM permissions p " +
                    "JOIN role_permissions rp ON p.id = rp.permission_id " +
                    "JOIN user_roles ur ON rp.role_id = ur.role_id " +
                    "WHERE ur.user_id = ?",
                    String.class,
                    userId
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        UserResponse response = UserResponse.fromEntity(user);
        List<String> roles = getUserRoles(userId);
        List<String> permissions = getUserPermissions(userId);
        boolean isSuper = roles.contains("SUPER_ADMIN") || "admin@eauction.in".equalsIgnoreCase(user.getEmail());
        response.setRoles(roles);
        response.setPermissions(permissions);
        response.setSuperAdmin(isSuper);
        return response;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UserResponse> searchUsers(
            String role, String search, org.springframework.data.domain.Pageable pageable) {
        return userRepository.searchUsers(role, search, pageable)
                .map(u -> {
                    UserResponse resp = UserResponse.fromEntity(u);
                    List<String> roles = getUserRoles(u.getId());
                    boolean isSuper = roles.contains("SUPER_ADMIN") || "admin@eauction.in".equalsIgnoreCase(u.getEmail());
                    resp.setRoles(roles);
                    resp.setSuperAdmin(isSuper);
                    return resp;
                });
    }

    @Transactional
    public void resetUserPassword(UUID userId, String newPassword, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }
}
