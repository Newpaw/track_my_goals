import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import colors from '../constants/colors';

/**
 * Custom button component with various styles and states
 * @param {Object} props - Component props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Button press handler
 * @param {string} props.variant - Button style variant (primary, secondary, outline, text)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.isLoading - Whether the button is in loading state
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.className - Additional Tailwind classes
 * @param {Object} props.style - Additional StyleSheet styles
 */
const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false,
  className = '',
  style,
  ...props 
}) => {
  // Base classes for all buttons
  let buttonClasses = 'flex flex-row items-center justify-center rounded-lg';
  let textClasses = 'font-medium text-center';
  
  // Size classes
  switch (size) {
    case 'sm':
      buttonClasses += ' px-3 py-2';
      textClasses += ' text-sm';
      break;
    case 'lg':
      buttonClasses += ' px-6 py-4';
      textClasses += ' text-lg';
      break;
    case 'md':
    default:
      buttonClasses += ' px-4 py-3';
      textClasses += ' text-base';
      break;
  }
  
  // Variant classes
  switch (variant) {
    case 'secondary':
      buttonClasses += ' bg-secondary-500';
      textClasses += ' text-white';
      break;
    case 'outline':
      buttonClasses += ' bg-transparent border border-primary-500';
      textClasses += ' text-primary-500';
      break;
    case 'text':
      buttonClasses += ' bg-transparent';
      textClasses += ' text-primary-500';
      break;
    case 'primary':
    default:
      buttonClasses += ' bg-primary-500';
      textClasses += ' text-white';
      break;
  }
  
  // Disabled state
  if (disabled || isLoading) {
    buttonClasses += ' opacity-50';
  }
  
  // Add any additional classes
  buttonClasses += ` ${className}`;
  
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledText = styled(Text);
  
  return (
    <StyledTouchableOpacity
      className={buttonClasses}
      style={style}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? colors.primary[500] : 'white'} 
        />
      ) : (
        <StyledText className={textClasses}>{title}</StyledText>
      )}
    </StyledTouchableOpacity>
  );
};

export default Button;