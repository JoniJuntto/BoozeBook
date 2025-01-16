import { create } from 'zustand';
import { Challenge, Badge, UserProgress, Achievement } from '../types/gamification';

interface GamificationState {
  userProgress: UserProgress | null;
  availableChallenges: Challenge[];
  joinChallenge: (challengeId: string) => Promise<void>;
  checkBadgeProgress: () => Promise<void>;
  updateProgress: (daysLogged: number, streakDays: number) => Promise<void>;
  claimReward: (achievementId: string) => Promise<void>;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  userProgress: null,
  availableChallenges: [
    {
      id: 'dry-week',
      title: 'Dry Week Challenge',
      description: 'Stay alcohol-free for 7 days',
      duration: 7,
      type: 'NO_ALCOHOL',
      isActive: false,
      reward: {
        xp: 500,
        badge: 'dry-week-champion'
      },
      milestones: [
        { target: 25, reward: 100 },
        { target: 50, reward: 200 },
        { target: 75, reward: 300 },
        { target: 100, reward: 400 }
      ],
      participants: 124
    },
    // Add more predefined challenges...
  ],
  
  joinChallenge: async (challengeId: string) => {
    try {
      // API call to join challenge
      const response = await fetch('/api/challenges/join', {
        method: 'POST',
        body: JSON.stringify({ challengeId })
      });
      
      if (!response.ok) throw new Error('Failed to join challenge');
      
      const challenge = get().availableChallenges.find(c => c.id === challengeId);
      if (!challenge) return;
      
      set(state => ({
        userProgress: {
          ...state.userProgress!,
          activeChallenges: [...state.userProgress!.activeChallenges, challenge]
        }
      }));
    } catch (error) {
      console.error('Failed to join challenge:', error);
      throw error;
    }
  },
  
  checkBadgeProgress: async () => {
    try {
      const response = await fetch('/api/badges/check');
      const newBadges = await response.json();
      
      set(state => ({
        userProgress: {
          ...state.userProgress!,
          badges: [...state.userProgress!.badges, ...newBadges]
        }
      }));
      
      return newBadges;
    } catch (error) {
      console.error('Failed to check badge progress:', error);
      throw error;
    }
  },
  
  updateProgress: async (daysLogged: number, streakDays: number) => {
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        body: JSON.stringify({ daysLogged, streakDays })
      });
      
      const updatedProgress = await response.json();
      set({ userProgress: updatedProgress });
      
      await get().checkBadgeProgress();
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },
  
  claimReward: async (achievementId: string) => {
    try {
      const response = await fetch('/api/achievements/claim', {
        method: 'POST',
        body: JSON.stringify({ achievementId })
      });
      
      const { xp, badge } = await response.json();
      
      set(state => ({
        userProgress: {
          ...state.userProgress!,
          xp: state.userProgress!.xp + xp,
          badges: badge ? [...state.userProgress!.badges, badge] : state.userProgress!.badges,
          achievements: state.userProgress!.achievements.map(a => 
            a.id === achievementId ? { ...a, completed: true } : a
          )
        }
      }));
    } catch (error) {
      console.error('Failed to claim reward:', error);
      throw error;
    }
  }
}));