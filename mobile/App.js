import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, Button, StyleSheet } from 'react-native';
import Navigation from './src/navigation';
import { useAuth } from './src/hooks/useAuth';
import notificationUtils from './src/utils/notificationUtils';
import { initDatabase } from './src/utils/storage';
import { initApi } from './src/api';
import syncUtils from './src/utils/syncUtils';
import TestRunner from './src/tests/runTests';

export default function App() {
  const { isLoading, userToken } = useAuth();
  const [showTests, setShowTests] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);

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
        
        setAppInitialized(true);
        
        // Return cleanup function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
        setAppInitialized(true); // Still mark as initialized so we can show the test option
      }
    };
    
    initApp();
  }, []);

  if (isLoading || !appInitialized) {
    // We could show a loading screen here
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If we're showing tests, render the test runner
  if (showTests) {
    return (
      <SafeAreaProvider>
        <TestRunner />
        <View style={styles.backButtonContainer}>
          <Button title="Back to App" onPress={() => setShowTests(false)} />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // Otherwise render the normal app with a test button
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navigation userToken={userToken} />
        <View style={styles.testButtonContainer}>
          <Button 
            title="Run API Configuration Tests" 
            onPress={() => setShowTests(true)} 
          />
        </View>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    padding: 5,
  },
  backButtonContainer: {
    padding: 10,
  }
});