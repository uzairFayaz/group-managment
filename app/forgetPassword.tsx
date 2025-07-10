import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { requestForgetPassword } from '../src/api/api';

const ForgetPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleForgetPassword = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email.');
      setErrors(['Email is required.']);
      return;
    }

    try {
      setLoading(true);
      await requestForgetPassword(email);
      setMessage('Password reset link sent to your email.');
      setErrors([]);
      setTimeout(() => router.push('/verify-forget-password'), 2000);
    } catch (err: any) {
      console.error('Forget Password Error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset link.';
      setMessage(errorMessage);
      setErrors(err.response?.data?.errors || []);
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
          <Text style={styles.sectionTitle}>Forget Password</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, { pointerEvents: 'auto' }]}
            onPress={handleForgetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  success: {
    color: '#15803d',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
  },
});

export default ForgetPasswordScreen;