import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, ActivityIndicator, RefreshControl } from "react-native";
import OwnAnalytics from "../components/OwnAnalytics";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import Header from "../components/Header";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Analytics() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
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
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#1D1C21] justify-center items-center">
        <ActivityIndicator size="large" color="#8884d8" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1D1C21] px-4">
      <Header />
      <View className="px-6 pt-6 rounded-lg pb-4">
        <Text className="text-white text-2xl font-bold">Analytics</Text>
      </View>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8884d8"
            colors={["#8884d8"]}
          />
        }
      >
        <OwnAnalytics profile={profile} onRefresh={onRefresh} />
      </ScrollView>
    </View>
  );
}
