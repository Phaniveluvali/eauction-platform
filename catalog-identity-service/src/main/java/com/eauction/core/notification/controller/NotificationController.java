package com.eauction.core.notification.controller;

import com.eauction.core.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/otp")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send-whatsapp")
    public ResponseEntity<Map<String, Object>> sendWhatsAppOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Phone number is required"));
        }

        String otpCode = notificationService.sendWhatsAppOtp(phoneNumber);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "otpCode", otpCode,
                "message", "WhatsApp OTP successfully dispatched to " + phoneNumber,
                "channel", "WHATSAPP"
        ));
    }

    @PostMapping("/send-email")
    public ResponseEntity<Map<String, Object>> sendEmailOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String fullName = request.getOrDefault("fullName", "Valued Bidder");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email address is required"));
        }

        String otpCode = notificationService.sendEmailOtp(email, fullName);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "otpCode", otpCode,
                "message", "Verification OTP sent to " + email,
                "channel", "EMAIL"
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String destination = request.get("destination");
        String code = request.get("code");

        if (destination == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Destination and code are required"));
        }

        boolean verified = notificationService.verifyOtp(destination, code);
        if (verified) {
            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "message", "OTP verified successfully. You may proceed."
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "verified", false,
                    "message", "Invalid or expired OTP. Please request a new code."
            ));
        }
    }
}
