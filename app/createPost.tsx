 import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCsrfCookie, setupAxios } from '../src/api/api'; // Adjust import path

  interface CreatePostProps {
    groupId: string;
    onPostCreated: () => void;
  }

  const CreatePost: React.FC<CreatePostProps> = ({ groupId, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setErrors] = useState<string[]>([]);

    const handleSubmit = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Please log in to create a post.');
          return;
        }

        // Set up Axios with token and CSRF
        await getCsrfCookie();
        await setupAxios(); // Assumes this sets the Authorization header

        console.log('Create Post Payload:', { group_id: groupId, content }); // Debug log
        const response = await axios.post(
          `http://127.0.0.1:8000/api/groups/posts`, // Explicit base URL
          { group_id: groupId, content },
          { headers: { Authorization: `Bearer ${token}` } } // Redundant if setupAxios handles it
        );

        console.log('Create Post Response:', response.data); // Debug log
        setMessage(response.data.message || 'Post created successfully.');
        setContent('');
        setErrors([]);
        onPostCreated();
      } catch (error) {
        console.error('Create Post Error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Failed to create post.';
        setMessage(errorMessage);
        setErrors(error.response?.data?.errors || []);
        if ([401, 403].includes(error.response?.status)) {
          await AsyncStorage.removeItem('token');
          Alert.alert('Error', 'Session expired. Please log in again.');
        } else if (error.message.includes('Network Error')) {
          setMessage('Network error. Check server connection or CORS settings.');
        }
      }
    };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Post</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Write your post..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            {message && <Text style={styles.message}>{message}</Text>}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Posting...' : 'Post'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  headerRight: {
    width: 24,
  },
  card: {
    padding: 15,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    minHeight: 150,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a3bffa',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default CreatePost;