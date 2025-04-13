import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  TimePickerAndroid,
  Platform
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useAuth } from '../../hooks/useAuth';
import { useGoals } from '../../hooks/useGoals';
import { getDatabase, initDatabase, getFromStorage, saveToStorage } from '../../utils/storage';
import colors from '../../constants/colors';
import syncUtils from '../../utils/syncUtils';
import notificationUtils from '../../utils/notificationUtils';

/**
 * Profile screen component
 */
const ProfileScreen = () => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledScrollView = styled(ScrollView);
  const StyledSwitch = styled(Switch);
  
  // Hooks
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const { goals, isLoading: isGoalsLoading } = useGoals();
  
  // State
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [notificationTime, setNotificationTime] = useState('20:00');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Calculate user stats
  useEffect(() => {
    if (goals && goals.length > 0) {
      calculateStats();
    } else {
      setStats({
        totalGoals: 0,
        completedGoals: 0,
        inProgressGoals: 0,
        completionRate: 0,
        streakGoals: 0
      });
      setIsStatsLoading(false);
    }
  }, [goals]);
  
  // Load notification settings on mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const settings = await notificationUtils.getNotificationSettings();
        setIsNotificationsEnabled(settings.enabled);
        setNotificationTime(settings.reminderTime);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    
    loadNotificationSettings();
  }, []);
  
  // Calculate user stats from goals
  const calculateStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.completion_rate >= 100).length;
    const inProgressGoals = totalGoals - completedGoals;
    const completionRate = totalGoals > 0 
      ? Math.round((completedGoals / totalGoals) * 100) 
      : 0;
    const streakGoals = goals.filter(goal => goal.current_streak > 0).length;
    
    setStats({
      totalGoals,
      completedGoals,
      inProgressGoals,
      completionRate,
      streakGoals
    });
    
    setIsStatsLoading(false);
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };
  
  // Handle clear local data
  const handleClearLocalData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will delete all locally stored data. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase();
              
              db.transaction(tx => {
                tx.executeSql('DELETE FROM goals');
                tx.executeSql('DELETE FROM checkins');
              });
              
              // Re-initialize the database
              initDatabase();
              
              Alert.alert('Success', 'Local data has been cleared.');
            } catch (error) {
              console.error('Error clearing local data:', error);
              Alert.alert('Error', 'Failed to clear local data.');
            }
          }
        }
      ]
    );
  };
  
  // Handle sync data
  const handleSyncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('Syncing data...');
    
    try {
      const isConnected = await syncUtils.isConnected();
      
      if (!isConnected) {
        Alert.alert('Error', 'No internet connection. Please try again when you\'re online.');
        setIsSyncing(false);
        setSyncStatus(null);
        return;
      }
      
      const result = await syncUtils.syncAll();
      
      if (result.success) {
        const totalSynced =
          (result.goals?.created || 0) +
          (result.goals?.updated || 0) +
          (result.checkins?.created || 0) +
          (result.checkins?.updated || 0);
        
        if (totalSynced > 0) {
          setSyncStatus(`Successfully synced ${totalSynced} items`);
          Alert.alert('Success', `Successfully synced ${totalSynced} items`);
        } else {
          setSyncStatus('No items to sync');
          Alert.alert('Success', 'All data is already synced');
        }
      } else {
        setSyncStatus('Sync failed');
        Alert.alert('Error', result.error || 'Failed to sync data');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncStatus('Sync failed');
      Alert.alert('Error', 'An unexpected error occurred while syncing data');
    } finally {
      setIsSyncing(false);
      // Clear status after 3 seconds
      setTimeout(() => {
        setSyncStatus(null);
      }, 3000);
    }
  };
  
  // Handle toggle offline mode
  const handleToggleOfflineMode = (value) => {
    setIsOfflineEnabled(value);
    // You could implement additional logic here if needed
  };
  
  // Handle toggle notifications
  const handleToggleNotifications = async (value) => {
    try {
      setIsNotificationsEnabled(value);
      await notificationUtils.setNotificationsEnabled(value);
      
      if (value) {
        // Request permissions if enabling notifications
        const hasPermission = await notificationUtils.requestNotificationPermissions();
        
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Notifications require permission. Please enable notifications in your device settings.'
          );
          setIsNotificationsEnabled(false);
          return;
        }
        
        // Schedule notifications
        await notificationUtils.scheduleCheckInReminders();
      } else {
        // Cancel all notifications if disabling
        await notificationUtils.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };
  
  // Handle notification time change
  const handleNotificationTimeChange = async (time) => {
    try {
      setNotificationTime(time);
      await notificationUtils.setReminderTime(time);
      
      if (isNotificationsEnabled) {
        await notificationUtils.scheduleCheckInReminders();
      }
    } catch (error) {
      console.error('Error setting notification time:', error);
      Alert.alert('Error', 'Failed to update notification time');
    }
  };
  
  // Show notification settings
  const showNotificationSettings = () => {
    setShowNotificationModal(true);
  };
  
  // Render loading state
  if (isAuthLoading && !user) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <StyledText className="text-gray-500 mt-4">Loading profile...</StyledText>
      </StyledView>
    );
  }
  
  return (
    <StyledScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <StyledView className="bg-primary-500 pt-6 pb-8 px-4 items-center">
        <StyledView className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
          <Ionicons name="person" size={48} color={colors.primary.DEFAULT} />
        </StyledView>
        
        <StyledText className="text-2xl font-bold text-white">
          {user?.username || 'User'}
        </StyledText>
        
        <StyledText className="text-primary-100 mt-1">
          {user?.email || 'user@example.com'}
        </StyledText>
      </StyledView>
      
      {/* Stats */}
      <StyledView className="px-4 -mt-4">
        <Card className="mb-4">
          <StyledText className="text-lg font-bold text-gray-800 mb-3">
            Your Progress
          </StyledText>
          
          {isStatsLoading || isGoalsLoading ? (
            <StyledView className="items-center py-4">
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              <StyledText className="text-gray-500 mt-2">Loading stats...</StyledText>
            </StyledView>
          ) : (
            <StyledView>
              <StyledView className="flex-row flex-wrap">
                <StyledView className="w-1/2 pr-2 mb-2">
                  <StyledView className="bg-gray-50 p-3 rounded-lg">
                    <StyledText className="text-gray-500 text-sm">Total Goals</StyledText>
                    <StyledText className="text-xl font-bold text-gray-800">
                      {stats?.totalGoals || 0}
                    </StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="w-1/2 pl-2 mb-2">
                  <StyledView className="bg-gray-50 p-3 rounded-lg">
                    <StyledText className="text-gray-500 text-sm">Completed</StyledText>
                    <StyledText className="text-xl font-bold text-green-600">
                      {stats?.completedGoals || 0}
                    </StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="w-1/2 pr-2">
                  <StyledView className="bg-gray-50 p-3 rounded-lg">
                    <StyledText className="text-gray-500 text-sm">In Progress</StyledText>
                    <StyledText className="text-xl font-bold text-primary-600">
                      {stats?.inProgressGoals || 0}
                    </StyledText>
                  </StyledView>
                </StyledView>
                
                <StyledView className="w-1/2 pl-2">
                  <StyledView className="bg-gray-50 p-3 rounded-lg">
                    <StyledText className="text-gray-500 text-sm">Active Streaks</StyledText>
                    <StyledText className="text-xl font-bold text-yellow-600">
                      {stats?.streakGoals || 0}
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
              
              {stats?.totalGoals > 0 && (
                <StyledView className="mt-4">
                  <StyledText className="text-gray-500 text-sm mb-1">
                    Overall Completion Rate
                  </StyledText>
                  <StyledView className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <StyledView 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${stats?.completionRate || 0}%`,
                        backgroundColor: colors.success
                      }}
                    />
                  </StyledView>
                  <StyledText className="text-xs text-gray-500 mt-1 text-right">
                    {stats?.completionRate || 0}%
                  </StyledText>
                </StyledView>
              )}
            </StyledView>
          )}
        </Card>
      </StyledView>
      
      {/* Settings */}
      <StyledView className="px-4">
        <StyledText className="text-lg font-bold text-gray-800 mb-3">
          Settings
        </StyledText>
        
        <Card className="mb-4">
          <StyledView className="divide-y divide-gray-100">
            {/* Offline Mode */}
            <StyledView className="flex-row justify-between items-center py-3">
              <StyledView className="flex-row items-center">
                <Ionicons name="cloud-offline-outline" size={22} color={colors.gray[700]} />
                <StyledText className="text-gray-800 ml-3">Offline Mode</StyledText>
              </StyledView>
              <StyledSwitch
                value={isOfflineEnabled}
                onValueChange={handleToggleOfflineMode}
                trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                thumbColor={isOfflineEnabled ? colors.primary.DEFAULT : colors.gray[100]}
              />
            </StyledView>
            
            {/* Sync Data */}
            <StyledTouchableOpacity
              className="flex-row justify-between items-center py-3"
              onPress={handleSyncData}
              disabled={isSyncing}
            >
              <StyledView className="flex-row items-center">
                <Ionicons name="sync-outline" size={22} color={colors.gray[700]} />
                <StyledText className="text-gray-800 ml-3">Sync Data</StyledText>
              </StyledView>
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              ) : (
                syncStatus && (
                  <StyledText className="text-xs text-gray-500">{syncStatus}</StyledText>
                )
              )}
            </StyledTouchableOpacity>
            
            {/* Dark Mode */}
            <StyledView className="flex-row justify-between items-center py-3">
              <StyledView className="flex-row items-center">
                <Ionicons name="moon-outline" size={22} color={colors.gray[700]} />
                <StyledText className="text-gray-800 ml-3">Dark Mode</StyledText>
              </StyledView>
              <StyledSwitch
                value={isDarkModeEnabled}
                onValueChange={setIsDarkModeEnabled}
                trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                thumbColor={isDarkModeEnabled ? colors.primary.DEFAULT : colors.gray[100]}
              />
            </StyledView>
            
            {/* Notifications */}
            <StyledView className="flex-row justify-between items-center py-3">
              <StyledView className="flex-row items-center">
                <Ionicons name="notifications-outline" size={22} color={colors.gray[700]} />
                <StyledText className="text-gray-800 ml-3">Notifications</StyledText>
              </StyledView>
              <StyledSwitch
                value={isNotificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                thumbColor={isNotificationsEnabled ? colors.primary.DEFAULT : colors.gray[100]}
              />
            </StyledView>
            
            {/* Notification Settings */}
            {isNotificationsEnabled && (
              <StyledTouchableOpacity
                className="flex-row justify-between items-center py-3"
                onPress={showNotificationSettings}
              >
                <StyledView className="flex-row items-center">
                  <Ionicons name="time-outline" size={22} color={colors.gray[700]} />
                  <StyledText className="text-gray-800 ml-3">Reminder Time</StyledText>
                </StyledView>
                <StyledText className="text-gray-500">{notificationTime}</StyledText>
              </StyledTouchableOpacity>
            )}
            
            {/* Clear Local Data */}
            <StyledTouchableOpacity
              className="flex-row items-center py-3"
              onPress={handleClearLocalData}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <StyledText className="text-red-500 ml-3">Clear Local Data</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </Card>
        
        {/* About */}
        <Card className="mb-4">
          <StyledView className="divide-y divide-gray-100">
            <StyledTouchableOpacity className="flex-row items-center py-3">
              <Ionicons name="information-circle-outline" size={22} color={colors.gray[700]} />
              <StyledText className="text-gray-800 ml-3">About</StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity className="flex-row items-center py-3">
              <Ionicons name="help-circle-outline" size={22} color={colors.gray[700]} />
              <StyledText className="text-gray-800 ml-3">Help & Support</StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity className="flex-row items-center py-3">
              <Ionicons name="document-text-outline" size={22} color={colors.gray[700]} />
              <StyledText className="text-gray-800 ml-3">Privacy Policy</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </Card>
        
        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          className="mb-8"
        />
        
        {/* App Version */}
        <StyledView className="items-center mb-8">
          <StyledText className="text-gray-400 text-sm">
            Track My Goals v1.0.0
          </StyledText>
        </StyledView>
      </StyledView>
      
      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <StyledView className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <StyledView className="bg-white rounded-lg w-4/5 p-4">
            <StyledText className="text-lg font-bold text-gray-800 mb-4">
              Notification Settings
            </StyledText>
            
            <StyledView className="mb-4">
              <StyledText className="text-gray-700 mb-2">Reminder Time</StyledText>
              <StyledTouchableOpacity
                className="border border-gray-300 rounded-lg p-3"
                onPress={async () => {
                  try {
                    // This is a simplified version since we can't actually implement the time picker
                    // In a real app, you would use a proper time picker component
                    const newTime = prompt('Enter time (HH:MM)', notificationTime);
                    if (newTime) {
                      handleNotificationTimeChange(newTime);
                    }
                  } catch (error) {
                    console.error('Error setting time:', error);
                  }
                }}
              >
                <StyledText className="text-gray-800">{notificationTime}</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
            
            <StyledView className="flex-row justify-end">
              <Button
                title="Close"
                onPress={() => setShowNotificationModal(false)}
                variant="outline"
                className="mr-2"
              />
              <Button
                title="Save"
                onPress={() => {
                  notificationUtils.scheduleCheckInReminders();
                  setShowNotificationModal(false);
                }}
              />
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>
      
    </StyledScrollView>
  );
};

export default ProfileScreen;