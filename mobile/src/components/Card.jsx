import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

/**
 * Card component for displaying content in a card-like container
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.rightContent - Content to display on the right side of the header
 * @param {Function} props.onPress - Function to call when the card is pressed
 * @param {boolean} props.pressable - Whether the card is pressable
 * @param {string} props.className - Additional Tailwind classes for the card container
 * @param {string} props.headerClassName - Additional Tailwind classes for the card header
 * @param {string} props.bodyClassName - Additional Tailwind classes for the card body
 * @param {Object} props.style - Additional StyleSheet styles
 */
const Card = ({ 
  children, 
  title, 
  rightContent,
  onPress, 
  pressable = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  style,
  ...props 
}) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  
  // Base classes
  const containerClasses = `bg-white rounded-lg shadow-sm overflow-hidden ${className}`;
  const headerClasses = `px-4 py-3 border-b border-gray-200 ${headerClassName}`;
  const bodyClasses = `p-4 ${bodyClassName}`;
  
  // Render the card content
  const renderContent = () => (
    <StyledView className={containerClasses} style={style} {...props}>
      {title && (
        <StyledView className={headerClasses}>
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-lg text-gray-800">{title}</StyledText>
            {rightContent}
          </StyledView>
        </StyledView>
      )}
      <StyledView className={bodyClasses}>
        {children}
      </StyledView>
    </StyledView>
  );
  
  // If the card is pressable, wrap it in a TouchableOpacity
  if (pressable && onPress) {
    return (
      <StyledTouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        {renderContent()}
      </StyledTouchableOpacity>
    );
  }
  
  // Otherwise, just render the content
  return renderContent();
};

export default Card;