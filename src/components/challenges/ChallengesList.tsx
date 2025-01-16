import React from 'react';
import { View, Text } from 'react-native';
import { useGamificationStore } from '../../stores/gamificationStore';
import { ChallengeCard } from './ChallengeCard';

export const ChallengesList = () => {
  const { availableChallenges, joinChallenge } = useGamificationStore();

  return (
    <View className="space-y-4">
      <Text className="text-xl font-bold">Available Challenges</Text>
      {availableChallenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onJoin={joinChallenge}
        />
      ))}
    </View>
  );
}; 