import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@store/authStore';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AppLayout() {
  const { isSignedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/(auth)/login');
    }
  }, [isSignedIn]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
          headerTitle: 'WRITEGO',
        }}
      />

      <Tabs.Screen
        name="writer"
        options={{
          title: 'كاتب النصوص',
          tabBarLabel: 'الكاتب',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="pencil" size={24} color={color} />
          ),
          headerTitle: 'كاتب النصوص',
        }}
      />

      <Tabs.Screen
        name="summarizer"
        options={{
          title: 'ملخص النصوص',
          tabBarLabel: 'التلخيص',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="text-box-outline" size={24} color={color} />
          ),
          headerTitle: 'ملخص النصوص',
        }}
      />

      <Tabs.Screen
        name="rewriter"
        options={{
          title: 'أعادة الصياغة',
          tabBarLabel: 'إعادة الصياغة',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="pencil-box" size={24} color={color} />
          ),
          headerTitle: 'إعادة الصياغة',
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarLabel: 'الإعدادات',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
          headerTitle: 'الإعدادات',
        }}
      />
    </Tabs>
  );
}
