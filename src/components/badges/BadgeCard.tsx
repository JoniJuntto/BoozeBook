import React from 'react';
import { View, Text, Animated } from 'react-native';
import * as Icons from 'lucide-react-native';
import { Badge } from '../../types/gamification';

interface BadgeCardProps {
  badge: Badge;
  isNew?: boolean;
}

export const BadgeCard = ({ badge, isNew }: BadgeCardProps) => {
  const IconComponent = Icons[badge.icon as keyof typeof Icons];
  const scaleAnim = React.useRef(new Animated.Value(isNew ? 0.5 : 1)).current;

  React.useEffect(() => {
    if (isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 5,
      }).start();
    }
  }, [isNew]);

  const getBadgeColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'COMMON': return '#757575';
      case 'RARE': return '#2196F3';
      case 'EPIC': return '#9C27B0';
      case 'LEGENDARY': return '#FFD700';
    }
  };

  return (
    <Animated.View 
      style={{ transform: [{ scale: scaleAnim }] }}
      className="items-center p-3 bg-white rounded-lg shadow-sm"
    >
      <View 
        style={{ backgroundColor: getBadgeColor(badge.rarity) }}
        className="p-3 rounded-full mb-2"
      >
        <IconComponent size={32} color="#FFFFFF" />
      </View>
      <Text className="font-bold text-center mb-1">{badge.title}</Text>
      <Text className="text-xs text-gray-500 text-center">{badge.description}</Text>
      {badge.xpBonus && (
        <Text className="text-xs text-primary mt-1">+{badge.xpBonus}XP Bonus</Text>
      )}
      {badge.unlockedAt && (
        <Text className="text-xs text-gray-400 mt-1">
          Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
        </Text>
      )}
    </Animated.View>
  );
};
