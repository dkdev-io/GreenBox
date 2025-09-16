import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthLandingScreen from '../screens/AuthLandingScreen';
import AuthLoginScreen from '../screens/AuthLoginScreen';
import UserSelectionScreen from '../screens/UserSelectionScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Green Box',
            headerShown: true,
            headerLeft: null, // Prevent back navigation from map
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}