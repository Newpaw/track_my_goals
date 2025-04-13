import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { formatDate } from '../utils/dateUtils';
import colors from '../constants/colors';

/**
 * Check-in item component for displaying a check-in in a list
 * @param {Object} props - Component props
 * @param {Object} props.checkin - Check-in data
 * @param {Function} props.onPress - Function to call when the check-in item is pressed
 * @param {string} props.className - Additional Tailwind classes
 */
const CheckInItem = ({ 
  checkin, 
  onPress,
  className = '',
  ...props 
}) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  
  return (
    <Card
      pressable={!!onPress}
      onPress={onPress}
      className={`mb-3 ${className}`}
      {...props}
    >
      <StyledView className="flex-row items-center">
        <StyledView 
          className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
            checkin.completed ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <Ionicons 
            name={checkin.completed ? 'checkmark-circle' : 'close-circle'} 
            size={24} 
            color={checkin.completed ? colors.success : colors.error} 
          />
        </StyledView>
        
        <StyledView className="flex-1">
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="text-base font-medium text-gray-800">
              {formatDate(checkin.date, 'long')}
            </StyledText>
            
            {!checkin.synced && (
              <StyledView className="bg-yellow-100 px-2 py-1 rounded-full">
                <StyledText className="text-xs text-yellow-800">Not synced</StyledText>
              </StyledView>
            )}
          </StyledView>
          
          {checkin.notes ? (
            <StyledText className="text-gray-600 mt-1">
              {checkin.notes}
            </StyledText>
          ) : (
            <StyledText className="text-gray-400 italic mt-1">
              No notes
            </StyledText>
          )}
          
          <StyledText className="text-xs text-gray-500 mt-2">
            {formatDate(checkin.created_at, 'time')}
          </StyledText>
        </StyledView>
      </StyledView>
    </Card>
  );
};

export default CheckInItem;