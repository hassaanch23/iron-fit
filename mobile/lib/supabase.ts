import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * With a dev build the scheme is "mobile" (from app.json).
 * Redirect URI is always: mobile://auth/callback
 * Add this exact string in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 */
export function getAuthRedirectUri(): string {
  const uri = makeRedirectUri({ scheme: 'mobile', path: 'auth/callback' });
  if (__DEV__) {
    console.log('[IronFit] redirectUri =', uri);
  }
  return uri;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
