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
import GoalItem from '../../components/GoalItem';
import { useGoals } from '../../hooks/useGoals';
import { useAuth } from '../../hooks/useAuth';
import colors from '../../constants/colors';

/**
 * Goals list screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const GoalsListScreen = ({ navigation }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  
  // Hooks
  const { goals, isLoading, error, fetchGoals, refreshGoals, clearError } = useGoals();
  const { user } = useAuth();
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  
  // Set up header right button (create goal)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <StyledTouchableOpacity
          className="mr-4"
          onPress={() => navigation.navigate('CreateGoal')}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </StyledTouchableOpacity>
      ),
    });
  }, [navigation]);
  
  // Show error alert when goals error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);
  
  // Refresh goals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [fetchGoals])
  );
  
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshGoals();
    setRefreshing(false);
  };
  
  // Navigate to goal details
  const handleGoalPress = (goal) => {
    navigation.navigate('GoalDetail', { 
      goalId: goal.id,
      title: goal.title
    });
  };
  
  // Navigate to check-in screen
  const handleCheckIn = (goal) => {
    navigation.navigate('CheckIn', { goalId: goal.id });
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <StyledView className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <StyledText className="text-gray-500 mt-4 text-center">
            Loading your goals...
          </StyledText>
        </StyledView>
      );
    }
    
    return (
      <StyledView className="flex-1 items-center justify-center p-6">
        <StyledView className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="flag-outline" size={40} color={colors.gray[400]} />
        </StyledView>
        <StyledText className="text-xl font-bold text-gray-800 text-center">
          No Goals Yet
        </StyledText>
        <StyledText className="text-gray-500 mt-2 text-center">
          Create your first goal to start tracking your progress
        </StyledText>
        <StyledTouchableOpacity
          className="mt-6 bg-primary-500 px-6 py-3 rounded-lg flex-row items-center"
          onPress={() => navigation.navigate('CreateGoal')}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <StyledText className="text-white font-medium ml-2">Create Goal</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    );
  };
  
  return (
    <StyledView className="flex-1 bg-gray-50">
      {user && (
        <StyledView className="px-4 py-3 bg-white border-b border-gray-200">
          <StyledText className="text-gray-500">
            Welcome back, <StyledText className="font-bold">{user.username}</StyledText>
          </StyledText>
        </StyledView>
      )}
      
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalItem
            goal={item}
            onPress={() => handleGoalPress(item)}
            onCheckIn={() => handleCheckIn(item)}
            className="mx-4 mt-4"
          />
        )}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 20
        }}
        ListEmptyComponent={renderEmptyState}
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

export default GoalsListScreen;