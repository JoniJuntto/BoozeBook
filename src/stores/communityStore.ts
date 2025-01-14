import { create } from "zustand";
import { supabase } from "../integrations/supabase/client";

interface Drink {
  id: string;
  type: string;
  volume_ml: number;
  alcohol_percentage: number;
  consumed_at: string;
  user_id: string;
}

interface CommunityState {
  drinks: Drink[];
  totalUsers: number;
  loading: boolean;
  error: string | null;
  fetchCommunityData: () => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  drinks: [],
  totalUsers: 0,
  loading: true,
  error: null,
  fetchCommunityData: async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [{ count: usersCount }, { data: drinks }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .not("id", "is", null),
        supabase
          .from("drinks")
          .select("*")
          .gte("consumed_at", thirtyDaysAgo.toISOString()),
      ]);

      set({
        drinks: drinks || [],
        totalUsers: usersCount || 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching community data:", error);
      set({
        loading: false,
        error: "Failed to load community data",
      });
    }
  },
}));
