import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Award, Users, Clock, TrendingUp } from 'lucide-react-native';
import { Challenge } from '../../types/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
}

export const ChallengeCard = ({ challenge, onJoin }: ChallengeCardProps) => {
  const getProgressColor = (type: Challenge['type']) => {
    switch (type) {
      case 'NO_ALCOHOL': return '#4CAF50';
      case 'REDUCTION': return '#2196F3';
      case 'SOCIAL': return '#9C27B0';
      case 'MILESTONE': return '#FF9800';
      default: return '#757575';
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 shadow-md">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold">{challenge.title}</Text>
        <View 
          style={{ backgroundColor: getProgressColor(challenge.type) }}
          className="px-2 py-1 rounded-full"
        >
          <Text className="text-white text-xs">{challenge.type}</Text>
        </View>
      </View>
      
      <Text className="text-gray-600 mb-3">{challenge.description}</Text>
      
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Clock size={16} className="text-gray-500 mr-1" />
          <Text className="text-gray-500">{challenge.duration}d</Text>
        </View>
        
        {challenge.participants && (
          <View className="flex-row items-center">
            <Users size={16} className="text-gray-500 mr-1" />
            <Text className="text-gray-500">{challenge.participants}</Text>
          </View>
        )}
        
        <View className="flex-row items-center">
          <Award size={16} className="text-gray-500 mr-1" />
          <Text className="text-gray-500">{challenge.reward.xp}XP</Text>
        </View>
      </View>

      {challenge.milestones.length > 0 && (
        <View className="mb-4">
          <Text className="font-semibold mb-2">Milestones:</Text>
          {challenge.milestones.map((milestone, index) => (
            <View key={index} className="flex-row items-center mb-1">
              <TrendingUp size={14} className="text-gray-500 mr-1" />
              <Text className="text-gray-600">
                {milestone.target}% - {milestone.reward}XP bonus
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => onJoin(challenge.id)}
        className="bg-primary py-3 rounded-lg items-center"
      >
        <Text className="text-white font-semibold">Join Challenge</Text>
      </TouchableOpacity>
    </View>
  );
};