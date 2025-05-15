import { 
  LoginCredentials, 
  RegisterCredentials 
} from '@/lib/validators/auth';
import { 
  API_CONFIG, 
  apiPost, 
  apiGet, 
  setAuthToken,
  getAuthToken,
  removeAuthToken
} from '@/lib/api';
import { 
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthErrorHandler } from '@/lib/hooks/useAuthErrorHandler';
import { useEffect } from 'react';
import { EmotionRecord, emotionStorage, userStorage } from '@/lib/storage-service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  emotion?: string;
  profile?: string;
  isAuthenticated?: boolean;
  emotion_history?: EmotionRecord[];
}

interface AuthResponse {
  access_token: string;
  user: User;
}

// Auth API service for interacting with authentication endpoints
export const authApi = {
  // Login user with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiPost(API_CONFIG.ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  // Register a new user
  register: async (userData: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiPost(API_CONFIG.ENDPOINTS.REGISTER, userData);
    return response?.data;
  },

  // Fetch current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiGet(API_CONFIG.ENDPOINTS.USER);
    return response.data;
  },

  // Logout the current user
  logout: async (): Promise<void> => {
    await apiPost(API_CONFIG.ENDPOINTS.LOGOUT);
  },
  
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiGet('/auth/users');
    return response.data;
  }
};

// Expose a function to manually refresh user data
export const refreshUserData = async (): Promise<User | null> => {
  try {
    // Only try to fetch if we have a token
    if (!getAuthToken()) return null;
    
    const userData = await authApi.getCurrentUser();
    
    // Update storage with the latest user data
    userStorage.saveUser(userData);

    emotionStorage.clearEmotionHistory();
    emotionStorage.addEmotionRecord(userData.emotion_history ?? []);
    
    return userData;
  } catch (error) {
    console.error("Error refreshing user data:", error);
    return null;
  }
};

// React Query hook for login mutation
export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Save token
      setAuthToken(data?.access_token);
      
      // Save user to sessionStorage
      userStorage.saveUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        emotion: data.user.emotion,
        profile: data.user.profile,
        emotion_history: data.user.emotion_history
      });
      
      // Show success message
      toast.success('Login successful', {
        description: 'Welcome back to EmotionSense!',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Redirect to home or previous page
      const redirectUrl = new URLSearchParams(window.location.search).get('from') || '/';
      router.push(redirectUrl);
    }
  });

  // Handle authentication errors
  useAuthErrorHandler(mutation.error);
  
  return mutation;
}

// Admin hook for registering other users without logging in as them
export function useAdminRegisterMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Show success message
      toast.success('User registered successfully', {
        description: `${data?.user?.name} has been added.`,
      });
      
      // Invalidate users query if it exists
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error("Error registering user:", error);
      toast.error('User registration failed', {
        description: error.message,
      });
    }
  });
  
  return mutation;
}

// React Query hook for fetching current user
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: authApi.getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    select: (userData: User) => {
      userStorage.saveUser(userData);
      return userData;
    }
  });

  // Handle authentication errors
  useAuthErrorHandler(query.error, '/auth');

  return query;
}

// React Query hook for logout
export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear token and user data
      removeAuthToken();
      userStorage.clearUser();

      // Clear emotion history
      emotionStorage.clearEmotionHistory();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Show success message
      toast.success('Logout successful', {
        description: 'You have been logged out.',
      });
      
      // Redirect to login
      router.push('/auth');
    }
  });

  // Handle errors in logout
  useEffect(() => {
    if (mutation.error) {
      // Still clear user data on error
      removeAuthToken();
      userStorage.clearUser();
      
      // Show error message
      toast.error('Logout failed', {
        description: 'An error occurred while logging out.',
      });
      
      // Redirect to login
      router.push('/auth');
    }
  }, [mutation.error, router]);
  
  return mutation;
}

// React Query hook for fetching all users (admin only)
export function useAllUsers() {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getAllUsers,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  // Handle authentication errors
  useAuthErrorHandler(query.error);

  return query;
} 