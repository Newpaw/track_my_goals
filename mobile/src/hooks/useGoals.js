import { useEffect, useState } from 'react';
import useGoalStore from '../store/goalStore';

/**
 * Custom hook for goals
 * Provides goals state and methods
 * @param {Object} options - Hook options
 * @param {boolean} options.autoFetch - Whether to automatically fetch goals on mount
 */
export const useGoals = ({ autoFetch = true } = {}) => {
  const {
    goals,
    currentGoal,
    isLoading,
    error,
    fetchGoals,
    fetchGoalById,
    addGoal,
    updateGoal,
    removeGoal,
    clearError
  } = useGoalStore();

  const [initialized, setInitialized] = useState(false);

  // Fetch goals on component mount if autoFetch is true
  useEffect(() => {
    if (autoFetch && !initialized) {
      fetchGoals().then(() => {
        setInitialized(true);
      });
    }
  }, [autoFetch, fetchGoals, initialized]);

  /**
   * Refresh goals data
   */
  const refreshGoals = async () => {
    return await fetchGoals(true);
  };

  /**
   * Get a goal by ID
   * @param {string} goalId - The ID of the goal to get
   */
  const getGoal = async (goalId) => {
    // First check if the goal is already in the store
    const foundGoal = goals.find(goal => goal.id === goalId);
    
    if (foundGoal && foundGoal === currentGoal) {
      return foundGoal;
    }
    
    // If not, fetch it
    const result = await fetchGoalById(goalId);
    return result.data;
  };

  return {
    // State
    goals,
    currentGoal,
    isLoading,
    error,
    
    // Methods
    fetchGoals,
    refreshGoals,
    getGoal,
    addGoal,
    updateGoal,
    removeGoal,
    clearError
  };
};

export default useGoals;