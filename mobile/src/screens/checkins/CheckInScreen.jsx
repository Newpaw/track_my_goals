import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Switch
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useGoals } from '../../hooks/useGoals';
import { useCheckins } from '../../hooks/useCheckins';
import { formatDate } from '../../utils/dateUtils';
import colors from '../../constants/colors';

/**
 * Check-in screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 * @param {string} props.route.params.goalId - ID of the goal to check in for
 */
const CheckInScreen = ({ navigation, route }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTextInput = styled(TextInput);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledScrollView = styled(ScrollView);
  const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
  const StyledSwitch = styled(Switch);
  
  // Get goal ID from route params
  const { goalId } = route.params;
  
  // Hooks
  const { getGoal, isLoading: isGoalLoading, error: goalError, clearError: clearGoalError } = useGoals({ autoFetch: false });
  const { createCheckin, isLoading: isCheckinsLoading, error: checkinsError, clearError: clearCheckinsError } = useCheckins({ goalId, autoFetch: false });
  
  // State
  const [goal, setGoal] = useState(null);
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load goal data on mount
  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goalData = await getGoal(goalId);
        setGoal(goalData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading goal data:', error);
        setIsLoading(false);
      }
    };
    
    loadGoal();
  }, [goalId, getGoal]);
  
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
  
  // Handle check-in submission
  const handleSubmitCheckin = async () => {
    const checkinData = {
      completed,
      notes,
      date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    };
    
    const result = await createCheckin(checkinData);
    
    if (result.success) {
      Alert.alert(
        'Check-in Recorded',
        completed 
          ? 'Great job! Your progress has been recorded.' 
          : 'Your check-in has been recorded. Keep working towards your goal!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
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
  if (isLoading || isGoalLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-white">
        <Ionicons name="time-outline" size={48} color={colors.primary.DEFAULT} />
        <StyledText className="text-gray-500 mt-4">Loading...</StyledText>
      </StyledView>
    );
  }
  
  // Render error state if goal not found
  if (!goal) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-white p-6">
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <StyledText className="text-xl font-bold text-gray-800 mt-4 text-center">
          Goal Not Found
        </StyledText>
        <StyledText className="text-gray-500 mt-2 text-center">
          The goal you're trying to check in for doesn't exist or has been deleted.
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
    <StyledKeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StyledScrollView
        className="flex-1 bg-white"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <StyledView className="flex-1 p-6">
          {/* Goal Info */}
          <StyledView className="bg-gray-50 p-4 rounded-lg mb-6">
            <StyledView className="flex-row items-center">
              <StyledView className="bg-primary-100 p-2 rounded-full mr-3">
                <Ionicons 
                  name={getCategoryIcon(goal.category)} 
                  size={24} 
                  color={colors.primary.DEFAULT} 
                />
              </StyledView>
              
              <StyledView className="flex-1">
                <StyledText className="text-lg font-bold text-gray-800">{goal.title}</StyledText>
                <StyledText className="text-gray-500">
                  {goal.frequency || 'No frequency set'} • {formatDate(new Date(), 'long')}
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
          
          {/* Check-in Form */}
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-gray-800 mb-4">
              Daily Check-in
            </StyledText>
            
            <StyledView className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <StyledView className="flex-row items-center justify-between mb-2">
                <StyledText className="text-gray-800 font-medium text-lg">
                  Did you complete this goal today?
                </StyledText>
                <StyledSwitch
                  value={completed}
                  onValueChange={setCompleted}
                  trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                  thumbColor={completed ? colors.primary.DEFAULT : colors.gray[100]}
                />
              </StyledView>
              
              <StyledView className="flex-row items-center mt-2">
                <Ionicons 
                  name={completed ? 'checkmark-circle' : 'close-circle'} 
                  size={24} 
                  color={completed ? colors.success : colors.error} 
                />
                <StyledText 
                  className={`ml-2 ${completed ? 'text-green-600' : 'text-red-500'}`}
                >
                  {completed ? 'Completed' : 'Not completed'}
                </StyledText>
              </StyledView>
            </StyledView>
            
            <StyledView className="mb-6">
              <StyledText className="text-gray-700 mb-2 font-medium">Notes (Optional)</StyledText>
              <StyledTextInput
                className="bg-gray-100 p-3 rounded-lg text-gray-800"
                placeholder="Add any notes about your progress..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
              />
              <StyledText className="text-gray-500 text-xs mt-1 text-right">
                {notes.length}/200
              </StyledText>
            </StyledView>
            
            <Button
              title="Submit Check-in"
              onPress={handleSubmitCheckin}
              isLoading={isCheckinsLoading}
              disabled={isCheckinsLoading}
            />
          </StyledView>
          
          {/* Motivational Message */}
          <StyledView className="items-center mt-4">
            <StyledView className="bg-primary-50 p-4 rounded-lg">
              <StyledText className="text-primary-700 text-center italic">
                "Consistency is the key to achieving and maintaining your goals."
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};

export default CheckInScreen;