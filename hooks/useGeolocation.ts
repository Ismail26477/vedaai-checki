"use client"

import { useState, useCallback } from "react"
import type { Location } from "@/types/attendance"

interface GeolocationState {
  location: Location | null
  error: string | null
  isLoading: boolean
  accuracy: number | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
    accuracy: null,
  })

  const getCurrentLocation = useCallback((): Promise<Location | null> => {
    return new Promise((resolve) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      if (!navigator.geolocation) {
        console.warn("[v0] Geolocation not supported")
        setState((prev) => ({ ...prev, isLoading: false }))
        resolve(null)
        return
      }

      const locationOptions = {
        enableHighAccuracy: false, // Set to false for faster acquisition
        timeout: 15000, // Reduced to 15 seconds
        maximumAge: 30000, // Cache location for 30s to speed up repeated calls
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const accuracyMeters = Math.round(position.coords.accuracy)
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: accuracyMeters,
          }

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "AttendEase-App/1.0",
                },
              },
            )
            const data = await response.json()
            if (data.address) {
              const addr = data.address
              const parts = [
                addr.road || addr.pedestrian || addr.footway,
                addr.neighbourhood || addr.suburb || addr.quarter,
                addr.city || addr.town || addr.village,
                addr.postcode,
              ].filter(Boolean)
              location.address =
                parts.length > 0 ? parts.join(", ") : data.display_name?.split(",").slice(0, 4).join(",")
            } else if (data.display_name) {
              location.address = data.display_name.split(",").slice(0, 4).join(",")
            }
          } catch (err) {
            console.error("[v0] Address lookup failed:", err)
            location.address = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
          }

          setState({ location, error: null, isLoading: false, accuracy: accuracyMeters })
          resolve(location)
        },
        (error) => {
          let errorMessage = "Unable to retrieve location"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location unavailable"
              break
            case error.TIMEOUT:
              console.warn("[v0] Location timeout - proceeding without location data for faster check-in")
              setState((prev) => ({ ...prev, isLoading: false }))
              resolve(null)
              return
          }
          console.warn("[v0] Geolocation error:", errorMessage)
          setState((prev) => ({ ...prev, isLoading: false }))
          resolve(null)
        },
        locationOptions,
      )
    })
  }, [])

  return {
    ...state,
    getCurrentLocation,
  }
}
