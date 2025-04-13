import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { login, register, getCurrentUser } from '../api/auth';

/**
 * Authentication store using Zustand
 */
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userToken: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  
  // Actions
  
  /**
   * Initialize the auth state by checking for a stored token
   */
  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if we have a token stored
      const token = await SecureStore.getItemAsync('userToken');
      
      if (token) {
        // If we have a token, fetch the user data
        set({ userToken: token });
        await get().fetchUserData();
      } else {
        // No token found, user is not authenticated
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        isLoading: false, 
        isAuthenticated: false, 
        error: 'Failed to initialize authentication'
      });
    }
  },
  
  /**
   * Fetch the current user's data
   */
  fetchUserData: async () => {
    try {
      const userData = await getCurrentUser();
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, the token might be invalid
      await get().signOut();
    }
  },
  
  /**
   * Sign in a user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  signIn: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await login(credentials);
      const { access_token, user } = response;
      
      // Store the token
      await SecureStore.setItemAsync('userToken', access_token);
      
      set({ 
        userToken: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        isLoading: false, 
        isAuthenticated: false, 
        error: error.detail || 'Failed to sign in'
      });
      
      return { success: false, error: error.detail || 'Failed to sign in' };
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  signUp: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await register(userData);
      
      // After registration, automatically sign in the user
      return await get().signIn({
        email: userData.email,
        password: userData.password
      });
    } catch (error) {
      console.error('Sign up error:', error);
      set({ 
        isLoading: false, 
        error: error.detail || 'Failed to register'
      });
      
      return { success: false, error: error.detail || 'Failed to register' };
    }
  },
  
  /**
   * Sign out the current user
   */
  signOut: async () => {
    set({ isLoading: true });
    
    try {
      // Remove the token from storage
      await SecureStore.deleteItemAsync('userToken');
      
      set({ 
        user: null,
        userToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        isLoading: false, 
        error: 'Failed to sign out'
      });
      
      return { success: false, error: 'Failed to sign out' };
    }
  },
  
  /**
   * Clear any authentication errors
   */
  clearError: () => {
    set({ error: null });
  }
}));

export default useAuthStore;