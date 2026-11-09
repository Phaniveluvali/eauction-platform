package com.eauction.core.notification.channel;

public interface NotificationChannel {
    String getChannelType();
    boolean supports(String channelType);
    boolean send(String destination, String subject, String messageText, String htmlContent);
}
