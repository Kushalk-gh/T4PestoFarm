package com.pesticides.repository;

import com.pesticides.modal.User;
import com.pesticides.modal.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {
    /**
     * Find the most recent location for a user
     */
    Optional<UserLocation> findFirstByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all locations for a user
     */
    List<UserLocation> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Delete old locations (for data cleanup)
     */
    void deleteByUserAndIdNot(User user, Long latestId);
}
