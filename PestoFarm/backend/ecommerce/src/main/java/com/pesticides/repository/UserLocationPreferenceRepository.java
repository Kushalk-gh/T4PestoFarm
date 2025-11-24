package com.pesticides.repository;

import com.pesticides.modal.User;
import com.pesticides.modal.UserLocationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLocationPreferenceRepository extends JpaRepository<UserLocationPreference, Long> {
    /**
     * Find location preference for a user (one-to-one relationship)
     */
    Optional<UserLocationPreference> findByUser(User user);
}
