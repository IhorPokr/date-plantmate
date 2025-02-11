import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../constants/supabaseClient';
import { View, Text } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import { configureNotifications } from './utils/notificationConfig';
import { requestRequiredPermissions } from './utils/permissionsManager';

export default function RootLayout() {
  // Initialize Supabase auth state
  useEffect(() => {
    try {
      supabase.auth.getSession();
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }, []);

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    requestRequiredPermissions();
  }, []);

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

// Add error boundary
RootLayout.ErrorBoundary = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Something went wrong!</Text>
  </View>
);
