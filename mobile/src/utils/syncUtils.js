import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from './storage';
import apiClient from '../api';
import * as SecureStore from 'expo-secure-store';

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
 * Synchronize all unsynced goals with the backend
 * @returns {Promise<Object>} - Promise with the synchronization results
 */
export const syncGoals = async () => {
  // Check if we're connected to the internet
  const connected = await isConnected();
  if (!connected) {
    return { success: false, error: 'No internet connection' };
  }

  // Check if we're authenticated
  const token = await SecureStore.getItemAsync('userToken');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const db = getDatabase();
    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      failed: 0,
      errors: []
    };

    // Get all unsynced goals
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM goals WHERE synced = 0',
          [],
          async (_, { rows }) => {
            const unsyncedGoals = rows._array;
            
            if (unsyncedGoals.length === 0) {
              resolve({ success: true, results, message: 'No goals to sync' });
              return;
            }
            
            // Process each unsynced goal
            for (const goal of unsyncedGoals) {
              try {
                // If the goal has a temporary ID (starts with 'temp_'), it's a new goal
                if (goal.id.startsWith('temp_')) {
                  // Create the goal on the backend
                  const { id, synced, ...goalData } = goal;
                  const response = await apiClient.post('/goals', goalData);
                  const newGoal = response.data;
                  
                  // Update the local goal with the new ID and mark as synced
                  tx.executeSql(
                    `UPDATE goals SET 
                      id = ?, 
                      synced = 1
                    WHERE id = ?`,
                    [newGoal.id, goal.id]
                  );
                  
                  // Also update any check-ins associated with this goal
                  tx.executeSql(
                    `UPDATE checkins SET 
                      goal_id = ?
                    WHERE goal_id = ?`,
                    [newGoal.id, goal.id]
                  );
                  
                  results.created++;
                } else {
                  // Update the goal on the backend
                  const { id, synced, ...goalData } = goal;
                  await apiClient.put(`/goals/${id}`, goalData);
                  
                  // Mark the goal as synced
                  tx.executeSql(
                    `UPDATE goals SET 
                      synced = 1
                    WHERE id = ?`,
                    [goal.id]
                  );
                  
                  results.updated++;
                }
              } catch (error) {
                console.error(`Error syncing goal ${goal.id}:`, error);
                results.failed++;
                results.errors.push({
                  id: goal.id,
                  error: error.message || 'Unknown error'
                });
              }
            }
            
            resolve({ success: true, results });
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  } catch (error) {
    console.error('Error syncing goals:', error);
    return { success: false, error: error.message || 'Failed to sync goals' };
  }
};

/**
 * Synchronize all unsynced check-ins with the backend
 * @returns {Promise<Object>} - Promise with the synchronization results
 */
export const syncCheckins = async () => {
  // Check if we're connected to the internet
  const connected = await isConnected();
  if (!connected) {
    return { success: false, error: 'No internet connection' };
  }

  // Check if we're authenticated
  const token = await SecureStore.getItemAsync('userToken');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const db = getDatabase();
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    // Get all unsynced check-ins
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM checkins WHERE synced = 0',
          [],
          async (_, { rows }) => {
            const unsyncedCheckins = rows._array;
            
            if (unsyncedCheckins.length === 0) {
              resolve({ success: true, results, message: 'No check-ins to sync' });
              return;
            }
            
            // Process each unsynced check-in
            for (const checkin of unsyncedCheckins) {
              try {
                // Convert boolean values
                const checkinData = {
                  ...checkin,
                  completed: checkin.completed === 1
                };
                
                // If the check-in has a temporary ID (starts with 'temp_'), it's a new check-in
                if (checkin.id.startsWith('temp_')) {
                  // Skip check-ins with temporary goal IDs (they'll be handled after the goal is synced)
                  if (checkin.goal_id.startsWith('temp_')) {
                    continue;
                  }
                  
                  // Create the check-in on the backend
                  const { id, synced, ...checkinData } = checkin;
                  const response = await apiClient.post('/checkins', {
                    ...checkinData,
                    completed: checkinData.completed === 1
                  });
                  const newCheckin = response.data;
                  
                  // Update the local check-in with the new ID and mark as synced
                  tx.executeSql(
                    `UPDATE checkins SET 
                      id = ?, 
                      synced = 1
                    WHERE id = ?`,
                    [newCheckin.id, checkin.id]
                  );
                  
                  results.created++;
                } else {
                  // Update the check-in on the backend
                  const { id, synced, ...checkinData } = checkin;
                  await apiClient.put(`/checkins/${id}`, {
                    ...checkinData,
                    completed: checkinData.completed === 1
                  });
                  
                  // Mark the check-in as synced
                  tx.executeSql(
                    `UPDATE checkins SET 
                      synced = 1
                    WHERE id = ?`,
                    [checkin.id]
                  );
                  
                  results.updated++;
                }
              } catch (error) {
                console.error(`Error syncing check-in ${checkin.id}:`, error);
                results.failed++;
                results.errors.push({
                  id: checkin.id,
                  error: error.message || 'Unknown error'
                });
              }
            }
            
            resolve({ success: true, results });
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  } catch (error) {
    console.error('Error syncing check-ins:', error);
    return { success: false, error: error.message || 'Failed to sync check-ins' };
  }
};

/**
 * Synchronize all unsynced data with the backend
 * @returns {Promise<Object>} - Promise with the synchronization results
 */
export const syncAll = async () => {
  try {
    // First sync goals, then check-ins
    const goalsResult = await syncGoals();
    const checkinsResult = await syncCheckins();
    
    return {
      success: goalsResult.success && checkinsResult.success,
      goals: goalsResult.results,
      checkins: checkinsResult.results
    };
  } catch (error) {
    console.error('Error syncing all data:', error);
    return { success: false, error: error.message || 'Failed to sync data' };
  }
};

/**
 * Set up a network change listener to sync data when the device comes online
 * @returns {Function} - Function to unsubscribe the listener
 */
export const setupNetworkListener = () => {
  // Subscribe to network state changes
  const unsubscribe = NetInfo.addEventListener(state => {
    // If the device just came online, sync data
    if (state.isConnected && state.isInternetReachable) {
      console.log('Device is online, syncing data...');
      syncAll().then(result => {
        if (result.success) {
          console.log('Data synced successfully:', result);
        } else {
          console.error('Failed to sync data:', result.error);
        }
      });
    }
  });
  
  return unsubscribe;
};

export default {
  isConnected,
  syncGoals,
  syncCheckins,
  syncAll,
  setupNetworkListener
};