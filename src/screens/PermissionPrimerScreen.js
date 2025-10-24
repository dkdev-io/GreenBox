import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';

export default function PermissionPrimerScreen({ navigation }) {
  const handleContinue = () => {
    navigation.navigate('PermissionRequest');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Location Access</Text>
          <Text style={styles.subtitle}>
            Green Box needs access to your location to share it securely with your friends and family
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔒</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>End-to-End Encrypted</Text>
              <Text style={styles.featureDescription}>
                Your location is encrypted on your device. Only your friends can see it.
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⏱️</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Automatic Deletion</Text>
              <Text style={styles.featureDescription}>
                All location data is automatically deleted after 10 minutes.
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👥</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>You Choose Who Sees</Text>
              <Text style={styles.featureDescription}>
                Only share with people you invite. Control who sees your location.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
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
  features: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
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
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  actions: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});