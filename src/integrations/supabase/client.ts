import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://henjmkejmmjpiwdpiiuu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlbmpta2VqbW1qcGl3ZHBpaXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0OTgwMTQsImV4cCI6MjA1MjA3NDAxNH0.tL7L6ICbGQuYdPzqWXfneK7UT4vFj5bKQB4yOUtCZ8Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
