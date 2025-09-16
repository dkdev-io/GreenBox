import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthLandingScreen from '../screens/AuthLandingScreen';
import AuthLoginScreen from '../screens/AuthLoginScreen';
import UserSelectionScreen from '../screens/UserSelectionScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="AuthLanding"
      screenOptions={{
        headerShown: false, // Clean look for auth flow
      }}
    >
      <Stack.Screen
        name="AuthLanding"
        component={AuthLandingScreen}
      />
      <Stack.Screen
        name="AuthLogin"
        component={AuthLoginScreen}
      />
      <Stack.Screen
        name="UserSelection"
        component={UserSelectionScreen}
        options={{
          title: 'Select User',
          headerShown: true, // Show header for dev mode
        }}
      />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Green Box',
          headerLeft: null, // Prevent back navigation from map
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});