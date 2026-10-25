package com.eauction.core.identity.dto;

public class AzureB2cLoginRequest {

    private String idToken;
    private String code;
    private String redirectUri;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String b2cObjectId;

    public AzureB2cLoginRequest() {
    }

    public AzureB2cLoginRequest(String idToken, String code, String redirectUri, String email, String fullName, String phoneNumber, String b2cObjectId) {
        this.idToken = idToken;
        this.code = code;
        this.redirectUri = redirectUri;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.b2cObjectId = b2cObjectId;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getB2cObjectId() {
        return b2cObjectId;
    }

    public void setB2cObjectId(String b2cObjectId) {
        this.b2cObjectId = b2cObjectId;
    }
}
