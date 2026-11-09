package com.eauction.core.identity.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * High-performance User Session tracking & dynamic pod load balancing service.
 * Adheres to Single Responsibility (SRP) and Dependency Inversion (DIP).
 */
public interface UserSessionService {

    void processHeartbeat(Map<String, Object> payload, HttpServletRequest request);

    Map<String, Object> getLiveSessions();

    void logout(String userId, String deviceType);

    Map<String, Object> migrateSession(String sessionId, String targetPod);

    Map<String, Object> bulkMigrateSessions(String sourcePod, String targetPod, int count);
}
