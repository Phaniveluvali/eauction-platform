package com.eauction.core.auction.repository;

import com.eauction.core.auction.model.Auction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Optional<Auction> findByIdWithPessimisticLock(@Param("id") UUID id);

    Optional<Auction> findByVehicleId(UUID vehicleId);

    List<Auction> findByStatus(String status);

    long countByStatusAndAuctionType(String status, String auctionType);

    long countByStatus(String status);

    @Modifying
    @Transactional
    @Query("UPDATE Auction a SET a.status = 'ENDED', a.updatedAt = :now WHERE a.status = 'ACTIVE' AND a.endTime <= :now")
    int endExpiredAuctions(@Param("now") Instant now);
}
