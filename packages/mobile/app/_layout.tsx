import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@store/authStore';
import { ActivityIndicator, View, Text } from 'react-native';

export default function RootLayout() {
  const { isSignedIn, isLoading, restoreSession } = useAuthStore();
  const [isRestored, setIsRestored] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await restoreSession();
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Still mark as restored to show the app
        // User will see login screen instead
      } finally {
        setIsRestored(true);
      }
    };

    initializeApp();
  }, []);

  // Loading state
  if (isLoading || !isRestored) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Error state (if needed)
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#d32f2f', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
