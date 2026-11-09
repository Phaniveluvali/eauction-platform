package com.eauction.core.catalog.service;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.catalog.dto.CreateVehicleRequest;
import com.eauction.core.catalog.model.Vehicle;
import com.eauction.core.catalog.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

        if (vehicleRepository.existsByVin(vin)) {
            throw new IllegalArgumentException("Vehicle with VIN already exists: " + vin);
        }

        String regNo = request.getRegistrationNumber();
        if (regNo == null || regNo.isBlank()) {
            if (request.getPreviousNumberplate() != null && !request.getPreviousNumberplate().isBlank()) {
                regNo = request.getPreviousNumberplate().trim().toUpperCase();
            } else {
                regNo = "AWA-" + (int)(Math.random() * 900000 + 100000);
            }
        } else {
            regNo = regNo.trim().toUpperCase();
        }

        if (vehicleRepository.existsByRegistrationNumber(regNo)) {
            regNo = regNo + "-" + (int)(Math.random() * 900 + 100);
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
        vehicle.setFuelType(request.getFuelType() != null ? request.getFuelType().trim().toUpperCase() : "PETROL");
        if (request.getMediaPaths() != null && !request.getMediaPaths().isEmpty()) {
            vehicle.setMediaPaths(request.getMediaPaths().toArray(new String[0]));
        } else {
            vehicle.setMediaPaths(new String[0]);
        }
        vehicle.setInspectionReportUrl(request.getInspectionReportUrl());
        vehicle.setLotNo(request.getLotNo() != null ? request.getLotNo() : (int)(Math.random() * 900000 + 100000));
        vehicle.setBranch(request.getBranch() != null ? request.getBranch() : "Sharjah");
        vehicle.setNoOfKeys(request.getNoOfKeys() != null ? request.getNoOfKeys() : "1 Key");
        vehicle.setColor(request.getColor() != null ? request.getColor() : "White");
        vehicle.setTargetSellingPrice(request.getTargetSellingPrice() != null ? request.getTargetSellingPrice() : BigDecimal.ZERO);
        vehicle.setMinimumSellingPrice(request.getMinimumSellingPrice() != null ? request.getMinimumSellingPrice() : BigDecimal.ZERO);
        vehicle.setPreviousNumberplate(request.getPreviousNumberplate() != null ? request.getPreviousNumberplate() : regNo);
        vehicle.setOldId(request.getOldId());
        vehicle.setLocation(request.getLocation() != null ? request.getLocation() : (request.getBranch() != null ? request.getBranch() : "Sharjah"));
        vehicle.setClientName(request.getClientName() != null ? request.getClientName() : "AWA Consignment Seller");
        vehicle.setMulkiyaDocumentUrl(request.getMulkiyaDocumentUrl());
        vehicle.setWfActivityId(request.getWfActivityId() != null ? request.getWfActivityId() : "FVSA");
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : "SUBMISSION_PENDING");

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

    @Override
    @Transactional
    public Vehicle submitTechnicalTest(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        vehicle.setWfActivityId("FIA");
        vehicle.setStatus("INACTIVE_AUCTION");
        Vehicle updated = vehicleRepository.save(vehicle);

        if (auctionRepository.findByVehicleId(id).isEmpty()) {
            Auction auction = new Auction();
            auction.setVehicleId(id);
            BigDecimal targetPrice = vehicle.getTargetSellingPrice() != null
                    ? vehicle.getTargetSellingPrice()
                    : new BigDecimal("80000.00");
            BigDecimal startPrice = targetPrice.multiply(new BigDecimal("0.70"));
            BigDecimal reservePrice = vehicle.getMinimumSellingPrice() != null
                    ? vehicle.getMinimumSellingPrice()
                    : targetPrice.multiply(new BigDecimal("0.90"));

            auction.setStartPrice(startPrice);
            auction.setReservePrice(reservePrice);
            auction.setMinBidIncrement(new BigDecimal("1000.00"));
            auction.setCurrentHighestBid(BigDecimal.ZERO);
            auction.setStartTime(Instant.now().plus(7, ChronoUnit.DAYS));
            auction.setEndTime(Instant.now().plus(14, ChronoUnit.DAYS));
            auction.setStatus("PENDING");
            auction.setAuctionType("ONLINE");
            auctionRepository.save(auction);
        }

        return updated;
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

    @Override
    @Transactional
    public List<Vehicle> batchCreateVehicles(UUID sellerId, List<CreateVehicleRequest> requests) {
        List<Vehicle> savedList = new ArrayList<>();
        for (CreateVehicleRequest req : requests) {
            String vin = req.getVin() != null && !req.getVin().isBlank()
                    ? req.getVin().trim().toUpperCase()
                    : UUID.randomUUID().toString().replace("-", "").substring(0, 17).toUpperCase();

            if (vehicleRepository.existsByVin(vin)) continue;

            String regNo = req.getRegistrationNumber();
            if (regNo == null || regNo.isBlank()) {
                regNo = req.getPreviousNumberplate() != null ? req.getPreviousNumberplate().trim().toUpperCase() : "AWA-" + (int)(Math.random() * 900000 + 100000);
            }
            if (vehicleRepository.existsByRegistrationNumber(regNo)) {
                regNo = regNo + "-" + (int)(Math.random() * 900 + 100);
            }

            Vehicle v = new Vehicle();
            v.setSellerId(sellerId);
            v.setVin(vin);
            v.setRegistrationNumber(regNo);
            v.setEngineNumber("ENG-" + vin.substring(Math.max(0, vin.length() - 8)));
            v.setVehicleType("CAR");
            v.setMake(req.getMake() != null ? req.getMake().trim() : "Toyota");
            v.setModel(req.getModel() != null ? req.getModel().trim() : "Sedan");
            v.setManufacturingYear(req.getManufacturingYear() != null ? req.getManufacturingYear() : 2024);
            v.setOdometerReadingKm(req.getOdometerReadingKm() != null ? req.getOdometerReadingKm() : BigDecimal.ZERO);
            v.setFuelType(req.getFuelType() != null ? req.getFuelType().trim().toUpperCase() : "PETROL");
            v.setMediaPaths(new String[0]);
            v.setLotNo(req.getLotNo() != null ? req.getLotNo() : (int)(Math.random() * 900000 + 100000));
            v.setBranch(req.getBranch() != null ? req.getBranch() : "Sharjah");
            v.setLocation(req.getLocation() != null ? req.getLocation() : (req.getBranch() != null ? req.getBranch() : "Sharjah"));
            v.setOldId(req.getOldId());
            v.setNoOfKeys(req.getNoOfKeys() != null ? req.getNoOfKeys() : "2 Keys");
            v.setColor(req.getColor() != null ? req.getColor() : "White");
            v.setTargetSellingPrice(req.getTargetSellingPrice() != null ? req.getTargetSellingPrice() : BigDecimal.ZERO);
            v.setMinimumSellingPrice(req.getMinimumSellingPrice() != null ? req.getMinimumSellingPrice() : BigDecimal.ZERO);
            v.setPreviousNumberplate(req.getPreviousNumberplate() != null ? req.getPreviousNumberplate() : regNo);
            v.setClientName(req.getClientName() != null ? req.getClientName() : "Batch Consignment Seller");
            v.setWfActivityId("FVSA");
            v.setStatus("SUBMISSION_PENDING");

            savedList.add(vehicleRepository.save(v));
        }
        return savedList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> listVehicles(String type, String make) {
        if (type != null && !type.isBlank()) {
            return vehicleRepository.findByVehicleType(type.toUpperCase().trim());
        }
        if (make != null && !make.isBlank()) {
            return vehicleRepository.findByMakeIgnoreCase(make.trim());
        }
        return vehicleRepository.findAll();
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
