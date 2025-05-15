/**
 * Simple localStorage-based state management
 * This provides a simpler alternative to Zustand while keeping data in browser session
 */

import { User } from "./api-services/auth-api";

// Storage keys
export const STORAGE_KEYS = {
  AUTH_USER: 'auth-user',
  EMOTION_HISTORY: 'emotion-history'
};

// Type for emotion records
export interface EmotionRecord {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

// User storage service
export const userStorage = {
  // Get the current user
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  },

  // Save user data
  saveUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Add isAuthenticated flag for consistency with previous implementation
      const userData = {
        ...user,
        isAuthenticated: true
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  // Clear user data
  clearUser: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch (error) {
      console.error('Error clearing user from localStorage:', error);
    }
  }
};

// Emotion storage service
export const emotionStorage = {
  // Get emotion history
  getEmotionHistory: (): EmotionRecord[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const historyData = localStorage.getItem(STORAGE_KEYS.EMOTION_HISTORY);
      const parsedData = historyData ? JSON.parse(historyData) : [];
      
      // Convert string dates back to Date objects
      return parsedData.map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
    } catch (error) {
      console.error('Error getting emotion history from localStorage:', error);
      return [];
    }
  },

  // Add new emotion record
  addEmotionRecord: (record: EmotionRecord[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // const history = emotionStorage.getEmotionHistory();
      // const newRecord = { ...record };
      
      // Add new record at the beginning, limit to 100 most recent records
      // const updatedHistory = [newRecord, ...history].slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.EMOTION_HISTORY, JSON.stringify(record));
    } catch (error) {
      console.error('Error saving emotion record to localStorage:', error);
    }
  },

  // Clear emotion history
  clearEmotionHistory: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.EMOTION_HISTORY);
    } catch (error) {
      console.error('Error clearing emotion history from localStorage:', error);
    }
  },

  // Get emotion statistics
  getEmotionStats: (): Record<string, number> => {
    const history = emotionStorage.getEmotionHistory();
    
    return history.reduce<Record<string, number>>((stats, record) => {
      const emotion = record.emotion.toLowerCase();
      stats[emotion] = (stats[emotion] || 0) + 1;
      return stats;
    }, {});
  }
}; 