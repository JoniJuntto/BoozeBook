import { create } from 'zustand';
import { supabase } from '../integrations/supabase/client';

interface Suggestion {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  created_at: string;
}

interface SuggestionStore {
  loading: boolean;
  error: string | null;
  createSuggestion: (title: string, content: string, category: string) => Promise<void>;
}

export const useSuggestionStore = create<SuggestionStore>((set) => ({
  loading: false,
  error: null,
  createSuggestion: async (title: string, content: string, category: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('suggestions').insert([
        {
          title,
          content,
          category,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);
      if (error) throw error;
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
})); 