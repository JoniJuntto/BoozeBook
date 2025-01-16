import React from 'react';
import { View, Text } from 'react-native';
import { useGamificationStore } from '../../stores/gamificationStore';
import * as Icons from 'lucide-react-native';
import { BadgeCard } from './BadgeCard';

export const BadgeGrid = () => {
  const { userProgress } = useGamificationStore();
  const [newBadges, setNewBadges] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Mark badges as new if they were unlocked in the last 24 hours
    const recentBadges = userProgress?.badges.filter(badge => 
      badge.unlockedAt && 
      new Date(badge.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).map(badge => badge.id) || [];
    
    setNewBadges(recentBadges);
  }, [userProgress?.badges]);

  return (
    <View className="space-y-4">
      <Text className="text-xl font-bold">Your Badges</Text>
      <View className="flex-row flex-wrap gap-4">
        {userProgress?.badges.map((badge) => (
          <View key={badge.id} className="w-[calc(50%-8px)]">
            <BadgeCard 
              badge={badge} 
              isNew={newBadges.includes(badge.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}; 