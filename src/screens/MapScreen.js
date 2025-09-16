import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getPrivateKey, getCurrentUserId } from '../services/secureStorage';
import { requestLocationPermissions, checkLocationPermissions, getCurrentLocation, startLocationTracking, stopLocationTracking } from '../services/locationService';
import { getFriendPublicKey, getFriendUserId, sendEncryptedLocation } from '../services/supabase';
import { encryptLocationForFriend } from '../services/encryptionService';

export default function MapScreen({ route }) {
  const { userType, userId, email } = route.params || {};
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [friendData, setFriendData] = useState(null);

  useEffect(() => {
    loadUserData();
    return () => {
      // Cleanup location tracking on unmount
      if (locationSubscription) {
        stopLocationTracking(locationSubscription);
      }
    };
  }, [userId]);

  const loadUserData = async () => {
    try {
      if (userId) {
        const key = await getPrivateKey(userId);
        setPrivateKey(key);
      }

      // Check location permissions
      const permissionStatus = await checkLocationPermissions();
      setLocationPermission(permissionStatus);

      // Fetch friend's public key (for Phase 0 testing)
      if (userType) {
        const friendUserId = getFriendUserId(userType);
        const friend = await getFriendPublicKey(friendUserId);
        setFriendData(friend);
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const result = await requestLocationPermissions();
      setLocationPermission(result);

      if (result.granted) {
        await startTracking();
      }
    } catch (error) {
      Alert.alert('Permission Error', error.message);
    }
  };

  const startTracking = async () => {
    try {
      // Get initial location
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Start tracking location changes
      const subscription = await startLocationTracking(async (newLocation) => {
        setCurrentLocation(newLocation);
        console.log('Location updated:', newLocation);

        // Encrypt and send location to friend (if we have their public key)
        if (friendData?.publicKey) {
          try {
            await encryptAndSendLocation(newLocation);
          } catch (error) {
            console.error('Failed to encrypt and send location:', error);
          }
        }
      });

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      Alert.alert('Location Error', 'Failed to get location');
    }
  };

  const encryptAndSendLocation = async (locationData) => {
    try {
      if (!friendData?.publicKey || !userId) {
        console.log('Missing friend public key or user ID, skipping encryption');
        return;
      }

      // Encrypt location data with friend's public key
      const encryptedPayload = await encryptLocationForFriend(locationData, friendData.publicKey);

      // Get friend's user ID
      const friendUserId = getFriendUserId(userType);

      // Send encrypted location to Supabase
      await sendEncryptedLocation(userId, friendUserId, encryptedPayload);

      console.log('Location encrypted and sent successfully');

    } catch (error) {
      console.error('Failed to encrypt and send location:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Screen</Text>
      <Text style={styles.subtitle}>
        Logged in as: {userType === 'userA' ? 'User A' : 'User B'}
      </Text>
      <Text style={styles.email}>Email: {email}</Text>
      <Text style={styles.userId}>User ID: {userId}</Text>
      <Text style={styles.keyStatus}>
        Private Key: {privateKey ? '✓ Loaded from secure storage' : '✗ Not found'}
      </Text>

      <Text style={styles.keyStatus}>
        Friend's Public Key: {friendData?.publicKey ? '✓ Loaded from Supabase' : '✗ Not found'}
      </Text>

      {friendData && (
        <Text style={styles.friendInfo}>
          Friend: {friendData.name || 'Unknown'}
        </Text>
      )}

      {/* Location Permission Status */}
      <Text style={styles.permissionStatus}>
        Location Permission: {
          locationPermission?.granted
            ? '✓ Granted'
            : locationPermission === null
              ? 'Checking...'
              : '✗ Denied'
        }
      </Text>

      {/* Request Permission Button */}
      {locationPermission && !locationPermission.granted && (
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
          <Text style={styles.permissionButtonText}>Grant Location Access</Text>
        </TouchableOpacity>
      )}

      {/* Current Location Display */}
      {currentLocation && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Current Location:</Text>
          <Text style={styles.locationText}>
            Lat: {currentLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {currentLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Accuracy: {currentLocation.accuracy?.toFixed(1)}m
          </Text>
          <Text style={styles.locationText}>
            Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <Text style={styles.placeholder}>
        Map component will be implemented in task 0.29
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  keyStatus: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  friendInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  permissionStatus: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  permissionButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '90%',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});