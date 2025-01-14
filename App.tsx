import "./global.css";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { useState } from "react";
import Navigator from "./src/navigation/Navigator";
import { View } from "react-native";

export default function App() {
  const [showOnBoarding, setShowOnBoarding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      {showOnBoarding ? (
        <OnboardingScreen setShowOnBoarding={setShowOnBoarding} />
      ) : (
        <Navigator />
      )}
    </View>
  );
}
