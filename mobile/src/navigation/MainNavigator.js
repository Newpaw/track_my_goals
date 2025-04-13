import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import GoalsListScreen from '../screens/goals/GoalsListScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import CreateGoalScreen from '../screens/goals/CreateGoalScreen';
import CheckInScreen from '../screens/checkins/CheckInScreen';
import CheckInHistoryScreen from '../screens/checkins/CheckInHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Constants
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const GoalsStack = createNativeStackNavigator();
const CheckInsStack = createNativeStackNavigator();

/**
 * Goals stack navigator
 */
const GoalsStackNavigator = () => {
  return (
    <GoalsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.DEFAULT,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.gray[50],
        },
      }}
    >
      <GoalsStack.Screen 
        name="GoalsList" 
        component={GoalsListScreen} 
        options={{ title: 'My Goals' }}
      />
      <GoalsStack.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Goal Details' })}
      />
      <GoalsStack.Screen 
        name="CreateGoal" 
        component={CreateGoalScreen} 
        options={{ title: 'Create New Goal' }}
      />
      <GoalsStack.Screen 
        name="CheckIn" 
        component={CheckInScreen} 
        options={{ title: 'Check In' }}
      />
    </GoalsStack.Navigator>
  );
};

/**
 * Check-ins stack navigator
 */
const CheckInsStackNavigator = () => {
  return (
    <CheckInsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.DEFAULT,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.gray[50],
        },
      }}
    >
      <CheckInsStack.Screen 
        name="CheckInHistory" 
        component={CheckInHistoryScreen} 
        options={{ title: 'Check-in History' }}
      />
    </CheckInsStack.Navigator>
  );
};

/**
 * Main app navigator with bottom tabs
 */
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Goals') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'CheckIns') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.gray[500],
        headerShown: false,
      })}
    >
      <Tab.Screen name="Goals" component={GoalsStackNavigator} />
      <Tab.Screen 
        name="CheckIns" 
        component={CheckInsStackNavigator} 
        options={{ title: 'Check-ins' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;