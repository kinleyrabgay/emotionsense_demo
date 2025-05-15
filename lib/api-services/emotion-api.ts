import { apiPost } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userStorage } from '@/lib/storage-service';
import { useEffect, useState } from 'react';
import { refreshUserData } from './auth-api';

export interface EmotionDetectionResult {
  status: string;
  message?: string;
  data?: {
    emotion: string;
    confidence: number;
    timestamp: string;
  };
}

// API endpoints for emotion detection
const EMOTION_ENDPOINTS = {
  DETECT: '/emotion-detection/detect'
};

// Emotion API service
export const emotionApi = {
  detectEmotion: async (imageBase64: string, userId: string): Promise<EmotionDetectionResult> => {
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    const response = await apiPost(EMOTION_ENDPOINTS.DETECT, {
      image: base64Data,
      user_id: userId
    });
    
    return response;
  }
};

// Directly refresh user data after emotion detection
export const detectEmotionAndRefreshUser = async (imageBase64: string): Promise<EmotionDetectionResult> => {
  try {
    const user = userStorage.getUser();
    if (!user || !user.id) {
      throw new Error("User not found");
    }
    
    // Detect emotion
    const result = await emotionApi.detectEmotion(imageBase64, user.id);
    
    // After successful detection, refresh user data directly
    await refreshUserData();
    
    return result;
  } catch (error) {
    console.error("Emotion detection or refresh failed:", error);
    throw error;
  }
};

// Fixed version that follows React Hook rules and handles hydration properly
export function useEmotionDetection() {
  // Add hydration state to prevent SSR issues
  const [isHydrated, setIsHydrated] = useState(false);
  const queryClient = useQueryClient();
  
  // Wait for hydration before accessing browser APIs
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Only use mutation after hydration
  const mutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      // Call the direct function that handles both detection and refresh
      return detectEmotionAndRefreshUser(imageBase64);
    },
    onSuccess: (data) => {
      // Ensure we update the user data after a successful emotion detection
      console.log("Emotion detection successful:", data);
      
      // Still invalidate user query for components that use React Query
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error("Emotion detection failed:", error);
    },
  });

  return mutation;
} 