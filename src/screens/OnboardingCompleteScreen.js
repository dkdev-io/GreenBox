import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingCompleteScreen() {
  const { completeOnboarding } = useAuth();

  useEffect(() => {
    // Complete onboarding after a brief delay
    const timer = setTimeout(async () => {
      await completeOnboarding();
    }, 2000); // 2 second delay to show this screen

    return () => clearTimeout(timer);
  }, [completeOnboarding]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Setting up your secure connection...</Text>
        <ActivityIndicator size="large" color="#2e7d32" style={styles.loader} />
        <Text style={styles.subtitle}>You'll be ready to share in just a moment</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});