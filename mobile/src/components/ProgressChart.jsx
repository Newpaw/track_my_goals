import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Card from './Card';
import colors from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

/**
 * Progress chart component for visualizing goal progress
 * @param {Object} props - Component props
 * @param {string} props.type - Chart type ('line' or 'bar')
 * @param {Object} props.data - Chart data
 * @param {string} props.title - Chart title
 * @param {string} props.className - Additional Tailwind classes
 */
const ProgressChart = ({ 
  type = 'line', 
  data, 
  title = 'Progress',
  className = '',
  ...props 
}) => {
  const StyledView = styled(View);
  const StyledText = styled(Text);
  
  // Default chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // primary color
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary[300],
    },
  };
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    const chartWidth = screenWidth - 40; // Account for padding
    
    if (type === 'bar') {
      return (
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
          showValuesOnTopOfBars
          {...props}
        />
      );
    }
    
    // Default to line chart
    return (
      <LineChart
        data={data}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        fromZero
        {...props}
      />
    );
  };
  
  // If no data is provided, show a placeholder
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <StyledView className="items-center justify-center h-[220px]">
          <StyledText className="text-gray-500 text-center">
            Not enough data to display chart
          </StyledText>
        </StyledView>
      </Card>
    );
  }
  
  return (
    <Card className={`p-4 ${className}`}>
      {title && (
        <StyledText className="text-lg font-bold text-gray-800 mb-4">
          {title}
        </StyledText>
      )}
      
      <StyledView className="items-center">
        {renderChart()}
      </StyledView>
    </Card>
  );
};

export default ProgressChart;