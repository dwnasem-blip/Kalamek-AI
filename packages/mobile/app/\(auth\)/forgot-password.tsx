import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/authStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email) {
      Alert.alert('خطأ', 'الرجاء إدخال بريدك الإلكتروني');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert('نجاح', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      router.back();
    } catch (error: any) {
      Alert.alert('خطأ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>استعادة كلمة المرور</Text>
      <Text style={styles.subtitle}>ادخل بريدك الإلكتروني لاستعادة كلمتك المرور</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>العودة للتسجيل</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
