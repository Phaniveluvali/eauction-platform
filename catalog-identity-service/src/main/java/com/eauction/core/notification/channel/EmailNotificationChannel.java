package com.eauction.core.notification.channel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;

@Component
public class EmailNotificationChannel implements NotificationChannel {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationChannel.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:phani_veluvali@tecnics.com}")
    private String mailFrom;

    @Value("${spring.mail.from:phani_veluvali@tecnics.com}")
    private String configuredFrom;

    @Override
    public String getChannelType() {
        return "EMAIL";
    }

    @Override
    public boolean supports(String channelType) {
        return "EMAIL".equalsIgnoreCase(channelType);
    }

    @Override
    public boolean send(String destination, String subject, String messageText, String htmlContent) {
        log.info("[EMAIL DISPATCH] Destination: {} | Subject: {}", destination, subject);

        String effectiveFrom = (configuredFrom != null && !configuredFrom.isBlank())
                ? configuredFrom
                : ((mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "phani_veluvali@tecnics.com");

        if (mailSender != null) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(effectiveFrom, "Al Wataneya Auctions");
                helper.setTo(destination);
                helper.setSubject(subject);
                helper.setText(htmlContent != null ? htmlContent : messageText, htmlContent != null);
                mailSender.send(mimeMessage);
                log.info("[SMTP SUCCESS] Real email delivered from {} over internet to {}", effectiveFrom, destination);
                return true;
            } catch (Exception e) {
                log.warn("[SMTP NOTICE] Failed to send email via SMTP from {} to {}: {}", effectiveFrom, destination, e.getMessage());
                return false;
            }
        } else {
            log.info("[SMTP NOTICE] No SMTP mailSender configured. Sender designated as {}. Template rendered successfully.", effectiveFrom);
            return true;
        }
    }
}
