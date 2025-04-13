import apiClient from './index';

/**
 * Create a new check-in for a goal
 * @param {Object} checkinData - The check-in data
 * @param {string} checkinData.goal_id - ID of the goal being checked in
 * @param {boolean} checkinData.completed - Whether the goal was completed for this check-in
 * @param {string} checkinData.notes - Optional notes for the check-in
 * @returns {Promise} - Promise with the created check-in data
 */
export const createCheckin = async (checkinData) => {
  try {
    const response = await apiClient.post('/checkins', checkinData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Get all check-ins for a specific goal
 * @param {string} goalId - The ID of the goal to get check-ins for
 * @returns {Promise} - Promise with the check-ins data
 */
export const getCheckinsByGoalId = async (goalId) => {
  try {
    const response = await apiClient.get(`/checkins/${goalId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Get check-in statistics for a goal
 * @param {string} goalId - The ID of the goal to get statistics for
 * @returns {Promise} - Promise with the statistics data
 */
export const getCheckinStats = async (goalId) => {
  try {
    const response = await apiClient.get(`/checkins/${goalId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};

/**
 * Update an existing check-in
 * @param {string} checkinId - The ID of the check-in to update
 * @param {Object} checkinData - The updated check-in data
 * @returns {Promise} - Promise with the updated check-in data
 */
export const updateCheckin = async (checkinId, checkinData) => {
  try {
    const response = await apiClient.put(`/checkins/${checkinId}`, checkinData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Network error occurred' };
  }
};