import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

/**
 * Custom hook for authentication
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const {
    user,
    userToken,
    isLoading,
    isAuthenticated,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    clearError
  } = useAuthStore();

  // Initialize auth state on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    user,
    userToken,
    isLoading,
    isAuthenticated,
    error,
    
    // Methods
    signIn,
    signUp,
    signOut,
    clearError
  };
};

export default useAuth;