package com.eauction.core.identity.repository;

import com.eauction.core.identity.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    long countByRole(String role);

    java.util.List<User> findByRole(String role);

    @Query("SELECT u FROM User u WHERE " +
            "(:role IS NULL OR :role = '' OR :role = 'ALL' OR u.role = :role) AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(
            @Param("role") String role,
            @Param("search") String search,
            Pageable pageable);
}
