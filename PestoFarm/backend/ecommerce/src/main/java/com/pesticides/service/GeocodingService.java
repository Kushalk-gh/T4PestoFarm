package com.pesticides.service;

import com.pesticides.modal.Address;

public interface GeocodingService {
    
    /**
     * Converts a street address into Latitude and Longitude coordinates by calling an external API.
     * @param address The Address object containing required address fields.
     * @return The updated Address object with latitude and longitude set.
     */
    Address geocodeAddress(Address address);
}