import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Platform, Dimensions, Alert } from "react-native";
import Home from "../screens/Home";
import { Camera, Home as HomeIcon, User, BarChart } from "lucide-react-native";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import Login from "../screens/Login";
import Profile from "../screens/Profile";
import QRScannerModal from "../components/QrScanner";
import dataJson from "../data/data.json";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import Analytics from "../screens/Analytics";

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Profile: undefined;
  Login: undefined;
  Analytics: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const screenWidth = Dimensions.get("window").width;
const navWidth = screenWidth * 0.6;

export default function Navigator() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCodeScanned = async (data: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      Alert.alert("Login Required", "Please login to track your drinks", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => {
            navigation.navigate("Profile");
          },
        },
      ]);
      return;
    }
    console.log(data);
    const product = dataJson.find((item) => item.ean === data);
    if (!product) {
      Alert.alert("Error", "Product not found");
      return;
    }

    try {
      const { error } = await supabase.from("drinks").insert({
        name: product.name,
        type: product.category,
        alcohol_percentage: product.alcohol_percentage,
        volume_ml: product.volume,
        user_id: session.user.id,
        consumed_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Success", "Drink logged successfully!");
      setScannerVisible(false);
    } catch (error) {
      console.error("Error inserting drink:", error);
      Alert.alert("Error", "Failed to log drink");
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "rgba(29, 28, 33, 0.85)",
            position: "absolute",
            bottom: Platform.OS === "ios" ? 24 : 16,
            right: 16,
            left: screenWidth - (navWidth + 16), // Position from left based on screen width
            width: navWidth,
            elevation: 0,
            borderRadius: 28,
            height: 56,
            paddingBottom: 4,
            paddingTop: 4,
            transform: [{ translateX: 0 }], // Reset any transform
            ...(Platform.OS === "ios"
              ? {
                  shadowColor: "#8884d8",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  backdropFilter: "blur(12px)",
                }
              : {
                  elevation: 20,
                }),
          },
          tabBarActiveTintColor: "#8884d8",
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
          headerStyle: {
            backgroundColor: "#1D1C21",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#FFFFFF",
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarBackground: () => (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 28,
                backgroundColor: "rgba(29, 28, 33, 0.85)",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(136, 132, 216, 0.2)", // Subtle border using primary color
              }}
            >
              {/* Additional glow overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(136, 132, 216, 0.03)", // Very subtle primary color overlay
                  borderRadius: 28,
                }}
              />
            </View>
          ),
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center" }}>
                <HomeIcon
                  color={focused ? "#8884d8" : "rgba(255, 255, 255, 0.5)"}
                  size={24}
                  strokeWidth={2}
                  style={{
                    ...(focused && {
                      shadowColor: "#8884d8",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 10,
                    }),
                  }}
                />
                {focused && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -8,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#8884d8",
                      shadowColor: "#8884d8",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 6,
                    }}
                  />
                )}
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Camera"
          component={View}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setScannerVisible(true);
            },
          }}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center" }}>
                <Camera
                  color={focused ? "#8884d8" : "rgba(255, 255, 255, 0.5)"}
                  size={24}
                  strokeWidth={2}
                  style={{
                    ...(focused && {
                      shadowColor: "#8884d8",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 10,
                    }),
                  }}
                />
                {focused && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -8,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#8884d8",
                      shadowColor: "#8884d8",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 6,
                    }}
                  />
                )}
              </View>
            ),
          }}
        />

        {isAuthenticated && (
          <Tab.Screen
            name="Analytics"
            component={Analytics}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={{ alignItems: "center" }}>
                  <BarChart
                    color={focused ? "#8884d8" : "rgba(255, 255, 255, 0.5)"}
                    size={24}
                    strokeWidth={2}
                    style={{
                      ...(focused && {
                        shadowColor: "#8884d8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                      }),
                    }}
                  />
                  {focused && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -8,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#8884d8",
                        shadowColor: "#8884d8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 6,
                      }}
                    />
                  )}
                </View>
              ),
            }}
          />
        )}

        {isAuthenticated ? (
          <Tab.Screen
            name="Profile"
            component={Profile}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={{ alignItems: "center" }}>
                  <User
                    color={focused ? "#8884d8" : "rgba(255, 255, 255, 0.5)"}
                    size={24}
                    strokeWidth={2}
                    style={{
                      ...(focused && {
                        shadowColor: "#8884d8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                      }),
                    }}
                  />
                  {focused && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -8,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#8884d8",
                        shadowColor: "#8884d8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 6,
                      }}
                    />
                  )}
                </View>
              ),
            }}
          />
        ) : (
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={{ alignItems: "center" }}>
                  <User
                    color={focused ? "#8884d8" : "rgba(255, 255, 255, 0.5)"}
                    size={24}
                    strokeWidth={2}
                    style={{
                      ...(focused && {
                        shadowColor: "#8884d8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                      }),
                    }}
                  />
                  {focused && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -8,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#8884d8",
                        shadowColor: "#8884d8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 6,
                      }}
                    />
                  )}
                </View>
              ),
            }}
          />
        )}
      </Tab.Navigator>

      <QRScannerModal
        isVisible={isScannerVisible}
        onClose={() => setScannerVisible(false)}
        onCodeScanned={handleCodeScanned}
      />
    </>
  );
}
