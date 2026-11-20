package com.eauction.core.identity.dto;

import com.eauction.core.identity.model.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class UserResponse {

    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role;
    private Boolean kycVerified;
    private String panNumber;
    private String gstNumber;
    private String emiratesId;
    private String trn;
    private String companyName;
    private String contractStatus;
    private String contractDocumentUrl;
    private BigDecimal securityDeposit;
    private BigDecimal biddingLimit;
    private BigDecimal usedBiddingLimit;
    private Boolean isActive;
    private Instant createdAt;
    private java.util.List<String> roles = new java.util.ArrayList<>();
    private java.util.List<String> permissions = new java.util.ArrayList<>();
    private Boolean isSuperAdmin = false;

    public UserResponse() {
    }

    public static UserResponse fromEntity(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setKycVerified(user.getKycVerified());
        response.setPanNumber(user.getPanNumber());
        response.setGstNumber(user.getGstNumber());
        response.setEmiratesId(user.getEmiratesId());
        response.setTrn(user.getTrn());
        response.setCompanyName(user.getCompanyName());
        response.setContractStatus(user.getContractStatus());
        response.setContractDocumentUrl(user.getContractDocumentUrl());
        response.setSecurityDeposit(user.getSecurityDeposit());
        response.setBiddingLimit(user.getBiddingLimit());
        response.setUsedBiddingLimit(user.getUsedBiddingLimit());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getKycVerified() {
        return kycVerified;
    }

    public void setKycVerified(Boolean kycVerified) {
        this.kycVerified = kycVerified;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getEmiratesId() {
        return emiratesId;
    }

    public void setEmiratesId(String emiratesId) {
        this.emiratesId = emiratesId;
    }

    public String getTrn() {
        return trn;
    }

    public void setTrn(String trn) {
        this.trn = trn;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContractStatus() {
        return contractStatus;
    }

    public void setContractStatus(String contractStatus) {
        this.contractStatus = contractStatus;
    }

    public String getContractDocumentUrl() {
        return contractDocumentUrl;
    }

    public void setContractDocumentUrl(String contractDocumentUrl) {
        this.contractDocumentUrl = contractDocumentUrl;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public BigDecimal getBiddingLimit() {
        return biddingLimit;
    }

    public void setBiddingLimit(BigDecimal biddingLimit) {
        this.biddingLimit = biddingLimit;
    }

    public BigDecimal getUsedBiddingLimit() {
        return usedBiddingLimit;
    }

    public void setUsedBiddingLimit(BigDecimal usedBiddingLimit) {
        this.usedBiddingLimit = usedBiddingLimit;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public java.util.List<String> getRoles() {
        return roles;
    }

    public void setRoles(java.util.List<String> roles) {
        this.roles = roles != null ? roles : new java.util.ArrayList<>();
    }

    public java.util.List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(java.util.List<String> permissions) {
        this.permissions = permissions != null ? permissions : new java.util.ArrayList<>();
    }

    public Boolean getIsSuperAdmin() {
        return isSuperAdmin;
    }

    public void setIsSuperAdmin(Boolean isSuperAdmin) {
        this.isSuperAdmin = isSuperAdmin != null ? isSuperAdmin : false;
    }

    public void setSuperAdmin(boolean isSuperAdmin) {
        this.isSuperAdmin = isSuperAdmin;
    }
}
