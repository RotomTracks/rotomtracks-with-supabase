'use client';

import { useState, useEffect } from 'react';

interface UserLocation {
  city?: string;
  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: false
  });

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Try to get location details from a reverse geocoding service
      // For now, we'll use a simple approach with browser's built-in capabilities
      // In a real app, you might want to use a service like Google Maps API
      
      try {
        // Simple approach: try to get location from IP or browser locale
        const locale = navigator.language || 'es-ES';
        const country = locale.includes('ES') ? 'España' : 
                       locale.includes('MX') ? 'México' :
                       locale.includes('AR') ? 'Argentina' :
                       locale.includes('CO') ? 'Colombia' :
                       locale.includes('CL') ? 'Chile' :
                       locale.includes('PE') ? 'Perú' : 'España';

        setState(prev => ({
          ...prev,
          location: {
            latitude,
            longitude,
            country,
            region: country === 'España' ? 'Europa' : 'Latinoamérica'
          },
          loading: false,
          hasPermission: true
        }));
      } catch {
        // Fallback to just coordinates
        setState(prev => ({
          ...prev,
          location: {
            latitude,
            longitude,
            country: 'España', // Default fallback
            region: 'Europa'
          },
          loading: false,
          hasPermission: true
        }));
      }
    } catch (error) {
      let errorMessage = 'Unable to retrieve location';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        hasPermission: false
      }));
    }
  };

  // Try to get location from localStorage first
  useEffect(() => {
    const savedLocation = localStorage.getItem('user-location');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setState(prev => ({
          ...prev,
          location,
          hasPermission: true
        }));
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
  }, []);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (state.location) {
      localStorage.setItem('user-location', JSON.stringify(state.location));
    }
  }, [state.location]);

  const clearLocation = () => {
    localStorage.removeItem('user-location');
    setState({
      location: null,
      loading: false,
      error: null,
      hasPermission: false
    });
  };

  return {
    ...state,
    requestLocation,
    clearLocation
  };
}