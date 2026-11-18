package com.eauction.core.identity.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    private static final Logger log = LoggerFactory.getLogger(KeycloakAdminService.class);

    private final String serverUrl;
    private final String realm;
    private final String masterRealm;
    private final String clientId;
    private final String adminUsername;
    private final String adminPassword;
    private final boolean syncEnabled;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public KeycloakAdminService(
            @Value("${keycloak.admin.server-url:http://eauction-keycloak:8080/auth}") String serverUrl,
            @Value("${keycloak.admin.realm:eauction}") String realm,
            @Value("${keycloak.admin.master-realm:master}") String masterRealm,
            @Value("${keycloak.admin.client-id:admin-cli}") String clientId,
            @Value("${keycloak.admin.username:admin}") String adminUsername,
            @Value("${keycloak.admin.password:adminpassword}") String adminPassword,
            @Value("${keycloak.admin.sync-enabled:true}") boolean syncEnabled) {
        this.serverUrl = serverUrl.endsWith("/") ? serverUrl.substring(0, serverUrl.length() - 1) : serverUrl;
        this.realm = realm;
        this.masterRealm = masterRealm;
        this.clientId = clientId;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.syncEnabled = syncEnabled;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Synchronizes a user's password into Keycloak (updating existing user or creating a new one if absent).
     * Throws IllegalStateException on failure so calling @Transactional DB updates roll back atomically.
     */
    public void syncUserPassword(String email, String fullName, String newPassword) {
        if (!syncEnabled) {
            log.info("Keycloak sync is disabled; skipping sync for {}", email);
            return;
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required to sync password with Keycloak");
        }
        String normalizedEmail = email.trim().toLowerCase();

        try {
            String adminToken = obtainAdminToken();
            String keycloakUserId = findUserIdByEmailOrUsername(adminToken, normalizedEmail);

            if (keycloakUserId != null) {
                ensureUserEnabledAndClearActions(adminToken, keycloakUserId);
                resetKeycloakPassword(adminToken, keycloakUserId, newPassword);
                log.info("Synced password reset to existing Keycloak user {} (kcId={})", normalizedEmail, keycloakUserId);
            } else {
                createKeycloakUserWithPassword(adminToken, normalizedEmail, fullName, newPassword);
                log.info("Created missing user {} in Keycloak realm '{}' with synced password", normalizedEmail, realm);
            }
        } catch (Exception ex) {
            log.error("Failed to sync password to Keycloak for user {}: {}", normalizedEmail, ex.getMessage(), ex);
            throw new IllegalStateException("Failed to synchronize password with Keycloak: " + ex.getMessage(), ex);
        }
    }

    private String obtainAdminToken() throws Exception {
        String tokenUrl = serverUrl + "/realms/" + masterRealm + "/protocol/openid-connect/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("username", adminUsername);
        form.add("password", adminPassword);
        form.add("grant_type", "password");

        ResponseEntity<String> resp = restTemplate.postForEntity(tokenUrl, new HttpEntity<>(form, headers), String.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new IllegalStateException("Keycloak admin token request failed with HTTP " + resp.getStatusCode());
        }
        JsonNode root = objectMapper.readTree(resp.getBody());
        String token = root.path("access_token").asText(null);
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Keycloak admin token response missing access_token");
        }
        return token;
    }

    private String findUserIdByEmailOrUsername(String adminToken, String email) throws Exception {
        HttpHeaders headers = bearerHeaders(adminToken);

        // 1. Search by exact email (handles users whose username differs from email, e.g. krishnareddy)
        String byEmailUrl = UriComponentsBuilder
                .fromHttpUrl(serverUrl + "/admin/realms/" + realm + "/users")
                .queryParam("email", email)
                .queryParam("exact", "true")
                .toUriString();
        ResponseEntity<String> emailResp = restTemplate.exchange(
                byEmailUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        String found = extractFirstUserId(emailResp.getBody());
        if (found != null) {
            return found;
        }

        // 2. Fallback: search by exact username
        String byUsernameUrl = UriComponentsBuilder
                .fromHttpUrl(serverUrl + "/admin/realms/" + realm + "/users")
                .queryParam("username", email)
                .queryParam("exact", "true")
                .toUriString();
        ResponseEntity<String> usernameResp = restTemplate.exchange(
                byUsernameUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        return extractFirstUserId(usernameResp.getBody());
    }

    private String extractFirstUserId(String responseBody) throws Exception {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }
        JsonNode arr = objectMapper.readTree(responseBody);
        if (arr.isArray() && arr.size() > 0) {
            String id = arr.get(0).path("id").asText(null);
            if (id != null && !id.isBlank()) {
                return id;
            }
        }
        return null;
    }

    private void ensureUserEnabledAndClearActions(String adminToken, String keycloakUserId) {
        String url = serverUrl + "/admin/realms/" + realm + "/users/" + keycloakUserId;
        HttpHeaders headers = bearerHeaders(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("enabled", true);
        body.put("emailVerified", true);
        body.put("requiredActions", Collections.emptyList());

        restTemplate.exchange(url, HttpMethod.PUT, new HttpEntity<>(body, headers), Void.class);
    }

    private void resetKeycloakPassword(String adminToken, String keycloakUserId, String newPassword) {
        String url = serverUrl + "/admin/realms/" + realm + "/users/" + keycloakUserId + "/reset-password";
        HttpHeaders headers = bearerHeaders(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> cred = new HashMap<>();
        cred.put("type", "password");
        cred.put("value", newPassword);
        cred.put("temporary", false);

        restTemplate.exchange(url, HttpMethod.PUT, new HttpEntity<>(cred, headers), Void.class);
    }

    private void createKeycloakUserWithPassword(String adminToken, String email, String fullName, String newPassword) {
        String url = serverUrl + "/admin/realms/" + realm + "/users";
        HttpHeaders headers = bearerHeaders(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String sanitized = sanitizeName(fullName, email);
        String[] parts = sanitized.split("\\s+", 2);
        String firstName = parts[0];
        String lastName = (parts.length > 1 && !parts[1].isBlank()) ? parts[1] : "User";

        Map<String, Object> cred = new HashMap<>();
        cred.put("type", "password");
        cred.put("value", newPassword);
        cred.put("temporary", false);

        Map<String, Object> userPayload = new HashMap<>();
        userPayload.put("username", email);
        userPayload.put("email", email);
        userPayload.put("firstName", firstName);
        userPayload.put("lastName", lastName);
        userPayload.put("enabled", true);
        userPayload.put("emailVerified", true);
        userPayload.put("requiredActions", Collections.emptyList());
        userPayload.put("credentials", List.of(cred));

        restTemplate.postForEntity(url, new HttpEntity<>(userPayload, headers), Void.class);
    }

    private String sanitizeName(String fullName, String email) {
        if (fullName != null && !fullName.isBlank()) {
            // Strip characters disallowed by Keycloak 24 User Profile validator (such as '#')
            String cleaned = fullName.replaceAll("[^A-Za-z0-9 .'-]", " ").replaceAll("\\s+", " ").trim();
            if (!cleaned.isBlank()) {
                return cleaned;
            }
        }
        int atIdx = email.indexOf('@');
        String local = atIdx > 0 ? email.substring(0, atIdx) : email;
        String cleanedLocal = local.replaceAll("[^A-Za-z0-9 .'-]", " ").trim();
        return cleanedLocal.isBlank() ? "Auction User" : cleanedLocal;
    }

    private HttpHeaders bearerHeaders(String adminToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        return headers;
    }
}
