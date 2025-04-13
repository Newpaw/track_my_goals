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
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, validatePassword } from '../../utils/validation';
import colors from '../../constants/colors';

/**
 * Register screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const RegisterScreen = ({ navigation }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTextInput = styled(TextInput);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledScrollView = styled(ScrollView);
  const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
  
  // Auth hook
  const { signUp, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  // Show error alert when auth error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      clearError();
    }
  }, [error, clearError]);
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    const result = await signUp({
      username,
      email,
      password
    });
    
    if (!result.success) {
      // Error is handled by the useEffect above
      return;
    }
  };
  
  // Navigate to login screen
  const navigateToLogin = () => {
    navigation.navigate('Login');
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
          <StyledView className="items-center mb-8">
            <StyledView className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="person-add" size={40} color={colors.primary.DEFAULT} />
            </StyledView>
            <StyledText className="text-2xl font-bold text-gray-800">Create Account</StyledText>
            <StyledText className="text-gray-500 mt-1">Sign up to track your goals</StyledText>
          </StyledView>
          
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Username</StyledText>
            <StyledTextInput
              className={`bg-gray-100 p-3 rounded-lg text-gray-800 ${
                formErrors.username ? 'border border-red-500' : ''
              }`}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {formErrors.username ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.username}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Email</StyledText>
            <StyledTextInput
              className={`bg-gray-100 p-3 rounded-lg text-gray-800 ${
                formErrors.email ? 'border border-red-500' : ''
              }`}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {formErrors.email ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.email}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className="mb-4">
            <StyledText className="text-gray-700 mb-1 font-medium">Password</StyledText>
            <StyledView className="relative">
              <StyledTextInput
                className={`bg-gray-100 p-3 rounded-lg text-gray-800 pr-10 ${
                  formErrors.password ? 'border border-red-500' : ''
                }`}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <StyledTouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={colors.gray[500]}
                />
              </StyledTouchableOpacity>
            </StyledView>
            {formErrors.password ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.password}</StyledText>
            ) : null}
            <StyledText className="text-gray-500 text-xs mt-1">
              Password must be at least 8 characters long
            </StyledText>
          </StyledView>
          
          <StyledView className="mb-6">
            <StyledText className="text-gray-700 mb-1 font-medium">Confirm Password</StyledText>
            <StyledView className="relative">
              <StyledTextInput
                className={`bg-gray-100 p-3 rounded-lg text-gray-800 pr-10 ${
                  formErrors.confirmPassword ? 'border border-red-500' : ''
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <StyledTouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={colors.gray[500]}
                />
              </StyledTouchableOpacity>
            </StyledView>
            {formErrors.confirmPassword ? (
              <StyledText className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</StyledText>
            ) : null}
          </StyledView>
          
          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={isLoading}
            className="mb-4"
          />
          
          <StyledView className="flex-row justify-center mt-6">
            <StyledText className="text-gray-600">Already have an account? </StyledText>
            <StyledTouchableOpacity onPress={navigateToLogin}>
              <StyledText className="text-primary-500 font-medium">Sign In</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};

export default RegisterScreen;