import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Check if we're running on web - more robust detection
const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

/**
 * Request location permissions from the user
 * For Phase 0, we only request "When In Use" permissions
 */
export async function requestLocationPermissions() {
  try {
    if (isWeb) {
      // For web, check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Test permission by trying to get location
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ granted: true, status: 'granted' }),
          (error) => {
            console.error('Web geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
              reject(new Error('Location permission denied'));
            } else {
              reject(new Error('Failed to get location'));
            }
          },
          { timeout: 10000 }
        );
      });
    } else {
      // Request foreground location permissions for native
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      return { granted: true, status };
    }
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    throw error;
  }
}

/**
 * Check current location permission status
 */
export async function checkLocationPermissions() {
  console.log('checkLocationPermissions called, isWeb:', isWeb);
  try {
    if (isWeb) {
      console.log('Web platform detected - assuming location permission NOT granted initially');
      // For web, return false so the permission button shows
      return { granted: false, status: 'prompt' };
    } else {
      console.log('Checking native location permissions');
      const { status } = await Location.getForegroundPermissionsAsync();
      return { granted: status === 'granted', status };
    }
  } catch (error) {
    console.error('Error checking location permissions:', error);
    throw error;
  }
}

/**
 * Get the current location
 * @param {boolean} highAccuracy - Whether to use high accuracy mode
 */
export async function getCurrentLocation(highAccuracy = true) {
  console.log('getCurrentLocation called, isWeb:', isWeb);
  try {
    if (isWeb) {
      console.log('Using browser geolocation API');
      // Use browser geolocation API
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Browser geolocation success:', position);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          },
          (error) => {
            console.error('Web geolocation error:', error);
            reject(new Error(`Failed to get location: ${error.message}`));
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });
    } else {
      console.log('Using Expo location API');
      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    }
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
}

/**
 * Start watching location changes (foreground only for Phase 0)
 * @param {function} callback - Function to call when location changes
 * @param {number} distanceInterval - Minimum distance change in meters
 */
export async function startLocationTracking(callback, distanceInterval = 10) {
  try {
    if (isWeb) {
      // Use browser geolocation watchPosition
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          callback(locationData);
        },
        (error) => {
          console.error('Web location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );

      // Return an object with remove method for compatibility
      return {
        remove: () => navigator.geolocation.clearWatch(watchId)
      };
    } else {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000, // 15 seconds
          distanceInterval: distanceInterval, // 10 meters
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          callback(locationData);
        }
      );

      return subscription;
    }
  } catch (error) {
    console.error('Error starting location tracking:', error);
    throw error;
  }
}

/**
 * Stop location tracking
 * @param {object} subscription - The subscription object returned by startLocationTracking
 */
export function stopLocationTracking(subscription) {
  if (subscription) {
    subscription.remove();
  }
}