import React, { createContext, useState, useContext, ReactNode } from "react";

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
    // Here you would typically persist this state
  };

  return (
    <OnboardingContext.Provider
      value={{ isOnboardingComplete, completeOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
