import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { register } from '../src/api/api'; // Make sure this file is updated (see below)

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await register(
        name,
        email.trim(),
        password.trim(),
        passwordConfirmation.trim(),
        phone.trim()
      );
      setMessage(response.message || 'Registration successful! Check your email for OTP.');
      Alert.alert('Success', 'Please check your email for OTP verification.');
      router.replace('/otpVerfication');
    } catch (error) {
      console.error('Register Error:', error.response?.data || error.message);
      const data = error.response?.data;
      setMessage(data?.message || 'Failed to register.');

      if (error.response?.status === 422) {
        const allErrors = Object.values(data.errors || {}).flat().join('\n');
        Alert.alert('Validation Error', allErrors || 'Invalid input.');
      } else {
        Alert.alert('Error', 'Server error. Please try again later.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>Cookie</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Register</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone (optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm your password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 20 },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#4361ee' },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 30, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeIcon: { position: 'absolute', right: 15, padding: 10 },
  registerButton: {
    backgroundColor: '#7209b7',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: '#666', fontSize: 16 },
  message: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default RegisterScreen;
