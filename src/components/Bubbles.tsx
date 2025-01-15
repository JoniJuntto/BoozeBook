import React, { useEffect, useMemo } from "react";
import { View, Dimensions } from "react-native";
import Animated, { 
  SharedValue,
  interpolate,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
  Extrapolation,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

interface Bubble {
  id: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  scale: SharedValue<number>;
  speed: number;
}


const useBubble = (index: number) => {
    const x = useSharedValue(Math.random() * width);
    const y = useSharedValue(height + 100);
    const scale = useSharedValue(Math.random() * 0.8 + 0.2);
    
    return {
      id: index,
      x,
      y,
      scale,
      speed: Math.random() * 2 + 1,
    };
  };
  
const BubbleComponent = ({ bubble }: { bubble: Bubble }) => {
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubble.x.value },
      { translateY: bubble.y.value },
      { scale: bubble.scale.value },
    ],
    opacity: interpolate(
      bubble.y.value,
      [height, -100],
      [1, 0],
      Extrapolation.CLAMP
    ),
    shadowColor: "#6b46c1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  }));

  return (
    <Animated.View
      key={bubble.id}
      className="absolute aspect-square w-8 rounded-full overflow-hidden"
      style={[bubbleStyle]}
    >
      <BlurView intensity={80} tint="light" className="w-full h-full">
        <LinearGradient
          colors={['rgba(147, 51, 234, 0.4)', 'rgba(147, 51, 234, 0.2)']}
          start={{ x: 0.3, y: 0.1 }}
          end={{ x: 0.7, y: 0.9 }}
          className="w-full h-full rounded-full"
        >
          <View className="w-full h-full rounded-full bg-purple-500/20" />
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export const Bubbles = () => {
  const bubble0 = useBubble(0);
  const bubble1 = useBubble(1);
  const bubble2 = useBubble(2);
  const bubble3 = useBubble(3);
  const bubble4 = useBubble(4);
  const bubble5 = useBubble(5);
  const bubble6 = useBubble(6);
  const bubble7 = useBubble(7);
  const bubble8 = useBubble(8);
  const bubble9 = useBubble(9);
  const bubble10 = useBubble(10);
  const bubble11 = useBubble(11);
  const bubble12 = useBubble(12);
  const bubble13 = useBubble(13);
  const bubble14 = useBubble(14);

  const bubbles = [
    bubble0, bubble1, bubble2, bubble3, bubble4, bubble5, bubble6, bubble7, bubble8, bubble9, bubble10, bubble11, bubble12, bubble13, bubble14
  ];

  const animateBubble = (bubble: Bubble) => {
    bubble.y.value = height + 100;
    bubble.x.value = Math.random() * width;
    bubble.scale.value = Math.random() * 0.8 + 0.2;

    bubble.y.value = withRepeat(
      withTiming(-100, {
        duration: 7000 / bubble.speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    bubble.x.value = withRepeat(
      withSequence(
        withTiming(bubble.x.value + 50, {
          duration: 2000,
          easing: Easing.linear,
        }),
        withTiming(bubble.x.value - 50, {
          duration: 2000,
          easing: Easing.linear,
        })
      ),
      -1,
      true
    );
  };

  useEffect(() => {
    bubbles.forEach(animateBubble);
  }, []);

  return (
    <>
      {bubbles.map((bubble) => (
        <BubbleComponent key={bubble.id} bubble={bubble} />
      ))}
    </>
  );
}; 