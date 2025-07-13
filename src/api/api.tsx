import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Replace with your machine’s IP or localhost:8000 for simulator
  withCredentials: true,
});

export const setupAxios = async () => {
  const token = await AsyncStorage.getItem("token");
  console.log("Auth Token:", token ? "Present" : "Missing"); // Debug log
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Fetch CSRF cookie
export const getCsrfCookie = async () => {
  try {
    console.log("Fetching CSRF cookie..."); // Debug log
    const response = await api.get("/sanctum/csrf-cookie");
    console.log("CSRF Cookie Response:", response.status); // Debug log
    return response;
  } catch (error) {
    console.error("CSRF Cookie Error:", error.response?.data || error.message);
    throw error;
  }
};

// Login
export const login = async (email: string, password: string) => {
  await getCsrfCookie();
  const response = await api.post("/api/login", { email, password });
  const { token, user } = response.data;
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
  await setupAxios();
  return response.data;
};

// Register
export const register = async (
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
  phone :string
) => {
  await getCsrfCookie();
  const response = await api.post("/api/register", {
    name,
    email,
    password,
    password_confirmation,
    phone
  });
  return response.data;
};

// Fetch User Profile
export const getUser = async () => {
  await setupAxios();
  const response = await api.get("/api/user");
  return response.data;
};

// Fetch Groups
export const getGroups = async () => {
  await setupAxios();
  const response = await api.get("/api/groups");
  return response.data.data || [];
};

// Create Group
export const createGroup = async (name: string, description: string) => {
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post("/api/groups", { name, description });
  return response.data;
};

// Join Group via QR Code
export const joinGroup = async (code: string) => {
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post("/api/join-group", { code });
  return response.data;
};

export const deleteG = async (groupId: number) =>{
  await getCsrfCookie();
await setupAxios();
const response = await api.delete(`/api/groups/${groupId}`);
return response.data;
};

// Fetch Group Details
export const getGroupDetails = async (groupId: string) => {
  await setupAxios();
  console.log("Fetching group details for ID:", groupId); // Debug log
  const response = await api.get(`/api/groups/${groupId}`);
  console.log("Group Details Response:", response.data); // Debug log
  return response.data.data || response.data;
};

// Fetch Group Members
export const getGroupMembers = async (groupId: string) => {
  await setupAxios();
  console.log("Fetching members for group ID:", groupId); // Debug log
  const response = await api.get(`/api/groups/${groupId}/members`);
  console.log("Members Response:", response.data); // Debug log
  return response.data;
};

// Fetch Group Stories
export const getGroupStories = async (groupId: string) => {
  await setupAxios();
  console.log("Fetching stories for group ID:", groupId); // Debug log
  const response = await api.get(`/api/groups/${groupId}/stories`);
  console.log("Stories Response:", response.data); // Debug log
  return response.data;
};
// Fetch Group Posts
export const getGroupPosts = async (groupId: string) => {
  await setupAxios();
  console.log("Fetching posts for group ID:", groupId); // Debug log
  const response = await api.get(`/api/groups/${groupId}/posts`);
  console.log("Posts Response:", response.data); // Debug log
  return response.data;
};

// Fetch Group QR Code
export const getGroupQr = async (groupId: string) => {
  await setupAxios();
  console.log("Fetching QR code for group ID:", groupId); // Debug log
  const response = await api.get(`/api/groups/${groupId}/qr`, {
    headers: { Accept: "image/svg+xml" },
  });
  console.log("QR Code Response:", response.data); // Debug log
  return response.data;
};

export const requestForgetPassword = async (email: string) => {
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post('/api/forget-password', { email });
  return response.data;
};
export const handleApiError = (error: any) => {
  if (error.response) {
    return {
      message: error.response.data.message || 'An error occurred.',
      errors: error.response.data.errors || [],
    };
  }
  return { message: 'Network error. Please try again.', errors: [] };
};
// Toggle Group Sharing
export const toggleGroupSharing = async (groupId: string) => {
  await getCsrfCookie();
  await setupAxios();
  console.log("Toggling sharing for group ID:", groupId); // Debug log
  const response = await api.post(`/api/groups/${groupId}/toggle-sharing`);
  console.log("Toggle Sharing Response:", response.data); // Debug log
  return response.data;
};

export const verifyForgetPassword = async ({email,otp}:{email: string, otp: string}) => {
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post('/api/verify-forget-password', { email, otp });
  return response.data;
};
export const verifyOtp = async (otp: string) => {
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post('/api/verify-otp', { otp });
  return response.data;
};

// Reset password with new password
export const resetPassword = async ({ email, password }: { email: string; password: string }) => {
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post('reset-password', { email, password });
  return response.data;
};
// Create a Story
export const createStory = async (
  groupId: string,
  content: string,
  sharedWith: number[] = []
) => {
  await getCsrfCookie();
  await setupAxios();
  console.log("Creating story for group:", groupId); // Debug log

  const response = await api.post("/api/stories", {
    group_id: groupId,
    content,
    shared_with: sharedWith,
  });

  console.log("Create Story Response:", response.data); // Debug log
  return response.data;
};

export const createPost = async(
groupId: string, content: { content: string; group_id: string }

) =>{
  await getCsrfCookie();
  await setupAxios();
  const response = await api.post("/api/groups/posts", {
                group_id: groupId,
                content,
            });
            console.log(response.data);
            return response.data;

}

export default api;
