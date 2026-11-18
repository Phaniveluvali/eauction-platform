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

    boolean existsByVinIgnoreCase(String vin);

    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);

    boolean existsByPreviousNumberplateIgnoreCase(String previousNumberplate);

    Optional<Vehicle> findByVinIgnoreCase(String vin);

    Optional<Vehicle> findByRegistrationNumberIgnoreCase(String registrationNumber);

    List<Vehicle> findByVehicleTypeIgnoreCase(String vehicleType);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v ORDER BY v.createdAt DESC, v.id ASC")
    List<Vehicle> findAllOrdered();

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v WHERE LOWER(v.vehicleType) = LOWER(:vehicleType) ORDER BY v.createdAt DESC, v.id ASC")
    List<Vehicle> findByVehicleTypeIgnoreCaseOrdered(@org.springframework.data.repository.query.Param("vehicleType") String vehicleType);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v WHERE LOWER(v.make) = LOWER(:make) ORDER BY v.createdAt DESC, v.id ASC")
    List<Vehicle> findByMakeIgnoreCaseOrdered(@org.springframework.data.repository.query.Param("make") String make);
}
