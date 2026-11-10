import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@store/authStore';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { isSignedIn, isLoading, restoreSession } = useAuthStore();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setIsRestored(true));
  }, []);

  if (isLoading || !isRestored) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
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
