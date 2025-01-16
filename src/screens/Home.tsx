import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Plus } from "lucide-react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring, interpolate } from "react-native-reanimated";
import CommunityStats from "../components/CommunityStats";
import QuickAddModal from "../components/QuickAddModal";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "../integrations/supabase/types";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import QrScanner from "../components/QrScanner";
import dataJson from "../data/data.json";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import BacComponent from "../components/BacComponent";
import { useTranslation } from 'react-i18next';

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Drink = Database["public"]["Tables"]["drinks"]["Row"];

export default function HomeScreen(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleCodeScanned = async (data: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: t('alerts.loginRequired'),
        textBody: t('alerts.pleaseLogin'),
        button: t('common.login'),
        closeOnOverlayTap: true,
        onPressButton: () => {
          setIsScannerVisible(false);
          navigation.navigate("Profile");
        },
      });
      return;
    }
    console.log(data);
    const product = dataJson.find((item) => item.ean === data);
    if (!product) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: t('alerts.error'),
        textBody: t('alerts.productNotFound'),
        button: 'OK',
      });
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

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: t('alerts.success'),
        textBody: t('alerts.drinkLogged'),
        button: 'OK',
        onPressButton: () => setIsScannerVisible(false),
      });
    } catch (error) {
      console.error("Error inserting drink:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: t('alerts.error'),
        textBody: t('alerts.failedToLog'),
        button: 'OK',
      });
    }
  };

  useEffect(() => {
    fetchProfileAndDrinks();
  }, []);

  async function fetchProfileAndDrinks() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

        const { data: drinkData, error: drinkError } = await supabase
        .from("drinks")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setProfile(data);
      setDrinks(drinkData || []);
    } catch (error) {
      console.error(error);
    }
  }

  const generateAnonUsername = () => {
    const randomNum = Math.floor(Math.random() * 100000000);
    return `Anon${randomNum}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    volume_ml: "",
    alcohol_percentage: "",
    location: "",
    mood: "",
    cost: "",
    consumed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: session?.user?.id,
    added_by: profile?.username || generateAnonUsername(),
  });

  const { mutate: onSubmit } = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("drinks").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drinks"] });
    },
  });

  const handleSubmit = async () => {
    onSubmit({
      ...formData,
      volume_ml: Number(formData.volume_ml),
      alcohol_percentage: Number(formData.alcohol_percentage),
      cost: formData.cost ? Number(formData.cost) : null,
      added_by: profile?.username || generateAnonUsername(),
    });

    try {
      const { error } = await supabase.from("drinks").insert({
        name: formData.name,
        type: formData.type,
        alcohol_percentage: formData.alcohol_percentage,
        volume_ml: formData.volume_ml,
        user_id: session?.user.id,
        location: formData.location || null,
        mood: formData.mood || null,
        cost: formData.cost ? Number(formData.cost) : null,
        consumed_at: new Date().toISOString(),
        added_by: profile?.username || generateAnonUsername(),
      });

      if (error) throw error;

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: t('alerts.success'),
        textBody: t('alerts.drinkLogged'),
        button: 'OK',
        onPressButton: () => setIsScannerVisible(false),
      });
    } catch (error) {
      console.error("Error inserting drink:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: t('alerts.error'),
        textBody: t('alerts.failedToLog'),
        button: 'OK',
      });
    }
    // Reset form
    setFormData({
      ...formData,
      name: "",
      type: "",
      volume_ml: "",
      alcohol_percentage: "",
      location: "",
      mood: "",
      cost: "",
      added_by: profile?.username || generateAnonUsername(),
    });
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Add animation values
  const addButtonScale = useSharedValue(1);
  const scrollY = useSharedValue(0);

  // Animated styles for the header
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.6]
    );
    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95]
    );
    return {
      opacity,
      transform: [{ scale }]
    };
  });

  // Animated style for add button
  const addButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: addButtonScale.value }]
    };
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProfileAndDrinks();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />

      <Animated.ScrollView 
        className="flex-1"
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9333ea" 
            colors={["#9333ea"]}
          />
        }
      >
        {/* Header with Logo */}
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={headerStyle}
          className="pt-6 px-4 items-center"
        >
          <Animated.Text
            entering={FadeInUp.delay(800).duration(800).springify()}
            className="text-purple-500 text-center text-4xl font-black tracking-tight mt-8 mb-8"
            style={{ fontFamily: 'Inter-Black' }}
          >
            BOOZEBOOK
          </Animated.Text>
        </Animated.View>

        {/* Main Content */}
        <View className="px-4 mt-4">
          {/* Quick Add Button */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            style={addButtonStyle}
            className="mb-8"
          >
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              onPressIn={() => {
                addButtonScale.value = withSpring(0.95);
              }}
              onPressOut={() => {
                addButtonScale.value = withSpring(1);
              }}
              className="bg-primary py-4 px-6 rounded-2xl flex-row items-center justify-center space-x-2"
            >
              <Animated.View
                entering={FadeInUp.delay(400).duration(800)}
              >
                <Plus size={24} color="white" />
              </Animated.View>
              <Text className="text-white font-semibold text-lg">
                {t('common.add')}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <BacComponent profile={profile} drinks={drinks} />

          {/* Stats Section */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(1000).springify()}
            style={{
              transform: [{
                translateY: interpolate(
                  scrollY.value,
                  [0, 100],
                  [0, -10]
                )
              }]
            }}
            className="bg-secondary border mt-12 border-primary/20 rounded-2xl overflow-hidden"
          >
            <View className="p-4 border-b border-primary/20">
              <Text className="text-xl font-semibold text-white">
                {t('home.communityInsights')}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                {t('home.last30Days')}
              </Text>
            </View>

            <View className="p-4">
              <CommunityStats />
            </View>
          </Animated.View>
        </View>

        <Footer />
      </Animated.ScrollView>

      <QuickAddModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onScannerRequest={() => setIsScannerVisible(true)}
      />
      <QrScanner
        isVisible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onCodeScanned={handleCodeScanned}
      />
    </SafeAreaView>
  );
}
