import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import ProgressChart from '../../components/ProgressChart';
import CheckInItem from '../../components/CheckInItem';
import Button from '../../components/Button';
import { useGoals } from '../../hooks/useGoals';
import { useCheckins } from '../../hooks/useCheckins';
import { formatDate } from '../../utils/dateUtils';
import colors from '../../constants/colors';

/**
 * Goal detail screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 * @param {string} props.route.params.goalId - ID of the goal to display
 */
const GoalDetailScreen = ({ navigation, route }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledScrollView = styled(ScrollView);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  
  // Get goal ID from route params
  const { goalId } = route.params;
  
  // Hooks
  const { getGoal, updateGoal, removeGoal, isLoading: isGoalLoading, error: goalError, clearError: clearGoalError } = useGoals({ autoFetch: false });
  const { checkins, stats, isLoading: isCheckinsLoading, error: checkinsError, fetchCheckins, fetchCheckinStats, clearError: clearCheckinsError } = useCheckins({ goalId, autoFetch: false });
  
  // State
  const [goal, setGoal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(null);
  
  // Set up header right button (edit/delete)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <StyledView className="flex-row">
          <StyledTouchableOpacity
            className="mr-4"
            onPress={handleEditGoal}
          >
            <Ionicons name="create-outline" size={24} color={colors.white} />
          </StyledTouchableOpacity>
          <StyledTouchableOpacity
            className="mr-4"
            onPress={handleDeleteGoal}
          >
            <Ionicons name="trash-outline" size={24} color={colors.white} />
          </StyledTouchableOpacity>
        </StyledView>
      ),
    });
  }, [navigation, goal]);
  
  // Show error alerts when errors occur
  useEffect(() => {
    if (goalError) {
      Alert.alert('Error', goalError);
      clearGoalError();
    }
    
    if (checkinsError) {
      Alert.alert('Error', checkinsError);
      clearCheckinsError();
    }
  }, [goalError, checkinsError, clearGoalError, clearCheckinsError]);
  
  // Fetch goal and check-ins when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoalData();
    }, [goalId])
  );
  
  // Prepare chart data when check-ins change
  useEffect(() => {
    if (checkins && checkins.length > 0) {
      prepareChartData();
    }
  }, [checkins]);
  
  // Load goal data
  const loadGoalData = async () => {
    try {
      const goalData = await getGoal(goalId);
      setGoal(goalData);
      
      await fetchCheckins();
      await fetchCheckinStats();
    } catch (error) {
      console.error('Error loading goal data:', error);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGoalData();
    setRefreshing(false);
  };
  
  // Prepare chart data for the progress chart
  const prepareChartData = () => {
    // Get the last 7 check-ins (or fewer if there aren't 7)
    const recentCheckins = [...checkins]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
    
    if (recentCheckins.length === 0) {
      setChartData(null);
      return;
    }
    
    const labels = recentCheckins.map(checkin => {
      const date = new Date(checkin.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const datasets = [
      {
        data: recentCheckins.map(checkin => checkin.completed ? 1 : 0),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // success color
        strokeWidth: 2
      }
    ];
    
    setChartData({ labels, datasets });
  };
  
  // Handle edit goal
  const handleEditGoal = () => {
    // Navigate to edit goal screen (reuse create goal screen with goal data)
    navigation.navigate('CreateGoal', { goal });
  };
  
  // Handle delete goal
  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const result = await removeGoal(goalId);
            
            if (result.success) {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };
  
  // Handle check-in
  const handleCheckIn = () => {
    navigation.navigate('CheckIn', { goalId });
  };
  
  // Handle view all check-ins
  const handleViewAllCheckins = () => {
    navigation.navigate('CheckInHistory', { goalId, goalTitle: goal.title });
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'fitness':
        return 'fitness';
      case 'health':
        return 'heart';
      case 'education':
        return 'school';
      case 'career':
        return 'briefcase';
      case 'finance':
        return 'cash';
      case 'personal':
        return 'person';
      default:
        return 'star';
    }
  };
  
  // Render loading state
  if (isGoalLoading && !goal) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <StyledText className="text-gray-500 mt-4">Loading goal details...</StyledText>
      </StyledView>
    );
  }
  
  // Render error state if goal not found
  if (!goal) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <StyledText className="text-xl font-bold text-gray-800 mt-4 text-center">
          Goal Not Found
        </StyledText>
        <StyledText className="text-gray-500 mt-2 text-center">
          The goal you're looking for doesn't exist or has been deleted.
        </StyledText>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          className="mt-6"
        />
      </StyledView>
    );
  }
  
  return (
    <StyledScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary.DEFAULT]}
          tintColor={colors.primary.DEFAULT}
        />
      }
    >
      {/* Goal Header */}
      <StyledView className="bg-white p-4 border-b border-gray-200">
        <StyledView className="flex-row items-center">
          <StyledView className="bg-primary-100 p-3 rounded-full mr-4">
            <Ionicons 
              name={getCategoryIcon(goal.category)} 
              size={28} 
              color={colors.primary.DEFAULT} 
            />
          </StyledView>
          
          <StyledView className="flex-1">
            <StyledText className="text-2xl font-bold text-gray-800">{goal.title}</StyledText>
            <StyledView className="flex-row items-center mt-1">
              <StyledText className="text-gray-500">
                {goal.category || 'No category'}
              </StyledText>
              <StyledView className="mx-2 w-1 h-1 bg-gray-300 rounded-full" />
              <StyledText className="text-gray-500">
                {goal.frequency || 'No frequency set'}
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
        
        {goal.description ? (
          <StyledText className="text-gray-600 mt-4">
            {goal.description}
          </StyledText>
        ) : null}
        
        <StyledView className="flex-row items-center mt-4">
          <Ionicons name="calendar-outline" size={16} color={colors.gray[500]} />
          <StyledText className="text-gray-500 ml-1">
            {goal.target_date 
              ? `Target date: ${formatDate(goal.target_date, 'long')}` 
              : 'No target date set'}
          </StyledText>
        </StyledView>
        
        <StyledView className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
          <StyledText className="text-gray-500 ml-1">
            Created: {formatDate(goal.created_at, 'long')}
          </StyledText>
        </StyledView>
      </StyledView>
      
      {/* Stats */}
      <StyledView className="p-4">
        <Card className="mb-4">
          <StyledView className="flex-row flex-wrap">
            <StyledView className="w-1/2 p-2">
              <StyledView className="items-center p-3 bg-primary-50 rounded-lg">
                <StyledText className="text-gray-600 mb-1">Completion Rate</StyledText>
                <StyledText className="text-2xl font-bold text-primary-500">
                  {stats?.completion_rate ? `${Math.round(stats.completion_rate)}%` : '0%'}
                </StyledText>
              </StyledView>
            </StyledView>
            
            <StyledView className="w-1/2 p-2">
              <StyledView className="items-center p-3 bg-green-50 rounded-lg">
                <StyledText className="text-gray-600 mb-1">Current Streak</StyledText>
                <StyledText className="text-2xl font-bold text-green-500">
                  {stats?.current_streak || 0} {stats?.current_streak === 1 ? 'day' : 'days'}
                </StyledText>
              </StyledView>
            </StyledView>
            
            <StyledView className="w-1/2 p-2">
              <StyledView className="items-center p-3 bg-blue-50 rounded-lg">
                <StyledText className="text-gray-600 mb-1">Total Check-ins</StyledText>
                <StyledText className="text-2xl font-bold text-blue-500">
                  {stats?.total_checkins || 0}
                </StyledText>
              </StyledView>
            </StyledView>
            
            <StyledView className="w-1/2 p-2">
              <StyledView className="items-center p-3 bg-yellow-50 rounded-lg">
                <StyledText className="text-gray-600 mb-1">Longest Streak</StyledText>
                <StyledText className="text-2xl font-bold text-yellow-600">
                  {stats?.longest_streak || 0} {stats?.longest_streak === 1 ? 'day' : 'days'}
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        </Card>
        
        {/* Progress Chart */}
        {chartData ? (
          <ProgressChart
            type="line"
            data={chartData}
            title="Recent Progress"
            className="mb-4"
          />
        ) : null}
        
        {/* Recent Check-ins */}
        <StyledView className="mb-4">
          <StyledView className="flex-row justify-between items-center mb-2">
            <StyledText className="text-lg font-bold text-gray-800">Recent Check-ins</StyledText>
            {checkins && checkins.length > 0 && (
              <StyledTouchableOpacity onPress={handleViewAllCheckins}>
                <StyledText className="text-primary-500">View All</StyledText>
              </StyledTouchableOpacity>
            )}
          </StyledView>
          
          {isCheckinsLoading && checkins.length === 0 ? (
            <StyledView className="items-center py-6">
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              <StyledText className="text-gray-500 mt-2">Loading check-ins...</StyledText>
            </StyledView>
          ) : checkins && checkins.length > 0 ? (
            checkins
              .slice(0, 3) // Show only the 3 most recent check-ins
              .map(checkin => (
                <CheckInItem
                  key={checkin.id}
                  checkin={checkin}
                />
              ))
          ) : (
            <StyledView className="items-center py-6 bg-white rounded-lg">
              <Ionicons name="calendar-outline" size={32} color={colors.gray[400]} />
              <StyledText className="text-gray-500 mt-2 text-center">
                No check-ins yet
              </StyledText>
            </StyledView>
          )}
        </StyledView>
        
        {/* Check-in Button */}
        <Button
          title="Check In Now"
          onPress={handleCheckIn}
          className="mb-8"
        />
      </StyledView>
    </StyledScrollView>
  );
};

export default GoalDetailScreen;