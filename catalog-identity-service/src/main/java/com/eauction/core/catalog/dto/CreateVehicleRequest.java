package com.eauction.core.catalog.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public class CreateVehicleRequest {

    @NotBlank(message = "VIN is required")
    private String vin;

    private String registrationNumber;

    private String engineNumber;

    private String vehicleType;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Manufacturing year is required")
    @Min(value = 1990, message = "Year must be >= 1990")
    @Max(value = 2030, message = "Year must be <= 2030")
    private Integer manufacturingYear;

    private BigDecimal odometerReadingKm;

    @NotBlank(message = "Fuel type is required")
    private String fuelType;

    private List<String> mediaPaths;

    private String inspectionReportUrl;

    private Integer lotNo;
    private String branch;
    private String noOfKeys;
    private String color;
    private BigDecimal targetSellingPrice;
    private BigDecimal minimumSellingPrice;
    private String previousNumberplate;
    private String clientName;
    private String mulkiyaDocumentUrl;
    private String wfActivityId;
    private String status;
    private String oldId;
    private String location;

    public CreateVehicleRequest() {
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getEngineNumber() {
        return engineNumber;
    }

    public void setEngineNumber(String engineNumber) {
        this.engineNumber = engineNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getManufacturingYear() {
        return manufacturingYear;
    }

    public void setManufacturingYear(Integer manufacturingYear) {
        this.manufacturingYear = manufacturingYear;
    }

    public BigDecimal getOdometerReadingKm() {
        return odometerReadingKm;
    }

    public void setOdometerReadingKm(BigDecimal odometerReadingKm) {
        this.odometerReadingKm = odometerReadingKm;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public List<String> getMediaPaths() {
        return mediaPaths;
    }

    public void setMediaPaths(List<String> mediaPaths) {
        this.mediaPaths = mediaPaths;
    }

    public String getInspectionReportUrl() {
        return inspectionReportUrl;
    }

    public void setInspectionReportUrl(String inspectionReportUrl) {
        this.inspectionReportUrl = inspectionReportUrl;
    }

    public Integer getLotNo() {
        return lotNo;
    }

    public void setLotNo(Integer lotNo) {
        this.lotNo = lotNo;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getNoOfKeys() {
        return noOfKeys;
    }

    public void setNoOfKeys(String noOfKeys) {
        this.noOfKeys = noOfKeys;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public BigDecimal getTargetSellingPrice() {
        return targetSellingPrice;
    }

    public void setTargetSellingPrice(BigDecimal targetSellingPrice) {
        this.targetSellingPrice = targetSellingPrice;
    }

    public BigDecimal getMinimumSellingPrice() {
        return minimumSellingPrice;
    }

    public void setMinimumSellingPrice(BigDecimal minimumSellingPrice) {
        this.minimumSellingPrice = minimumSellingPrice;
    }

    public String getPreviousNumberplate() {
        return previousNumberplate;
    }

    public void setPreviousNumberplate(String previousNumberplate) {
        this.previousNumberplate = previousNumberplate;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getMulkiyaDocumentUrl() {
        return mulkiyaDocumentUrl;
    }

    public void setMulkiyaDocumentUrl(String mulkiyaDocumentUrl) {
        this.mulkiyaDocumentUrl = mulkiyaDocumentUrl;
    }

    public String getWfActivityId() {
        return wfActivityId;
    }

    public void setWfActivityId(String wfActivityId) {
        this.wfActivityId = wfActivityId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOldId() {
        return oldId;
    }

    public void setOldId(String oldId) {
        this.oldId = oldId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
