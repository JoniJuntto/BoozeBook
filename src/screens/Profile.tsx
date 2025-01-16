import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Database } from "../integrations/supabase/types";
import { LogOut, User, Pencil, Settings, Info } from "lucide-react-native";
import BacComponent from "../components/BacComponent";
import * as Application from "expo-application";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from "react-i18next";
import CreateSuggestion from "../components/CreateSuggestion";
import BacGraphComponent from "../components/BacGraphComponent";
import ResponsiveContainer from "../components/ResponsiveContainer";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Drink = Database["public"]["Tables"]["drinks"]["Row"];

export default function ProfileScreen() {
  const { t } = useTranslation(); 
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.message,
        button: 'OK',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.message,
        button: 'OK',
      });
    }
  }

  async function handleUpdateUsername() {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername })
        .eq("id", profile?.id);

      if (error) throw error;

      setProfile({ ...profile!, username: newUsername });
      setIsEditing(false);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Username updated successfully',
        button: 'OK',
      });
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.message,
        button: 'OK',
      });
    }
  }

  async function handleUpdateProfile() {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          weight_kg: weight ? parseFloat(weight) : null,
          gender: gender,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      setProfile((prev) => ({
        ...prev!,
        weight_kg: weight ? parseFloat(weight) : null,
        gender,
      }));
      setIsSettingsOpen(false);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Profile updated successfully',
        button: 'OK',
      });
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.message,
        button: 'OK',
      });
    }
  }

  useEffect(() => {
    if (profile) {
      setWeight(profile.weight_kg?.toString() ?? "");
      setGender(profile.gender);
    }
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileAndDrinks();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#1D1C21] justify-center items-center">
        <ActivityIndicator size="large" color="#8884d8" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1D1C21]">
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
        <View className="p-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-[#2A2A2E] rounded-full items-center justify-center mb-4">
              <User size={40} color="#8884d8" />
            </View>
            <View className="flex-row items-center justify-center">
              {isEditing ? (
                <View className="flex-row items-center">
                  <TextInput
                    className="text-white text-xl font-semibold border-b border-[#8884d8] px-2 py-1"
                    value={newUsername}
                    onChangeText={setNewUsername}
                    autoFocus
                    onBlur={() => {
                      if (newUsername.trim()) {
                        handleUpdateUsername();
                      } else {
                        setIsEditing(false);
                      }
                    }}
                  />
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white text-xl font-semibold">
                    {profile?.username || t('common.anonymousUser')}
                  </Text>
                  <TouchableOpacity
                    className="ml-2"
                    onPress={() => {
                      setNewUsername(profile?.username || "");
                      setIsEditing(true);
                    }}
                  >
                    <Pencil size={16} color="#8884d8" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <BacGraphComponent profile={profile} drinks={drinks} />
          <View className="bg-[#2A2A2E] rounded-lg px-4 py-6 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-semibold">
                {t('common.bacSettings')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 hover:bg-[#1D1C21] rounded-full"
              >
                <Settings size={20} color="#8884d8" />
              </TouchableOpacity>
            </View>

            <View className="flex-row bg-[#1D1C21] p-3 rounded-lg">
              <Info size={16} color="#8884d8" />
              <Text className="text-gray-400 text-sm ml-2 flex-1 leading-5">
                {t('common.bacEstimateDescription')}
              </Text>
            </View>

            {isSettingsOpen && (
              <View className="mt-4 space-y-4">
                <View>
                  <Text className="text-gray-400 text-sm mb-2">
                    {t('common.weight')} (kg)
                  </Text>
                  <TextInput
                    className="text-white bg-[#1D1C21] px-4 py-3 rounded-lg"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder={t('common.enterWeight')}
                    placeholderTextColor="#666"
                  />
                </View>

                <View>
                  <Text className="text-gray-400 text-sm mb-2">
                    {t('common.gender')}
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setGender("male")}
                      className={`flex-1 px-4 py-3 rounded-lg ${
                        gender === "male"
                          ? "bg-[#8884d8]"
                          : "bg-[#1D1C21] border border-[#2A2A2E]"
                      }`}
                    >
                      <Text
                        className={`text-center ${
                          gender === "male" ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {t('common.male')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setGender("female")}
                      className={`flex-1 px-4 py-3 rounded-lg ${
                        gender === "female"
                          ? "bg-[#8884d8]"
                          : "bg-[#1D1C21] border border-[#2A2A2E]"
                      }`}
                    >
                      <Text
                        className={`text-center ${
                          gender === "female" ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {t('common.female')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  className="bg-[#8884d8] px-4 py-3 rounded-lg mt-2"
                >
                  <Text className="text-white text-center font-semibold">
                    {t('common.saveChanges')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View className="bg-[#2A2A2E] rounded-lg p-4 mt-6">
            <View>
              <Text className="text-[#666] text-sm mb-1">
                {t('common.memberSince')}
              </Text>
              <Text className="text-white">
                {new Date(profile?.created_at || "").toLocaleDateString()}
              </Text>
            </View>
            <View>
              <Text className="text-[#666] text-sm mb-1">
                {t('common.appVersion')}
              </Text>
              <Text className="text-white">
                {Application.nativeApplicationVersion}
              </Text>
            </View>
          </View>
          <View className="mt-6">
            <LanguageSelector />
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-500 p-4 rounded-lg mt-6"
          >
            <LogOut size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold">
              {t('common.logout')}
            </Text>
          </TouchableOpacity>
        </View>
        <CreateSuggestion />
        </ResponsiveContainer>
      </ScrollView>
      <Footer />
    </View>
  );
}
