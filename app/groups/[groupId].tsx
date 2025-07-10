import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  View
} from "react-native";
import CreatePost from "../../components/createPosts";
import CreateStories from "../../components/createStories";
import {
  getGroupDetails,
  getGroupMembers,
  getGroupPosts,
  getGroupStories,
  toggleGroupSharing,
} from "../../src/api/api";

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
  const [copySuccess, setCopySuccess] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Stories" | "Posts" | "Members">(
    "Stories"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroupData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please log in.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
        return;
      }

      setLoading(true);
      const [groupData, membersData, storiesData, postsData] =
        await Promise.all([
          getGroupDetails(groupId as string),
          getGroupMembers(groupId as string),
          getGroupStories(groupId as string),
          getGroupPosts(groupId as string),
        ]);
      setGroup(groupData);
      setMembers(
        Array.isArray(membersData) ? membersData : membersData?.data || []
      );
      setStories(storiesData || []);
      setPosts(postsData || []);
      setMessage("");
      setErrors([]);
    } catch (err: any) {
      console.error("Fetch Group Data Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load group data.";
      setMessage(errorMessage);
      setErrors(err.response?.data?.errors || []);
      if ([401, 403].includes(err.response?.status)) {
        await AsyncStorage.removeItem("token");
        Alert.alert("Error", "Session expired. Please log in.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSharing = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please log in.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
        return;
      }
      const response = await toggleGroupSharing(groupId as string);
      setGroup((prev) =>
        prev ? { ...prev, is_shared: response.data.is_shared } : null
      );
      setMessage(response.message || "Sharing updated.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error("Toggle Sharing Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to toggle sharing.";
      setMessage(errorMessage);
      setErrors(err.response?.data?.errors || []);
      Alert.alert("Error", errorMessage);
    }
  };

  const copyShareCode = async () => {
    if (group?.share_code) {
      try {
        await Clipboard.setStringAsync(group.share_code);
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      } catch {
        setCopySuccess("Failed to copy.");
        setTimeout(() => setCopySuccess(""), 2000);
      }
    }
  };

  const navigateToQr = () => {
    router.push('/qr');
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStories = () => (
    <View style={styles.tabContent}>
      <CreateStories
        groupId={groupId as string}
        onStoryCreated={fetchGroupData}
        members={members}
      />
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.storyItem}>
            <Image
              style={styles.storyAvatar}
              source={{ uri: `https://i.pravatar.cc/100?u=${item.user?.name || 'user'}` }}
            />
            <View style={styles.storyContent}>
              <Text style={styles.storyText}>{item.content}</Text>
              <Text style={styles.storyMeta}>
                By: {item.user?.name || "Unknown"} • 
                Expires: {new Date(item.expires_at).toLocaleDateString()}
              </Text>
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

  const renderPosts = () => (
    <View style={styles.tabContent}>
      <CreatePost groupId={groupId as string} onPostCreated={fetchGroupData} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image
                style={styles.postAvatar}
                source={{ uri: `https://i.pravatar.cc/100?u=${item.user?.name || 'user'}` }}
              />
              <View>
                <Text style={styles.postUser}>{item.user?.name || "Unknown"}</Text>
                <Text style={styles.postTime}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={styles.postContent}>{item.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="heart-outline" size={20} color="#666" />
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="chatbubble-outline" size={20} color="#666" />
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Ionicons name="share-social-outline" size={20} color="#666" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
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
            <Image
              style={styles.memberAvatar}
              source={{ uri: `https://i.pravatar.cc/100?u=${item.user_email}` }}
            />
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
        <Ionicons name="person-add" size={20} color="#4361ee" />
        <Text style={styles.inviteText}>Invite Members</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4361ee" />
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.messageContainer}>
          <Text>{message || "Group not found."}</Text>
          {errors.length > 0 &&
            errors.map((err, idx) => (
              <Text key={idx} style={styles.error}>
                {err}
              </Text>
            ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.groupName}>{group.name}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {message && (
          <View style={styles.messageContainer}>
            <Text
              style={[
                styles.message,
                errors.length > 0 ? styles.error : styles.success,
              ]}
            >
              {message}
            </Text>
            {errors.length > 0 &&
              errors.map((err, idx) => (
                <Text key={idx} style={styles.error}>
                  {err}
                </Text>
              ))}
          </View>
        )}

        {/* Group Info */}
        <View style={styles.groupInfo}>
          <Text style={styles.memberCount}>{members.length} members</Text>
          <Text style={styles.description}>{group.description || "No description."}</Text>
          
          <View style={styles.sharingToggle}>
            <Text style={styles.toggleLabel}>Enable Sharing</Text>
            <TouchableOpacity 
              style={[styles.toggle, group.is_shared ? styles.toggleOn : styles.toggleOff]}
              onPress={handleToggleSharing}
            >
              <View style={[styles.toggleCircle, group.is_shared ? styles.toggleCircleOn : null]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Share Code Section */}
        {group.is_shared && group.share_code && (
          <View style={styles.shareSection}>
            <View style={styles.shareCodeContainer}>
              <Text style={styles.shareCodeLabel}>Share Code:</Text>
              <Text style={styles.shareCode}>{group.share_code}</Text>
              <TouchableOpacity onPress={copyShareCode} style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
              {copySuccess && <Text style={styles.copySuccess}>{copySuccess}</Text>}
              <TouchableOpacity
                style={[styles.qrButton, { pointerEvents: 'auto' }]}
                onPress={navigateToQr}
              >
                <Text style={styles.qrButtonText}>Show QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(["Stories", "Posts", "Members"] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Tab Content */}
        {activeTab === "Stories" && renderStories()}
        {activeTab === "Posts" && renderPosts()}
        {activeTab === "Members" && renderMembers()}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  groupInfo: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  memberCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  sharingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  toggleOn: {
    backgroundColor: '#4361ee',
  },
  toggleOff: {
    backgroundColor: '#e0e0e0',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleCircleOn: {
    transform: [{ translateX: 22 }],
  },
  shareSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  shareCodeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  shareCodeLabel: {
    fontSize: 16,
    marginRight: 10,
    marginBottom: 5,
  },
  shareCode: {
    flex: 1,
    backgroundColor: '#eef2ff',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  copySuccess: {
    color: '#15803d',
    marginBottom: 10,
  },
  qrButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4361ee',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4361ee',
  },
  tabContent: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    flex: 1,
  },
  storyItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  storyContent: {
    flex: 1,
  },
  storyText: {
    fontSize: 16,
    marginBottom: 5,
  },
  storyMeta: {
    fontSize: 14,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUser: {
    fontWeight: '600',
    fontSize: 16,
  },
  postTime: {
    color: '#666',
    fontSize: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberEmail: {
    color: '#666',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4361ee',
    borderRadius: 10,
  },
  inviteText: {
    marginLeft: 10,
    color: '#4361ee',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  messageContainer: { 
    marginBottom: 10,
    padding: 15,
  },
  message: { 
    fontSize: 16,
    textAlign: 'center',
  },
  success: { 
    color: '#15803d' 
  },
  error: { 
    color: '#dc2626' 
  },
});

export default GroupDetailScreen;