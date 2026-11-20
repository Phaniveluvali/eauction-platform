package com.eauction.core.catalog.service;

import com.eauction.core.catalog.dto.CreateVehicleRequest;
import com.eauction.core.catalog.model.Vehicle;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleCatalogService {
    Vehicle createVehicle(UUID sellerId, CreateVehicleRequest request);
    Vehicle updateVehicleDetails(UUID id, CreateVehicleRequest request);
    Vehicle approveVehicle(UUID id);
    Vehicle sendToWash(UUID id);
    Vehicle markWashingComplete(UUID id);
    Vehicle submitPhotoVehicle(UUID id, List<String> mediaPaths);
    Vehicle updateTechnicalReport(UUID id, String reportUrl);
    Vehicle submitTechnicalTest(UUID id);
    Vehicle relistVehicle(UUID id);
    Vehicle deliverVehicle(UUID id);
    Vehicle sellerApprovalDecision(UUID id, boolean approved, String comment);
    Vehicle archiveVehicle(UUID id);
    List<Vehicle> batchApprove(List<UUID> ids);
    List<Vehicle> batchArchive(List<UUID> ids);
    List<Vehicle> batchCreateVehicles(UUID sellerId, List<CreateVehicleRequest> requests);
    List<Vehicle> listVehicles(String type, String make);
    Optional<Vehicle> getVehicleById(UUID id);
    Optional<Vehicle> getVehicleByVin(String vin);
    List<Vehicle> getVehiclesBySeller(UUID sellerId);
}
