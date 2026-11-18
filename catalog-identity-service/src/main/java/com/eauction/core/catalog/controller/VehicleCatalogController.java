package com.eauction.core.catalog.controller;

import com.eauction.core.catalog.dto.CreateVehicleRequest;
import com.eauction.core.catalog.exception.DuplicateVehicleException;
import com.eauction.core.catalog.model.Vehicle;
import com.eauction.core.catalog.service.VehicleCatalogService;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/v1/catalog/vehicles")
public class VehicleCatalogController {

    private static final Set<String> ALLOWED_REPORT_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final VehicleCatalogService vehicleCatalogService;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final JdbcTemplate jdbcTemplate;

    public VehicleCatalogController(
            VehicleCatalogService vehicleCatalogService,
            UserRepository userRepository,
            AuthService authService,
            JdbcTemplate jdbcTemplate) {
        this.vehicleCatalogService = vehicleCatalogService;
        this.userRepository = userRepository;
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> createVehicle(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @Valid @RequestBody CreateVehicleRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }

        String token = authHeader.substring(7).trim();
        UUID sellerId = authService.extractUserId(token);
        String role = authService.extractRole(token);

        if (!"SELLER".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only Sellers or Admins can list vehicles."));
        }

        // Seller submissions always enter Inactive Auctions queue for Admin review & batching
        if ("SELLER".equalsIgnoreCase(role)) {
            request.setWfActivityId("FIA");
            request.setStatus("INACTIVE_AUCTION");
        }

        try {
            Vehicle created = vehicleCatalogService.createVehicle(sellerId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVehicleDetails(
            @PathVariable UUID id,
            @RequestBody CreateVehicleRequest request) {
        try {
            return ResponseEntity.ok(vehicleCatalogService.updateVehicleDetails(id, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/stats/users")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> approveVehicle(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleCatalogService.approveVehicle(id));
    }

    @PutMapping("/{id}/send-to-wash")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> sendToWash(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleCatalogService.sendToWash(id));
    }

    @PutMapping("/{id}/wash-complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> markWashingComplete(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleCatalogService.markWashingComplete(id));
    }

    @PutMapping({"/{id}/photo-submit", "/{id}/submit-photo"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> submitPhotoVehicle(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> updateTechnicalReport(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String reportUrl = body.get("reportUrl");
        if (reportUrl == null || reportUrl.isBlank()) {
            reportUrl = body.get("inspectionReportUrl");
        }
        return ResponseEntity.ok(vehicleCatalogService.updateTechnicalReport(id, reportUrl));
    }

    /**
     * Real multipart file upload for Technical Test inspection reports (PDF, DOC, DOCX, JPG, PNG, WEBP).
     */
    @PostMapping(value = "/{id}/technical-report/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadTechnicalReportFile(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a valid non-empty file to upload."));
        }
        if (file.getSize() > 20L * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "File exceeds maximum allowed size of 20MB."));
        }
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().trim() : "technical-report.pdf";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "application/octet-stream";
        String lowerName = originalName.toLowerCase();
        boolean validExt = lowerName.endsWith(".pdf") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")
                || lowerName.endsWith(".png") || lowerName.endsWith(".webp") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx");
        if (!validExt && !ALLOWED_REPORT_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unsupported file type. Allowed: PDF, JPG, PNG, WEBP, DOC, DOCX."));
        }
        if (vehicleCatalogService.getVehicleById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Vehicle not found: " + id));
        }

        try {
            byte[] bytes = file.getBytes();
            UUID adminId = authService.extractUserId(authHeader.substring(7).trim());
            jdbcTemplate.update("""
                    INSERT INTO vehicle_technical_reports (vehicle_id, file_name, content_type, file_size, file_data, uploaded_by, uploaded_at)
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT (vehicle_id) DO UPDATE SET
                        file_name = EXCLUDED.file_name,
                        content_type = EXCLUDED.content_type,
                        file_size = EXCLUDED.file_size,
                        file_data = EXCLUDED.file_data,
                        uploaded_by = EXCLUDED.uploaded_by,
                        uploaded_at = CURRENT_TIMESTAMP
                    """, id, originalName, contentType, file.getSize(), bytes, adminId);

            String downloadUrl = "/api/v1/catalog/vehicles/" + id + "/technical-report/file";
            Vehicle updated = vehicleCatalogService.updateTechnicalReport(id, downloadUrl);
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("success", true);
            resp.put("vehicleId", id);
            resp.put("fileName", originalName);
            resp.put("contentType", contentType);
            resp.put("fileSize", file.getSize());
            resp.put("reportUrl", downloadUrl);
            resp.put("vehicle", updated);
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to store technical report file: " + ex.getMessage()));
        }
    }

    /**
     * Streams the real uploaded technical inspection report file back to the browser.
     */
    @GetMapping("/{id}/technical-report/file")
    public ResponseEntity<byte[]> downloadTechnicalReportFile(@PathVariable UUID id) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT file_name, content_type, file_data FROM vehicle_technical_reports WHERE vehicle_id = ?",
                id
        );
        if (rows.isEmpty() || rows.get(0).get("file_data") == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> row = rows.get(0);
        String fileName = String.valueOf(row.get("file_name"));
        String contentType = String.valueOf(row.get("content_type"));
        byte[] data = (byte[]) row.get("file_data");

        HttpHeaders headers = new HttpHeaders();
        try {
            headers.setContentType(MediaType.parseMediaType(contentType));
        } catch (Exception e) {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName, StandardCharsets.UTF_8).build());
        headers.setContentLength(data.length);
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PutMapping({"/{id}/technical-submit", "/{id}/technical-test"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> submitTechnicalTest(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        return ResponseEntity.ok(vehicleCatalogService.submitTechnicalTest(id));
    }

    @PostMapping("/batch-approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Vehicle>> batchApprove(@RequestBody List<UUID> ids) {
        return ResponseEntity.ok(vehicleCatalogService.batchApprove(ids));
    }

    @PostMapping("/batch-archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Vehicle>> batchArchive(@RequestBody List<UUID> ids) {
        return ResponseEntity.ok(vehicleCatalogService.batchArchive(ids));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> batchCreateVehicles(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody List<CreateVehicleRequest> requests) {
        String token = authHeader.substring(7).trim();
        UUID sellerId = authService.extractUserId(token);
        try {
            List<Vehicle> created = vehicleCatalogService.batchCreateVehicles(sellerId, requests);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (DuplicateVehicleException ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("code", "DUPLICATE_VEHICLES");
            body.put("message", ex.getMessage());
            body.put("errors", ex.getErrors());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("code", "INVALID_UPLOAD", "message", ex.getMessage()));
        }
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
