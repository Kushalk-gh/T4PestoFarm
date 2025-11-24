package com.pesticides.service;

import java.util.Optional;

import com.pesticides.modal.User;
import com.pesticides.modal.UserLocation;
import com.pesticides.modal.UserLocationPreference;

public interface LocationService {
    /**
     * Save user's current location
     */
    UserLocation saveLocation(User user, Double latitude, Double longitude, Long timestamp) throws Exception;

    /**
     * Get user's most recent location
     */
    Optional<UserLocation> getLatestLocation(User user) throws Exception;

    /**
     * Save user's location permission choice
     */
    UserLocationPreference saveLocationPreference(User user, String choice) throws Exception;

    /**
     * Get user's location permission preference
     */
    Optional<UserLocationPreference> getLocationPreference(User user) throws Exception;
}
