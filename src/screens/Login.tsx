import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      Alert.alert(
        "Success",
        "Registration successful! Please check your email for verification."
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#1D1C21]"
    >
      <View className="flex-1 justify-center px-8">
        <Text className="text-white text-3xl font-bold mb-8 text-center">
          Welcome
        </Text>

        <View className="space-y-4">
          <TextInput
            className="bg-[#2A2A2E] h-12 px-4 rounded-lg text-white my-2"
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            className="bg-[#2A2A2E] h-12 px-4 rounded-lg text-white mb-2"
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            className="bg-[#8884d8] h-12 rounded-lg items-center justify-center mb-2"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="h-12 rounded-lg items-center justify-center border border-[#8884d8]"
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#8884d8" />
            ) : (
              <Text className="text-[#8884d8] font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
