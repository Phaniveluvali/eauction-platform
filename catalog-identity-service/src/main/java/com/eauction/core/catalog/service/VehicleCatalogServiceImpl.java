package com.eauction.core.catalog.service;

import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.catalog.dto.CreateVehicleRequest;
import com.eauction.core.catalog.exception.DuplicateVehicleException;
import com.eauction.core.catalog.model.Vehicle;
import com.eauction.core.catalog.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class VehicleCatalogServiceImpl implements VehicleCatalogService {

    private final VehicleRepository vehicleRepository;
    private final AuctionRepository auctionRepository;

    public VehicleCatalogServiceImpl(VehicleRepository vehicleRepository, AuctionRepository auctionRepository) {
        this.vehicleRepository = vehicleRepository;
        this.auctionRepository = auctionRepository;
    }

    @Override
    @Transactional
    public Vehicle createVehicle(UUID sellerId, CreateVehicleRequest request) {
        String vin = request.getVin() != null && !request.getVin().isBlank()
                ? request.getVin().trim().toUpperCase()
                : UUID.randomUUID().toString().replace("-", "").substring(0, 17).toUpperCase();

        if (vehicleRepository.existsByVinIgnoreCase(vin)) {
            throw new IllegalArgumentException("Vehicle with Chassis Number (VIN) already exists: " + vin);
        }

        String regNo = request.getRegistrationNumber();
        if (regNo == null || regNo.isBlank()) {
            if (request.getPreviousNumberplate() != null && !request.getPreviousNumberplate().isBlank()) {
                regNo = request.getPreviousNumberplate().trim().toUpperCase();
            } else {
                regNo = "AWA-" + (int) (Math.random() * 900000 + 100000);
            }
        } else {
            regNo = regNo.trim().toUpperCase();
        }

        if (vehicleRepository.existsByRegistrationNumberIgnoreCase(regNo)) {
            throw new IllegalArgumentException("Vehicle with Registration / Number Plate already exists: " + regNo);
        }

        String vType = request.getVehicleType() != null ? request.getVehicleType().toUpperCase().trim() : "CAR";
        if (!"CAR".equals(vType) && !"TRUCK".equals(vType)) {
            vType = "CAR";
        }

        String engNo = request.getEngineNumber();
        if (engNo == null || engNo.isBlank()) {
            engNo = "ENG-" + vin.substring(Math.max(0, vin.length() - 8));
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setSellerId(sellerId);
        vehicle.setVin(vin);
        vehicle.setRegistrationNumber(regNo);
        vehicle.setEngineNumber(engNo.trim().toUpperCase());
        vehicle.setVehicleType(vType);
        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setManufacturingYear(request.getManufacturingYear() != null ? request.getManufacturingYear() : 2024);
        vehicle.setOdometerReadingKm(request.getOdometerReadingKm() != null ? request.getOdometerReadingKm() : BigDecimal.ZERO);
        vehicle.setFuelType(normalizeFuelType(request.getFuelType()));
        if (request.getMediaPaths() != null && !request.getMediaPaths().isEmpty()) {
            vehicle.setMediaPaths(request.getMediaPaths().toArray(new String[0]));
        } else {
            vehicle.setMediaPaths(new String[0]);
        }
        vehicle.setInspectionReportUrl(request.getInspectionReportUrl());
        vehicle.setLotNo(request.getLotNo() != null ? request.getLotNo() : (int) (Math.random() * 900000 + 100000));
        vehicle.setBranch(request.getBranch() != null && !request.getBranch().isBlank() ? request.getBranch().trim() : "Sharjah");
        vehicle.setNoOfKeys(request.getNoOfKeys() != null && !request.getNoOfKeys().isBlank() ? request.getNoOfKeys().trim() : "1 Key");
        vehicle.setColor(request.getColor() != null && !request.getColor().isBlank() ? request.getColor().trim() : "White");
        vehicle.setTargetSellingPrice(request.getTargetSellingPrice() != null ? request.getTargetSellingPrice() : BigDecimal.ZERO);
        vehicle.setMinimumSellingPrice(request.getMinimumSellingPrice() != null ? request.getMinimumSellingPrice() : BigDecimal.ZERO);
        vehicle.setPreviousNumberplate(request.getPreviousNumberplate() != null && !request.getPreviousNumberplate().isBlank()
                ? request.getPreviousNumberplate().trim().toUpperCase() : regNo);
        vehicle.setOldId(request.getOldId());
        vehicle.setLocation(request.getLocation() != null && !request.getLocation().isBlank()
                ? request.getLocation().trim() : vehicle.getBranch());
        vehicle.setClientName(request.getClientName() != null && !request.getClientName().isBlank()
                ? request.getClientName().trim() : "AJ Consignment Seller");
        vehicle.setMulkiyaDocumentUrl(request.getMulkiyaDocumentUrl());
        vehicle.setWfActivityId(request.getWfActivityId() != null ? request.getWfActivityId() : "FVSA");
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : "SUBMISSION_PENDING");

        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public Vehicle updateVehicleDetails(UUID id, CreateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        if (request.getVin() != null && !request.getVin().isBlank()) {
            String newVin = request.getVin().trim().toUpperCase();
            vehicleRepository.findByVinIgnoreCase(newVin).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Another vehicle already uses Chassis Number (VIN): " + newVin);
                }
            });
            vehicle.setVin(newVin);
        }
        if (request.getRegistrationNumber() != null && !request.getRegistrationNumber().isBlank()) {
            String newReg = request.getRegistrationNumber().trim().toUpperCase();
            vehicleRepository.findByRegistrationNumberIgnoreCase(newReg).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Another vehicle already uses Registration Number: " + newReg);
                }
            });
            vehicle.setRegistrationNumber(newReg);
        }
        if (request.getMake() != null && !request.getMake().isBlank()) vehicle.setMake(request.getMake().trim());
        if (request.getModel() != null && !request.getModel().isBlank()) vehicle.setModel(request.getModel().trim());
        if (request.getManufacturingYear() != null) vehicle.setManufacturingYear(request.getManufacturingYear());
        if (request.getOdometerReadingKm() != null) vehicle.setOdometerReadingKm(request.getOdometerReadingKm());
        if (request.getFuelType() != null && !request.getFuelType().isBlank()) vehicle.setFuelType(normalizeFuelType(request.getFuelType()));
        if (request.getVehicleType() != null && !request.getVehicleType().isBlank()) {
            String vt = request.getVehicleType().trim().toUpperCase();
            if ("CAR".equals(vt) || "TRUCK".equals(vt)) vehicle.setVehicleType(vt);
        }
        if (request.getBranch() != null && !request.getBranch().isBlank()) vehicle.setBranch(request.getBranch().trim());
        if (request.getLocation() != null && !request.getLocation().isBlank()) vehicle.setLocation(request.getLocation().trim());
        if (request.getColor() != null && !request.getColor().isBlank()) vehicle.setColor(request.getColor().trim());
        if (request.getNoOfKeys() != null && !request.getNoOfKeys().isBlank()) vehicle.setNoOfKeys(request.getNoOfKeys().trim());
        if (request.getTargetSellingPrice() != null) vehicle.setTargetSellingPrice(request.getTargetSellingPrice());
        if (request.getMinimumSellingPrice() != null) vehicle.setMinimumSellingPrice(request.getMinimumSellingPrice());
        if (request.getPreviousNumberplate() != null && !request.getPreviousNumberplate().isBlank()) {
            vehicle.setPreviousNumberplate(request.getPreviousNumberplate().trim().toUpperCase());
        }
        if (request.getClientName() != null && !request.getClientName().isBlank()) vehicle.setClientName(request.getClientName().trim());
        if (request.getMediaPaths() != null && !request.getMediaPaths().isEmpty()) {
            vehicle.setMediaPaths(request.getMediaPaths().toArray(new String[0]));
        }
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public Vehicle approveVehicle(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));
        vehicle.setWfActivityId("FVSBS");
        vehicle.setStatus("APPROVED");
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public Vehicle sendToWash(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));
        vehicle.setWfActivityId("FW");
        vehicle.setStatus("UNDER_WASHING");
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public Vehicle markWashingComplete(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));
        vehicle.setWfActivityId("FP");
        vehicle.setStatus("PHOTO_PENDING");
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public Vehicle submitPhotoVehicle(UUID id, List<String> mediaPaths) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));
        vehicle.setWfActivityId("FTT");
        vehicle.setStatus("TECHNICAL_PENDING");
        if (mediaPaths != null && !mediaPaths.isEmpty()) {
            vehicle.setMediaPaths(mediaPaths.toArray(new String[0]));
        }
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public Vehicle updateTechnicalReport(UUID id, String reportUrl) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));
        if (reportUrl != null && !reportUrl.isBlank()) {
            vehicle.setInspectionReportUrl(reportUrl);
        }
        return vehicleRepository.save(vehicle);
    }

    /**
     * Submits technical inspection and moves the vehicle to the Inactive Auctions queue (FIA).
     * Does NOT auto-create a live auction — admins must assign the vehicle to an ONLINE or SILENT
     * Auction Batch before publishing to auction screens.
     */
    @Override
    @Transactional
    public Vehicle submitTechnicalTest(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        vehicle.setWfActivityId("FIA");
        vehicle.setStatus("INACTIVE_AUCTION");
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public List<Vehicle> batchApprove(List<UUID> ids) {
        List<Vehicle> updated = new ArrayList<>();
        for (UUID id : ids) {
            vehicleRepository.findById(id).ifPresent(v -> {
                v.setWfActivityId("FW");
                v.setStatus("UNDER_WASHING");
                updated.add(vehicleRepository.save(v));
            });
        }
        return updated;
    }

    @Override
    @Transactional
    public List<Vehicle> batchArchive(List<UUID> ids) {
        List<Vehicle> updated = new ArrayList<>();
        for (UUID id : ids) {
            vehicleRepository.findById(id).ifPresent(v -> {
                v.setWfActivityId("ARCHIVED");
                v.setStatus("ARCHIVED");
                updated.add(vehicleRepository.save(v));
            });
        }
        return updated;
    }

    /**
     * Strict all-or-nothing bulk vehicle import.
     * Validates required fields, intra-file duplicates, and database duplicates on both
     * Chassis Number (VIN) and Registration / Number Plate before persisting any record.
     */
    @Override
    @Transactional
    public List<Vehicle> batchCreateVehicles(UUID sellerId, List<CreateVehicleRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file contains no vehicle rows.");
        }

        List<Map<String, Object>> validationErrors = new ArrayList<>();
        Map<String, Integer> seenVins = new HashMap<>();
        Map<String, Integer> seenPlates = new HashMap<>();
        List<Vehicle> toSave = new ArrayList<>();

        for (int i = 0; i < requests.size(); i++) {
            CreateVehicleRequest req = requests.get(i);
            int rowNum = i + 2; // Row 1 is CSV header

            String vin = req.getVin() != null ? req.getVin().trim().toUpperCase() : "";
            String make = req.getMake() != null ? req.getMake().trim() : "";
            String model = req.getModel() != null ? req.getModel().trim() : "";
            String regNo = req.getRegistrationNumber() != null && !req.getRegistrationNumber().isBlank()
                    ? req.getRegistrationNumber().trim().toUpperCase()
                    : (req.getPreviousNumberplate() != null ? req.getPreviousNumberplate().trim().toUpperCase() : "");

            if (vin.isBlank()) {
                validationErrors.add(errorEntry(rowNum, "vin", vin, "Row " + rowNum + ": Chassis Number (VIN) is required."));
                continue;
            }
            if (make.isBlank() || model.isBlank()) {
                validationErrors.add(errorEntry(rowNum, "make/model", vin, "Row " + rowNum + " (VIN " + vin + "): Make and Model are required."));
                continue;
            }

            // Intra-file duplicate VIN
            if (seenVins.containsKey(vin)) {
                validationErrors.add(errorEntry(rowNum, "vin", vin,
                        "Row " + rowNum + ": Duplicate Chassis Number (VIN) '" + vin + "' repeated in file (first seen at Row " + seenVins.get(vin) + ")."));
                continue;
            }
            seenVins.put(vin, rowNum);

            // Database duplicate VIN
            if (vehicleRepository.existsByVinIgnoreCase(vin)) {
                validationErrors.add(errorEntry(rowNum, "vin", vin,
                        "Row " + rowNum + ": Vehicle with Chassis Number (VIN) '" + vin + "' already exists in the system."));
                continue;
            }

            // Number plate / Registration Number duplicate checks (when provided)
            if (!regNo.isBlank()) {
                if (seenPlates.containsKey(regNo)) {
                    validationErrors.add(errorEntry(rowNum, "registrationNumber", regNo,
                            "Row " + rowNum + ": Duplicate Number Plate '" + regNo + "' repeated in file (first seen at Row " + seenPlates.get(regNo) + ")."));
                    continue;
                }
                seenPlates.put(regNo, rowNum);

                if (vehicleRepository.existsByRegistrationNumberIgnoreCase(regNo)
                        || vehicleRepository.existsByPreviousNumberplateIgnoreCase(regNo)) {
                    validationErrors.add(errorEntry(rowNum, "registrationNumber", regNo,
                            "Row " + rowNum + ": Vehicle with Number Plate '" + regNo + "' already exists in the system."));
                    continue;
                }
            } else {
                regNo = "AJ-" + vin.substring(Math.max(0, vin.length() - 6)) + "-" + rowNum;
                if (vehicleRepository.existsByRegistrationNumberIgnoreCase(regNo)) {
                    regNo = "AJ-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
                }
            }

            Vehicle v = new Vehicle();
            v.setSellerId(sellerId);
            v.setVin(vin);
            v.setRegistrationNumber(regNo);
            v.setEngineNumber("ENG-" + vin.substring(Math.max(0, vin.length() - 8)));
            String vType = req.getVehicleType() != null ? req.getVehicleType().trim().toUpperCase() : "CAR";
            v.setVehicleType(("CAR".equals(vType) || "TRUCK".equals(vType)) ? vType : "CAR");
            v.setMake(make);
            v.setModel(model);
            int year = req.getManufacturingYear() != null ? req.getManufacturingYear() : 2024;
            v.setManufacturingYear(Math.max(1990, Math.min(2030, year)));
            v.setOdometerReadingKm(req.getOdometerReadingKm() != null && req.getOdometerReadingKm().compareTo(BigDecimal.ZERO) >= 0
                    ? req.getOdometerReadingKm() : BigDecimal.ZERO);
            v.setFuelType(normalizeFuelType(req.getFuelType()));
            v.setMediaPaths(new String[0]);
            v.setLotNo(req.getLotNo() != null ? req.getLotNo() : (int) (Math.random() * 900000 + 100000));
            v.setBranch(req.getBranch() != null && !req.getBranch().isBlank() ? req.getBranch().trim() : "Sharjah");
            v.setLocation(req.getLocation() != null && !req.getLocation().isBlank() ? req.getLocation().trim() : v.getBranch());
            v.setOldId(req.getOldId());
            v.setNoOfKeys(req.getNoOfKeys() != null && !req.getNoOfKeys().isBlank() ? req.getNoOfKeys().trim() : "2 Keys");
            v.setColor(req.getColor() != null && !req.getColor().isBlank() ? req.getColor().trim() : "White");
            v.setTargetSellingPrice(req.getTargetSellingPrice() != null ? req.getTargetSellingPrice() : BigDecimal.ZERO);
            v.setMinimumSellingPrice(req.getMinimumSellingPrice() != null ? req.getMinimumSellingPrice() : BigDecimal.ZERO);
            v.setPreviousNumberplate(req.getPreviousNumberplate() != null && !req.getPreviousNumberplate().isBlank()
                    ? req.getPreviousNumberplate().trim().toUpperCase() : regNo);
            v.setClientName(req.getClientName() != null && !req.getClientName().isBlank() ? req.getClientName().trim() : "Batch Consignment Seller");
            v.setWfActivityId("FVSA");
            v.setStatus("SUBMISSION_PENDING");
            toSave.add(v);
        }

        if (!validationErrors.isEmpty()) {
            throw new DuplicateVehicleException(
                    "Bulk upload rejected: " + validationErrors.size() + " duplicate or invalid vehicle row(s) detected. No vehicles were imported.",
                    validationErrors
            );
        }

        return vehicleRepository.saveAll(toSave);
    }

    private Map<String, Object> errorEntry(int row, String field, String value, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("row", row);
        m.put("field", field);
        m.put("value", value);
        m.put("message", message);
        return m;
    }

    private String normalizeFuelType(String raw) {
        if (raw == null || raw.isBlank()) return "PETROL";
        String f = raw.trim().toUpperCase();
        if (Set.of("DIESEL", "PETROL", "CNG", "ELECTRIC", "HYBRID").contains(f)) {
            return f;
        }
        return "PETROL";
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> listVehicles(String type, String make) {
        if (type != null && !type.isBlank()) {
            return vehicleRepository.findByVehicleTypeIgnoreCaseOrdered(type.trim());
        }
        if (make != null && !make.isBlank()) {
            return vehicleRepository.findByMakeIgnoreCaseOrdered(make.trim());
        }
        return vehicleRepository.findAllOrdered();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Vehicle> getVehicleById(UUID id) {
        return vehicleRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Vehicle> getVehicleByVin(String vin) {
        return vehicleRepository.findByVin(vin.toUpperCase().trim());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesBySeller(UUID sellerId) {
        return vehicleRepository.findBySellerId(sellerId);
    }
}
