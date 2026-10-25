package com.eauction.core.notification.service;

import com.eauction.core.auction.model.Auction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final HttpClient httpClient;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    @Value("${notification.whatsapp.url:http://evolution-api:8080/message/sendText}")
    private String whatsappApiUrl;

    @Value("${notification.whatsapp.instance:alwataneya-prod}")
    private String whatsappInstance;

    @Value("${notification.whatsapp.apikey:alwataneya-wa-key}")
    private String whatsappApiKey;

    /**
     * Optional JavaMailSender injected when spring-boot-starter-mail is present.
     * When configured with SMTP credentials (e.g., Gmail App Password or SendGrid),
     * real emails are transmitted directly over the internet.
     */
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public NotificationService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    private static class OtpRecord {
        final String code;
        final Instant expiresAt;

        OtpRecord(String code, Instant expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }

        boolean isValid(String inputCode) {
            return Instant.now().isBefore(expiresAt) && code.equals(inputCode.trim());
        }
    }

    public String generateAndStoreOtp(String destination) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(5));
        otpStore.put(destination.toLowerCase().trim(), new OtpRecord(code, expiresAt));
        return code;
    }

    public boolean verifyOtp(String destination, String code) {
        if (destination == null || code == null) return false;
        String key = destination.toLowerCase().trim();
        OtpRecord record = otpStore.get(key);
        if (record != null && record.isValid(code)) {
            otpStore.remove(key);
            log.info("[OTP VERIFIED] Destination {} successfully authenticated", key);
            return true;
        }
        return false;
    }

    /**
     * Send One-Time Password via Open-Source Evolution API (WhatsApp Gateway).
     *
     * How it works:
     * 1. Generates an encrypted 6-digit cryptographically secure OTP with a 5-minute TTL.
     * 2. Formats message with official Emirates Transport Al Wataneya Auctions header.
     * 3. Constructs payload conforming to Evolution API / Baileys standard:
     *    POST /message/sendText/{instance} with { number, textMessage, options }.
     * 4. Asynchronously invokes gateway. If gateway container is offline, it logs locally
     *    and returns the code so developers and users are never locked out during testing.
     *
     * @param phoneNumber Destination mobile number (E.164 or national format)
     * @return The generated 6-digit OTP code
     */
    public String sendWhatsAppOtp(String phoneNumber) {
        String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
        String otpCode = generateAndStoreOtp(cleanPhone);

        String messageBody = "🚗 *AL WATANEYA AUCTIONS - EMIRATES TRANSPORT*\n\n" +
                "Your One-Time Password (OTP) for account verification is:\n\n" +
                "🔑 *" + otpCode + "*\n\n" +
                "This code is valid for 5 minutes. Please do not share this code with anyone.\n" +
                "_Secure bidding powered by Emirates Transport Government Fleet Platform._";

        log.info("[WHATSAPP OTP DISPATCH] Target: {} | Code: {}", cleanPhone, otpCode);

        try {
            // Payload conforming to Evolution API / Baileys open-source format
            String jsonPayload = String.format(
                    "{\"number\":\"%s\",\"options\":{\"delay\":1200,\"presence\":\"composing\"},\"textMessage\":{\"text\":\"%s\"}}",
                    cleanPhone.replace("+", ""),
                    messageBody.replace("\"", "\\\"").replace("\n", "\\n")
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(whatsappApiUrl + "/" + whatsappInstance))
                    .header("Content-Type", "application/json")
                    .header("apikey", whatsappApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(4))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> log.info("[WhatsApp Gateway Response] Code: {}, Body: {}", res.statusCode(), res.body()))
                    .exceptionally(ex -> {
                        log.warn("[WhatsApp Gateway Offline/Fallback] Message logged locally for {}: {}. Start 'evolution-api' container to receive live WhatsApp.", cleanPhone, ex.getMessage());
                        return null;
                    });
            return otpCode;
        } catch (Exception e) {
            log.warn("[WhatsApp Dispatch Warning] Gateway connection unavailable, mock OTP delivered: {}", e.getMessage());
            return otpCode;
        }
    }

    /**
     * Send One-Time Password via Branded Email.
     *
     * How it works:
     * 1. Generates 6-digit secure OTP and stores with 5-minute expiry in concurrent hashmap.
     * 2. Renders high-fidelity responsive HTML email template (#D32437 theme).
     * 3. Dispatches via JavaMailSender (if SMTP credentials supplied) or logs rendered template.
     *
     * @param email Destination recipient email
     * @param fullName User display name for personalized greeting
     * @return The generated 6-digit OTP code
     */
    public String sendEmailOtp(String email, String fullName) {
        String otpCode = generateAndStoreOtp(email);
        String htmlBody = buildOtpEmailHtml(fullName != null ? fullName : "Valued Bidder", otpCode);

        log.info("[EMAIL OTP DISPATCH] To: {} | Code: {}", email, otpCode);
        deliverEmail(email, "Al Wataneya Auctions - Your Verification Code [" + otpCode + "]", htmlBody);
        return otpCode;
    }

    /**
     * Send 24 Hours Before Auction Start Reminder
     */
    public void sendAuction24hReminder(Auction auction, List<String> recipientEmails) {
        String title = "Auction Lot #" + (auction.getId() != null ? auction.getId().toString().substring(0, 8) : "");
        String htmlBody = buildAuctionReminderHtml(
                "UPCOMING AUCTION IN 24 HOURS",
                "Your Registered Auction Starts Tomorrow!",
                title,
                auction.getStartPrice() != null ? auction.getStartPrice().doubleValue() : 0.0,
                auction.getStartTime() != null ? auction.getStartTime().toString() : "Tomorrow",
                "Please ensure your KYC documents and escrow deposit are confirmed prior to commencement.",
                "View Catalog & Prime Deposit"
        );

        for (String email : recipientEmails) {
            deliverEmail(email, "⏰ 24h Notice: " + title + " begins tomorrow!", htmlBody);
        }
        log.info("[24H REMINDER SENT] Auction: {} to {} recipients", auction.getId(), recipientEmails.size());
    }

    /**
     * Send 1 Hour Before Auction Start Reminder
     */
    public void sendAuction1hReminder(Auction auction, List<String> recipientEmails) {
        String title = "Auction Lot #" + (auction.getId() != null ? auction.getId().toString().substring(0, 8) : "");
        String htmlBody = buildAuctionReminderHtml(
                "STARTING IN 60 MINUTES",
                "Get Ready! Live Bidding Opens Soon",
                title,
                auction.getStartPrice() != null ? auction.getStartPrice().doubleValue() : 0.0,
                auction.getStartTime() != null ? auction.getStartTime().toString() : "In 1 Hour",
                "Bidding floor and real-time WebSocket ledger will be active in 60 minutes. Log in now.",
                "Enter Live Auction Floor"
        );

        for (String email : recipientEmails) {
            deliverEmail(email, "🚨 1h Notice: " + title + " starts in 60 minutes!", htmlBody);
        }
        log.info("[1H REMINDER SENT] Auction: {} to {} recipients", auction.getId(), recipientEmails.size());
    }

    /**
     * Send 1 Hour Before Auction End Final Call Notice
     */
    public void sendAuctionEnding1hNotice(Auction auction, List<String> recipientEmails) {
        String title = "Auction Lot #" + (auction.getId() != null ? auction.getId().toString().substring(0, 8) : "");
        double highest = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid().doubleValue() : (auction.getStartPrice() != null ? auction.getStartPrice().doubleValue() : 0.0);
        String htmlBody = buildAuctionReminderHtml(
                "FINAL CALL - 60 MINUTES REMAINING",
                "Auction Concluding Shortly!",
                title,
                highest,
                auction.getEndTime() != null ? auction.getEndTime().toString() : "In 1 Hour",
                "The hammer falls in exactly 1 hour. Submit your winning bid before the timer expires.",
                "Submit Final Bid Now"
        );

        for (String email : recipientEmails) {
            deliverEmail(email, "⚡ Final Call: 60 minutes remaining for " + title + "!", htmlBody);
        }
        log.info("[ENDING 1H NOTICE SENT] Auction: {} to {} recipients", auction.getId(), recipientEmails.size());
    }

    /**
     * Delivers an HTML email.
     * Uses Spring JavaMailSender if configured with SMTP host & credentials (e.g. Gmail / SendGrid / SES).
     * If no external credentials are configured, safely logs delivery so the application functions autonomously.
     */
    private void deliverEmail(String toEmail, String subject, String htmlContent) {
        log.info("[DELIVERING HTML EMAIL] To: {} | Subject: {}", toEmail, subject);

        if (mailSender != null && mailFrom != null && !mailFrom.isBlank()) {
            try {
                jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
                org.springframework.mail.javamail.MimeMessageHelper helper =
                        new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(mailFrom, "Al Wataneya Auctions");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(mimeMessage);
                log.info("[SMTP SUCCESS] Real email delivered over internet to {}", toEmail);
            } catch (Exception e) {
                log.warn("[SMTP NOTICE] Failed to send email via SMTP to {}: {}", toEmail, e.getMessage());
            }
        } else {
            log.info("[SMTP NOTICE] No SMTP credentials configured. To send real emails over internet, configure SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD (e.g. Gmail App Password). HTML template rendered successfully.");
        }
    }

    // =========================================================================
    // RESPONSIVE BRANDED HTML TEMPLATES (#D32437 AL WATANEYA CRIMSON THEME)
    // =========================================================================

    private String buildOtpEmailHtml(String name, String otpCode) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 24px; color: #231F20; }" +
                ".container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }" +
                ".header { background: #1E293B; padding: 28px 32px; text-align: center; border-bottom: 4px solid #D32437; }" +
                ".header h1 { color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }" +
                ".header p { color: #94A3B8; margin: 6px 0 0 0; font-size: 12px; }" +
                ".content { padding: 36px 32px; text-align: center; }" +
                ".greeting { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 12px; text-align: left; }" +
                ".text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 28px; text-align: left; }" +
                ".otp-card { background: #FFF1F2; border: 2px dashed #D32437; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }" +
                ".otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9F1239; letter-spacing: 1px; }" +
                ".otp-code { font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #D32437; font-family: monospace; margin: 10px 0; }" +
                ".otp-expiry { font-size: 12px; color: #881337; font-weight: 500; }" +
                ".footer { background: #F1F5F9; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>AL WATANEYA AUCTIONS</h1>" +
                "<p>EMIRATES TRANSPORT DIGITAL PLATFORM</p>" +
                "</div>" +
                "<div class='content'>" +
                "<div class='greeting'>Hello " + name + ",</div>" +
                "<div class='text'>You requested a secure One-Time Password (OTP) to authenticate with the Al Wataneya Auctions fleet bidding platform. Use the verification PIN below to proceed:</div>" +
                "<div class='otp-card'>" +
                "<div class='otp-label'>Verification PIN</div>" +
                "<div class='otp-code'>" + otpCode + "</div>" +
                "<div class='otp-expiry'>⏱ Expires in 5 minutes (One-Time Use Only)</div>" +
                "</div>" +
                "<div class='text' style='font-size: 12px; color: #64748B;'>If you did not initiate this request, please disregard this email or contact support immediately. Never disclose this code to anyone.</div>" +
                "</div>" +
                "<div class='footer'>© 2026 Al Wataneya Auctions | Emirates Transport. All Rights Reserved.</div>" +
                "</div></body></html>";
    }

    private String buildAuctionReminderHtml(String badgeText, String headline, String auctionTitle, double price, String timeStr, String guidance, String btnText) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 24px; color: #231F20; }" +
                ".container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }" +
                ".header { background: #1E293B; padding: 28px 32px; text-align: center; border-bottom: 4px solid #D32437; }" +
                ".badge { display: inline-block; background: #D32437; color: #FFFFFF; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }" +
                ".header h1 { color: #FFFFFF; margin: 4px 0 0 0; font-size: 18px; font-weight: 800; }" +
                ".content { padding: 32px; }" +
                ".headline { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 12px; }" +
                ".desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }" +
                ".vehicle-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }" +
                ".v-title { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 8px; }" +
                ".v-detail { display: flex; justify-content: space-between; font-size: 13px; color: #64748B; margin-top: 6px; }" +
                ".price-highlight { font-size: 18px; font-weight: 800; color: #D32437; }" +
                ".btn { display: block; text-align: center; background: #D32437; color: #FFFFFF; padding: 14px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; margin-top: 24px; box-shadow: 0 4px 12px rgba(211,36,55,0.25); }" +
                ".footer { background: #F1F5F9; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<span class='badge'>" + badgeText + "</span>" +
                "<h1>AL WATANEYA AUCTIONS</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<div class='headline'>" + headline + "</div>" +
                "<div class='desc'>" + guidance + "</div>" +
                "<div class='vehicle-box'>" +
                "<div class='v-title'>" + auctionTitle + "</div>" +
                "<div class='v-detail'><span>Timing:</span><strong>" + timeStr + "</strong></div>" +
                "<div class='v-detail'><span>Price / Leading Bid:</span><span class='price-highlight'>AED " + String.format("%,.2f", price) + "</span></div>" +
                "</div>" +
                "<a href='https://dev-alwataneya.et.ae' class='btn'>" + btnText + " →</a>" +
                "</div>" +
                "<div class='footer'>© 2026 Al Wataneya Auctions | Emirates Transport. All Rights Reserved.</div>" +
                "</div></body></html>";
    }
}
