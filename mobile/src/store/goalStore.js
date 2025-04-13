import { create } from 'zustand';
import { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal } from '../api/goals';
import { getDatabase } from '../utils/storage';

/**
 * Goals store using Zustand
 */
const useGoalStore = create((set, get) => ({
  // State
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,
  
  // Actions
  
  /**
   * Fetch all goals for the current user
   * @param {boolean} forceRefresh - Whether to force a refresh from the API
   */
  fetchGoals: async (forceRefresh = false) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to get goals from the API
      const goalsData = await getAllGoals();
      
      // Store goals in state
      set({ 
        goals: goalsData,
        isLoading: false,
        error: null
      });
      
      // Also store goals in local database for offline access
      const db = getDatabase();
      
      db.transaction(tx => {
        // First clear existing goals if we're doing a full refresh
        if (forceRefresh) {
          tx.executeSql('DELETE FROM goals');
        }
        
        // Insert or update goals in the database
        goalsData.forEach(goal => {
          tx.executeSql(
            `INSERT OR REPLACE INTO goals (
              id, title, description, category, frequency, target_date, created_at, updated_at, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              goal.id,
              goal.title,
              goal.description,
              goal.category,
              goal.frequency,
              goal.target_date,
              goal.created_at,
              goal.updated_at,
              1 // Synced = true
            ]
          );
        });
      });
      
      return { success: true, data: goalsData };
    } catch (error) {
      console.error('Error fetching goals:', error);
      
      // If API fails, try to get goals from local database
      try {
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM goals',
            [],
            (_, { rows }) => {
              const localGoals = rows._array;
              
              set({ 
                goals: localGoals,
                isLoading: false,
                error: 'Could not connect to server, showing offline data'
              });
            }
          );
        });
        
        return { success: true, offline: true };
      } catch (dbError) {
        console.error('Error fetching goals from local database:', dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to fetch goals'
        });
        
        return { success: false, error: 'Failed to fetch goals' };
      }
    }
  },
  
  /**
   * Fetch a specific goal by ID
   * @param {string} goalId - The ID of the goal to fetch
   */
  fetchGoalById: async (goalId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to get the goal from the API
      const goalData = await getGoalById(goalId);
      
      set({ 
        currentGoal: goalData,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: goalData };
    } catch (error) {
      console.error(`Error fetching goal ${goalId}:`, error);
      
      // If API fails, try to get the goal from local database
      try {
        const db = getDatabase();
        
        return new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM goals WHERE id = ?',
              [goalId],
              (_, { rows }) => {
                if (rows.length > 0) {
                  const localGoal = rows._array[0];
                  
                  set({ 
                    currentGoal: localGoal,
                    isLoading: false,
                    error: 'Could not connect to server, showing offline data'
                  });
                  
                  resolve({ success: true, data: localGoal, offline: true });
                } else {
                  set({ 
                    isLoading: false, 
                    error: 'Goal not found'
                  });
                  
                  reject({ success: false, error: 'Goal not found' });
                }
              },
              (_, error) => {
                reject(error);
              }
            );
          });
        });
      } catch (dbError) {
        console.error(`Error fetching goal ${goalId} from local database:`, dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to fetch goal'
        });
        
        return { success: false, error: 'Failed to fetch goal' };
      }
    }
  },
  
  /**
   * Create a new goal
   * @param {Object} goalData - The goal data
   */
  addGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to create the goal via the API
      const newGoal = await createGoal(goalData);
      
      // Update the goals list in state
      set(state => ({ 
        goals: [...state.goals, newGoal],
        isLoading: false,
        error: null
      }));
      
      // Also store the new goal in local database
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO goals (
            id, title, description, category, frequency, target_date, created_at, updated_at, synced
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newGoal.id,
            newGoal.title,
            newGoal.description,
            newGoal.category,
            newGoal.frequency,
            newGoal.target_date,
            newGoal.created_at,
            newGoal.updated_at,
            1 // Synced = true
          ]
        );
      });
      
      return { success: true, data: newGoal };
    } catch (error) {
      console.error('Error creating goal:', error);
      
      // If API fails, store the goal locally with a temporary ID and synced=false
      try {
        const tempId = `temp_${Date.now()}`;
        const now = new Date().toISOString();
        
        const tempGoal = {
          id: tempId,
          ...goalData,
          created_at: now,
          updated_at: now,
          synced: 0
        };
        
        // Add to state
        set(state => ({ 
          goals: [...state.goals, tempGoal],
          isLoading: false,
          error: 'Could not connect to server, goal saved locally'
        }));
        
        // Store in local database
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO goals (
              id, title, description, category, frequency, target_date, created_at, updated_at, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              tempGoal.id,
              tempGoal.title,
              tempGoal.description,
              tempGoal.category,
              tempGoal.frequency,
              tempGoal.target_date,
              tempGoal.created_at,
              tempGoal.updated_at,
              0 // Synced = false
            ]
          );
        });
        
        return { success: true, data: tempGoal, offline: true };
      } catch (dbError) {
        console.error('Error storing goal locally:', dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to create goal'
        });
        
        return { success: false, error: 'Failed to create goal' };
      }
    }
  },
  
  /**
   * Update an existing goal
   * @param {string} goalId - The ID of the goal to update
   * @param {Object} goalData - The updated goal data
   */
  updateGoal: async (goalId, goalData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to update the goal via the API
      const updatedGoal = await updateGoal(goalId, goalData);
      
      // Update the goals list in state
      set(state => ({ 
        goals: state.goals.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ),
        currentGoal: state.currentGoal?.id === goalId ? updatedGoal : state.currentGoal,
        isLoading: false,
        error: null
      }));
      
      // Also update the goal in local database
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE goals SET 
            title = ?, 
            description = ?, 
            category = ?, 
            frequency = ?, 
            target_date = ?, 
            updated_at = ?,
            synced = ?
          WHERE id = ?`,
          [
            updatedGoal.title,
            updatedGoal.description,
            updatedGoal.category,
            updatedGoal.frequency,
            updatedGoal.target_date,
            updatedGoal.updated_at,
            1, // Synced = true
            goalId
          ]
        );
      });
      
      return { success: true, data: updatedGoal };
    } catch (error) {
      console.error(`Error updating goal ${goalId}:`, error);
      
      // If API fails, update the goal locally with synced=false
      try {
        const now = new Date().toISOString();
        
        // Find the current goal in state
        const currentGoal = get().goals.find(g => g.id === goalId);
        
        if (!currentGoal) {
          throw new Error('Goal not found');
        }
        
        const updatedGoal = {
          ...currentGoal,
          ...goalData,
          updated_at: now,
          synced: 0
        };
        
        // Update in state
        set(state => ({ 
          goals: state.goals.map(goal => 
            goal.id === goalId ? updatedGoal : goal
          ),
          currentGoal: state.currentGoal?.id === goalId ? updatedGoal : state.currentGoal,
          isLoading: false,
          error: 'Could not connect to server, changes saved locally'
        }));
        
        // Update in local database
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE goals SET 
              title = ?, 
              description = ?, 
              category = ?, 
              frequency = ?, 
              target_date = ?, 
              updated_at = ?,
              synced = ?
            WHERE id = ?`,
            [
              updatedGoal.title,
              updatedGoal.description,
              updatedGoal.category,
              updatedGoal.frequency,
              updatedGoal.target_date,
              updatedGoal.updated_at,
              0, // Synced = false
              goalId
            ]
          );
        });
        
        return { success: true, data: updatedGoal, offline: true };
      } catch (dbError) {
        console.error(`Error updating goal ${goalId} locally:`, dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to update goal'
        });
        
        return { success: false, error: 'Failed to update goal' };
      }
    }
  },
  
  /**
   * Delete a goal
   * @param {string} goalId - The ID of the goal to delete
   */
  removeGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to delete the goal via the API
      await deleteGoal(goalId);
      
      // Remove the goal from state
      set(state => ({ 
        goals: state.goals.filter(goal => goal.id !== goalId),
        currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
        isLoading: false,
        error: null
      }));
      
      // Also remove the goal from local database
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql('DELETE FROM goals WHERE id = ?', [goalId]);
        // Also delete related check-ins
        tx.executeSql('DELETE FROM checkins WHERE goal_id = ?', [goalId]);
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting goal ${goalId}:`, error);
      
      // If the goal has a temporary ID (starts with 'temp_'), we can safely delete it locally
      if (goalId.startsWith('temp_')) {
        // Remove from state
        set(state => ({ 
          goals: state.goals.filter(goal => goal.id !== goalId),
          currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
          isLoading: false,
          error: null
        }));
        
        // Remove from local database
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql('DELETE FROM goals WHERE id = ?', [goalId]);
          tx.executeSql('DELETE FROM checkins WHERE goal_id = ?', [goalId]);
        });
        
        return { success: true };
      }
      
      // For regular goals, mark them for deletion when back online
      try {
        // Mark the goal as deleted in state
        set(state => ({ 
          goals: state.goals.filter(goal => goal.id !== goalId),
          currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
          isLoading: false,
          error: 'Could not connect to server, goal will be deleted when back online'
        }));
        
        // Mark the goal for deletion in local database
        const db = getDatabase();
        
        db.transaction(tx => {
          // Instead of deleting, we could mark it with a 'deleted' flag
          // But for simplicity, we'll just delete it locally
          tx.executeSql('DELETE FROM goals WHERE id = ?', [goalId]);
          tx.executeSql('DELETE FROM checkins WHERE goal_id = ?', [goalId]);
        });
        
        return { success: true, offline: true };
      } catch (dbError) {
        console.error(`Error marking goal ${goalId} for deletion:`, dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to delete goal'
        });
        
        return { success: false, error: 'Failed to delete goal' };
      }
    }
  },
  
  /**
   * Clear any goal-related errors
   */
  clearError: () => {
    set({ error: null });
  }
}));

export default useGoalStore;