import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getFromStorage, saveToStorage } from './storage';

// Storage key for notification settings
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  reminderTime: '20:00', // Default reminder time (8:00 PM)
  days: [1, 2, 3, 4, 5, 6, 0], // All days of the week (0 = Sunday, 1 = Monday, etc.)
};

/**
 * Configure notification behavior
 */
export const configureNotifications = () => {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - Promise that resolves to true if permissions granted, false otherwise
 */
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    // This is running in an emulator/simulator
    console.log('Notifications are not supported in the emulator/simulator');
    return false;
  }

  // Check if we already have permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If we don't have permission, ask for it
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // If we still don't have permission, return false
  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  return true;
};

/**
 * Get notification settings
 * @returns {Promise<Object>} - Promise that resolves to notification settings
 */
export const getNotificationSettings = async () => {
  try {
    const settings = await getFromStorage(NOTIFICATION_SETTINGS_KEY);
    return settings || DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

/**
 * Save notification settings
 * @param {Object} settings - Notification settings
 * @returns {Promise<void>}
 */
export const saveNotificationSettings = async (settings) => {
  try {
    await saveToStorage(NOTIFICATION_SETTINGS_KEY, {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...settings,
    });
    
    // Update scheduled notifications
    await scheduleCheckInReminders();
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
};

/**
 * Enable or disable notifications
 * @param {boolean} enabled - Whether notifications should be enabled
 * @returns {Promise<void>}
 */
export const setNotificationsEnabled = async (enabled) => {
  try {
    const settings = await getNotificationSettings();
    await saveNotificationSettings({ ...settings, enabled });
  } catch (error) {
    console.error('Error setting notifications enabled:', error);
    throw error;
  }
};

/**
 * Set reminder time
 * @param {string} time - Reminder time in 24-hour format (HH:MM)
 * @returns {Promise<void>}
 */
export const setReminderTime = async (time) => {
  try {
    const settings = await getNotificationSettings();
    await saveNotificationSettings({ ...settings, reminderTime: time });
  } catch (error) {
    console.error('Error setting reminder time:', error);
    throw error;
  }
};

/**
 * Set reminder days
 * @param {Array<number>} days - Array of days (0 = Sunday, 1 = Monday, etc.)
 * @returns {Promise<void>}
 */
export const setReminderDays = async (days) => {
  try {
    const settings = await getNotificationSettings();
    await saveNotificationSettings({ ...settings, days });
  } catch (error) {
    console.error('Error setting reminder days:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 * @returns {Promise<void>}
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
    throw error;
  }
};

/**
 * Schedule daily check-in reminders
 * @returns {Promise<void>}
 */
export const scheduleCheckInReminders = async () => {
  try {
    // Get notification settings
    const settings = await getNotificationSettings();
    
    // If notifications are disabled, cancel all notifications and return
    if (!settings.enabled) {
      await cancelAllNotifications();
      return;
    }
    
    // Cancel existing notifications
    await cancelAllNotifications();
    
    // Parse reminder time
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    
    // Schedule notifications for each day
    for (const day of settings.days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to check in!',
          body: 'Don\'t forget to track your progress on your goals today.',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          weekday: day === 0 ? 7 : day, // Convert Sunday from 0 to 7 for Expo's format
          repeats: true,
        },
      });
    }
  } catch (error) {
    console.error('Error scheduling check-in reminders:', error);
    throw error;
  }
};

/**
 * Send an immediate notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<void>}
 */
export const sendImmediateNotification = async (title, body) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Null trigger means send immediately
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
    throw error;
  }
};

export default {
  configureNotifications,
  requestNotificationPermissions,
  getNotificationSettings,
  saveNotificationSettings,
  setNotificationsEnabled,
  setReminderTime,
  setReminderDays,
  cancelAllNotifications,
  scheduleCheckInReminders,
  sendImmediateNotification,
};