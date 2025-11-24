package com.pesticides.utils;

public class LocationUtil {

    private static final double EARTH_RADIUS_KM = 6371.0; // Radius of the Earth in Kilometers

    /**
     * Calculates the distance between two points on the Earth using the Haversine formula.
     * @param lat1 Latitude of the first point (e.g., User)
     * @param lon1 Longitude of the first point (e.g., User)
     * @param lat2 Latitude of the second point (e.g., Seller)
     * @param lon2 Longitude of the second point (e.g., Seller)
     * @return Distance in kilometers
     */
    public static double calculateDistanceInKilometers(double lat1, double lon1, double lat2, double lon2) {
        // Convert latitude and longitude to radians
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        // Haversine formula implementation
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}