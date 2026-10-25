package com.eauction.core.identity.dto;

public class KeycloakLoginRequest {

    private String idToken;
    private String accessToken;
    private String email;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String keycloakUserId;

    public KeycloakLoginRequest() {
    }

    public KeycloakLoginRequest(String idToken, String accessToken, String email, String username, String fullName, String phoneNumber, String keycloakUserId) {
        this.idToken = idToken;
        this.accessToken = accessToken;
        this.email = email;
        this.username = username;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.keycloakUserId = keycloakUserId;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getKeycloakUserId() {
        return keycloakUserId;
    }

    public void setKeycloakUserId(String keycloakUserId) {
        this.keycloakUserId = keycloakUserId;
    }
}
