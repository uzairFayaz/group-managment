
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getGroupDetails } from '../../src/api/api';

interface Group {
  id: number;
  name: string;
  description: string;
  creator?: { name: string };
}

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupData = await getGroupDetails(groupId as string);
        setGroup(groupData);
        setMessage('');
      } catch (error) {
        console.error('Group Details Error:', error.response?.data || error.message);
        setMessage(error.response?.data?.message || 'Failed to load group details.');
        if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in to view group details.');
          router.replace('/login');
        }
      }
    };
    fetchGroup();
  }, [groupId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Details</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {group ? (
        <View>
          <Text style={styles.info}>Name: {group.name}</Text>
          <Text style={styles.info}>Description: {group.description || 'No description provided.'}</Text>
          <Text style={styles.info}>Created by: {group.creator?.name || 'Unknown'}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default GroupDetailScreen;
