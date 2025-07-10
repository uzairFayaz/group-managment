import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { createGroup } from '../src/api/api';

interface CreateGroupForm {
  name: string;
  description: string;
}

const CreateGroupScreen = () => {
  const [form, setForm] = useState<CreateGroupForm>({ name: '', description: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof CreateGroupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setMessage('');
    setErrors([]);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setMessage('Group name is required.');
      setErrors(['Group name cannot be empty.']);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Missing token');
      }
      const response = await createGroup(form.name, form.description);
      console.log('Create Group Response:', response);
      setMessage('Group created successfully.');
      setForm({ name: '', description: '' });
      setErrors([]);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Create Group Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      let errorMessage = 'Failed to create group. Please try again.';
      if (typeof err.response?.data === 'string' && err.response?.data.includes('<!DOCTYPE html>')) {
        errorMessage = 'Server returned HTML instead of JSON. Verify the backend API is running at http://192.168.x.x:8000/api/groups.';
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Session expired. Please log in again.';
        await AsyncStorage.removeItem('token');
        Alert.alert('Error', errorMessage, [{ text: 'OK', onPress: () => router.replace('/login') }]);
      } else if (err.response?.status === 422) {
        errorMessage = err.response?.data?.message || 'Invalid input.';
        setErrors(err.response?.data?.errors || []);
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error: Unable to connect to server. Check server status or network.';
      }
      setMessage(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <View style={styles.header}>
            <TouchableOpacity style={{ pointerEvents: 'auto' }} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#4361ee" />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Create New Group</Text>
          </View>

          {message && (
            <View style={styles.messageContainer}>
              <Text style={[styles.message, errors.length > 0 ? styles.error : styles.success]}>
                {message}
              </Text>
              {errors.map((error, index) => (
                <Text key={index} style={styles.error}>{error}</Text>
              ))}
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={text => handleInputChange('name', text)}
              placeholder="Enter group name"
              placeholderTextColor="#666"
              maxLength={100}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={text => handleInputChange('description', text)}
              placeholder="Enter group description"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton, { pointerEvents: loading ? 'none' : 'auto' }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>
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
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a3bffa',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: '#15803d',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CreateGroupScreen;