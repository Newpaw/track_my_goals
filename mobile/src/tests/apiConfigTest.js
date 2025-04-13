import Constants from 'expo-constants';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import apiClient, { getApiUrl, toggleMockApi, isConnected } from '../api/index';

// Mock console.log for testing
const originalConsoleLog = console.log;
let consoleOutput = [];
console.log = (...args) => {
  consoleOutput.push(args.join(' '));
  originalConsoleLog(...args);
};

// Test functions
const runTests = async () => {
  console.log('=== API Configuration Tests ===');
  
  // Test 1: Mock API Configuration
  console.log('\n1. Testing Mock API Configuration:');
  testMockApiConfiguration();
  
  // Test 2: API URL Configuration
  console.log('\n2. Testing API URL Configuration:');
  testApiUrlConfiguration();
  
  // Test 3: Toggle Mock API
  console.log('\n3. Testing Toggle Mock API:');
  await testToggleMockApi();
  
  // Test 4: Network Connectivity
  console.log('\n4. Testing Network Connectivity:');
  await testNetworkConnectivity();
  
  // Restore console.log
  console.log = originalConsoleLog;
  
  console.log('\n=== Tests Complete ===');
};

// Test Mock API Configuration
const testMockApiConfiguration = () => {
  // Check if Constants is properly imported
  console.log('- Constants available:', Constants !== undefined);
  
  // Check if expoConfig is available
  console.log('- expoConfig available:', Constants.expoConfig !== undefined);
  
  // Check if extra is available
  console.log('- extra available:', Constants.expoConfig?.extra !== undefined);
  
  // Check useMockApi setting
  console.log('- useMockApi setting:', Constants.expoConfig?.extra?.useMockApi);
  
  // Check if __DEV__ is defined
  console.log('- __DEV__ defined:', typeof __DEV__ !== 'undefined');
  console.log('- __DEV__ value:', __DEV__);
  
  // Expected behavior: In development, should default to true if not set in app.json
  const expectedMockApi = Constants.expoConfig?.extra?.useMockApi !== undefined 
    ? Constants.expoConfig?.extra?.useMockApi 
    : (__DEV__ ? true : false);
  
  console.log('- Expected mock API setting:', expectedMockApi);
};

// Test API URL Configuration
const testApiUrlConfiguration = () => {
  // Get the API URL
  const apiUrl = getApiUrl();
  console.log('- API URL:', apiUrl);
  
  // Check if customApiUrl is set
  console.log('- Custom API URL setting:', Constants.expoConfig?.extra?.apiUrl);
  
  // Expected URL based on platform
  let expectedUrl;
  if (Constants.expoConfig?.extra?.apiUrl) {
    expectedUrl = Constants.expoConfig?.extra?.apiUrl;
  } else if (Platform.OS === 'ios') {
    expectedUrl = 'http://localhost:8000';
  } else if (Platform.OS === 'android') {
    expectedUrl = 'http://10.0.2.2:8000';
  } else {
    expectedUrl = 'http://localhost:8000';
  }
  
  console.log('- Expected API URL:', expectedUrl);
  console.log('- API URL matches expected:', apiUrl === expectedUrl);
  
  // Check if Platform is correctly detected
  console.log('- Platform OS:', Platform.OS);
};

// Test Toggle Mock API
const testToggleMockApi = async () => {
  // Clear console output
  consoleOutput = [];
  
  // Test enabling mock API
  await toggleMockApi(true);
  console.log('- Toggle to enable - Console output:', consoleOutput[0]);
  console.log('- Expected output:', 'Mock API enabled');
  
  // Clear console output
  consoleOutput = [];
  
  // Test disabling mock API
  await toggleMockApi(false);
  console.log('- Toggle to disable - Console output:', consoleOutput[0]);
  console.log('- Expected output:', 'Mock API disabled');
};

// Test Network Connectivity
const testNetworkConnectivity = async () => {
  // Test isConnected function
  const connected = await isConnected();
  console.log('- Device is connected:', connected);
  
  // Get network state directly
  const netInfo = await NetInfo.fetch();
  console.log('- NetInfo state:', {
    isConnected: netInfo.isConnected,
    isInternetReachable: netInfo.isInternetReachable,
    type: netInfo.type
  });
};

export default runTests;