import React from 'react';
import { View, Text } from 'react-native';
import { useGamificationStore } from '../../stores/gamificationStore';

export const LevelProgress = () => {
  const { userProgress } = useGamificationStore();
  
  if (!userProgress) return null;
  
  const progressPercentage = (userProgress.xp / userProgress.xpToNextLevel) * 100;
  
  return (
    <View className="bg-primary p-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-lg font-bold">Level {userProgress.level}</Text>
        <Text className="text-white">
          {userProgress.xp} / {userProgress.xpToNextLevel} XP
        </Text>
      </View>
      
      <View className="h-2 bg-white/20 rounded-full">
        <View 
          className="h-full bg-white rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
      
      <View className="flex-row justify-between mt-4">
        <View className="items-center">
          <Text className="text-white font-bold">{userProgress.streakDays}</Text>
          <Text className="text-white/80 text-sm">Day Streak</Text>
        </View>
        <View className="items-center">
          <Text className="text-white font-bold">{userProgress.totalDaysLogged}</Text>
          <Text className="text-white/80 text-sm">Total Days</Text>
        </View>
        <View className="items-center">
          <Text className="text-white font-bold">{userProgress.badges.length}</Text>
          <Text className="text-white/80 text-sm">Badges</Text>
        </View>
      </View>
    </View>
  );
}; 