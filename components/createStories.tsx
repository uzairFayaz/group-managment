import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import MultiSelect from 'react-native-multiple-select';

interface Member {
  user_id: number;
  user_name: string;
  user_email: string;
}

interface CreateStoriesProps {
  groupId: string;
  onStoryCreated: () => void;
  members: Member[];
}

const CreateStories: React.FC<CreateStoriesProps> = ({ groupId, onStoryCreated, members }) => {
  const [content, setContent] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const memberOptions = members.map(member => ({
    value: member.user_id,
    label: member.user_name || member.user_email,
  }));

  const handleSubmit = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found. Please log in.');

    const API_BASE = 'http://127.0.0.1:8000'; // or use your local IP for real device testing

    const response = await axios.post(
      `${API_BASE}/api/stories`,
      {
        group_id: groupId,
        content,
        shared_with: selectedMemberIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage(response.data.message || 'Story created successfully.');
    console.log(response.data)
    setContent('');
    setSelectedMemberIds([]);
    setErrors([]);
    onStoryCreated();
  } catch (error) {
    console.error('Create Story Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'Failed to create story.';
    setMessage(errorMessage);
    setErrors(error.response?.data?.errors || []);

    if ([401, 403].includes(error.response?.status)) {
      await AsyncStorage.removeItem('token');
      Alert.alert('Error', 'Session expired. Please log in again.');
    }
  }
};


  return (
    <View style={styles.container}>
      {message !== '' && (
        <View>
          <Text style={[styles.message, errors.length > 0 ? styles.error : styles.success]}>
            {message}
          </Text>
          {errors.length > 0 &&
            errors.map((error, index) => (
              <Text key={index} style={styles.error}>
                {error}
              </Text>
            ))}
        </View>
      )}

      <Text style={styles.label}>Story Content</Text>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="Write your story..."
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <Text style={styles.label}>Share With</Text>
      <MultiSelect
        items={memberOptions}
        uniqueKey="value"
        onSelectedItemsChange={setSelectedMemberIds}
        selectedItems={selectedMemberIds}
        selectText="Select members..."
        searchInputPlaceholderText="Search Members..."
        tagRemoveIconColor="#ccc"
        tagBorderColor="#ccc"
        tagTextColor="#000"
        selectedItemTextColor="#000"
        selectedItemIconColor="#000"
        itemTextColor="#000"
        displayKey="label"
        searchInputStyle={{ color: '#000' }}
        submitButtonColor="#22c55e"
        submitButtonText="Done"
        styleMainWrapper={{ marginBottom: 10 }}
      />

      <Button title="Create Story" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#374151',
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

export default CreateStories;
