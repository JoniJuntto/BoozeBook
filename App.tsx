import "./global.css";
import "./src/utils/i18n";
import { I18nextProvider } from 'react-i18next';
import i18n from './src/utils/i18n';
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { useState } from "react";
import Navigator from "./src/navigation/Navigator";
import { View } from "react-native";
import { AlertNotificationRoot } from 'react-native-alert-notification';

export default function App() {
  const [showOnBoarding, setShowOnBoarding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AlertNotificationRoot>
        <View className="flex-1 bg-background">
          {showOnBoarding ? (
            <OnboardingScreen setShowOnBoarding={setShowOnBoarding} />
          ) : (
            <Navigator />
          )}
        </View>
      </AlertNotificationRoot>
    </I18nextProvider>
  );
}
