import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Database } from "../integrations/supabase/types";
import { LogOut, User, Pencil, Settings, Info } from "lucide-react-native";
import BacComponent from "../components/BacComponent";
import * as Application from "expo-application";
import Footer from "../components/Footer";
import Header from "../components/Header";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Drink = Database["public"]["Tables"]["drinks"]["Row"];

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);

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
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert("Error", error.message);
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
      Alert.alert("Success", "Username updated successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
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
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  useEffect(() => {
    if (profile) {
      setWeight(profile.weight_kg?.toString() ?? "");
      setGender(profile.gender);
    }
  }, [profile]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#1D1C21] justify-center items-center">
        <ActivityIndicator size="large" color="#8884d8" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1D1C21]">
      {/* Header */}
      <Header />

      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Profile Info */}
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
                    {profile?.username || "Anonymous User"}
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
          <BacComponent profile={profile} drinks={drinks} />
          <View className="bg-[#2A2A2E] rounded-lg px-4 py-6 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-semibold">
                BAC Settings
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
                Weight and gender are used to estimate your Blood Alcohol
                Content (BAC). This is only an approximation and can vary based
                on metabolism, food intake, and other health factors. Never use
                these estimates for safety-critical decisions.
              </Text>
            </View>

            {isSettingsOpen && (
              <View className="mt-4 space-y-4">
                <View>
                  <Text className="text-gray-400 text-sm mb-2">
                    Weight (kg)
                  </Text>
                  <TextInput
                    className="text-white bg-[#1D1C21] px-4 py-3 rounded-lg"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="Enter weight"
                    placeholderTextColor="#666"
                  />
                </View>

                <View>
                  <Text className="text-gray-400 text-sm mb-2">Gender</Text>
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
                        Male
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
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  className="bg-[#8884d8] px-4 py-3 rounded-lg mt-2"
                >
                  <Text className="text-white text-center font-semibold">
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View className="bg-[#2A2A2E] rounded-lg p-4 mt-6">
            <View>
              <Text className="text-[#666] text-sm mb-1">Member Since</Text>
              <Text className="text-white">
                {new Date(profile?.created_at || "").toLocaleDateString()}
              </Text>
            </View>
            <View>
              <Text className="text-[#666] text-sm mb-1">App Version</Text>
              <Text className="text-white">
                {Application.nativeApplicationVersion}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-500 p-4 rounded-lg mt-6"
          >
            <LogOut size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}
