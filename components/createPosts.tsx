 import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { getCsrfCookie, setupAxios } from '../src/api/api'; // Adjust import path

  interface CreatePostProps {
    groupId: string;
    onPostCreated: () => void;
  }

  const CreatePost: React.FC<CreatePostProps> = ({ groupId, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = async () => {
      try {
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
      <View style={styles.container}>
        <Text style={styles.title}>Create Post</Text>
        {message ? (
          <Text style={[styles.message, errors.length > 0 ? styles.error : styles.success]}>
            {message}
            {errors.length > 0 && (
              <View>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.error}>
                    {error}
                  </Text>
                ))}
              </View>
            )}
          </Text>
        ) : null}
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Share a post with your group..."
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        <Button title="Post" onPress={handleSubmit} />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
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
      marginBottom: 10,
      textAlign: 'center',
    },
    success: {
      color: '#15803d',
    },
    error: {
      color: '#dc2626',
    },
  });

  export default CreatePost;