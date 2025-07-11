import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { joinGroup } from '../src/api/api';

const JoinGroupScreen = () => {
  const [shareCode, setShareCode] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleJoinGroup = async () => {
    if (!shareCode.trim()) {
      setMessage('Please enter a share code.');
      setErrors(['Share code is required.']);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Missing token');
      }
      await joinGroup(shareCode);
      setMessage('Successfully joined the group!');
      setErrors([]);
      setTimeout(() => router.replace(`/profile`), 2000); // Redirect to home or group list
    } catch (err: any) {
      console.error('Join Group Error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join group.';
      setMessage(errorMessage);
      setErrors(err.response?.data?.errors || []);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    setShareCode(data);
    handleJoinGroup();
  };

  const toggleScan = () => {
    if (hasPermission === null) {
      Alert.alert('Permission', 'Requesting camera permission...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
      return;
    }
    setScanning(true);
  };

  if (scanning) {
    return (
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.scanOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.scanText}>Scan the QR code to join</Text>
        </View>
      </BarCodeScanner>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={{ pointerEvents: 'auto' }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4361ee" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Join Group</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Enter Share Code</Text>
          <TextInput
            style={styles.input}
            value={shareCode}
            onChangeText={setShareCode}
            placeholder="Enter share code"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, { pointerEvents: 'auto' }]}
            onPress={handleJoinGroup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Join Group</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.scanButton, { pointerEvents: 'auto' }]}
            onPress={toggleScan}
          >
            <Ionicons name="qr-code" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Scan QR Code</Text>
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
  scanButton: {
    backgroundColor: '#4361ee',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
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
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default JoinGroupScreen;