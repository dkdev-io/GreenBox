import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri, startAsync } from 'expo-auth-session';
import { supabase } from '../services/supabase';

export default function AuthLoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send the credential to Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        throw error;
      }

      // Navigate to app on success
      navigation.replace('Map');

    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const redirectUri = makeRedirectUri({
        scheme: 'com.greenbox.app',
        path: 'auth',
      });

      const result = await startAsync({
        authUrl: `${supabase.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUri}`,
        returnUrl: redirectUri,
      });

      if (result.type === 'success') {
        // Handle the success response
        const { url } = result;
        // Extract tokens from URL and complete auth
        // This would need proper URL parsing in production
        navigation.replace('Map');
      }

    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // For Phase 1 development, also provide the legacy user selection
  const handleLegacyAuth = () => {
    navigation.replace('UserSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Green Box</Text>
          <Text style={styles.subtitle}>
            Sign in to start sharing your location securely
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={styles.authButtons}>
          {/* Apple Sign In */}
          <TouchableOpacity
            style={[styles.authButton, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>Continue with Apple</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#333" />
            ) : (
              <Text style={[styles.authButtonText, styles.googleButtonText]}>Continue with Google</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Development Mode */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devButton}
            onPress={handleLegacyAuth}
          >
            <Text style={styles.devButtonText}>Development Mode</Text>
          </TouchableOpacity>
        )}
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  authButtons: {
    gap: 16,
    marginBottom: 40,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  googleButtonText: {
    color: '#333',
  },
  devButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 20,
  },
  devButtonText: {
    fontSize: 14,
    color: '#666',
  },
});