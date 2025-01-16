import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring, interpolate } from "react-native-reanimated";
import { supabase } from "../integrations/supabase/client";
import { Bubbles } from "../components/Bubbles";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const posthog = usePostHog();

  async function handleLogin() {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      posthog.identify(email, 
        { 
            email: email,
        }
      )
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

  async function handleSignUp() {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      posthog.identify(email, 
        { 
            email: email,
        }
      )
      
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: t('alerts.success'),
        textBody: t('alerts.registrationSuccessful'),
        button: 'OK',
      });
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: t('alerts.error'),
        textBody: error.message,
        button: 'OK',
      });
    } finally {
      setLoading(false);
    }
  }
  const scrollY = useSharedValue(0);

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

  return (
    <View className="flex-1 bg-[#1D1C21] justify-center items-center">
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="max-w-3xl bg-[#1D1C21] w-full"
    >
      <View className="flex-1 justify-center px-8 w-full">
        
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={headerStyle}
          className="pt-6 px-4 items-center"
        >
          <Animated.Text
            entering={FadeInUp.delay(800).duration(800).springify()}
            className="text-purple-500 text-center text-4xl font-black tracking-tight mt-8"
            style={{ fontFamily: 'Inter-Black' }}
          >
            BOOZEBOOK
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(800).duration(800).springify()}
            className="text-white text-center text-xl font-medium mt-8 mb-8"
            style={{ fontFamily: 'Inter-Medium' }}
          >
            {t('login.welcome')}
          </Animated.Text>
        </Animated.View>

        <View className="space-y-6">
          <TextInput
            className="bg-[#2A2A2E] h-12 px-4 rounded-lg text-white my-4"
            placeholder={t('login.email')}
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            className="bg-[#2A2A2E] h-12 px-4 rounded-lg text-white mb-4"
            placeholder={t('login.password')}
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            className="bg-[#8884d8] h-12 rounded-lg items-center justify-center mb-4"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">{t('common.login')}</Text>
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
              <Text className="text-[#8884d8] font-semibold">{t('common.signUp')}</Text>
            )}
          </TouchableOpacity>
        </View>
        <Bubbles />
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}
