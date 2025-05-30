import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import mockApiService from '../utils/mockApiService';

// API URL Configuration based on platform and environment
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine the appropriate API URL based on platform
const getApiUrl = () => {
  // Check if we have a custom API URL in the app config (app.json)
  const customApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (customApiUrl) return customApiUrl;
  
  // Platform-specific defaults
  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000';
  } else if (Platform.OS === 'android') {
    // Android emulator needs the special IP for localhost
    return 'http://10.0.2.2:8000';
  } else {
    // Web or other platforms
    return 'http://localhost:8000';
  }
};

// Base URL for the API
const API_URL = getApiUrl();

// Flag to use mock API - configurable via environment or development toggle
// Priority: 1. Constants from app config, 2. Development toggle (if enabled)
const getUseMockApi = () => {
  // Check if we have a mock API setting in the app config
  const mockApiSetting = Constants.expoConfig?.extra?.useMockApi;
  if (mockApiSetting !== undefined) return mockApiSetting === true;
  
  // Default to false for production, true for development
  return __DEV__ ? true : false;
};

const USE_MOCK_API = getUseMockApi();

// Development toggle for mock API (can be implemented in settings/profile screen)
export const toggleMockApi = async (value) => {
  // This could be persisted to storage for user preference
  // For now, we'll just log it as this would require app restart
  console.log(`Mock API ${value ? 'enabled' : 'disabled'}`);
  // In a real implementation, you would save this to storage and
  // reload the app or update the configuration
};

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    // Get the token from secure storage
    const token = await SecureStore.getItemAsync('userToken');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear the token from storage
      await SecureStore.deleteItemAsync('userToken');
      
      // You could implement token refresh logic here
      
      // For now, we'll just reject the promise
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Check if the device is connected to the internet
 * @returns {Promise<boolean>} - Promise that resolves to true if connected, false otherwise
 */
export const isConnected = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

/**
 * Initialize the API
 */
export const initApi = async () => {
  if (USE_MOCK_API) {
    await mockApiService.initMockData();
  }
};

/**
 * API client with fallback to mock API when offline or in testing mode
 */
const apiClientWithFallback = {
  get: async (url, config) => {
    if (USE_MOCK_API) {
      // Use mock API
      return mockApiRequest('GET', url, null, config);
    }
    
    try {
      // Try real API first
      return await apiClient.get(url, config);
    } catch (error) {
      // If network error, try mock API
      if (!error.response && (await isConnected()) === false) {
        return mockApiRequest('GET', url, null, config);
      }
      throw error;
    }
  },
  
  post: async (url, data, config) => {
    if (USE_MOCK_API) {
      // Use mock API
      return mockApiRequest('POST', url, data, config);
    }
    
    try {
      // Try real API first
      return await apiClient.post(url, data, config);
    } catch (error) {
      // If network error, try mock API
      if (!error.response && (await isConnected()) === false) {
        return mockApiRequest('POST', url, data, config);
      }
      throw error;
    }
  },
  
  put: async (url, data, config) => {
    if (USE_MOCK_API) {
      // Use mock API
      return mockApiRequest('PUT', url, data, config);
    }
    
    try {
      // Try real API first
      return await apiClient.put(url, data, config);
    } catch (error) {
      // If network error, try mock API
      if (!error.response && (await isConnected()) === false) {
        return mockApiRequest('PUT', url, data, config);
      }
      throw error;
    }
  },
  
  delete: async (url, config) => {
    if (USE_MOCK_API) {
      // Use mock API
      return mockApiRequest('DELETE', url, null, config);
    }
    
    try {
      // Try real API first
      return await apiClient.delete(url, config);
    } catch (error) {
      // If network error, try mock API
      if (!error.response && (await isConnected()) === false) {
        return mockApiRequest('DELETE', url, null, config);
      }
      throw error;
    }
  }
};

/**
 * Handle mock API requests
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 * @param {Object} config - Request config
 * @returns {Promise<Object>} - Promise with the response
 */
async function mockApiRequest(method, url, data, config) {
  console.log(`[MOCK API] ${method} ${url}`);
  
  try {
    let response;
    
    // Auth endpoints
    if (url === '/auth/register') {
      response = await mockApiService.auth.register(data);
    } else if (url === '/auth/login') {
      response = await mockApiService.auth.login(data);
    } else if (url === '/auth/me') {
      response = await mockApiService.auth.getCurrentUser();
    }
    // Goals endpoints
    else if (url === '/goals' && method === 'GET') {
      response = await mockApiService.goals.getAllGoals();
    } else if (url === '/goals' && method === 'POST') {
      response = await mockApiService.goals.createGoal(data);
    } else if (url.startsWith('/goals/') && method === 'GET') {
      const goalId = url.split('/')[2];
      response = await mockApiService.goals.getGoalById(goalId);
    } else if (url.startsWith('/goals/') && method === 'PUT') {
      const goalId = url.split('/')[2];
      response = await mockApiService.goals.updateGoal(goalId, data);
    } else if (url.startsWith('/goals/') && method === 'DELETE') {
      const goalId = url.split('/')[2];
      response = await mockApiService.goals.deleteGoal(goalId);
    }
    // Check-ins endpoints
    else if (url === '/checkins' && method === 'POST') {
      response = await mockApiService.checkins.createCheckin(data);
    } else if (url.startsWith('/checkins/') && !url.endsWith('/stats') && method === 'GET') {
      const goalId = url.split('/')[2];
      response = await mockApiService.checkins.getCheckinsByGoalId(goalId);
    } else if (url.endsWith('/stats') && method === 'GET') {
      const goalId = url.split('/')[2];
      response = await mockApiService.checkins.getCheckinStats(goalId);
    } else if (url.startsWith('/checkins/') && method === 'PUT') {
      const checkinId = url.split('/')[2];
      response = await mockApiService.checkins.updateCheckin(checkinId, data);
    } else {
      throw new Error(`Mock API endpoint not implemented: ${method} ${url}`);
    }
    
    return { data: response };
  } catch (error) {
    throw {
      response: {
        data: error
      }
    };
  }
}

export default apiClientWithFallback;