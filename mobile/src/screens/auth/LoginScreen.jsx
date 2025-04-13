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
import { isValidEmail } from '../../utils/validation';
import colors from '../../constants/colors';

/**
 * Login screen component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const LoginScreen = ({ navigation }) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTextInput = styled(TextInput);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledScrollView = styled(ScrollView);
  const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
  
  // Auth hook
  const { signIn, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      Alert.alert('Login Failed', error);
      clearError();
    }
  }, [error, clearError]);
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    const result = await signIn({ email, password });
    
    if (!result.success) {
      // Error is handled by the useEffect above
      return;
    }
  };
  
  // Navigate to register screen
  const navigateToRegister = () => {
    navigation.navigate('Register');
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
        <StyledView className="flex-1 p-6 justify-center">
          <StyledView className="items-center mb-8">
            <StyledView className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="trophy" size={40} color={colors.primary.DEFAULT} />
            </StyledView>
            <StyledText className="text-2xl font-bold text-gray-800">Track My Goals</StyledText>
            <StyledText className="text-gray-500 mt-1">Sign in to your account</StyledText>
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
          
          <StyledView className="mb-6">
            <StyledText className="text-gray-700 mb-1 font-medium">Password</StyledText>
            <StyledView className="relative">
              <StyledTextInput
                className={`bg-gray-100 p-3 rounded-lg text-gray-800 pr-10 ${
                  formErrors.password ? 'border border-red-500' : ''
                }`}
                placeholder="Enter your password"
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
          </StyledView>
          
          <Button
            title="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
            className="mb-4"
          />
          
          <StyledView className="flex-row justify-center mt-6">
            <StyledText className="text-gray-600">Don't have an account? </StyledText>
            <StyledTouchableOpacity onPress={navigateToRegister}>
              <StyledText className="text-primary-500 font-medium">Sign Up</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};

export default LoginScreen;