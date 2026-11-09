package com.eauction.core.notification.service;

import org.springframework.stereotype.Component;

@Component
public class NotificationTemplateEngine {

    public String buildOtpEmailHtml(String name, String otpCode) {
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
                "<h1>AJ AUCTIONS</h1>" +
                "<p>ENTERPRISE FLEET AUCTION PLATFORM</p>" +
                "</div>" +
                "<div class='content'>" +
                "<div class='greeting'>Hello " + name + ",</div>" +
                "<div class='text'>You requested a secure One-Time Password (OTP) to create or verify your account on the AJ Auctions platform. Use the verification PIN below to proceed:</div>" +
                "<div class='otp-card'>" +
                "<div class='otp-label'>Verification PIN</div>" +
                "<div class='otp-code'>" + otpCode + "</div>" +
                "<div class='otp-expiry'>⏱ Expires in 10 minutes (One-Time Use Only)</div>" +
                "</div>" +
                "<div class='text' style='font-size: 12px; color: #64748B;'>If you did not initiate this registration request, please disregard this email or contact support immediately. Never disclose this code to anyone.</div>" +
                "</div>" +
                "<div class='footer'>© 2026 AJ Auctions Platform. All Rights Reserved.</div>" +
                "</div></body></html>";
    }

    public String buildAuctionReminderHtml(String badgeText, String headline, String auctionTitle, double price, String timeStr, String guidance, String btnText) {
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
