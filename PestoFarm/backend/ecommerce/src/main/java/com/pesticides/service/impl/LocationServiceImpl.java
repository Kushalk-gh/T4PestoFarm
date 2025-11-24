package com.pesticides.service.impl;

import com.pesticides.modal.User;
import com.pesticides.modal.UserLocation;
import com.pesticides.modal.UserLocationPreference;
import com.pesticides.repository.UserLocationRepository;
import com.pesticides.repository.UserLocationPreferenceRepository;
import com.pesticides.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationServiceImpl implements LocationService {

    private final UserLocationRepository userLocationRepository;
    private final UserLocationPreferenceRepository preferenceRepository;

    /**
     * Save user's current location to database
     */
    @Override
    public UserLocation saveLocation(User user, Double latitude, Double longitude, Long timestamp) throws Exception {
        if (user == null) {
            throw new Exception("User not found");
        }

        if (latitude == null || longitude == null) {
            throw new Exception("Latitude and longitude are required");
        }

        // Validate coordinates (rough bounds for Earth)
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new Exception("Invalid latitude or longitude values");
        }

        UserLocation location = new UserLocation(user, latitude, longitude, timestamp);
        return userLocationRepository.save(location);
    }

    /**
     * Get user's most recent location from database
     */
    @Override
    public Optional<UserLocation> getLatestLocation(User user) throws Exception {
        if (user == null) {
            throw new Exception("User not found");
        }
        return userLocationRepository.findFirstByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Save or update user's location permission preference
     */
    @Override
    public UserLocationPreference saveLocationPreference(User user, String choice) throws Exception {
        if (user == null) {
            throw new Exception("User not found");
        }

        // Validate choice
        if (!isValidChoice(choice)) {
            throw new Exception("Invalid location preference choice. Must be: allowWhileVisiting, onlyThisTime, or dontAllow");
        }

        // Find existing preference or create new
        UserLocationPreference preference = preferenceRepository.findByUser(user)
                .orElse(new UserLocationPreference());
        preference.setUser(user);
        preference.setChoice(choice);

        return preferenceRepository.save(preference);
    }

    /**
     * Get user's location permission preference
     */
    @Override
    public Optional<UserLocationPreference> getLocationPreference(User user) throws Exception {
        if (user == null) {
            throw new Exception("User not found");
        }
        return preferenceRepository.findByUser(user);
    }

    /**
     * Validate location preference choice
     */
    private boolean isValidChoice(String choice) {
        return choice != null && (
                choice.equals("allowWhileVisiting") ||
                choice.equals("onlyThisTime") ||
                choice.equals("dontAllow")
        );
    }
}
