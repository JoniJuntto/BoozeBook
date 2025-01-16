import React from 'react';
import { View } from 'react-native';
import { useWindowDimensions } from 'react-native';

const ResponsiveContainer = ({ children, className = "" }) => {
  const { width } = useWindowDimensions();
  
  // Calculate container width based on screen size
  const getContainerWidth = () => {
    if (width > 1536) return 'max-w-7xl'; // 2XL screens
    if (width > 1280) return 'max-w-6xl'; // XL screens
    if (width > 1024) return 'max-w-5xl'; // LG screens
    if (width > 768) return 'max-w-4xl';  // MD screens
    return 'w-full';                      // Default for mobile
  };

  return (
    <View className={`mx-auto px-4 ${getContainerWidth()} ${className}`}>
      {children}
    </View>
  );
};

export default ResponsiveContainer;