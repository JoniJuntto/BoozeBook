import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { Beer, Wine, Coffee, Martini } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/ToastHook";
import { drinkTypes } from "../utils/constants";

const generateAnonUsername = () => {
  const randomNum = Math.floor(Math.random() * 100000000);
  return `Anon${randomNum}`;
};

export default function QuickAdd() {
  const [drinkType, setDrinkType] = useState(drinkTypes[0].value);
  const [volume, setVolume] = useState(drinkTypes[0].defaultVolume.toString());
  const [percentage, setPercentage] = useState(
    drinkTypes[0].defaultPercentage.toString()
  );
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleDrinkTypeChange = (value: string) => {
    setDrinkType(value);
    const selectedDrink = drinkTypes.find((drink) => drink.value === value);
    if (selectedDrink) {
      setVolume(selectedDrink.defaultVolume.toString());
      setPercentage(selectedDrink.defaultPercentage.toString());
    }
  };

  const handleSubmit = async () => {
    const drink = {
      name: drinkType,
      type: drinkType,
      volume_ml: Number(volume),
      alcohol_percentage: Number(percentage),
      consumed_at: new Date().toISOString(),
    };

    if (session?.user) {
      const { error } = await supabase.from("drinks").insert({
        ...drink,
        name: userProfile?.username || generateAnonUsername(),
        user_id: session.user.id,
      });

      if (error) {
        toast.show({
          title: "Error adding drink",
          message: error.message,
          type: "error",
        });
        return;
      }
    } else {
      if (!showLoginPrompt) {
        setShowLoginPrompt(true);
        return;
      }

      const { error } = await supabase.from("drinks").insert({
        ...drink,
        name: generateAnonUsername(),
        user_id: null,
      });

      if (error) {
        toast.show({
          title: "Error adding drink",
          message: error.message,
          type: "error",
        });
        return;
      }
    }

    toast.show({
      title: "Juoma lisätty!",
      message: `Lisäsit juoman: ${drinkType}`,
    });

    // Reset form
    const defaultDrink = drinkTypes[0];
    setDrinkType(defaultDrink.value);
    setVolume(defaultDrink.defaultVolume.toString());
    setPercentage(defaultDrink.defaultPercentage.toString());
  };

  return (
    <View className="bg-secondary p-6 rounded-lg shadow-lg mx-4">
      <Text className="text-2xl font-bold mb-4 text-white">Pikalisäys</Text>

      <View className="space-y-4  rounded-lg ">
        <View className="bg-tertiary rounded-lg px-2 my-2">
          <Picker
            selectedValue={drinkType}
            onValueChange={handleDrinkTypeChange}
            dropdownIconColor="#fff"
            style={{ color: "#fff" }}
          >
            {drinkTypes.map(({ value, label }) => (
              <Picker.Item key={value} label={label} value={value} />
            ))}
          </Picker>
        </View>
        <View className="w-2/3">
          <View className="flex-row items-center justify-between w-full">
            <TextInput
              className="bg-tertiary text-white p-2 rounded-lg mb-2 flex-1 mr-2"
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
              placeholder="Määrä (ml)"
              placeholderTextColor="#9ca3af"
            />
            <Text className="text-white">ml</Text>
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <TextInput
              className="bg-tertiary text-white p-2 rounded-lg w-64 flex-1 mr-2"
              value={percentage}
              onChangeText={setPercentage}
              keyboardType="numeric"
              placeholder="Alkoholi %"
              placeholderTextColor="#9ca3af"
            />
            <Text className="text-white">%</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-lime-500 p-3 rounded-lg"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-bold">Lisää juoma</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showLoginPrompt} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-700 p-4 rounded-lg m-4">
            <Text className="text-white mb-4">
              Haluatko tallentaa tilastot ja nähdä trendit? Kirjaudu nyt!
            </Text>

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="flex-1 bg-primary p-2 rounded-lg"
                onPress={() => navigation.navigate("Auth" as never)}
              >
                <Text className="text-white text-center">Kirjaudu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 border border-gray-500 p-2 rounded-lg"
                onPress={() => {
                  setShowLoginPrompt(false);
                  handleSubmit();
                }}
              >
                <Text className="text-white text-center">Ei kiitos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
