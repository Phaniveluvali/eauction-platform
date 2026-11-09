package com.eauction.core.identity.security;

import com.eauction.core.identity.model.User;
import io.jsonwebtoken.Claims;
import java.util.UUID;

public interface TokenProvider {
    String generateToken(User user);
    Claims parseAndValidateToken(String token);
    UUID extractUserId(String token);
    String extractEmail(String token);
    String extractRole(String token);
}
