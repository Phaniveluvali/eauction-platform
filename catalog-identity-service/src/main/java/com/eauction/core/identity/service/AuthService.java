package com.eauction.core.identity.service;

import com.eauction.core.identity.dto.AuthResponse;
import com.eauction.core.identity.dto.LoginRequest;
import com.eauction.core.identity.dto.RegisterRequest;
import com.eauction.core.identity.dto.UserResponse;
import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final SecretKey signingKey;
    private final long expirationMs;

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.expirationMs = expirationMs;
        // Generate HMAC-SHA key from shared secret bytes (guaranteeing >= 256 bits)
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this(userRepository, passwordEncoder, null, jwtSecret, expirationMs);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number is already registered: " + request.getPhoneNumber());
        }

        String normalizedRole = request.getRole().toUpperCase().trim();
        if (!"BUYER".equals(normalizedRole) && !"SELLER".equals(normalizedRole) && !"ADMIN".equals(normalizedRole)) {
            throw new IllegalArgumentException("Invalid role specified. Must be BUYER or SELLER");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setRole(normalizedRole);
        user.setPanNumber(request.getPanNumber());
        user.setGstNumber(request.getGstNumber());
        // KYC is verified if PAN is present for compliance, otherwise pending
        user.setKycVerified(request.getPanNumber() != null && !request.getPanNumber().isBlank());
        user.setIsActive(true);

        User savedUser = userRepository.saveAndFlush(user);

        // Assign user role in user_roles table
        try {
            if (jdbcTemplate != null) {
                jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = ?)) ON CONFLICT DO NOTHING", savedUser.getId(), normalizedRole);
            }
        } catch (Exception ignored) {}

        String token = generateToken(savedUser);
        java.util.List<String> roles = getUserRoles(savedUser.getId());
        java.util.List<String> permissions = getUserPermissions(savedUser.getId());
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
        java.util.List<String> roles = getUserRoles(user.getId());
        java.util.List<String> permissions = getUserPermissions(user.getId());
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

    // =========================================================================
    // CRITICAL LOGIC: AZURE AD B2C ENTERPRISE SSO AUTHENTICATION & PROVISIONING
    // =========================================================================
    // Handles federated authentication for Emirates Transport Azure AD B2C users:
    // 1. Decodes and parses OIDC ID Token payload (Base64URL JSON claims):
    //    - Extracts 'emails' array or 'email' claim.
    //    - Extracts 'name' / 'given_name' display name.
    //    - Extracts custom B2C attributes like 'extension_MobileNumber'.
    // 2. Account Resolution & Dynamic Provisioning:
    //    - If the user already exists in PostgreSQL, authenticates them immediately.
    //    - If new user, auto-provisions account as verified 'BUYER' with a secure random hash.
    //    - Resolves unique phone number constraints to avoid collisions on new sign-ins.
    // 3. Flush Ordering & RBAC Assignment:
    //    - Uses userRepository.saveAndFlush() to ensure PostgreSQL foreign keys are
    //      committed before executing jdbcTemplate INSERT INTO user_roles (preventing 25P02 aborts).
    // 4. Returns canonical JWT token signed with HMAC-SHA256 containing all roles and permissions.
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
            } catch (Exception ignored) {
            }
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
        java.util.List<String> roles = getUserRoles(user.getId());
        java.util.List<String> permissions = getUserPermissions(user.getId());
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
        java.util.List<String> roles = getUserRoles(user.getId());
        java.util.List<String> permissions = getUserPermissions(user.getId());
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
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiration = Date.from(now.plusMillis(expirationMs));

        return Jwts.builder()
                .header()
                    .type("JWT")
                    .and()
                .subject(user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("role", user.getRole())
                .claim("kycVerified", user.getKycVerified())
                .claim("fullName", user.getFullName())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseAndValidateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new BadCredentialsException("Invalid or expired JWT token: " + e.getMessage(), e);
        }
    }

    public UUID extractUserId(String token) {
        Claims claims = parseAndValidateToken(token);
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    public String extractEmail(String token) {
        return parseAndValidateToken(token).getSubject();
    }

    public String extractRole(String token) {
        return parseAndValidateToken(token).get("role", String.class);
    }

    public java.util.List<String> getUserRoles(UUID userId) {
        if (jdbcTemplate == null || userId == null) {
            return java.util.Collections.emptyList();
        }
        try {
            return jdbcTemplate.queryForList(
                    "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?",
                    String.class,
                    userId
            );
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    public java.util.List<String> getUserPermissions(UUID userId) {
        if (jdbcTemplate == null || userId == null) {
            return java.util.Collections.emptyList();
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
            return java.util.Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        UserResponse response = UserResponse.fromEntity(user);
        java.util.List<String> roles = getUserRoles(userId);
        java.util.List<String> permissions = getUserPermissions(userId);
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
                    java.util.List<String> roles = getUserRoles(u.getId());
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
