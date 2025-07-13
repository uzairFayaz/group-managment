import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CreatePost from '../../components/createPosts';
import CreateStories from '../../components/createStories';
import {
  getGroupDetails,
  getGroupMembers,
  getGroupPosts,
  getGroupStories,
  toggleGroupSharing,
} from '../../src/api/api';

interface Group {
  id: number;
  name: string;
  description: string;
  creator: { id: number; name: string } | null;
  is_shared: boolean;
  share_code: string | null;
  created_by: number;
}

interface Member {
  user_id: number;
  user_name: string;
  user_email: string;
}

interface Story {
  id: number;
  content: string;
  user: { name: string } | null;
  expires_at: string;
}

interface Post {
  id: number;
  content: string;
  user: { name: string } | null;
  created_at: string;
}

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [copySuccess, setCopySuccess] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Stories' | 'Posts' | 'Members'>('Stories');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGroupData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }

      setLoading(true);
      const [groupData, membersData, storiesData, postsData] = await Promise.all([
        getGroupDetails(groupId as string),
        getGroupMembers(groupId as string),
        getGroupStories(groupId as string),
        getGroupPosts(groupId as string),
      ]);
      
      console.log('Group Response:', groupData);
      console.log('Members Response:', membersData);
      console.log('Stories Response:', storiesData);
      console.log('Posts Response:', postsData);
      
      // Debug state updates
      setGroup(groupData);
      setMembers(Array.isArray(membersData) ? membersData : membersData?.data || []);
      setStories(storiesData.data?.stories || []);
      console.log('Stories State:', storiesData || []);
      setPosts(postsData.data?.posts || []);
      console.log('Posts State:', postsData || []);
      setMessage('');
      setErrors([]);
    } catch (err: any) {
      console.error('Fetch Group Data Error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to load group data.';
      setMessage(errorMessage);
      setErrors(err.response?.data?.errors || []);
      if ([401, 403].includes(err.response?.status)) {
        await AsyncStorage.removeItem('token');
        Alert.alert('Error', 'Session expired. Please log in.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSharing = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }
      const response = await toggleGroupSharing(groupId as string);
      setGroup((prev) => (prev ? { ...prev, is_shared: response.data.is_shared } : null));
      setMessage(response.message || 'Sharing updated.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Toggle Sharing Error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to toggle sharing.';
      setMessage(errorMessage);
      setErrors(err.response?.data?.errors || []);
      Alert.alert('Error', errorMessage);
    }
  };

  const copyShareCode = async () => {
    if (group?.share_code) {
      try {
        await Clipboard.setStringAsync(group.share_code);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      } catch {
        setCopySuccess('Failed to copy.');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    }
  };

  const navigateToQr = () => {
    router.push({pathname:'/qr',params:{groupId: groupId}});
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const filteredMembers = members.filter((member) =>
    member.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const navigateToCreateGroup = () =>{
    return router.push('/createPost');
  }


  const renderStories = () => {
    console.log('Rendering Stories:', stories.length);
    return (
      <View style={styles.tabContent}>
        <CreateStories groupId={groupId as string} onStoryCreated={fetchGroupData} members={members} />
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Image style={styles.avatar} source={{ uri: `https://i.pravatar.cc/100?u=${item.user?.name || 'user'}` }} />
                <View style={styles.storyInfo}>
                  <Text style={styles.storyName}>{item.user?.name || 'Unknown'}</Text>
                  <Text style={styles.storyTime}>2 hours ago</Text>
                </View>
              </View>
              <Text style={styles.storyContent}>{item.content || 'No content'}</Text>
              <View style={styles.storyReactions}>
                <View style={styles.reactionItem}>
                  <Ionicons name="fast-food" size={20} color="#666" />
                  <Text style={styles.reactionCount}>24</Text>
                </View>
                <View style={styles.reactionItem}>
                  <Ionicons name="heart" size={20} color="#e74c3c" />
                  <Text style={styles.reactionCount}>8</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No stories available yet</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderPosts = () => {
    console.log('Rendering Posts:', posts.length);
    return (
      <View style={styles.tabContent}>
        <CreatePost groupId={groupId as string} onPostCreated={fetchGroupData} />
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image style={styles.avatar} source={{ uri: `https://i.pravatar.cc/100?u=${item.user?.name || 'user'}` }} />
                <View style={styles.postInfo}>
                  <Text style={styles.postName}>{item.user?.name || 'Unknown'}</Text>
                  <Text style={styles.postTime}>{item.created_at}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{item.content || 'No content'}</Text>
              <View style={styles.postReactions}>
                <View style={styles.reactionItem}>
                  <Ionicons name="fast-food" size={20} color="#666" />
                  <Text style={styles.reactionCount}>25</Text>
                </View>
                <View style={styles.reactionItem}>
                  <Ionicons name="heart" size={20} color="#e74c3c" />
                  <Text style={styles.reactionCount}>8</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No posts available yet</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderMembers = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <Image style={styles.avatar} source={{ uri: `https://i.pravatar.cc/100?u=${item.user_email}` }} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.user_name || item.user_email}</Text>
              <Text style={styles.memberEmail}>{item.user_email}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No members found</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.inviteButton}>
        <Ionicons name="person-add" size={20} color="#4a90e2" />
        <Text style={styles.inviteText}>Invite Members</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.messageContainer}>
          <Text>{message || 'Group not found.'}</Text>
          {errors.length > 0 &&
            errors.map((err, idx) => (
              <Text key={idx} style={styles.error}>{err || 'Unknown error'}</Text>
            ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.groupInfoCard}>
            <Text style={styles.groupTitle}>{group.name}</Text>
            <Text style={styles.groupDescription}>{group.description || 'No description.'}</Text>
            <Text style={styles.memberCount}>{members.length} members</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sharingSection}>
            <Text style={styles.sectionTitle}>Enable Sharing</Text>
            
            <View style={styles.shareCodeRow}>
              <Text style={styles.shareCodeLabel}>Share Code</Text>
              <Text style={styles.shareCode}>{group.share_code || 'Not available'}</Text>
            </View>
            
            <TouchableOpacity onPress={copyShareCode} style={styles.copyButton}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            
            {copySuccess ? (
              <Text style={styles.copySuccess}>{copySuccess}</Text>
            ) : null}
            
            <TouchableOpacity style={styles.qrButton} onPress={navigateToQr}>
              <Text style={styles.qrButtonText}>Show QR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Stories' && styles.activeTab]}
              onPress={() => setActiveTab('Stories')}
            >
              <Text style={[styles.tabText, activeTab === 'Stories' && styles.activeTabText]}>Stories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Posts' && styles.activeTab]}
              onPress={() => setActiveTab('Posts')}
            >
              <Text style={[styles.tabText, activeTab === 'Posts' && styles.activeTabText]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Members' && styles.activeTab]}
              onPress={() => setActiveTab('Members')}
            >
              <Text style={[styles.tabText, activeTab === 'Members' && styles.activeTabText]}>Members</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Stories' && renderStories()}
          {activeTab === 'Posts' && renderPosts()}
          {activeTab === 'Members' && renderMembers()}
        </View>
      </ScrollView>
     { activeTab === "Posts" && <TouchableOpacity style={[styles.fab, { pointerEvents: 'auto' }]} onPress={navigateToCreateGroup}>
                <Ionicons name="add" size={30} color="white" />
              </TouchableOpacity>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 24,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  groupInfoCard: {
    padding: 16,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  groupDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  memberCount: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  sharingSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  shareCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareCodeLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  shareCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  copyButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
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
  qrButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4a90e2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  storyCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storyInfo: {
    flex: 1,
  },
  storyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  storyTime: {
    fontSize: 14,
    color: '#888',
  },
  storyContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  storyReactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  reactionCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postInfo: {
    flex: 1,
  },
  postName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postTime: {
    fontSize: 14,
    color: '#888',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  postReactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberInfo: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#888',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    marginTop: 16,
  },
  inviteText: {
    marginLeft: 8,
    color: '#4a90e2',
    fontWeight: '500',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  messageContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: '#2ecc71',
  },
  error: {
    color: '#e74c3c',
  },
  copySuccess: {
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default GroupDetailScreen;