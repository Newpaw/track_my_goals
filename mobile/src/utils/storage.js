import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

// Database name
const DB_NAME = 'track_my_goals.db';

/**
 * Initialize the SQLite database
 * @returns {SQLite.WebSQLDatabase} - The database instance
 */
export const initDatabase = () => {
  const db = SQLite.openDatabase(DB_NAME);
  
  // Create tables if they don't exist
  db.transaction(tx => {
    // Goals table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        frequency TEXT,
        target_date TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );
    
    // Check-ins table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS checkins (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        completed INTEGER NOT NULL,
        notes TEXT,
        date TEXT NOT NULL,
        created_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (goal_id) REFERENCES goals (id)
      );`
    );
  });
  
  return db;
};

/**
 * Get the database instance
 * @returns {SQLite.WebSQLDatabase} - The database instance
 */
export const getDatabase = () => {
  return SQLite.openDatabase(DB_NAME);
};

/**
 * Save a value to secure storage
 * @param {string} key - The key to store the value under
 * @param {string} value - The value to store
 * @returns {Promise<void>}
 */
export const saveToSecureStore = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error saving to secure store:', error);
    throw error;
  }
};

/**
 * Get a value from secure storage
 * @param {string} key - The key to retrieve the value for
 * @returns {Promise<string|null>} - The retrieved value or null if not found
 */
export const getFromSecureStore = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error getting from secure store:', error);
    return null;
  }
};

/**
 * Delete a value from secure storage
 * @param {string} key - The key to delete
 * @returns {Promise<void>}
 */
export const deleteFromSecureStore = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error deleting from secure store:', error);
    throw error;
  }
};

/**
 * Save a value to AsyncStorage
 * @param {string} key - The key to store the value under
 * @param {any} value - The value to store (will be JSON stringified)
 * @returns {Promise<void>}
 */
export const saveToStorage = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error saving to storage:', error);
    throw error;
  }
};

/**
 * Get a value from AsyncStorage
 * @param {string} key - The key to retrieve the value for
 * @returns {Promise<any|null>} - The retrieved value or null if not found
 */
export const getFromStorage = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting from storage:', error);
    return null;
  }
};

/**
 * Delete a value from AsyncStorage
 * @param {string} key - The key to delete
 * @returns {Promise<void>}
 */
export const deleteFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting from storage:', error);
    throw error;
  }
};

export default {
  initDatabase,
  getDatabase,
  saveToSecureStore,
  getFromSecureStore,
  deleteFromSecureStore,
  saveToStorage,
  getFromStorage,
  deleteFromStorage,
};