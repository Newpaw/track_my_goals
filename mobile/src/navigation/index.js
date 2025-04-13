import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

/**
 * Root navigation component
 * Handles switching between auth and main app flows based on authentication state
 * @param {Object} props - Component props
 * @param {string} props.userToken - User authentication token
 */
const Navigation = ({ userToken }) => {
  return (
    userToken ? <MainNavigator /> : <AuthNavigator />
  );
};

export default Navigation;