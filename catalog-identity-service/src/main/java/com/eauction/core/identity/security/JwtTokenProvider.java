package com.eauction.core.identity.security;

import com.eauction.core.identity.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider implements TokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:default-insecure-secret-key-that-is-at-least-256-bits-long!!}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    @Override
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

    @Override
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

    @Override
    public UUID extractUserId(String token) {
        Claims claims = parseAndValidateToken(token);
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    @Override
    public String extractEmail(String token) {
        return parseAndValidateToken(token).getSubject();
    }

    @Override
    public String extractRole(String token) {
        return parseAndValidateToken(token).get("role", String.class);
    }
}
