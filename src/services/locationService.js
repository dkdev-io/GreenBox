import * as Location from 'expo-location';

/**
 * Request location permissions from the user
 * For Phase 0, we only request "When In Use" permissions
 */
export async function requestLocationPermissions() {
  try {
    // Request foreground location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    return { granted: true, status };
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    throw error;
  }
}

/**
 * Check current location permission status
 */
export async function checkLocationPermissions() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return { granted: status === 'granted', status };
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
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
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