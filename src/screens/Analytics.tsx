import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, ActivityIndicator, RefreshControl, Platform } from "react-native";
import OwnAnalytics from "../components/OwnAnalytics";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import BacGraphComponent from "../components/BacGraphComponent";
import ResponsiveContainer from "../components/ResponsiveContainer";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Drink = Database["public"]["Tables"]["drinks"]["Row"];

export default function Analytics() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drinks, setDrinks] = useState<Drink[]>([]);

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

      const { data: drinksData, error: drinksError } = await supabase
        .from("drinks")
        .select("*")
        .eq("user_id", user.id);

      if (drinksError) throw drinksError;
      setDrinks(drinksData);
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
{Platform.OS !== "web" && <Header />}
      
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
        <ResponsiveContainer>
        <View className="px-6 pt-6 rounded-lg pb-4">
        <Text className="text-white text-2xl font-bold">
          {t('common.analytics')}
        </Text>
      </View>
        <OwnAnalytics profile={profile} onRefresh={onRefresh} />
        </ResponsiveContainer>
      </ScrollView>
    </View>
    
  );
}
