export type Challenge = {
    id: string;
    title: string;
    description: string;
    duration: number;
    type: 'NO_ALCOHOL' | 'REDUCTION' | 'CUSTOM' | 'SOCIAL' | 'MILESTONE';
    target?: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    reward: {
      xp: number;
      badge?: string;
    };
    milestones: {
      target: number;
      reward: number;
    }[];
    participants?: number;
  };
  
  export type Badge = {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
    category: 'MILESTONE' | 'CHALLENGE' | 'SOCIAL' | 'SPECIAL';
    requirement: {
      type: 'DAYS_LOGGED' | 'NO_ALCOHOL_STREAK' | 'CHALLENGE_COMPLETE' | 'SOCIAL_INTERACTION';
      value: number;
    };
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    xpBonus?: number;
  };
  
  export type UserProgress = {
    userId: string;
    activeChallenges: Challenge[];
    completedChallenges: Challenge[];
    badges: Badge[];
    streakDays: number;
    totalDaysLogged: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    achievements: Achievement[];
  };
  
  export type Achievement = {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
    reward: {
      xp: number;
      badge?: string;
    };
  };
  