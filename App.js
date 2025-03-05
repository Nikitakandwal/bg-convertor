import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? ( 
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Black & White Converter' }}
          />
        ) : ( 
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ title: 'Login/Register' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}