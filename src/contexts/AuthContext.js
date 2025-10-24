import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { initializeUserKeys } from '../services/encryptionService';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Get initial session and check onboarding status
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Check if user has completed onboarding
        const onboardingKey = `onboarding_completed_${session.user.id}`;
        const completed = await AsyncStorage.getItem(onboardingKey);
        setHasCompletedOnboarding(!!completed);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Initialize user keys on first sign-in
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const result = await initializeUserKeys(session.user);
          if (result?.isNewDevice) {
            setIsNewDevice(true);
          }

          // Check onboarding status for new sign-in
          const onboardingKey = `onboarding_completed_${session.user.id}`;
          const completed = await AsyncStorage.getItem(onboardingKey);
          setHasCompletedOnboarding(!!completed);
        } catch (error) {
          console.error('Error initializing user keys:', error);
        }
      }

      if (event === 'SIGNED_OUT') {
        setHasCompletedOnboarding(false);
        setIsNewDevice(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setIsNewDevice(false);
    setLoading(false);
  };

  const dismissNewDeviceNotification = () => {
    setIsNewDevice(false);
  };

  const completeOnboarding = async () => {
    if (user) {
      const onboardingKey = `onboarding_completed_${user.id}`;
      await AsyncStorage.setItem(onboardingKey, 'true');
      setHasCompletedOnboarding(true);
    }
  };

  const checkLocationPermissions = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    isNewDevice,
    dismissNewDeviceNotification,
    hasCompletedOnboarding,
    completeOnboarding,
    checkLocationPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};