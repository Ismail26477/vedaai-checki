// Office location configuration
// 301, VINAYAK ENCLAVE, Manish Nagar, Nagpur, Maharashtra 440015

export const OFFICE_LOCATION = {
  name: "Vinayak Enclave, Manish Nagar",
  latitude: 21.1096, // Approximate coordinates for Manish Nagar, Nagpur
  longitude: 79.0598,
  address: "301, Vinayak Enclave, Manish Nagar, Nagpur, Maharashtra 440015",
  // Maximum allowed distance from office (in meters) to be considered "at office"
  geofenceRadius: 100, // 100 meters
}

// Haversine formula to calculate distance between two GPS coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Check if a location is within the office geofence
export function isAtOffice(
  latitude: number,
  longitude: number,
): {
  isWithinGeofence: boolean
  distanceFromOffice: number
} {
  const distance = calculateDistance(latitude, longitude, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude)

  return {
    isWithinGeofence: distance <= OFFICE_LOCATION.geofenceRadius,
    distanceFromOffice: Math.round(distance),
  }
}
