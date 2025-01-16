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
  const [fontsLoaded] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.ttf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return <App />;
};

function Main() {
  useReactQueryDevTools(queryClient);
  const [fontsLoaded] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.ttf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

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
      regular: {
        fontFamily: 'Inter-Regular',
      },
      medium: {
        fontFamily: 'Inter-Medium',
      },
      bold: {
        fontFamily: 'Inter-Bold',
      },
      black: {
        fontFamily: 'Inter-Black',
      },
    },
  };

  if (!fontsLoaded) {
    return null;
  }

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
