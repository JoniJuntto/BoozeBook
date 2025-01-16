import { Platform } from "react-native";

import "./global.css";
import "./src/utils/i18n";
import { I18nextProvider } from 'react-i18next';
import i18n from './src/utils/i18n';
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { useState, useEffect } from "react";
import Navigator from "./src/navigation/Navigator";
import { View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { PostHogProvider } from 'posthog-react-native'


export default function App() {
  const [showOnBoarding, setShowOnBoarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    checkOnboardingStatus();
  }, []);
  const checkOnboardingStatus = async () => {
    try {
      let hasSeenOnboarding;
      if (Platform.OS === 'web') {
        hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      } else {
        hasSeenOnboarding = await SecureStore.getItemAsync('hasSeenOnboarding');
      }
      setShowOnBoarding(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('hasSeenOnboarding', 'true');
      } else {
        await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
      }
      setShowOnBoarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };
  if (isLoading) {
    return null;
  }

  return (
    <PostHogProvider apiKey="phc_Dp18owoJtUrLpm5piQ8so3Axorx1B0NvmfqVJk6aBpd" options={{
host: 'https://eu.i.posthog.com', 
  }} autocapture={true}>
    <I18nextProvider i18n={i18n}>
      <Toast />
        <View className="flex-1 bg-background">
          {showOnBoarding ? (
            <OnboardingScreen setShowOnBoarding={handleOnboardingComplete} />
          ) : (
            <Navigator />
          )}
        </View>
    </I18nextProvider>
    </PostHogProvider>
  );
}
