import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { login } from '../src/api/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await login(email.trim(), password.trim());
      setMessage(response.message || 'Login successful!');
      router.replace('/groups');
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Failed to log in.');
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      } else if (error.response?.status === 422) {
        Alert.alert('Error', error.response?.data?.errors?.join(', ') || 'Invalid input.');
      } else {
        Alert.alert('Error', 'Server error. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Log In" onPress={handleLogin} />
      <Button
        title="Register"
        onPress={() => router.push('/register')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;