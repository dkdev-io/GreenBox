import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UserSelectionScreen from '../screens/UserSelectionScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UserSelection">
        <Stack.Screen
          name="UserSelection"
          component={UserSelectionScreen}
          options={{ title: 'Select User' }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'Green Box' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}