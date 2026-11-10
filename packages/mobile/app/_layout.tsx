import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';

export default function RootLayout() {
  const { isSignedIn, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
