import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Plus } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import CommunityStats from "../components/CommunityStats";
import QuickAddModal from "../components/QuickAddModal";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "../integrations/supabase/types";
import Footer from "../components/Footer";
import { useNavigation, useRoute } from "@react-navigation/native";
import QrScanner from "../components/QrScanner";
import dataJson from "../data/data.json";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export default function HomeScreen(): JSX.Element {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

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
            setIsScannerVisible(false);
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
      setIsScannerVisible(false);
    } catch (error) {
      console.error("Error inserting drink:", error);
      Alert.alert("Error", "Failed to log drink");
    }
  };

  const route = useRoute();

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

      if (error) throw error;
      setProfile(data);
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

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      volume_ml: Number(formData.volume_ml),
      alcohol_percentage: Number(formData.alcohol_percentage),
      cost: formData.cost ? Number(formData.cost) : null,
      added_by: profile?.username || generateAnonUsername(),
    });
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />

      <ScrollView className="flex-1">
        {/* Header with Logo */}
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          className="pt-6 px-4 items-center"
        >
          <Text className="text-purple-600 text-center text-xl font-bold ">
            Boozebook
          </Text>
        </Animated.View>

        {/* Main Content */}
        <View className="px-4 mt-4">
          {/* Quick Add Button */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            className="mb-8"
          >
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="bg-primary py-4 px-6 rounded-2xl flex-row items-center justify-center space-x-2"
            >
              <Plus size={24} color="white" />
              <Text className="text-white font-semibold text-lg">
                Add Drink
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(1000).springify()}
            className="bg-secondary border border-primary/20 rounded-2xl overflow-hidden"
          >
            <View className="p-4 border-b border-primary/20">
              <Text className="text-xl font-semibold text-white">
                Community Insights
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Last 30 days</Text>
            </View>

            <View className="p-4">
              <CommunityStats />
            </View>
          </Animated.View>
        </View>

        <Footer />
      </ScrollView>

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
