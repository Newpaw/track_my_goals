import { v4 as uuidv4 } from 'uuid';
import { getFromStorage, saveToStorage } from './storage';

// Storage keys
const MOCK_USERS_KEY = 'mock_users';
const MOCK_GOALS_KEY = 'mock_goals';
const MOCK_CHECKINS_KEY = 'mock_checkins';
const MOCK_AUTH_KEY = 'mock_auth';

// Default data
const defaultUsers = [
  {
    id: '1',
    email: 'user@example.com',
    username: 'testuser',
    created_at: new Date().toISOString()
  }
];

const defaultGoals = [];
const defaultCheckins = [];

/**
 * Initialize mock data
 */
export const initMockData = async () => {
  // Check if mock data already exists
  const users = await getFromStorage(MOCK_USERS_KEY);
  const goals = await getFromStorage(MOCK_GOALS_KEY);
  const checkins = await getFromStorage(MOCK_CHECKINS_KEY);
  
  // If not, initialize with default data
  if (!users) {
    await saveToStorage(MOCK_USERS_KEY, defaultUsers);
  }
  
  if (!goals) {
    await saveToStorage(MOCK_GOALS_KEY, defaultGoals);
  }
  
  if (!checkins) {
    await saveToStorage(MOCK_CHECKINS_KEY, defaultCheckins);
  }
};

/**
 * Mock authentication API
 */
export const mockAuthApi = {
  // Register a new user
  register: async (userData) => {
    try {
      // Get existing users
      const users = await getFromStorage(MOCK_USERS_KEY) || [];
      
      // Check if email already exists
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Create new user
      const newUser = {
        id: uuidv4(),
        email: userData.email,
        username: userData.username || userData.email.split('@')[0],
        created_at: new Date().toISOString()
      };
      
      // Add to users list
      users.push(newUser);
      await saveToStorage(MOCK_USERS_KEY, users);
      
      // Create auth token
      const token = `mock_token_${newUser.id}`;
      await saveToStorage(MOCK_AUTH_KEY, {
        user_id: newUser.id,
        token
      });
      
      return {
        access_token: token,
        token_type: 'bearer',
        user: newUser
      };
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Login a user
  login: async (credentials) => {
    try {
      // Get existing users
      const users = await getFromStorage(MOCK_USERS_KEY) || [];
      
      // Find user by email
      const user = users.find(user => user.email === credentials.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, we would check the password here
      
      // Create auth token
      const token = `mock_token_${user.id}`;
      await saveToStorage(MOCK_AUTH_KEY, {
        user_id: user.id,
        token
      });
      
      return {
        access_token: token,
        token_type: 'bearer',
        user
      };
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get users
      const users = await getFromStorage(MOCK_USERS_KEY) || [];
      
      // Find user by ID
      const user = users.find(user => user.id === auth.user_id);
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw { detail: error.message };
    }
  }
};

/**
 * Mock goals API
 */
export const mockGoalsApi = {
  // Get all goals
  getAllGoals: async () => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Filter goals by user ID
      return goals.filter(goal => goal.user_id === auth.user_id);
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Get a goal by ID
  getGoalById: async (goalId) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Find goal by ID
      const goal = goals.find(goal => goal.id === goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Check if goal belongs to user
      if (goal.user_id !== auth.user_id) {
        throw new Error('Not authorized to access this goal');
      }
      
      return goal;
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Create a new goal
  createGoal: async (goalData) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Create new goal
      const newGoal = {
        id: uuidv4(),
        ...goalData,
        user_id: auth.user_id,
        created_at: new Date().toISOString()
      };
      
      // Add to goals list
      goals.push(newGoal);
      await saveToStorage(MOCK_GOALS_KEY, goals);
      
      return newGoal;
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Update a goal
  updateGoal: async (goalId, goalData) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Find goal index
      const goalIndex = goals.findIndex(goal => goal.id === goalId);
      if (goalIndex === -1) {
        throw new Error('Goal not found');
      }
      
      // Check if goal belongs to user
      if (goals[goalIndex].user_id !== auth.user_id) {
        throw new Error('Not authorized to update this goal');
      }
      
      // Update goal
      const updatedGoal = {
        ...goals[goalIndex],
        ...goalData,
        updated_at: new Date().toISOString()
      };
      
      goals[goalIndex] = updatedGoal;
      await saveToStorage(MOCK_GOALS_KEY, goals);
      
      return updatedGoal;
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Delete a goal
  deleteGoal: async (goalId) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Find goal
      const goal = goals.find(goal => goal.id === goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Check if goal belongs to user
      if (goal.user_id !== auth.user_id) {
        throw new Error('Not authorized to delete this goal');
      }
      
      // Remove goal
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      await saveToStorage(MOCK_GOALS_KEY, updatedGoals);
      
      // Also remove related check-ins
      const checkins = await getFromStorage(MOCK_CHECKINS_KEY) || [];
      const updatedCheckins = checkins.filter(checkin => checkin.goal_id !== goalId);
      await saveToStorage(MOCK_CHECKINS_KEY, updatedCheckins);
      
      return { success: true };
    } catch (error) {
      throw { detail: error.message };
    }
  }
};

/**
 * Mock check-ins API
 */
export const mockCheckinsApi = {
  // Create a new check-in
  createCheckin: async (checkinData) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Find goal
      const goal = goals.find(goal => goal.id === checkinData.goal_id);
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Check if goal belongs to user
      if (goal.user_id !== auth.user_id) {
        throw new Error('Not authorized to access this goal');
      }
      
      // Get check-ins
      const checkins = await getFromStorage(MOCK_CHECKINS_KEY) || [];
      
      // Check if check-in for this date already exists
      const existingCheckin = checkins.find(
        checkin => checkin.goal_id === checkinData.goal_id && 
                  checkin.date === checkinData.date
      );
      
      if (existingCheckin) {
        throw new Error('Check-in for this date already exists');
      }
      
      // Create new check-in
      const newCheckin = {
        id: uuidv4(),
        ...checkinData,
        date: checkinData.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
      
      // Add to check-ins list
      checkins.push(newCheckin);
      await saveToStorage(MOCK_CHECKINS_KEY, checkins);
      
      return newCheckin;
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Get check-ins for a goal
  getCheckinsByGoalId: async (goalId) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Find goal
      const goal = goals.find(goal => goal.id === goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Check if goal belongs to user
      if (goal.user_id !== auth.user_id) {
        throw new Error('Not authorized to access this goal');
      }
      
      // Get check-ins
      const checkins = await getFromStorage(MOCK_CHECKINS_KEY) || [];
      
      // Filter check-ins by goal ID
      return checkins
        .filter(checkin => checkin.goal_id === goalId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Get check-in statistics for a goal
  getCheckinStats: async (goalId) => {
    try {
      // Get check-ins for goal
      const checkins = await mockCheckinsApi.getCheckinsByGoalId(goalId);
      
      // Calculate statistics
      const totalCheckins = checkins.length;
      const completedCheckins = checkins.filter(c => c.status === true).length;
      const completionRate = totalCheckins > 0 ? (completedCheckins / totalCheckins) * 100 : 0;
      
      // Calculate current streak
      let currentStreak = 0;
      const sortedCheckins = [...checkins].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      for (const checkin of sortedCheckins) {
        if (checkin.status === true) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Calculate longest streak
      let longestStreak = 0;
      let currentLongestStreak = 0;
      
      for (const checkin of sortedCheckins) {
        if (checkin.status === true) {
          currentLongestStreak++;
          if (currentLongestStreak > longestStreak) {
            longestStreak = currentLongestStreak;
          }
        } else {
          currentLongestStreak = 0;
        }
      }
      
      return {
        total_checkins: totalCheckins,
        completed_checkins: completedCheckins,
        completion_rate: completionRate,
        current_streak: currentStreak,
        longest_streak: longestStreak
      };
    } catch (error) {
      throw { detail: error.message };
    }
  },
  
  // Update a check-in
  updateCheckin: async (checkinId, checkinData) => {
    try {
      // Get auth data
      const auth = await getFromStorage(MOCK_AUTH_KEY);
      if (!auth) {
        throw new Error('Not authenticated');
      }
      
      // Get check-ins
      const checkins = await getFromStorage(MOCK_CHECKINS_KEY) || [];
      
      // Find check-in index
      const checkinIndex = checkins.findIndex(checkin => checkin.id === checkinId);
      if (checkinIndex === -1) {
        throw new Error('Check-in not found');
      }
      
      // Get goals
      const goals = await getFromStorage(MOCK_GOALS_KEY) || [];
      
      // Find goal
      const goal = goals.find(goal => goal.id === checkins[checkinIndex].goal_id);
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Check if goal belongs to user
      if (goal.user_id !== auth.user_id) {
        throw new Error('Not authorized to update this check-in');
      }
      
      // Update check-in
      const updatedCheckin = {
        ...checkins[checkinIndex],
        ...checkinData,
        updated_at: new Date().toISOString()
      };
      
      checkins[checkinIndex] = updatedCheckin;
      await saveToStorage(MOCK_CHECKINS_KEY, checkins);
      
      return updatedCheckin;
    } catch (error) {
      throw { detail: error.message };
    }
  }
};

export default {
  initMockData,
  auth: mockAuthApi,
  goals: mockGoalsApi,
  checkins: mockCheckinsApi
};