
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createGroup, getGroups, joinGroup } from '../src/api/api';

interface Group {
  id: number;
  name: string;
  description: string;
  creator?: { name: string };
}

const GroupsScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [refreshGroups, setRefreshGroups] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getGroups();
        console.log('Fetch Groups Response:', groupsData); // Debug log
        setGroups(groupsData);
        setMessage('');
      } catch (error) {
        console.error('Fetch Groups Error:', error.response?.data || error.message);
        setMessage(error.response?.data?.message || 'Failed to load groups.');
        if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in to view groups.');
          router.replace('/login');
        }
      }
    };
    fetchGroups();
  }, [refreshGroups]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGroup = async () => {
    try {
      const response = await createGroup(formData.name, formData.description);
      setMessage(response.message || 'Group created!');
      setFormData({ name: '', description: '' });
      setRefreshGroups(prev => prev + 1);
    } catch (error) {
      console.error('Create Group Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Failed to create group.');
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Please log in to create a group.');
        router.replace('/login');
      }
    }
  };

  const handleQrCode = async (data: string) => {
    setShowQrScanner(false);
    let shareCode: string;
    try {
      const url = new URL(data);
      shareCode = url.searchParams.get('code') || '';
      if (!shareCode || shareCode.length < 8) {
        throw new Error('Invalid share code format');
      }
    } catch {
      shareCode = data;
      if (!shareCode || shareCode.length < 8) {
        setMessage('Invalid QR code format.');
        return;
      }
    }

    try {
      console.log('Share Code Sent:', shareCode); // Debug log
      const response = await joinGroup(shareCode);
      setMessage(response.message || 'Joined group!');
      const groupId = response.data?.group_id;
      if (groupId) {
        setRefreshGroups(prev => prev + 1);
        router.push(`/groups/${groupId}`);
      } else {
        setMessage('Joined group, but group ID not found.');
      }
    } catch (error) {
      console.error('Join Group Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Failed to join group.');
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Please log in to join a group.');
        router.replace('/login');
      }
    }
  };

  const handleQrScanner = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Error', 'Camera permission is required to scan QR codes.');
        return;
      }
    }
    if (permission?.status === 'granted') {
      setShowQrScanner(true);
    } else {
      Alert.alert('Error', 'Camera permission denied.');
    }
  };

  return (
    <View style={styles.container}>
      {showQrScanner ? (
        <CameraView
          style={styles.camera}
          facing={CameraType.back}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={({ data }) => handleQrCode(data)}
        >
          <View style={styles.cameraOverlay}>
            <Text style={styles.scannerTitle}>Scan Group QR Code</Text>
            <Button
              title="Cancel"
              onPress={() => setShowQrScanner(false)}
            />
          </View>
        </CameraView>
      ) : (
        <>
          <Text style={styles.title}>Your Groups</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button
            title="Join Group via QR Code"
            onPress={handleQrScanner}
          />
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={formData.name}
              onChangeText={text => handleChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Group Description"
              value={formData.description}
              onChangeText={text => handleChange('description', text)}
            />
            <Button title="Create Group" onPress={handleCreateGroup} />
          </View>
          <FlatList
            data={groups}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => router.push(`/groups/${item.id}`)}
              >
                <Text style={styles.groupName}>{item.name}</Text>
                <Text>{item.description || 'No description provided.'}</Text>
                <Text style={styles.groupCreator}>Created by: {item.creator?.name || 'Unknown'}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No groups found.</Text>}
          />
          <Button
            title="View Profile"
            onPress={() => router.push('/profile')}
          />
        </>
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
  scannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
    color: '#fff',
  },
  form: {
    marginVertical: 20,
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
  groupItem: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  groupCreator: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
});

export default GroupsScreen;
