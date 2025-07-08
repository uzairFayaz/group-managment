
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getUser } from '../src/api/api';

interface User {
  id: number;
  name: string;
  email: string;
}

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
        setMessage('');
      } catch (error) {
        console.error('Profile Error:', error.response?.data || error.message);
        setMessage(error.response?.data?.message || 'Failed to load profile.');
        if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in to view your profile.');
          router.replace('/login');
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {user ? (
        <View>
          <Text style={styles.info}>Name: {user.name}</Text>
          <Text style={styles.info}>Email: {user.email}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
      <Button
        title="Go to Groups"
        onPress={() => router.push('/groups')}
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
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ProfileScreen;
