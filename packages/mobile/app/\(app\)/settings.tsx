import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@store/authStore';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { signOut } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ عند تسجيل الخروج');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
