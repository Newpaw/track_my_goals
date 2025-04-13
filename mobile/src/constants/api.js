/**
 * API endpoints and configuration
 */

// Base URL for the API
export const API_BASE_URL = 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  
  // Goals endpoints
  GOALS: {
    BASE: '/goals',
    DETAIL: (goalId) => `/goals/${goalId}`,
  },
  
  // Check-ins endpoints
  CHECKINS: {
    BASE: '/checkins',
    BY_GOAL: (goalId) => `/checkins/${goalId}`,
    STATS: (goalId) => `/checkins/${goalId}/stats`,
  },
};

// API request timeout in milliseconds
export const API_TIMEOUT = 10000;

// API response status codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  TIMEOUT: API_TIMEOUT,
  STATUS: API_STATUS,
};