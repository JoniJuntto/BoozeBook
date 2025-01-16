import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Beer,
  Trophy,
  LineChart,
  ArrowRight,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  interpolate,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { Bubbles } from "../components/Bubbles";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}


export default function OnboardingScreen({
  setShowOnBoarding,
}: {
  setShowOnBoarding: (show: boolean) => void;
}) {
  const { t } = useTranslation();

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: t('onboarding.trackYourJourney'),
      description:
        t('onboarding.logDrinksEffortlessly'),
      icon: <Beer size={48} color="#9333EA" />,
    },
    {
      id: 2,
      title: t('onboarding.visualizeProgress'),
      description:
        t('onboarding.watchHabitsTransform'),
      icon: <LineChart size={48} color="#9333EA" />,
    },
    {
      id: 3,
      title: t('onboarding.joinChallenges'),
      description:
        t('onboarding.participateInChallenges'),
      icon: <Trophy size={48} color="#9333EA" />,
    },
  ];
  
  interface LogoScreen extends OnboardingSlide {
    isLogoScreen: boolean;
  }
  
  const allSlides: (OnboardingSlide | LogoScreen)[] = [
    {
      id: 0,
      title: "",
      description: "",
      icon: null,
      isLogoScreen: true,
    },
    ...slides,
  ];
  

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


  const LogoSlide = () => {
    return (
      <View className="w-screen flex-1 items-center justify-center px-8">
        <LinearGradient
          colors={["#4C1D95", "#1F2937"]}
          className="absolute top-0 left-0 right-0 bottom-0 opacity-30"
        />
        
        <Bubbles />

        <View className="items-center">
          <Animated.View entering={FadeInUp.duration(1200).springify()}>
            <Animated.Text
              className="text-purple-500 text-center text-6xl font-black tracking-tight mt-8 "
              style={{ fontFamily: 'Inter-Black' }}
            >
              BOOZEBOOK
            </Animated.Text>
            <Animated.Text
              className="text-white text-center text-xl"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              {t('onboarding.aNewWayToTrackYourDrinking')}
            </Animated.Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  const AnimatedSlide = ({
    slide,
    index,
  }: {
    slide: OnboardingSlide | LogoScreen;
    index: number;
  }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);
      const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50]);
      const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]);
      return { transform: [{ scale }, { translateY }], opacity };
    });

    return (
      <View className="w-screen flex-1 items-center justify-center px-8">
        <LinearGradient
          colors={["#4C1D95", "#1F2937"]}
          className="absolute top-0 left-0 right-0 bottom-0 opacity-30"
        />
        
        <Bubbles />

        {('isLogoScreen' in slide && slide.isLogoScreen) ? (
          <LogoSlide />
        ) : (
          <View className="items-center">
            <View className="items-center">
              <Animated.View style={animatedStyle}>
                <View className="bg-gray-800/50 p-6 self-center rounded-full w-24 h-24 mb-8 shadow-lg">
                  {slide.icon}
                </View>

                <Animated.Text
                  className="text-3xl font-bold text-white mb-4 text-center"
                >
                  {slide.title}
                </Animated.Text>

                <Animated.Text
                  className="text-gray-300 text-center text-lg mb-8"
                >
                  {slide.description}
                </Animated.Text>
              </Animated.View>
            </View>
          </View>
        )}
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
      setShowOnBoarding(true);
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
    <SafeAreaView className="flex-1 bg-gray-900 ">
      <StatusBar style="light" />
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {allSlides.map((slide, index) => (
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
            {currentIndex === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
