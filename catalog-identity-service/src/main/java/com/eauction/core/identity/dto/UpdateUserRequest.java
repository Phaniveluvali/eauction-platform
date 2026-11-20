package com.eauction.core.identity.dto;

import java.math.BigDecimal;

public class UpdateUserRequest {

    private String fullName;
    private String phoneNumber;
    private String role;
    private Boolean isActive;
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

    public UpdateUserRequest() {
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
}
