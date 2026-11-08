import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { AuthProvider } from './providers/AuthProvider';
import { I18nProvider } from './providers/I18nProvider';
import { ThemeProvider } from './providers/ThemeProvider';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Cairo': require('./assets/fonts/Cairo-Regular.ttf'),
    'Cairo-Bold': require('./assets/fonts/Cairo-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {/* Auth Stack */}
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
        }}
      />

      {/* Main App Stack */}
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />

      {/* Modals */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
