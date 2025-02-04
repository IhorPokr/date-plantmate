import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
const SECURE_STORAGE_KEY = 'auth-tokens';
const ASYNC_STORAGE_KEY = 'auth-user';

// Type for essential session data
interface SecureSessionData {
  access_token: string | null;
  refresh_token: string | null;
}

// Custom storage implementation
const hybridStorage = {
  async getItem(key: string) {
    try {
      // For auth tokens, use SecureStore
      if (key === SECURE_STORAGE_KEY) {
        const tokens = await SecureStore.getItemAsync(key);
        return tokens;
      }
      // For other session data, use AsyncStorage
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return null;
    }
  },

  async setItem(key: string, value: string) {
    try {
      // Store tokens in SecureStore
      if (key === SECURE_STORAGE_KEY) {
        const sessionData = JSON.parse(value);
        // Only store essential tokens
        const secureData: SecureSessionData = {
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        };
        await SecureStore.setItemAsync(key, JSON.stringify(secureData));
        
        // Store additional session data in AsyncStorage
        if (sessionData.user) {
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(sessionData.user));
        }
        return;
      }
      
      // For other data, use AsyncStorage
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting storage item:', error);
    }
  },

  async removeItem(key: string) {
    try {
      // Clean up both storages
      if (key === SECURE_STORAGE_KEY) {
        await SecureStore.deleteItemAsync(key);
        await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing storage item:', error);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: hybridStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get complete session data
export async function getCompleteSession() {
  try {
    const tokens = await SecureStore.getItemAsync(SECURE_STORAGE_KEY);
    const userData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    
    if (!tokens) {
      return null;
    }

    return {
      ...JSON.parse(tokens),
      user: userData ? JSON.parse(userData) : null,
    };
  } catch (error) {
    console.error('Error getting complete session:', error);
    return null;
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    if (event === 'SIGNED_IN' && session) {
      // Store tokens in SecureStore
      const tokens: SecureSessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };
      await SecureStore.setItemAsync(SECURE_STORAGE_KEY, JSON.stringify(tokens));
      
      // Store user data in AsyncStorage
      if (session.user) {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(session.user));
      }
      
      console.log('Session stored successfully');
    } else if (event === 'SIGNED_OUT') {
      // Clear both storages
      await SecureStore.deleteItemAsync(SECURE_STORAGE_KEY);
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
      console.log('Session cleared successfully');
    }
  } catch (error) {
    console.error('Error handling auth state change:', error);
  }
});
