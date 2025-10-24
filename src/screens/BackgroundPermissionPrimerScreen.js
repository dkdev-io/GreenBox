import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function BackgroundPermissionPrimerScreen({ navigation }) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableBackground = async () => {
    try {
      setIsRequesting(true);

      // Request background location permission
      const { status } = await Location.requestBackgroundPermissionsAsync();

      if (status === 'granted') {
        // Background permission granted, proceed to main app
        // This will be handled by the navigation state
        navigateToMainApp();
      } else {
        // Background permission denied, but that's okay
        // User can still use the app with foreground-only location
        Alert.alert(
          'Background Access Not Enabled',
          'You can still share your location when the app is open. You can enable background sharing later in Settings.',
          [{ text: 'Continue', onPress: navigateToMainApp }]
        );
      }
    } catch (error) {
      console.error('Error requesting background permission:', error);
      Alert.alert('Error', 'Failed to request background permission. Continuing with foreground-only access.');
      navigateToMainApp();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkipBackground = () => {
    Alert.alert(
      'Skip Background Access?',
      'You\'ll only be able to share your location when the app is open. You can enable background sharing later in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: navigateToMainApp }
      ]
    );
  };

  const navigateToMainApp = () => {
    // Reset navigation stack and go to main app
    // The auth context will handle switching to MainStack
    navigation.reset({
      index: 0,
      routes: [{ name: 'OnboardingComplete' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stay Connected</Text>
          <Text style={styles.subtitle}>
            Enable background location to keep sharing even when the app isn't open
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Text style={styles.icon}>🔄</Text>
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Automatic Updates</Text>
              <Text style={styles.benefitDescription}>
                Your friends stay updated even when you're not actively using the app
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Text style={styles.icon}>🔋</Text>
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Battery Optimized</Text>
              <Text style={styles.benefitDescription}>
                Uses intelligent location updates to preserve battery life
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Text style={styles.icon}>⚙️</Text>
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Always Your Choice</Text>
              <Text style={styles.benefitDescription}>
                You can disable background sharing anytime in Settings
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableBackground}
            disabled={isRequesting}
          >
            <Text style={styles.enableButtonText}>
              {isRequesting ? 'Requesting...' : 'Enable Background Sharing'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipBackground}
            disabled={isRequesting}
          >
            <Text style={styles.skipButtonText}>Use Foreground Only</Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
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
  benefits: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    paddingBottom: 20,
  },
  enableButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enableButtonText: {
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