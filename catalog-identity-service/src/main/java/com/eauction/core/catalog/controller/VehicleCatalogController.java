package com.eauction.core.catalog.controller;

import com.eauction.core.auction.model.Auction;
import com.eauction.core.auction.repository.AuctionRepository;
import com.eauction.core.catalog.dto.CreateVehicleRequest;
import com.eauction.core.catalog.model.Vehicle;
import com.eauction.core.catalog.repository.VehicleRepository;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/vehicles")
public class VehicleCatalogController {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuctionRepository auctionRepository;

    public VehicleCatalogController(VehicleRepository vehicleRepository, UserRepository userRepository, AuthService authService, AuctionRepository auctionRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.auctionRepository = auctionRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Vehicle> createVehicle(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @Valid @RequestBody CreateVehicleRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7).trim();
        UUID sellerId = authService.extractUserId(token);
        String role = authService.extractRole(token);

        if (!"SELLER".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

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

        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/stats/users")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Long>> getUserStats() {
        long buyers = userRepository.countByRole("BUYER");
        long sellers = userRepository.countByRole("SELLER");
        long staff = userRepository.countByRole("ADMIN");
        long totalCustomers = buyers + sellers;
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("buyers", buyers);
        stats.put("sellers", sellers);
        stats.put("staff", staff);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<Vehicle> approveVehicle(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        // Workflow transition: Moves to Next Activity FVSBS (Submitted by Seller)
        vehicle.setWfActivityId("FVSBS");
        vehicle.setStatus("APPROVED");

        Vehicle updated = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/send-to-wash")
    @Transactional
    public ResponseEntity<Vehicle> sendToWash(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        // Workflow transition: Moves from Submitted by Seller (FVSBS) to Washed Vehicle (FW)
        vehicle.setWfActivityId("FW");
        vehicle.setStatus("UNDER_WASHING");

        Vehicle updated = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/wash-complete")
    @Transactional
    public ResponseEntity<Vehicle> markWashingComplete(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        // Workflow transition: Moves from Washing (FW) to Photo Vehicle (FP)
        vehicle.setWfActivityId("FP");
        vehicle.setStatus("PHOTO_PENDING");

        Vehicle updated = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/photo-submit")
    @Transactional
    public ResponseEntity<Vehicle> submitPhotoVehicle(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        // Workflow transition: Moves from Photo (FP) to Technical Test (FTT)
        vehicle.setWfActivityId("FTT");
        vehicle.setStatus("TECHNICAL_PENDING");

        if (body != null && body.containsKey("mediaPaths")) {
            Object pathsObj = body.get("mediaPaths");
            if (pathsObj instanceof List) {
                List<?> list = (List<?>) pathsObj;
                String[] arr = list.stream().map(Object::toString).toArray(String[]::new);
                if (arr.length > 0) {
                    vehicle.setMediaPaths(arr);
                }
            }
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/technical-report")
    @Transactional
    public ResponseEntity<Vehicle> updateTechnicalReport(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        String reportUrl = body.get("reportUrl");
        if (reportUrl == null || reportUrl.isBlank()) {
            reportUrl = body.get("inspectionReportUrl");
        }
        if (reportUrl != null && !reportUrl.isBlank()) {
            vehicle.setInspectionReportUrl(reportUrl);
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/technical-submit")
    @Transactional
    public ResponseEntity<Vehicle> submitTechnicalTest(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));

        // Workflow transition: Moves to Inactive Auctions (FIA)
        vehicle.setWfActivityId("FIA");
        vehicle.setStatus("INACTIVE_AUCTION");

        Vehicle updated = vehicleRepository.save(vehicle);

        // Ensure an auction record exists in PENDING (Inactive) state for this vehicle
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

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/batch-approve")
    @Transactional
    public ResponseEntity<List<Vehicle>> batchApprove(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<UUID> ids) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Vehicle> updated = new java.util.ArrayList<>();
        for (UUID id : ids) {
            vehicleRepository.findById(id).ifPresent(v -> {
                v.setWfActivityId("FW");
                v.setStatus("UNDER_WASHING");
                updated.add(vehicleRepository.save(v));
            });
        }
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/batch-archive")
    @Transactional
    public ResponseEntity<List<Vehicle>> batchArchive(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<UUID> ids) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Vehicle> updated = new java.util.ArrayList<>();
        for (UUID id : ids) {
            vehicleRepository.findById(id).ifPresent(v -> {
                v.setWfActivityId("ARCHIVED");
                v.setStatus("ARCHIVED");
                updated.add(vehicleRepository.save(v));
            });
        }
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/batch")
    @Transactional
    public ResponseEntity<List<Vehicle>> batchCreateVehicles(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<CreateVehicleRequest> requests) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7).trim();
        UUID sellerId = authService.extractUserId(token);

        List<Vehicle> savedList = new java.util.ArrayList<>();
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

        return ResponseEntity.status(HttpStatus.CREATED).body(savedList);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Vehicle>> listVehicles(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String make) {

        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(vehicleRepository.findByVehicleType(type.toUpperCase().trim()));
        }

        if (make != null && !make.isBlank()) {
            return ResponseEntity.ok(vehicleRepository.findByMakeIgnoreCase(make.trim()));
        }

        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable UUID id) {
        return vehicleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vin/{vin}")
    @Transactional(readOnly = true)
    public ResponseEntity<Vehicle> getVehicleByVin(@PathVariable String vin) {
        return vehicleRepository.findByVin(vin.toUpperCase().trim())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/seller/{sellerId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Vehicle>> getVehiclesBySeller(@PathVariable UUID sellerId) {
        return ResponseEntity.ok(vehicleRepository.findBySellerId(sellerId));
    }
}
