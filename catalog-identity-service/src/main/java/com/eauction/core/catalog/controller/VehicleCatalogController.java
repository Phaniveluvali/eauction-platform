package com.eauction.core.catalog.controller;

import com.eauction.core.catalog.dto.CreateVehicleRequest;
import com.eauction.core.catalog.model.Vehicle;
import com.eauction.core.catalog.service.VehicleCatalogService;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/vehicles")
public class VehicleCatalogController {

    private final VehicleCatalogService vehicleCatalogService;
    private final UserRepository userRepository;
    private final AuthService authService;

    public VehicleCatalogController(
            VehicleCatalogService vehicleCatalogService,
            UserRepository userRepository,
            AuthService authService) {
        this.vehicleCatalogService = vehicleCatalogService;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @PostMapping
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

        Vehicle created = vehicleCatalogService.createVehicle(sellerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/stats/users")
    public ResponseEntity<Map<String, Long>> getUserStats() {
        long buyers = userRepository.countByRole("BUYER");
        long sellers = userRepository.countByRole("SELLER");
        long staff = userRepository.countByRole("ADMIN");
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCustomers", buyers + sellers);
        stats.put("buyers", buyers);
        stats.put("sellers", sellers);
        stats.put("staff", staff);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Vehicle> approveVehicle(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vehicleCatalogService.approveVehicle(id));
    }

    @PutMapping("/{id}/send-to-wash")
    public ResponseEntity<Vehicle> sendToWash(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vehicleCatalogService.sendToWash(id));
    }

    @PutMapping("/{id}/wash-complete")
    public ResponseEntity<Vehicle> markWashingComplete(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vehicleCatalogService.markWashingComplete(id));
    }

    @PutMapping("/{id}/photo-submit")
    public ResponseEntity<Vehicle> submitPhotoVehicle(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<String> paths = null;
        if (body != null && body.containsKey("mediaPaths")) {
            Object pathsObj = body.get("mediaPaths");
            if (pathsObj instanceof List) {
                paths = ((List<?>) pathsObj).stream().map(Object::toString).toList();
            }
        }
        return ResponseEntity.ok(vehicleCatalogService.submitPhotoVehicle(id, paths));
    }

    @PutMapping("/{id}/technical-report")
    public ResponseEntity<Vehicle> updateTechnicalReport(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String reportUrl = body.get("reportUrl");
        if (reportUrl == null || reportUrl.isBlank()) {
            reportUrl = body.get("inspectionReportUrl");
        }
        return ResponseEntity.ok(vehicleCatalogService.updateTechnicalReport(id, reportUrl));
    }

    @PutMapping("/{id}/technical-submit")
    public ResponseEntity<Vehicle> submitTechnicalTest(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vehicleCatalogService.submitTechnicalTest(id));
    }

    @PostMapping("/batch-approve")
    public ResponseEntity<List<Vehicle>> batchApprove(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<UUID> ids) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vehicleCatalogService.batchApprove(ids));
    }

    @PostMapping("/batch-archive")
    public ResponseEntity<List<Vehicle>> batchArchive(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<UUID> ids) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vehicleCatalogService.batchArchive(ids));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Vehicle>> batchCreateVehicles(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<CreateVehicleRequest> requests) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7).trim();
        UUID sellerId = authService.extractUserId(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleCatalogService.batchCreateVehicles(sellerId, requests));
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> listVehicles(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String make) {
        return ResponseEntity.ok(vehicleCatalogService.listVehicles(type, make));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable UUID id) {
        return vehicleCatalogService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vin/{vin}")
    public ResponseEntity<Vehicle> getVehicleByVin(@PathVariable String vin) {
        return vehicleCatalogService.getVehicleByVin(vin)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesBySeller(@PathVariable UUID sellerId) {
        return ResponseEntity.ok(vehicleCatalogService.getVehiclesBySeller(sellerId));
    }
}
