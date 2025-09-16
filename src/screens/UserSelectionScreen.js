import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { authenticateTestUser, TEST_USERS } from '../services/supabase';
import { storeCurrentUser, initializeTestUserKeys } from '../services/secureStorage';

export default function UserSelectionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Initialize test user keys in secure storage on first load
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

  const handleAuth = async () => {
    setLoading(true);
    try {
      // For Phase 0, randomly select a test user (in real app this would be proper auth)
      const userType = Math.random() > 0.5 ? 'userA' : 'userB';

      // Authenticate with Supabase
      const { user, session } = await authenticateTestUser(userType);

      // Store current user ID in secure storage
      await storeCurrentUser(user.id);

      // Navigate to map with user context
      navigation.navigate('Map', {
        userType,
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
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
      <Text style={styles.title}>Green Box</Text>

      {/* Sign In/Sign Up Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isSignUp && styles.toggleButtonActive]}
          onPress={() => setIsSignUp(false)}
        >
          <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isSignUp && styles.toggleButtonActive]}
          onPress={() => setIsSignUp(true)}
        >
          <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      {/* Main Action Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 30,
    width: '80%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#2e7d32',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#81c784',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  phaseNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});