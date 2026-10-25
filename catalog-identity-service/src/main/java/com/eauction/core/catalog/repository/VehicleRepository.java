package com.eauction.core.catalog.repository;

import com.eauction.core.catalog.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findBySellerId(UUID sellerId);

    List<Vehicle> findByVehicleType(String vehicleType);

    List<Vehicle> findByMakeIgnoreCase(String make);

    Optional<Vehicle> findByVin(String vin);

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    boolean existsByVin(String vin);

    boolean existsByRegistrationNumber(String registrationNumber);
}
