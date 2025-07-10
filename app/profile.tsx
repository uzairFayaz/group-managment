import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { deleteGroup as apiDeleteGroup, getGroups, getUser } from '../src/api/api';

interface Group {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  created_by: number;
  share_code?: string;
  memberCount?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  username?: string;
}

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchGroups();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Missing token');
      }
      const userData = await getUser();
      if (!userData.username) {
        userData.username = `@${userData.name.toLowerCase().replace(/\s/g, '.')}`;
      }
      setUser(userData);
    } catch (err) {
      console.error('Fetch User Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      Alert.alert('Unauthorized', 'Please log in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Missing token');
      }
      const groupsData = await getGroups();
      const groupsWithCounts = (Array.isArray(groupsData) ? groupsData : []).map((group: Group) => ({
        ...group,
        memberCount: Math.floor(Math.random() * 50) + 1,
      }));
      setGroups(groupsWithCounts);
      setMessage('');
    } catch (err) {
      console.error('Fetch Groups Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.message || 'Failed to load groups';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              throw new Error('Missing token');
            }
            await apiDeleteGroup(id);
            setMessage('Deleted group');
            fetchGroups();
          } catch (err) {
            console.error('Delete Group Error:', {
              message: err.message,
              status: err.response?.status,
              data: err.response?.data,
            });
            const errorMessage = err.response?.data?.message || 'Failed to delete group';
            setMessage(errorMessage);
          }
        },
      },
    ]);
  };

  const navigateToGroup = (groupId: number) => {
    router.push(`/groups/${groupId}`);
  };

  const navigateToCreateGroup = () => {
    router.push('/create');
  };

  const navigateToJoinGroup = () => {
    router.push('/join');
  };

  if (!user || loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4361ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            style={styles.profileImage}
            source={{ uri: `https://i.pravatar.cc/150?u=${user.email}` }}
          />
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileUsername}>{user.username}</Text>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Groups</Text>
            <TouchableOpacity style={{ pointerEvents: 'auto' }} onPress={navigateToJoinGroup}>
              <Text style={styles.joinButton}>Join Group</Text>
            </TouchableOpacity>
          </View>

          {groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>You haven't joined any groups yet</Text>
              <TouchableOpacity
                style={[styles.createGroupButton, { pointerEvents: 'auto' }]}
                onPress={navigateToCreateGroup}
              >
                <Text style={styles.createGroupText}>Create Your First Group</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={item => String(item.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.groupCard, { pointerEvents: 'auto' }]}
                  onPress={() => navigateToGroup(item.id)}
                >
                  <View style={styles.groupIcon}>
                    <Ionicons name="people" size={24} color="#4361ee" />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{item.name}</Text>
                    <Text style={styles.groupMembers}>{item.memberCount} members</Text>
                  </View>
                  {item.created_by === user.id && (
                    <TouchableOpacity
                      style={{ pointerEvents: 'auto' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteGroup(item.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={24} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button for Create Group */}
      <TouchableOpacity style={[styles.fab, { pointerEvents: 'auto' }]} onPress={navigateToCreateGroup}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {message && <Text style={styles.message}>{message}</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  joinButton: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '500',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  createGroupButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  createGroupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#4361ee',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  message: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ProfileScreen;