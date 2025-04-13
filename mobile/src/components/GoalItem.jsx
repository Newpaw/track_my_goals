import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { formatDate } from '../utils/dateUtils';
import colors from '../constants/colors';

/**
 * Goal item component for displaying a goal in a list
 * @param {Object} props - Component props
 * @param {Object} props.goal - Goal data
 * @param {Function} props.onPress - Function to call when the goal item is pressed
 * @param {Function} props.onCheckIn - Function to call when the check-in button is pressed
 * @param {string} props.className - Additional Tailwind classes
 */
const GoalItem = ({ 
  goal, 
  onPress, 
  onCheckIn,
  className = '',
  ...props 
}) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  
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
  
  // Get frequency text
  const getFrequencyText = (frequency) => {
    switch (frequency?.toLowerCase()) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency || 'Not set';
    }
  };
  
  // Get progress color based on completion rate
  const getProgressColor = (completionRate) => {
    if (completionRate >= 75) {
      return colors.success;
    } else if (completionRate >= 50) {
      return colors.secondary.DEFAULT;
    } else if (completionRate >= 25) {
      return colors.warning;
    } else {
      return colors.error;
    }
  };
  
  // Calculate progress width based on completion rate
  const progressWidth = `${goal.completion_rate || 0}%`;
  
  return (
    <Card
      pressable
      onPress={onPress}
      className={`mb-4 ${className}`}
      {...props}
    >
      <StyledView className="flex-row justify-between items-start">
        <StyledView className="flex-row items-center flex-1">
          <StyledView className="bg-primary-100 p-2 rounded-full mr-3">
            <Ionicons 
              name={getCategoryIcon(goal.category)} 
              size={24} 
              color={colors.primary.DEFAULT} 
            />
          </StyledView>
          
          <StyledView className="flex-1">
            <StyledText className="text-lg font-bold text-gray-800">{goal.title}</StyledText>
            
            {goal.description ? (
              <StyledText className="text-gray-600 mt-1" numberOfLines={2}>
                {goal.description}
              </StyledText>
            ) : null}
            
            <StyledView className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={14} color={colors.gray[500]} />
              <StyledText className="text-xs text-gray-500 ml-1">
                {goal.target_date ? `Target: ${formatDate(goal.target_date)}` : 'No target date'}
              </StyledText>
              
              <StyledView className="mx-2 w-1 h-1 bg-gray-300 rounded-full" />
              
              <Ionicons name="repeat-outline" size={14} color={colors.gray[500]} />
              <StyledText className="text-xs text-gray-500 ml-1">
                {getFrequencyText(goal.frequency)}
              </StyledText>
            </StyledView>
            
            {/* Progress bar */}
            <StyledView className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <StyledView 
                className="h-full rounded-full" 
                style={{ 
                  width: progressWidth,
                  backgroundColor: getProgressColor(goal.completion_rate || 0)
                }}
              />
            </StyledView>
            
            <StyledView className="flex-row justify-between mt-1">
              <StyledText className="text-xs text-gray-500">
                Progress: {Math.round(goal.completion_rate || 0)}%
              </StyledText>
              
              {goal.current_streak ? (
                <StyledText className="text-xs text-gray-500">
                  Streak: {goal.current_streak} {goal.current_streak === 1 ? 'day' : 'days'}
                </StyledText>
              ) : null}
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
      
      {onCheckIn && (
        <StyledView className="mt-3 border-t border-gray-200 pt-3">
          <StyledTouchableOpacity
            className="flex-row items-center justify-center py-2 bg-primary-50 rounded-md"
            onPress={() => onCheckIn(goal)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkbox-outline" size={18} color={colors.primary.DEFAULT} />
            <StyledText className="ml-1 text-primary-500 font-medium">Check In</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      )}
    </Card>
  );
};

export default GoalItem;