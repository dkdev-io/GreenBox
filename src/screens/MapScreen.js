import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker } from '../components/Map';
import { getPrivateKey, getCurrentUserId } from '../services/secureStorage';
import { requestLocationPermissions, checkLocationPermissions, getCurrentLocation, startLocationTracking, stopLocationTracking } from '../services/locationService';
import { getFriendPublicKey, getFriendUserId, sendEncryptedLocation, subscribeToLocationUpdates, unsubscribeFromLocationUpdates, processIncomingLocation } from '../services/supabase';
import { encryptLocationForFriend } from '../services/encryptionService';

export default function MapScreen({ route }) {
  const { userType, userId, email } = route.params || {};
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);
  const [receivedLocations, setReceivedLocations] = useState([]);

  useEffect(() => {
    loadUserData();
    return () => {
      // Cleanup location tracking on unmount
      if (locationSubscription) {
        stopLocationTracking(locationSubscription);
      }
      // Cleanup real-time subscription on unmount
      if (realtimeSubscription) {
        unsubscribeFromLocationUpdates(realtimeSubscription);
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

      // Set up real-time subscription for incoming locations
      if (userId) {
        setupRealtimeSubscription();
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('🔄 Setting up real-time subscription for user:', userId);

    const subscription = subscribeToLocationUpdates(userId, async (encryptedLocationRow) => {
      try {
        console.log('📨 Received encrypted location message:', encryptedLocationRow);

        // Process and decrypt the incoming location
        const decryptedLocation = await processIncomingLocation(encryptedLocationRow, userType);

        // Add to received locations list (for display)
        setReceivedLocations(prev => [decryptedLocation, ...prev.slice(0, 4)]); // Keep last 5

      } catch (error) {
        console.error('Failed to process incoming location:', error);
      }
    });

    setRealtimeSubscription(subscription);
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
        console.log('Location updated successfully');

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
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <Text style={styles.userLabel}>
          {userType === 'userA' ? 'User A' : 'User B'}
        </Text>
        <Text style={styles.connectionStatus}>
          {realtimeSubscription ? '🟢' : '🔴'}
        </Text>
      </View>

      {/* Request Permission Button */}
      {locationPermission && !locationPermission.granted && (
        <View style={styles.permissionOverlay}>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Grant Location Access</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Component */}
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* User's Current Location - Blue Dot */}
          <Marker
            key={`user-current-${currentLocation.timestamp}`}
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You"
            description="Your current location"
            pinColor="blue"
          />

          {/* Friend's Most Recent Location - Red Dot */}
          {receivedLocations.length > 0 && (
            <Marker
              key={`friend-current-${receivedLocations[0].timestamp}`}
              coordinate={{
                latitude: receivedLocations[0].latitude,
                longitude: receivedLocations[0].longitude,
              }}
              title={receivedLocations[0].senderName || 'Friend'}
              description={`Updated: ${new Date(receivedLocations[0].timestamp).toLocaleTimeString()}`}
              pinColor="red"
            />
          )}
        </MapView>
      )}

      {!currentLocation && locationPermission?.granted && (
        <View style={styles.loadingMap}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2e7d32',
    paddingTop: 50,
  },
  userLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectionStatus: {
    fontSize: 16,
  },
  permissionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  permissionButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  loadingMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});