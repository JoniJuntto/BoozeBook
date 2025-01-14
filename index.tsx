import { registerRootComponent } from "expo";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { useCallback } from "react";
import { useFonts } from "expo-font";
import { View } from "react-native";
import App from "./App";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const AppComponent = () => {
  const [fontsLoaded] = useFonts({});

  if (!fontsLoaded) {
    return null;
  }

  return <App />;
};

function Main() {
  useReactQueryDevTools(queryClient);
  const [fontsLoaded] = useFonts({});
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const MyTheme = {
    dark: true,
    colors: {
      ...DefaultTheme.colors,
    },
    fonts: {
      ...DefaultTheme.fonts,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <NavigationContainer theme={MyTheme}>
          <AppComponent />
        </NavigationContainer>
      </View>
    </QueryClientProvider>
  );
}

registerRootComponent(Main);
