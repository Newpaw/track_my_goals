import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CheckInItem from '../../components/CheckInItem';
import ProgressChart from '../../components/ProgressChart';
import { useGoals } from '../../hooks/useGoals';
import { useCheckins } from '../../hooks/useCheckins';
import colors from '../../constants/colors';

/**
 * Check-in history screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 * @param {string} props.route.params.goalId - ID of the goal to show check-ins for
 * @param {string} props.route.params.goalTitle - Title of the goal (optional)
 */
const CheckInHistoryScreen = ({ navigation, route }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  
  // Get goal ID from route params
  const { goalId, goalTitle } = route.params;
  
  // Hooks
  const { getGoal, isLoading: isGoalLoading, error: goalError, clearError: clearGoalError } = useGoals({ autoFetch: false });
  const { 
    checkins, 
    stats, 
    isLoading: isCheckinsLoading, 
    error: checkinsError, 
    fetchCheckins, 
    fetchCheckinStats, 
    clearError: clearCheckinsError 
  } = useCheckins({ goalId, autoFetch: false });
  
  // State
  const [goal, setGoal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(null);
  
  // Update screen title
  useEffect(() => {
    if (goalTitle) {
      navigation.setOptions({
        title: `${goalTitle} - History`
      });
    }
  }, [navigation, goalTitle]);
  
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
      loadData();
    }, [goalId])
  );
  
  // Prepare chart data when check-ins change
  useEffect(() => {
    if (checkins && checkins.length > 0) {
      prepareChartData();
    }
  }, [checkins]);
  
  // Load goal and check-ins data
  const loadData = async () => {
    try {
      const goalData = await getGoal(goalId);
      setGoal(goalData);
      
      await fetchCheckins();
      await fetchCheckinStats();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // Prepare chart data for the progress chart
  const prepareChartData = () => {
    // Group check-ins by month
    const checkinsMap = {};
    
    checkins.forEach(checkin => {
      const date = new Date(checkin.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
      
      if (!checkinsMap[monthYear]) {
        checkinsMap[monthYear] = { total: 0, completed: 0 };
      }
      
      checkinsMap[monthYear].total += 1;
      if (checkin.completed) {
        checkinsMap[monthYear].completed += 1;
      }
    });
    
    // Convert to chart data format
    const labels = Object.keys(checkinsMap).slice(-6); // Last 6 months
    
    if (labels.length === 0) {
      setChartData(null);
      return;
    }
    
    const datasets = [
      {
        data: labels.map(label => {
          const monthData = checkinsMap[label];
          return monthData.total > 0 
            ? Math.round((monthData.completed / monthData.total) * 100) 
            : 0;
        }),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // success color
        strokeWidth: 2
      }
    ];
    
    setChartData({ 
      labels, 
      datasets,
      legend: ['Completion %']
    });
  };
  
  // Render loading state
  if ((isGoalLoading || isCheckinsLoading) && !goal && checkins.length === 0) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <StyledText className="text-gray-500 mt-4">Loading check-in history...</StyledText>
      </StyledView>
    );
  }
  
  return (
    <StyledView className="flex-1 bg-gray-50">
      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CheckInItem
            checkin={item}
            className="mx-4 mt-4"
          />
        )}
        ListHeaderComponent={() => (
          <StyledView className="p-4">
            {/* Stats Summary */}
            {stats && (
              <StyledView className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <StyledText className="text-lg font-bold text-gray-800 mb-3">
                  Check-in Summary
                </StyledText>
                
                <StyledView className="flex-row flex-wrap">
                  <StyledView className="w-1/2 pr-2 mb-2">
                    <StyledView className="bg-gray-50 p-3 rounded-lg">
                      <StyledText className="text-gray-500 text-sm">Total Check-ins</StyledText>
                      <StyledText className="text-xl font-bold text-gray-800">
                        {stats.total_checkins || 0}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="w-1/2 pl-2 mb-2">
                    <StyledView className="bg-gray-50 p-3 rounded-lg">
                      <StyledText className="text-gray-500 text-sm">Completed</StyledText>
                      <StyledText className="text-xl font-bold text-green-600">
                        {stats.completed_checkins || 0}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="w-1/2 pr-2">
                    <StyledView className="bg-gray-50 p-3 rounded-lg">
                      <StyledText className="text-gray-500 text-sm">Completion Rate</StyledText>
                      <StyledText className="text-xl font-bold text-primary-600">
                        {stats.completion_rate ? `${Math.round(stats.completion_rate)}%` : '0%'}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="w-1/2 pl-2">
                    <StyledView className="bg-gray-50 p-3 rounded-lg">
                      <StyledText className="text-gray-500 text-sm">Current Streak</StyledText>
                      <StyledText className="text-xl font-bold text-yellow-600">
                        {stats.current_streak || 0} {stats.current_streak === 1 ? 'day' : 'days'}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>
              </StyledView>
            )}
            
            {/* Progress Chart */}
            {chartData && (
              <ProgressChart
                type="bar"
                data={chartData}
                title="Monthly Completion Rate"
                className="mb-4"
              />
            )}
            
            {/* Check-ins Header */}
            <StyledView className="flex-row justify-between items-center mb-2">
              <StyledText className="text-lg font-bold text-gray-800">
                All Check-ins
              </StyledText>
              
              <StyledTouchableOpacity
                className="flex-row items-center"
                onPress={() => navigation.navigate('CheckIn', { goalId })}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primary.DEFAULT} />
                <StyledText className="text-primary-500 ml-1">New Check-in</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        )}
        ListEmptyComponent={() => (
          <StyledView className="flex-1 items-center justify-center p-6 mt-4">
            <Ionicons name="calendar-outline" size={48} color={colors.gray[400]} />
            <StyledText className="text-xl font-bold text-gray-800 mt-4 text-center">
              No Check-ins Yet
            </StyledText>
            <StyledText className="text-gray-500 mt-2 text-center">
              Start tracking your progress by adding your first check-in
            </StyledText>
            <StyledTouchableOpacity
              className="mt-6 bg-primary-500 px-6 py-3 rounded-lg flex-row items-center"
              onPress={() => navigation.navigate('CheckIn', { goalId })}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <StyledText className="text-white font-medium ml-2">Add Check-in</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 20
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      />
    </StyledView>
  );
};

export default CheckInHistoryScreen;