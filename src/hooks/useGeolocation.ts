import { useState, useEffect, useCallback } from 'react';
import { Location } from '../types';

interface GeolocationState {
  location: Location | null;
  error: string | null;
}

interface SavedLocationData {
  location: Location;
  timestamp: number;
  sessionId: string;
}

// Generate a session ID for this browser session
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// Location is considered stale after 24 hours
const LOCATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'traffick-user-location';

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
  });

  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Load saved location from localStorage
  const loadSavedLocation = useCallback((): SavedLocationData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const parsed: SavedLocationData = JSON.parse(saved);
      const now = Date.now();
      
      // Check if location is still valid (not expired)
      if (now - parsed.timestamp > LOCATION_EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to load saved location:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  // Save location to localStorage
  const saveLocation = useCallback((location: Location) => {
    try {
      const savedData: SavedLocationData = {
        location,
        timestamp: Date.now(),
        sessionId: generateSessionId()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    } catch (error) {
      console.warn('Failed to save location:', error);
    }
  }, []);

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const { 
          state, 
          state_district, 
          county, 
          city, 
          town, 
          village, 
          country,
          country_code 
        } = data.address;
        
        // Prioritize state, then fallback to larger regions
        if (state) {
          return state;
        }
        if (state_district) {
          return state_district;
        }
        if (county) {
          return county;
        }
        if (city || town || village) {
          return city || town || village;
        }
        if (country) {
          return country;
        }
      }
      
      // Fallback based on rough coordinate ranges for major regions
      if (lat >= 24.396308 && lat <= 49.384358 && lng >= -125.000000 && lng <= -66.934570) {
        return 'United States';
      }
      if (lat >= 41.675105 && lat <= 83.162102 && lng >= -141.000000 && lng <= -52.636291) {
        return 'Canada';
      }
      if (lat >= 14.532286 && lat <= 32.718865 && lng >= -118.404834 && lng <= -86.703392) {
        return 'Mexico';
      }
      if (lat >= 35.000000 && lat <= 72.000000 && lng >= -10.000000 && lng <= 40.000000) {
        return 'Europe';
      }
      if (lat >= -10.000000 && lat <= 37.000000 && lng >= 68.000000 && lng <= 97.000000) {
        return 'Asia';
      }
      
      return 'Your Location';
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return 'Your Location';
    }
  }, []);

  // Request fresh location from browser
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    if (isRequestingLocation) return; // Prevent multiple simultaneous requests
    
    setIsRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        // Get address from coordinates
        const address = await reverseGeocode(coords.lat, coords.lng);
        
        const newLocation = {
          ...coords,
          address,
        };
        
        saveLocation(newLocation);
        setState({
          location: newLocation,
          error: null,
        });
        setIsRequestingLocation(false);
      },
      (error) => {
        let errorMessage = 'An unknown error occurred.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setState({
          location: null,
          error: errorMessage,
        });
        setIsRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, [isRequestingLocation, saveLocation, reverseGeocode]);

  // Force refresh location (for manual refresh)
  const refreshLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    // First, try to load saved location
    const savedLocation = loadSavedLocation();
    
    if (savedLocation) {
      // Check if saved location has address, if not, get it
      if (!savedLocation.location.address) {
        // Backward compatibility: get address for saved location without address
        reverseGeocode(savedLocation.location.lat, savedLocation.location.lng)
          .then(address => {
            const updatedLocation = {
              ...savedLocation.location,
              address,
            };
            saveLocation(updatedLocation);
            setState({
              location: updatedLocation,
              error: null,
            });
          })
          .catch(() => {
            // If reverse geocoding fails, still use the saved location
            setState({
              location: savedLocation.location,
              error: null,
            });
          });
      } else {
        // Use saved location immediately
        setState({
          location: savedLocation.location,
          error: null,
        });
      }
    } else {
      // No saved location, request new one
      requestLocation();
    }
  }, [loadSavedLocation, requestLocation, reverseGeocode, saveLocation]);

  return {
    ...state,
    isRequestingLocation,
    refreshLocation,
  };
};