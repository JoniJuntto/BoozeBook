import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, View, Text } from 'react-native';
import { ChallengesList } from '../components/challenges/ChallengesList';
import { BadgeGrid } from '../components/badges/BadgeGrid';
import { LevelProgress } from '../components/gamification/LevelProgress';

export const GamificationScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <ScrollView className="flex-1">
        <LevelProgress />
        <View className="p-4">
          <ChallengesList />
          <View className="h-6" />
          <BadgeGrid />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 