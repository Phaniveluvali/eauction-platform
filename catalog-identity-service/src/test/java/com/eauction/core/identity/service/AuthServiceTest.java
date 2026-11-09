package com.eauction.core.identity.service;

import com.eauction.core.identity.dto.AuthResponse;
import com.eauction.core.identity.dto.LoginRequest;
import com.eauction.core.identity.dto.RegisterRequest;
import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;
    private final String secretKey = "eauction_secret_jwt_signing_key_32bytes_minimum_length_production_ready_value!";

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, secretKey, 3600000L);
    }

    @Test
    @DisplayName("Should successfully register a new user, hash password, and issue HS256 JWT")
    void shouldRegisterUserAndGenerateToken() {
        RegisterRequest req = new RegisterRequest(
                "bidder@eauction.in",
                "StrongPassword123!",
                "Vikram Sharma",
                "+919876543210",
                "BUYER",
                "ABCDE1234F",
                null
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            u.setCreatedAt(Instant.now());
            u.setUpdatedAt(Instant.now());
            return u;
        });

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertNotNull(resp.getToken());
        assertEquals("bidder@eauction.in", resp.getEmail());
        assertEquals("BUYER", resp.getRole());
        assertTrue(resp.isKycVerified());

        // Validate generated JWT claims
        Claims claims = authService.parseAndValidateToken(resp.getToken());
        assertEquals("bidder@eauction.in", claims.getSubject());
        assertEquals("BUYER", claims.get("role", String.class));
        assertNotNull(claims.get("userId", String.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void shouldLoginWithValidCredentials() {
        UUID userId = UUID.randomUUID();
        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("seller@eauction.in");
        existingUser.setPasswordHash(passwordEncoder.encode("SecretPass123!"));
        existingUser.setFullName("Ramesh Patel");
        existingUser.setRole("SELLER");
        existingUser.setIsActive(true);
        existingUser.setKycVerified(true);

        when(userRepository.findByEmail("seller@eauction.in")).thenReturn(Optional.of(existingUser));

        LoginRequest req = new LoginRequest("seller@eauction.in", "SecretPass123!");
        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals(userId, resp.getUserId());
        assertEquals("SELLER", resp.getRole());
    }

    @Test
    @DisplayName("Should reject login with bad password")
    void shouldFailLoginWithBadPassword() {
        User existingUser = new User();
        existingUser.setEmail("seller@eauction.in");
        existingUser.setPasswordHash(passwordEncoder.encode("CorrectPassword"));

        when(userRepository.findByEmail("seller@eauction.in")).thenReturn(Optional.of(existingUser));

        LoginRequest req = new LoginRequest("seller@eauction.in", "WrongPassword");
        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Should successfully register when valid OTP verification code is provided")
    void shouldRegisterWithValidOtpVerificationCode() {
        com.eauction.core.notification.service.NotificationService mockNotificationService =
                mock(com.eauction.core.notification.service.NotificationService.class);
        when(mockNotificationService.verifyOtp("bidder@eauction.in", "123456")).thenReturn(true);

        AuthService serviceWithOtp = new AuthService(
                userRepository,
                passwordEncoder,
                null,
                new com.eauction.core.identity.security.JwtTokenProvider(secretKey, 3600000L),
                mockNotificationService,
                3600000L
        );

        RegisterRequest req = new RegisterRequest(
                "bidder@eauction.in",
                "StrongPassword123!",
                "Vikram Sharma",
                "+919876543210",
                "BUYER",
                null,
                null,
                "123456"
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            u.setCreatedAt(Instant.now());
            u.setUpdatedAt(Instant.now());
            return u;
        });

        AuthResponse resp = serviceWithOtp.register(req);
        assertNotNull(resp);
        assertEquals("bidder@eauction.in", resp.getEmail());
        verify(mockNotificationService).verifyOtp("bidder@eauction.in", "123456");
    }

    @Test
    @DisplayName("Should reject registration when OTP code is invalid or missing")
    void shouldRejectRegistrationWithInvalidOtp() {
        com.eauction.core.notification.service.NotificationService mockNotificationService =
                mock(com.eauction.core.notification.service.NotificationService.class);
        when(mockNotificationService.verifyOtp("bidder@eauction.in", "999999")).thenReturn(false);

        AuthService serviceWithOtp = new AuthService(
                userRepository,
                passwordEncoder,
                null,
                new com.eauction.core.identity.security.JwtTokenProvider(secretKey, 3600000L),
                mockNotificationService,
                3600000L
        );

        RegisterRequest req = new RegisterRequest(
                "bidder@eauction.in",
                "StrongPassword123!",
                "Vikram Sharma",
                "+919876543210",
                "BUYER",
                null,
                null,
                "999999"
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> serviceWithOtp.register(req));
        assertTrue(ex.getMessage().contains("verification code"));
    }
}
