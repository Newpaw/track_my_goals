import apiClient from './index';

/**
 * Get all goals for the current user
 * @returns {Promise} - Promise with the goals data
 */
export const getAllGoals = async () => {
  try {
    const response = await apiClient.get('/goals');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Get a specific goal by ID
 * @param {string} goalId - The ID of the goal to retrieve
 * @returns {Promise} - Promise with the goal data
 */
export const getGoalById = async (goalId) => {
  try {
    const response = await apiClient.get(`/goals/${goalId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Create a new goal
 * @param {Object} goalData - The goal data
 * @param {string} goalData.title - Goal title
 * @param {string} goalData.description - Goal description
 * @param {string} goalData.category - Goal category
 * @param {string} goalData.frequency - Check-in frequency (daily, weekly, etc.)
 * @param {Date} goalData.target_date - Target completion date
 * @returns {Promise} - Promise with the created goal data
 */
export const createGoal = async (goalData) => {
  try {
    const response = await apiClient.post('/goals', goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Update an existing goal
 * @param {string} goalId - The ID of the goal to update
 * @param {Object} goalData - The updated goal data
 * @returns {Promise} - Promise with the updated goal data
 */
export const updateGoal = async (goalId, goalData) => {
  try {
    const response = await apiClient.put(`/goals/${goalId}`, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Delete a goal
 * @param {string} goalId - The ID of the goal to delete
 * @returns {Promise} - Promise with the deletion response
 */
export const deleteGoal = async (goalId) => {
  try {
    const response = await apiClient.delete(`/goals/${goalId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};