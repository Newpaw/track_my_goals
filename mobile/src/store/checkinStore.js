import { create } from 'zustand';
import { createCheckin, getCheckinsByGoalId, getCheckinStats, updateCheckin } from '../api/checkins';
import { getDatabase } from '../utils/storage';

/**
 * Check-ins store using Zustand
 */
const useCheckinStore = create((set, get) => ({
  // State
  checkins: {},  // Object with goalId as key and array of check-ins as value
  stats: {},     // Object with goalId as key and stats object as value
  isLoading: false,
  error: null,
  
  // Actions
  
  /**
   * Fetch all check-ins for a specific goal
   * @param {string} goalId - The ID of the goal to fetch check-ins for
   * @param {boolean} forceRefresh - Whether to force a refresh from the API
   */
  fetchCheckins: async (goalId, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to get check-ins from the API
      const checkinsData = await getCheckinsByGoalId(goalId);
      
      // Store check-ins in state
      set(state => ({ 
        checkins: {
          ...state.checkins,
          [goalId]: checkinsData
        },
        isLoading: false,
        error: null
      }));
      
      // Also store check-ins in local database for offline access
      const db = getDatabase();
      
      db.transaction(tx => {
        // First clear existing check-ins for this goal if we're doing a full refresh
        if (forceRefresh) {
          tx.executeSql('DELETE FROM checkins WHERE goal_id = ?', [goalId]);
        }
        
        // Insert or update check-ins in the database
        checkinsData.forEach(checkin => {
          tx.executeSql(
            `INSERT OR REPLACE INTO checkins (
              id, goal_id, completed, notes, date, created_at, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              checkin.id,
              checkin.goal_id,
              checkin.completed ? 1 : 0,
              checkin.notes,
              checkin.date,
              checkin.created_at,
              1 // Synced = true
            ]
          );
        });
      });
      
      return { success: true, data: checkinsData };
    } catch (error) {
      console.error(`Error fetching check-ins for goal ${goalId}:`, error);
      
      // If API fails, try to get check-ins from local database
      try {
        const db = getDatabase();
        
        return new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM checkins WHERE goal_id = ? ORDER BY date DESC',
              [goalId],
              (_, { rows }) => {
                const localCheckins = rows._array.map(row => ({
                  ...row,
                  completed: row.completed === 1
                }));
                
                set(state => ({ 
                  checkins: {
                    ...state.checkins,
                    [goalId]: localCheckins
                  },
                  isLoading: false,
                  error: 'Could not connect to server, showing offline data'
                }));
                
                resolve({ success: true, data: localCheckins, offline: true });
              },
              (_, error) => {
                reject(error);
              }
            );
          });
        });
      } catch (dbError) {
        console.error(`Error fetching check-ins for goal ${goalId} from local database:`, dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to fetch check-ins'
        });
        
        return { success: false, error: 'Failed to fetch check-ins' };
      }
    }
  },
  
  /**
   * Fetch check-in statistics for a specific goal
   * @param {string} goalId - The ID of the goal to fetch statistics for
   */
  fetchCheckinStats: async (goalId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to get stats from the API
      const statsData = await getCheckinStats(goalId);
      
      // Store stats in state
      set(state => ({ 
        stats: {
          ...state.stats,
          [goalId]: statsData
        },
        isLoading: false,
        error: null
      }));
      
      return { success: true, data: statsData };
    } catch (error) {
      console.error(`Error fetching check-in stats for goal ${goalId}:`, error);
      
      // If API fails, calculate stats from local check-ins
      try {
        // Get local check-ins for this goal
        const goalCheckins = get().checkins[goalId] || [];
        
        if (goalCheckins.length === 0) {
          // Try to fetch from local database first
          await get().fetchCheckins(goalId);
        }
        
        const updatedGoalCheckins = get().checkins[goalId] || [];
        
        // Calculate basic stats
        const totalCheckins = updatedGoalCheckins.length;
        const completedCheckins = updatedGoalCheckins.filter(c => c.completed).length;
        const completionRate = totalCheckins > 0 ? (completedCheckins / totalCheckins) * 100 : 0;
        
        // Calculate current streak
        let currentStreak = 0;
        const sortedCheckins = [...updatedGoalCheckins].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        for (const checkin of sortedCheckins) {
          if (checkin.completed) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        const statsData = {
          total_checkins: totalCheckins,
          completed_checkins: completedCheckins,
          completion_rate: completionRate,
          current_streak: currentStreak,
          // We can't calculate longest streak accurately without all historical data
          longest_streak: currentStreak,
          // This is a simplified version of the stats
          calculated_locally: true
        };
        
        set(state => ({ 
          stats: {
            ...state.stats,
            [goalId]: statsData
          },
          isLoading: false,
          error: 'Could not connect to server, showing calculated stats'
        }));
        
        return { success: true, data: statsData, offline: true };
      } catch (calcError) {
        console.error(`Error calculating check-in stats for goal ${goalId}:`, calcError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to fetch check-in statistics'
        });
        
        return { success: false, error: 'Failed to fetch check-in statistics' };
      }
    }
  },
  
  /**
   * Create a new check-in
   * @param {Object} checkinData - The check-in data
   */
  addCheckin: async (checkinData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to create the check-in via the API
      const newCheckin = await createCheckin(checkinData);
      const goalId = newCheckin.goal_id;
      
      // Update the check-ins list in state
      set(state => {
        const goalCheckins = state.checkins[goalId] || [];
        
        return { 
          checkins: {
            ...state.checkins,
            [goalId]: [...goalCheckins, newCheckin]
          },
          isLoading: false,
          error: null
        };
      });
      
      // Also store the new check-in in local database
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO checkins (
            id, goal_id, completed, notes, date, created_at, synced
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newCheckin.id,
            newCheckin.goal_id,
            newCheckin.completed ? 1 : 0,
            newCheckin.notes,
            newCheckin.date,
            newCheckin.created_at,
            1 // Synced = true
          ]
        );
      });
      
      // Refresh stats for this goal
      await get().fetchCheckinStats(goalId);
      
      return { success: true, data: newCheckin };
    } catch (error) {
      console.error('Error creating check-in:', error);
      
      // If API fails, store the check-in locally with a temporary ID and synced=false
      try {
        const tempId = `temp_${Date.now()}`;
        const now = new Date().toISOString();
        const goalId = checkinData.goal_id;
        
        const tempCheckin = {
          id: tempId,
          ...checkinData,
          created_at: now,
          synced: 0
        };
        
        // Add to state
        set(state => {
          const goalCheckins = state.checkins[goalId] || [];
          
          return { 
            checkins: {
              ...state.checkins,
              [goalId]: [...goalCheckins, tempCheckin]
            },
            isLoading: false,
            error: 'Could not connect to server, check-in saved locally'
          };
        });
        
        // Store in local database
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO checkins (
              id, goal_id, completed, notes, date, created_at, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              tempCheckin.id,
              tempCheckin.goal_id,
              tempCheckin.completed ? 1 : 0,
              tempCheckin.notes,
              tempCheckin.date,
              tempCheckin.created_at,
              0 // Synced = false
            ]
          );
        });
        
        // Update local stats
        try {
          await get().fetchCheckinStats(goalId);
        } catch (statsError) {
          console.error('Error updating stats after offline check-in:', statsError);
        }
        
        return { success: true, data: tempCheckin, offline: true };
      } catch (dbError) {
        console.error('Error storing check-in locally:', dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to create check-in'
        });
        
        return { success: false, error: 'Failed to create check-in' };
      }
    }
  },
  
  /**
   * Update an existing check-in
   * @param {string} checkinId - The ID of the check-in to update
   * @param {Object} checkinData - The updated check-in data
   */
  updateCheckin: async (checkinId, checkinData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to update the check-in via the API
      const updatedCheckin = await updateCheckin(checkinId, checkinData);
      const goalId = updatedCheckin.goal_id;
      
      // Update the check-ins list in state
      set(state => {
        const goalCheckins = state.checkins[goalId] || [];
        
        return { 
          checkins: {
            ...state.checkins,
            [goalId]: goalCheckins.map(checkin => 
              checkin.id === checkinId ? updatedCheckin : checkin
            )
          },
          isLoading: false,
          error: null
        };
      });
      
      // Also update the check-in in local database
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE checkins SET 
            completed = ?, 
            notes = ?, 
            synced = ?
          WHERE id = ?`,
          [
            updatedCheckin.completed ? 1 : 0,
            updatedCheckin.notes,
            1, // Synced = true
            checkinId
          ]
        );
      });
      
      // Refresh stats for this goal
      await get().fetchCheckinStats(goalId);
      
      return { success: true, data: updatedCheckin };
    } catch (error) {
      console.error(`Error updating check-in ${checkinId}:`, error);
      
      // If API fails, update the check-in locally with synced=false
      try {
        // Find the current check-in and its goal ID
        let goalId = null;
        let currentCheckin = null;
        
        Object.entries(get().checkins).forEach(([gId, checkins]) => {
          const found = checkins.find(c => c.id === checkinId);
          if (found) {
            goalId = gId;
            currentCheckin = found;
          }
        });
        
        if (!currentCheckin || !goalId) {
          throw new Error('Check-in not found');
        }
        
        const updatedCheckin = {
          ...currentCheckin,
          ...checkinData,
          synced: 0
        };
        
        // Update in state
        set(state => {
          const goalCheckins = state.checkins[goalId] || [];
          
          return { 
            checkins: {
              ...state.checkins,
              [goalId]: goalCheckins.map(checkin => 
                checkin.id === checkinId ? updatedCheckin : checkin
              )
            },
            isLoading: false,
            error: 'Could not connect to server, changes saved locally'
          };
        });
        
        // Update in local database
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE checkins SET 
              completed = ?, 
              notes = ?, 
              synced = ?
            WHERE id = ?`,
            [
              updatedCheckin.completed ? 1 : 0,
              updatedCheckin.notes,
              0, // Synced = false
              checkinId
            ]
          );
        });
        
        // Update local stats
        try {
          await get().fetchCheckinStats(goalId);
        } catch (statsError) {
          console.error('Error updating stats after offline check-in update:', statsError);
        }
        
        return { success: true, data: updatedCheckin, offline: true };
      } catch (dbError) {
        console.error(`Error updating check-in ${checkinId} locally:`, dbError);
        
        set({ 
          isLoading: false, 
          error: 'Failed to update check-in'
        });
        
        return { success: false, error: 'Failed to update check-in' };
      }
    }
  },
  
  /**
   * Clear any check-in-related errors
   */
  clearError: () => {
    set({ error: null });
  }
}));

export default useCheckinStore;