
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { resetPassword, handleApiError } from '../src/api/api';

const PasswordResetScreen = () => {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setMessage('Email not provided. Please try again.');
      setErrors(['Email is missing.']);
    }
  }, [email]);

  const handleResetPassword = async () => {
    if (!email || !password.trim() || !confirmPassword.trim()) {
      setMessage('Please fill all fields.');
      setErrors(['Email, password, and confirmation are required.']);
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setErrors(['Passwords must match.']);
      return;
    }

    try {
      setLoading(true);
      console.log('Sending reset:', { email, password }); // Debug log
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Missing token');
      }
      await resetPassword({ email, password });
      setMessage('Password reset successful!');
      setErrors([]);
      setTimeout(() => router.replace('/login'), 2000); // Redirect to login
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      const { message: errorMessage, errors: errorDetails } = handleApiError(err);
      setMessage(errorMessage);
      setErrors(errorDetails);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={{ pointerEvents: 'auto' }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4361ee" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Reset Password</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email || ''}
            onChangeText={(text) => {/* Optional: Allow manual override */}}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false} // Disable editing if passed via params
          />
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { pointerEvents: 'auto' }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          {message && (
            <Text style={[styles.message, errors.length > 0 ? styles.error : styles.success]}>
              {message}
            </Text>
          )}
          {errors.length > 0 &&
            errors.map((err, idx) => (
              <Text key={idx} style={styles.error}>{err}</Text>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%', maxWidth: 400, alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 10, alignSelf: 'flex-start' },
  input: { width: '100%', height: 50, borderColor: '#eee', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#4361ee', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  message: { fontSize: 16, textAlign: 'center', marginTop: 10 },
  success: { color: '#15803d' },
  error: { color: '#dc2626', fontSize: 14 },
});

export default PasswordResetScreen;