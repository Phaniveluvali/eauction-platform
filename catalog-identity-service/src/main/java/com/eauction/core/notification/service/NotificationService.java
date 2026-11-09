package com.eauction.core.notification.service;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.notification.channel.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final List<NotificationChannel> channels;
    private final NotificationTemplateEngine templateEngine;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    public NotificationService(List<NotificationChannel> channels, NotificationTemplateEngine templateEngine) {
        this.channels = channels;
        this.templateEngine = templateEngine;
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
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(10));
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

    private NotificationChannel resolveChannel(String channelType) {
        return channels.stream()
                .filter(c -> c.supports(channelType))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No notification channel registered for type: " + channelType));
    }

    public String sendWhatsAppOtp(String phoneNumber) {
        String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
        String otpCode = generateAndStoreOtp(cleanPhone);

        String messageBody = "🚗 *AJ AUCTIONS*\n\n" +
                "Your One-Time Password (OTP) for account verification is:\n\n" +
                "🔑 *" + otpCode + "*\n\n" +
                "This code is valid for 10 minutes. Please do not share this code with anyone.\n" +
                "_Secure bidding powered by AJ Auctions Platform._";

        NotificationChannel waChannel = resolveChannel("WHATSAPP");
        waChannel.send(cleanPhone, "AJ Auctions Verification OTP", messageBody, null);
        return otpCode;
    }

    public String sendEmailOtp(String toEmail, String fullName) {
        String otpCode = generateAndStoreOtp(toEmail);
        String subject = "🔑 Your AJ Auctions Verification Code: " + otpCode;
        String html = templateEngine.buildOtpEmailHtml(fullName, otpCode);
        String text = "Hello " + fullName + ",\n\nYour AJ Auctions verification code is: " + otpCode + ".\nValid for 10 minutes.";

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        emailChannel.send(toEmail, subject, text, html);
        return otpCode;
    }

    public void sendAuctionOutbidEmail(String toEmail, String auctionTitle, double currentBid, double minNextBid) {
        String subject = "⚠️ Outbid Alert: " + auctionTitle;
        String guidance = "Another verified bidder just placed a higher bid of AED " + String.format("%,.2f", currentBid) + ". Place your next counter-bid now to stay in the lead!";
        String html = templateEngine.buildAuctionReminderHtml("OUTBID NOTICE", "You Have Been Outbid!", auctionTitle, minNextBid, "Active Auction", guidance, "Counter-Bid Now");
        String text = "You have been outbid on " + auctionTitle + ". Current leading bid: AED " + currentBid + ". Minimum next bid: AED " + minNextBid;

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        emailChannel.send(toEmail, subject, text, html);
    }

    public void sendAuctionEndingEmail(String toEmail, String auctionTitle, double currentBid, String timeLeft) {
        String subject = "⏳ Final Call: " + auctionTitle + " Closes in " + timeLeft;
        String guidance = "This auction lot is reaching its final countdown! Do not miss the hammer on this high-value Emirates Transport fleet vehicle.";
        String html = templateEngine.buildAuctionReminderHtml("FINAL HAMMER CALL", "Auction Ending Soon!", auctionTitle, currentBid, timeLeft, guidance, "Join Live Bidding");
        String text = "Final call for auction " + auctionTitle + "! Closes in " + timeLeft + ". Leading bid: AED " + currentBid;

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        emailChannel.send(toEmail, subject, text, html);
    }

    public void sendAuctionWonEmail(String toEmail, String buyerName, String auctionTitle, double winningBid, String auctionId) {
        String subject = "🏆 Congratulations! You Won: " + auctionTitle;
        String guidance = "Congratulations " + buyerName + "! You are the official winning bidder for " + auctionTitle + " with a final winning hammer of AED " + String.format("%,.2f", winningBid) + ". Please proceed to security settlement.";
        String html = templateEngine.buildAuctionReminderHtml("AUCTION WON", "Hammer Fell - Congratulations!", auctionTitle, winningBid, "Auction Concluded", guidance, "Complete Settlement");
        String text = "Congratulations " + buyerName + "! You won " + auctionTitle + " for AED " + winningBid + ". Lot ID: " + auctionId;

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        emailChannel.send(toEmail, subject, text, html);
    }

    public void sendAuction24hReminder(Auction auction, List<String> recipientEmails) {
        double startingPrice = auction.getStartPrice() != null ? auction.getStartPrice().doubleValue() : 0.0;
        String title = "Auction Lot #" + (auction.getVehicleId() != null ? auction.getVehicleId().toString().substring(0, 8) : auction.getId().toString().substring(0, 8));
        String subject = "📅 Starting in 24 Hours: " + title;
        String guidance = "Exclusive fleet auction opens for bidding in exactly 24 hours. Ensure your refundable security deposit is active.";
        String html = templateEngine.buildAuctionReminderHtml("STARTING TOMORROW", "Upcoming Fleet Auction", title, startingPrice, "Opens in 24 Hours", guidance, "Preview Vehicle Lot");
        String text = "Upcoming Auction: " + title + " starts in 24 hours. Reserve: AED " + startingPrice;

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        for (String email : recipientEmails) {
            emailChannel.send(email, subject, text, html);
        }
    }

    public void sendAuction1hReminder(Auction auction, List<String> recipientEmails) {
        double startingPrice = auction.getStartPrice() != null ? auction.getStartPrice().doubleValue() : 0.0;
        String title = "Auction Lot #" + (auction.getVehicleId() != null ? auction.getVehicleId().toString().substring(0, 8) : auction.getId().toString().substring(0, 8));
        String subject = "⚡ Starting in 1 Hour: " + title;
        String guidance = "Live bidding commences in 60 minutes! Enter the virtual auction hall now to synchronize your real-time WebSocket connection.";
        String html = templateEngine.buildAuctionReminderHtml("COMMENCING IN 1 HOUR", "Auction Starting Very Soon", title, startingPrice, "Opens in 60 Minutes", guidance, "Enter Auction Room");
        String text = "Upcoming Auction: " + title + " starts in 1 hour. Starting price: AED " + startingPrice;

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        for (String email : recipientEmails) {
            emailChannel.send(email, subject, text, html);
        }
    }

    public void sendAuctionEnding1hNotice(Auction auction, List<String> recipientEmails) {
        double currentPrice = auction.getCurrentHighestBid() != null && auction.getCurrentHighestBid().doubleValue() > 0
                ? auction.getCurrentHighestBid().doubleValue()
                : (auction.getStartPrice() != null ? auction.getStartPrice().doubleValue() : 0.0);
        String title = "Auction Lot #" + (auction.getVehicleId() != null ? auction.getVehicleId().toString().substring(0, 8) : auction.getId().toString().substring(0, 8));
        String subject = "🚨 FINAL 60 MINUTES: " + title;
        String guidance = "This auction lot closes in exactly 1 hour! Submit your final bids before the digital hammer falls.";
        String html = templateEngine.buildAuctionReminderHtml("FINAL 1 HOUR REMAINING", "Impending Auction Close", title, currentPrice, "Closes in 60 Minutes", guidance, "Bid Before Close");
        String text = "Auction " + title + " closes in 60 minutes! Leading price: AED " + currentPrice;

        NotificationChannel emailChannel = resolveChannel("EMAIL");
        for (String email : recipientEmails) {
            emailChannel.send(email, subject, text, html);
        }
    }
}
