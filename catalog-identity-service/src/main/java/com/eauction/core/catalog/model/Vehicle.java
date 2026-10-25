package com.eauction.core.catalog.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Seller ID cannot be null")
    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @NotBlank(message = "VIN cannot be blank")
    @Column(name = "vin", nullable = false, unique = true, length = 100)
    private String vin;

    @NotBlank(message = "Registration number cannot be blank")
    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @NotBlank(message = "Engine number cannot be blank")
    @Column(name = "engine_number", nullable = false, length = 100)
    private String engineNumber;

    @NotBlank(message = "Vehicle type cannot be blank")
    @Column(name = "vehicle_type", nullable = false, length = 50)
    private String vehicleType; // CAR or TRUCK

    @NotBlank(message = "Make cannot be blank")
    @Column(name = "make", nullable = false, length = 100)
    private String make;

    @NotBlank(message = "Model cannot be blank")
    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @NotNull(message = "Manufacturing year cannot be null")
    @Min(value = 1990, message = "Manufacturing year must be >= 1990")
    @Max(value = 2030, message = "Manufacturing year must be <= 2030")
    @Column(name = "manufacturing_year", nullable = false)
    private Integer manufacturingYear;

    @NotNull(message = "Odometer reading cannot be null")
    @PositiveOrZero(message = "Odometer reading cannot be negative")
    @Column(name = "odometer_reading_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal odometerReadingKm;

    @NotBlank(message = "Fuel type cannot be blank")
    @Column(name = "fuel_type", nullable = false, length = 50)
    private String fuelType; // DIESEL, PETROL, CNG, ELECTRIC, HYBRID

    @Column(name = "media_paths", columnDefinition = "text[]")
    private String[] mediaPaths = new String[0];

    @Column(name = "inspection_report_url", length = 1024)
    private String inspectionReportUrl;

    @Column(name = "lot_no")
    private Integer lotNo;

    @Column(name = "branch", length = 100)
    private String branch;

    @Column(name = "no_of_keys", length = 50)
    private String noOfKeys;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "target_selling_price", precision = 14, scale = 2)
    private BigDecimal targetSellingPrice;

    @Column(name = "minimum_selling_price", precision = 14, scale = 2)
    private BigDecimal minimumSellingPrice;

    @Column(name = "previous_numberplate", length = 50)
    private String previousNumberplate;

    @Column(name = "client_name", length = 255)
    private String clientName;

    @Column(name = "mulkiya_document_url", length = 1024)
    private String mulkiyaDocumentUrl;

    @Column(name = "wf_activity_id", length = 50)
    private String wfActivityId;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "old_id", length = 100)
    private String oldId;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Vehicle() {
    }

    public Vehicle(UUID id, UUID sellerId, String vin, String registrationNumber,
                   String engineNumber, String vehicleType, String make, String model,
                   Integer manufacturingYear, BigDecimal odometerReadingKm, String fuelType,
                   String[] mediaPaths, String inspectionReportUrl, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.sellerId = sellerId;
        this.vin = vin;
        this.registrationNumber = registrationNumber;
        this.engineNumber = engineNumber;
        this.vehicleType = vehicleType;
        this.make = make;
        this.model = model;
        this.manufacturingYear = manufacturingYear;
        this.odometerReadingKm = odometerReadingKm;
        this.fuelType = fuelType;
        this.mediaPaths = mediaPaths != null ? mediaPaths : new String[0];
        this.inspectionReportUrl = inspectionReportUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.mediaPaths == null) {
            this.mediaPaths = new String[0];
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSellerId() {
        return sellerId;
    }

    public void setSellerId(UUID sellerId) {
        this.sellerId = sellerId;
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

    public String[] getMediaPaths() {
        return mediaPaths;
    }

    public void setMediaPaths(String[] mediaPaths) {
        this.mediaPaths = mediaPaths;
    }

    public String getInspectionReportUrl() {
        return inspectionReportUrl;
    }

    public void setInspectionReportUrl(String inspectionReportUrl) {
        this.inspectionReportUrl = inspectionReportUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Vehicle vehicle = (Vehicle) o;
        return Objects.equals(id, vehicle.id) &&
                Objects.equals(vin, vehicle.vin) &&
                Objects.equals(registrationNumber, vehicle.registrationNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, vin, registrationNumber);
    }

    @Override
    public String toString() {
        return "Vehicle{" +
                "id=" + id +
                ", sellerId=" + sellerId +
                ", vin='" + vin + '\'' +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                ", make='" + make + '\'' +
                ", model='" + model + '\'' +
                ", manufacturingYear=" + manufacturingYear +
                ", odometerReadingKm=" + odometerReadingKm +
                ", fuelType='" + fuelType + '\'' +
                ", mediaPaths=" + Arrays.toString(mediaPaths) +
                ", createdAt=" + createdAt +
                '}';
    }
}
