import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation';
import { useAuth } from './src/hooks/useAuth';
import notificationUtils from './src/utils/notificationUtils';
import { initDatabase } from './src/utils/storage';
import { initApi } from './src/api';
import syncUtils from './src/utils/syncUtils';

export default function App() {
  const { isLoading, userToken } = useAuth();

  // Initialize app on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database
        initDatabase();
        
        // Initialize API
        await initApi();
        
        // Configure notifications
        notificationUtils.configureNotifications();
        
        // Request notification permissions
        await notificationUtils.requestNotificationPermissions();
        
        // Schedule notifications based on saved settings
        const settings = await notificationUtils.getNotificationSettings();
        if (settings.enabled) {
          await notificationUtils.scheduleCheckInReminders();
        }
        
        // Set up network change listener for sync
        const unsubscribe = syncUtils.setupNetworkListener();
        
        // Return cleanup function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initApp();
  }, []);

  if (isLoading) {
    // We could show a loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navigation userToken={userToken} />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}