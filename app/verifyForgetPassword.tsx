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
import { verifyForgetPassword } from '../src/api/api';

const VerifyForgetPasswordScreen = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setMessage('Please enter the verification code.');
      setErrors(['Verification code is required.']);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Missing token');
      }
      await verifyForgetPassword(verificationCode);
      setMessage('Verification successful!');
      setErrors([]);
      setTimeout(() => router.push('/otpVerfication'), 2000);
    } catch (err: any) {
      console.error('Verify Forget Password Error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid verification code.';
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
          <Text style={styles.sectionTitle}>Verify Forget Password</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter verification code"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.button, { pointerEvents: 'auto' }]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
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
    width: '100%',
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

export default VerifyForgetPasswordScreen;