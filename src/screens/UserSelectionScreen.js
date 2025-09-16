import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { initializeTestUserKeys } from '../services/secureStorage';
import { authenticateUser } from '../services/supabase';

export default function UserSelectionScreen({ navigation }) {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeKeys();
  }, []);

  const initializeKeys = async () => {
    try {
      await initializeTestUserKeys();
    } catch (error) {
      console.error('Failed to initialize test keys:', error);
      Alert.alert('Error', 'Failed to initialize secure storage');
    } finally {
      setInitializing(false);
    }
  };

  const handleAuth = async (userType) => {
    try {
      const result = await authenticateUser(userType);

      if (result.success) {
        navigation.replace('Map', {
          userType: userType,
          userId: result.userId,
          email: result.email
        });
      } else {
        Alert.alert('Authentication Error', result.error);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert('Error', 'Authentication failed');
    }
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Initializing secure storage...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Development Mode</Text>
      <Text style={styles.subtitle}>Select a test user account</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.userButton, styles.userAButton]}
          onPress={() => handleAuth('userA')}
        >
          <Text style={styles.userButtonText}>Login as User A</Text>
          <Text style={styles.userEmail}>dan@dkdev.io</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.userButton, styles.userBButton]}
          onPress={() => handleAuth('userB')}
        >
          <Text style={styles.userButtonText}>Login as User B</Text>
          <Text style={styles.userEmail}>dpeterkelly@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        These are test accounts for development only.
        Location sharing is fully encrypted between users.
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
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 30,
  },
  userButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  userAButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#2e7d32',
  },
  userBButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  userButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});