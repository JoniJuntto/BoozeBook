import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import {
  Beer,
  Trophy,
  LineChart,
  Users,
  ArrowRight,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Track Your Journey",
    description:
      "Log drinks effortlessly and get data like your weekly average, total drinks, and more.",
    icon: <Beer size={48} color="#9333EA" />,
  },
  {
    id: 2,
    title: "Visualize Progress",
    description:
      "Watch your habits transform through beautiful, interactive charts and insights.",
    icon: <LineChart size={48} color="#9333EA" />,
  },
  {
    id: 3,
    title: "Join Challenges",
    description:
      "Participate in community challenges and earn badges for your achievements.",
    icon: <Trophy size={48} color="#9333EA" />,
  },
  {
    id: 4,
    title: "Connect & Grow",
    description:
      "Be part of a supportive community sharing the same journey towards mindful drinking.",
    icon: <Users size={48} color="#9333EA" />,
  },
];

export default function OnboardingScreen({
  setShowOnBoarding,
}: {
  setShowOnBoarding: (show: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const logoScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    logoScale.value = withSpring(1.2, {
      mass: 1,
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const AnimatedSlide = ({
    slide,
    index,
  }: {
    slide: OnboardingSlide;
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);

      const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50]);

      const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]);

      return {
        transform: [{ scale }, { translateY }],
        opacity,
      };
    });

    return (
      <View className="w-screen flex-1 items-center justify-center px-8">
        <LinearGradient
          colors={["#4C1D95", "#1F2937"]}
          className="absolute top-0 left-0 right-0 bottom-0 opacity-30"
        />

        <Animated.View
          entering={FadeInUp.duration(800).springify()}
          style={animatedStyle}
          className="items-center"
        >
          <View className="bg-gray-800/50 p-6 rounded-full mb-8 shadow-lg">
            <Animated.View
              entering={FadeInUp.delay(400).duration(1000).springify()}
            >
              {slide.icon}
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeInUp.delay(200).duration(800).springify()}
            className="text-3xl font-bold text-white mb-4 text-center"
          >
            {slide.title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(400).duration(800).springify()}
            className="text-gray-300 text-center text-lg mb-8"
          >
            {slide.description}
          </Animated.Text>
        </Animated.View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowOnBoarding(false);
    }
  };

  const Dot = ({ index }: { index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1.4, 0.8],
        "clamp"
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.4, 1, 0.4],
        "clamp"
      );

      return {
        transform: [{ scale: withSpring(scale) }],
        opacity: withTiming(opacity),
      };
    });

    return (
      <Animated.View
        className="h-2 w-2 rounded-full bg-purple-600 mx-1"
        style={animatedStyle}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      <Animated.View
        entering={FadeInUp.duration(1000).springify()}
        className="h-[30%] items-center justify-end pb-8"
      >
        <Animated.Image
          entering={FadeInUp.delay(400).duration(1000).springify()}
          source={require("../../assets/boozebook.webp")}
          className="w-32 h-32"
          style={logoAnimatedStyle}
        />
        <Animated.Text
          entering={FadeInUp.delay(600).duration(800).springify()}
          className="text-purple-600 text-center text-2xl font-bold mt-4"
        >
          Welcome to Boozebook
        </Animated.Text>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-[1.5]"
      >
        {slides.map((slide, index) => (
          <AnimatedSlide key={slide.id} slide={slide} index={index} />
        ))}
      </Animated.ScrollView>

      <Animated.View
        entering={FadeInUp.delay(600).duration(800).springify()}
        className="px-8 pb-12"
      >
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <Dot key={index} index={index} />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className={`bg-purple-600 py-4 px-8 rounded-full flex-row items-center justify-center
            ${currentIndex === slides.length - 1 ? "bg-green-600" : ""}`}
        >
          <Text className="text-white font-bold text-lg mr-2">
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
