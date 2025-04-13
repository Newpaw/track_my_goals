import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/Button';
import { useGoals } from '../../hooks/useGoals';
import { formatDate } from '../../utils/dateUtils';
import colors from '../../constants/colors';

/**
 * Create/Edit goal screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 * @param {Object} props.route.params.goal - Goal data for editing (optional)
 */
const CreateGoalScreen = ({ navigation, route }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTextInput = styled(TextInput);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledScrollView = styled(ScrollView);
  const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
  
  // Get goal from route params (if editing)
  const editingGoal = route.params?.goal;
  const isEditing = !!editingGoal;
  
  // Hooks
  const { addGoal, updateGoal, isLoading, error, clearError } = useGoals({ autoFetch: false });
  
  // Form state
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [description, setDescription] = useState(editingGoal?.description || '');
  const [category, setCategory] = useState(editingGoal?.category || '');
  const [frequency, setFrequency] = useState(editingGoal?.frequency || 'daily');
  const [targetDate, setTargetDate] = useState(
    editingGoal?.target_date ? new Date(editingGoal.target_date) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Update screen title based on mode
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Goal' : 'Create New Goal'
    });
  }, [navigation, isEditing]);
  
  // Show error alert when goals error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);
  
  // Category options
  const categories = [
    { label: 'Fitness', value: 'fitness', icon: 'fitness' },
    { label: 'Health', value: 'health', icon: 'heart' },
    { label: 'Education', value: 'education', icon: 'school' },
    { label: 'Career', value: 'career', icon: 'briefcase' },
    { label: 'Finance', value: 'finance', icon: 'cash' },
    { label: 'Personal', value: 'personal', icon: 'person' },
    { label: 'Other', value: 'other', icon: 'star' }
  ];
  
  // Frequency options
  const frequencies = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!title) {
      errors.title = 'Title is required';
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    if (!category) {
      errors.category = 'Please select a category';
    }
    
    if (!frequency) {
      errors.frequency = 'Please select a frequency';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };
  
  // Handle save goal
  const handleSaveGoal = async () => {
    if (!validateForm()) {
      return;
    }
    
    const goalData = {
      title,
      description,
      category,
      frequency,
      target_date: targetDate ? targetDate.toISOString() : null
    };
    
    let result;
    
    if (isEditing) {
      result = await updateGoal(editingGoal.id, goalData);
    } else {
      result = await addGoal(goalData);
    }
    
    if (result.success) {
      navigation.goBack();
    }
  };
  
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
          {/* Title */}
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Goal Title *</StyledText>
            <StyledTextInput
              className={`bg-gray-100 p-3 rounded-lg text-gray-800 ${
                formErrors.title ? 'border border-red-500' : ''
              }`}
              placeholder="What do you want to achieve?"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            {formErrors.title ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.title}</StyledText>
            ) : null}
          </StyledView>
          
          {/* Description */}
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Description</StyledText>
            <StyledTextInput
              className="bg-gray-100 p-3 rounded-lg text-gray-800"
              placeholder="Describe your goal (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </StyledView>
          
          {/* Category */}
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Category *</StyledText>
            <StyledView className={`mb-1 ${formErrors.category ? 'border border-red-500 rounded-lg' : ''}`}>
              <StyledView className="flex-row flex-wrap">
                {categories.map((cat) => (
                  <StyledTouchableOpacity
                    key={cat.value}
                    className={`m-1 p-2 rounded-lg flex-row items-center ${
                      category === cat.value ? 'bg-primary-100 border border-primary-300' : 'bg-gray-100'
                    }`}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Ionicons 
                      name={cat.icon} 
                      size={18} 
                      color={category === cat.value ? colors.primary.DEFAULT : colors.gray[600]} 
                    />
                    <StyledText 
                      className={`ml-1 ${
                        category === cat.value ? 'text-primary-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {cat.label}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>
            {formErrors.category ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.category}</StyledText>
            ) : null}
          </StyledView>
          
          {/* Frequency */}
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Check-in Frequency *</StyledText>
            <StyledView className={`mb-1 ${formErrors.frequency ? 'border border-red-500 rounded-lg' : ''}`}>
              <StyledView className="flex-row">
                {frequencies.map((freq) => (
                  <StyledTouchableOpacity
                    key={freq.value}
                    className={`mr-2 py-2 px-4 rounded-lg ${
                      frequency === freq.value ? 'bg-primary-100 border border-primary-300' : 'bg-gray-100'
                    }`}
                    onPress={() => setFrequency(freq.value)}
                  >
                    <StyledText 
                      className={
                        frequency === freq.value ? 'text-primary-700 font-medium' : 'text-gray-700'
                      }
                    >
                      {freq.label}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>
            {formErrors.frequency ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.frequency}</StyledText>
            ) : null}
          </StyledView>
          
          {/* Target Date */}
          <StyledView className="mb-6">
            <StyledText className="text-gray-700 mb-1 font-medium">Target Date (Optional)</StyledText>
            <StyledTouchableOpacity
              className="bg-gray-100 p-3 rounded-lg flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <StyledText className="text-gray-800">
                {targetDate ? formatDate(targetDate, 'long') : 'No target date set'}
              </StyledText>
              <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
            </StyledTouchableOpacity>
            
            {targetDate && (
              <StyledTouchableOpacity
                className="mt-2 flex-row items-center"
                onPress={() => setTargetDate(null)}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.gray[600]} />
                <StyledText className="text-gray-600 ml-1">Clear date</StyledText>
              </StyledTouchableOpacity>
            )}
            
            {showDatePicker && (
              <DateTimePicker
                value={targetDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </StyledView>
          
          {/* Save Button */}
          <Button
            title={isEditing ? 'Update Goal' : 'Create Goal'}
            onPress={handleSaveGoal}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </StyledView>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};

export default CreateGoalScreen;