import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function PermissionRequestScreen({ navigation }) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setIsRequesting(true);

      // Request "When In Use" permission first
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        // Permission granted, proceed to main app
        // The navigation will be handled by AuthContext when permissions are ready
        navigation.reset({
          index: 0,
          routes: [{ name: 'BackgroundPermissionPrimer' }],
        });
      } else if (status === 'denied') {
        Alert.alert(
          'Location Permission Required',
          'Green Box needs location access to share your location with friends. Please enable location access in Settings.',
          [
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
            { text: 'Later', style: 'cancel' }
          ]
        );
      } else {
        // Permission was denied permanently
        Alert.alert(
          'Location Access Blocked',
          'Location access has been blocked. Please enable it in your device settings to use Green Box.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkipForNow = () => {
    Alert.alert(
      'Skip Location Access?',
      'You can always enable location sharing later in Settings, but you won\'t be able to share your location until then.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            // Navigate to main app but with limited functionality
            // The app will show empty state
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Allow Location Access</Text>
          <Text style={styles.subtitle}>
            To share your location with friends, Green Box needs access to your device's location
          </Text>
        </View>

        {/* Permission Info */}
        <View style={styles.permissionInfo}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>📍</Text>
            <Text style={styles.permissionText}>
              We'll ask for "When In Use" permission first
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>🔒</Text>
            <Text style={styles.permissionText}>
              Your exact location stays private and encrypted
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>⚙️</Text>
            <Text style={styles.permissionText}>
              You can always change these settings later
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleRequestPermission}
            disabled={isRequesting}
          >
            <Text style={styles.allowButtonText}>
              {isRequesting ? 'Requesting...' : 'Allow Location Access'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipForNow}
            disabled={isRequesting}
          >
            <Text style={styles.skipButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  permissionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    paddingBottom: 20,
  },
  allowButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  allowButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});