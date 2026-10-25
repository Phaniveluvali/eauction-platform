package com.eauction.core.auction.repository;

import com.eauction.core.auction.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, UUID> {

    List<Bid> findByAuctionIdOrderByBidAmountDesc(UUID auctionId);

    List<Bid> findByBidderIdOrderByCreatedAtDesc(UUID bidderId);

    Optional<Bid> findTopByAuctionIdOrderByBidAmountDesc(UUID auctionId);
}
