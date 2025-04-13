import { useEffect, useState } from 'react';
import useCheckinStore from '../store/checkinStore';

/**
 * Custom hook for check-ins
 * Provides check-ins state and methods for a specific goal
 * @param {Object} options - Hook options
 * @param {string} options.goalId - The ID of the goal to get check-ins for
 * @param {boolean} options.autoFetch - Whether to automatically fetch check-ins on mount
 * @param {boolean} options.fetchStats - Whether to fetch check-in statistics
 */
export const useCheckins = ({ goalId, autoFetch = true, fetchStats = true } = {}) => {
  const {
    checkins,
    stats,
    isLoading,
    error,
    fetchCheckins,
    fetchCheckinStats,
    addCheckin,
    updateCheckin,
    clearError
  } = useCheckinStore();

  const [initialized, setInitialized] = useState(false);

  // Fetch check-ins on component mount if autoFetch is true and goalId is provided
  useEffect(() => {
    if (autoFetch && goalId && !initialized) {
      const fetchData = async () => {
        await fetchCheckins(goalId);
        
        if (fetchStats) {
          await fetchCheckinStats(goalId);
        }
        
        setInitialized(true);
      };
      
      fetchData();
    }
  }, [autoFetch, fetchCheckins, fetchCheckinStats, fetchStats, goalId, initialized]);

  /**
   * Refresh check-ins data for the goal
   */
  const refreshCheckins = async () => {
    if (!goalId) return { success: false, error: 'No goal ID provided' };
    
    const result = await fetchCheckins(goalId, true);
    
    if (fetchStats) {
      await fetchCheckinStats(goalId);
    }
    
    return result;
  };

  /**
   * Create a new check-in for the goal
   * @param {Object} checkinData - The check-in data (without goal_id)
   */
  const createCheckin = async (checkinData) => {
    if (!goalId) return { success: false, error: 'No goal ID provided' };
    
    return await addCheckin({
      ...checkinData,
      goal_id: goalId
    });
  };

  /**
   * Get check-ins for the current goal
   */
  const getGoalCheckins = () => {
    return checkins[goalId] || [];
  };

  /**
   * Get statistics for the current goal
   */
  const getGoalStats = () => {
    return stats[goalId] || null;
  };

  return {
    // State
    checkins: getGoalCheckins(),
    stats: getGoalStats(),
    isLoading,
    error,
    
    // Methods
    fetchCheckins: () => fetchCheckins(goalId),
    fetchCheckinStats: () => fetchCheckinStats(goalId),
    refreshCheckins,
    createCheckin,
    updateCheckin,
    clearError
  };
};

export default useCheckins;