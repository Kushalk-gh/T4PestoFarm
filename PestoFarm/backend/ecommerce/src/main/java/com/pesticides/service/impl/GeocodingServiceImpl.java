package com.pesticides.service.impl;

import com.pesticides.modal.Address;
import com.pesticides.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@RestController
@Service
@RequiredArgsConstructor
public class GeocodingServiceImpl implements GeocodingService {

        // NOTE: In a real app, RestTemplate should be injected or used via WebClient
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${osm.nominatim.base-url}")
    private String nominatimBaseUrl;

    @Value("${osm.nominatim.user-agent}")
    private String userAgent;

    @Value("${osm.nominatim.email}")
    private String contactEmail;

    @Override
    public Address geocodeAddress(Address address) {
        if (address == null) return null;

        // Construct the full address string for the query
        final String fullAddress = String.format("%s, %s, %s, %s", 
            address.getStreetAddress(), address.getCity(), address.getState(), address.getZipCode());

        // Build the URI with query parameters
        String uri = UriComponentsBuilder.fromHttpUrl(nominatimBaseUrl)
                .queryParam("q", fullAddress)
                .queryParam("format", "json")
                .queryParam("limit", 1) 
                .queryParam("email", contactEmail) // Required by policy
                .toUriString();

        // Set the REQUIRED User-Agent header
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", userAgent); 
        
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        try {
            // Execute the API call (Nominatim returns a JSON array)
            ResponseEntity<List> response = restTemplate.exchange(
                    uri, 
                    HttpMethod.GET, 
                    entity, 
                    List.class
            );

            List<Map<String, Object>> results = response.getBody();

            // Parse the response
            if (results != null && !results.isEmpty()) {
                Map<String, Object> bestMatch = results.get(0);
                
                Double lat = Double.parseDouble((String) bestMatch.get("lat"));
                Double lon = Double.parseDouble((String) bestMatch.get("lon"));
                
                address.setLatitude(lat);
                address.setLongitude(lon);
            } else {
                address.setLatitude(null); 
                address.setLongitude(null);
            }
        } catch (Exception e) {
            System.err.println("Geocoding failed for address: " + fullAddress + ". Error: " + e.getMessage());
            address.setLatitude(null);
            address.setLongitude(null);
        }

        return address;
    }
}