package com.pesticides.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.modal.User;
import com.pesticides.modal.UserLocation;
import com.pesticides.modal.UserLocationPreference;
import com.pesticides.service.LocationService;
import com.pesticides.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;
    private final UserService userService;

    /**
     * POST /api/users/location
     * Save user's current location
     *
     * Request Body:
     * {
     *   "latitude": 28.6139,
     *   "longitude": 77.2090,
     *   "timestamp": 1699564800000
     * }
     *
     * Response (201 Created):
     * {
     *   "id": 1,
     *   "userId": 5,
     *   "latitude": 28.6139,
     *   "longitude": 77.2090,
     *   "timestamp": 1699564800000,
     *   "createdAt": "2024-01-15T10:30:00Z",
     *   "updatedAt": "2024-01-15T10:30:00Z"
     * }
     */
    @PostMapping("/user-location")
    public ResponseEntity<?> saveLocation(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request) {
        try {
            // Extract user from JWT token
            User user = userService.findUserByJwtToken(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Unauthorized"));
            }

            // Extract coordinates from request
            Double latitude = ((Number) request.get("latitude")).doubleValue();
            Double longitude = ((Number) request.get("longitude")).doubleValue();
            Long timestamp = ((Number) request.get("timestamp")).longValue();

            // Save location
            UserLocation location = locationService.saveLocation(user, latitude, longitude, timestamp);

            // Return created location
            return ResponseEntity.status(HttpStatus.CREATED).body(location);

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Invalid number format in request body"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/users/location
     * Get user's most recent location
     *
     * Response (200 OK):
     * {
     *   "id": 1,
     *   "userId": 5,
     *   "latitude": 28.6139,
     *   "longitude": 77.2090,
     *   "timestamp": 1699564800000,
     *   "createdAt": "2024-01-15T10:30:00Z",
     *   "updatedAt": "2024-01-15T10:30:00Z"
     * }
     *
     * Response (404 Not Found):
     * {
     *   "error": "No location found"
     * }
     */
    @GetMapping("/user-location")
    public ResponseEntity<?> getLocation(@RequestHeader("Authorization") String token) {
        try {
            // Extract user from JWT token
            User user = userService.findUserByJwtToken(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Unauthorized"));
            }

            // Get latest location
            Optional<UserLocation> location = locationService.getLatestLocation(user);
            if (location.isPresent()) {
                return ResponseEntity.ok(location.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("No location found"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * POST /api/users/location-preference
     * Save user's location permission preference
     *
     * Request Body:
     * {
     *   "choice": "allowWhileVisiting"
     * }
     *
     * Valid choice values: "allowWhileVisiting", "onlyThisTime", "dontAllow"
     *
     * Response (201 Created):
     * {
     *   "id": 1,
     *   "userId": 5,
     *   "choice": "allowWhileVisiting",
     *   "savedAt": "2024-01-15T10:30:00Z"
     * }
     */
    @PostMapping("/location-preference")
    public ResponseEntity<?> saveLocationPreference(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        try {
            // Extract user from JWT token
            User user = userService.findUserByJwtToken(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Unauthorized"));
            }

            // Extract choice from request
            String choice = request.get("choice");
            if (choice == null || choice.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Choice field is required"));
            }

            // Save preference
            UserLocationPreference preference = locationService.saveLocationPreference(user, choice);

            // Return created preference
            return ResponseEntity.status(HttpStatus.CREATED).body(preference);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/users/location-preference
     * Get user's location permission preference
     *
     * Response (200 OK):
     * {
     *   "id": 1,
     *   "userId": 5,
     *   "choice": "allowWhileVisiting",
     *   "savedAt": "2024-01-15T10:30:00Z"
     * }
     *
     * Response (404 Not Found):
     * {
     *   "error": "No location preference found"
     * }
     */
    @GetMapping("/location-preference")
    public ResponseEntity<?> getLocationPreference(@RequestHeader("Authorization") String token) {
        try {
            // Extract user from JWT token
            User user = userService.findUserByJwtToken(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Unauthorized"));
            }

            // Get location preference
            Optional<UserLocationPreference> preference = locationService.getLocationPreference(user);
            if (preference.isPresent()) {
                return ResponseEntity.ok(preference.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("No location preference found"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Helper method to create consistent error response format
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
