import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { signInWithGoogleOAuth } from '@/lib/google-oauth';
import { extractOAuthCodeFromUrl } from '@/lib/oauth-parse';
import { api, setAuthToken } from '@/lib/api';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Profile } from '@/types/api';
import { debugLog } from '@/lib/debug-log';

function userToProfile(user: User): Profile {
  const m = user.user_metadata ?? {};
  return {
    user_id: 0,
    name: (m.name as string) ?? user.email?.split('@')[0] ?? null,
    age: typeof m.age === 'number' ? m.age : m.age != null ? Number(m.age) : null,
    height_cm: m.height_cm != null ? Number(m.height_cm) : null,
    weight_kg: m.weight_kg != null ? Number(m.weight_kg) : null,
    goal_type: (m.goal_type as string) ?? null,
    target_value: m.target_value != null ? Number(m.target_value) : null,
  };
}

/** Prefer API fields when set; otherwise keep Supabase user_metadata (baseline may only live there). */
function mergeProfiles(api: Profile, meta: Profile): Profile {
  return {
    user_id: api.user_id,
    name: api.name ?? meta.name,
    age: api.age ?? meta.age,
    height_cm: api.height_cm ?? meta.height_cm,
    weight_kg: api.weight_kg ?? meta.weight_kg,
    goal_type: api.goal_type ?? meta.goal_type,
    target_value: api.target_value ?? meta.target_value,
  };
}

async function syncProfileFromSupabaseUser(user: User | null): Promise<Profile | null> {
  if (!user) return null;
  const fromMeta = userToProfile(user);
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      setAuthToken(session.access_token);
      const res = await api.get<Profile>('/profile');
      return mergeProfiles(res.data, fromMeta);
    }
  } catch {
    // FastAPI may not accept Supabase JWT yet — keep metadata profile
  }
  return fromMeta;
}

function isProfileComplete(p: Profile | null): boolean {
  if (!p) return false;
  return Boolean(p.name && p.weight_kg && p.height_cm);
}

type AuthContextType = {
  token: string | null;
  loading: boolean;
  profile: Profile | null;
  onboardingComplete: boolean;
  signup: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  saveProfile: (payload: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const applySession = async (session: Session | null) => {
    if (!session) {
      setToken(null);
      setProfile(null);
      setAuthToken(null);
      return;
    }
    setToken(session.access_token);
    setAuthToken(session.access_token);
    const next = await syncProfileFromSupabaseUser(session.user);
    setProfile(next ?? userToProfile(session.user));
  };

  useEffect(() => {
    const configured = isSupabaseConfigured();
    debugLog('Auth', 'init', { supabaseConfigured: configured });

    if (!configured) {
      setLoading(false);
      return;
    }

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      debugLog('Auth', 'getSession finished', {
        hasSession: !!session,
        userId: session?.user?.id ? '(present)' : null,
      });
      await applySession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      if (!url.includes('code=') && !url.includes('access_token=')) return;
      const code = extractOAuthCodeFromUrl(url);
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return;
      }
    };

    void Linking.getInitialURL().then((url) => void handleDeepLink(url));
    const sub = Linking.addEventListener('url', ({ url }) => void handleDeepLink(url));
    return () => sub.remove();
  }, []);

  const refreshProfileInternal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const next = await syncProfileFromSupabaseUser(user);
      setProfile(next ?? userToProfile(user));
    }
  };

  const signup = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message?.toLowerCase().includes('rate') || error.status === 429) {
        throw new Error('Too many attempts. Please wait a moment and try again.');
      }
      throw error;
    }
    if (data.session) {
      await applySession(data.session);
    }
    // No session = email confirmation required → caller navigates to OTP screen
  };

  const verifyOtp = async (email: string, code: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
    }
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    if (error) {
      if (error.message?.toLowerCase().includes('rate') || error.status === 429) {
        throw new Error('Too many attempts. Please wait a moment and try again.');
      }
      if (error.message?.toLowerCase().includes('expired')) {
        throw new Error('Code expired. Tap "Resend" to get a new one.');
      }
      throw new Error('Invalid code. Please check and try again.');
    }
    if (data.session) {
      await applySession(data.session);
    }
  };

  const resendOtp = async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      if (error.message?.toLowerCase().includes('rate') || error.status === 429) {
        throw new Error('Please wait before requesting another code.');
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message?.toLowerCase().includes('rate') || error.status === 429) {
        throw new Error('Too many attempts. Please wait a moment and try again.');
      }
      if (error.message?.toLowerCase().includes('invalid login')) {
        throw new Error('Incorrect email or password');
      }
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please confirm your email first. Check your inbox.');
      }
      throw error;
    }
    await applySession(data.session);
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
    }
    await signInWithGoogleOAuth();
  };

  const saveProfile = async (payload: Partial<Profile>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile((prev) => ({
        user_id: prev?.user_id ?? 0,
        name: payload.name ?? prev?.name ?? null,
        age: payload.age ?? prev?.age ?? null,
        height_cm: payload.height_cm ?? prev?.height_cm ?? null,
        weight_kg: payload.weight_kg ?? prev?.weight_kg ?? null,
        goal_type: payload.goal_type ?? prev?.goal_type ?? null,
        target_value: payload.target_value ?? prev?.target_value ?? null,
      }));
      return;
    }

    const nextMeta = {
      ...user.user_metadata,
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.age !== undefined && { age: payload.age }),
      ...(payload.height_cm !== undefined && { height_cm: payload.height_cm }),
      ...(payload.weight_kg !== undefined && { weight_kg: payload.weight_kg }),
      ...(payload.goal_type !== undefined && { goal_type: payload.goal_type }),
      ...(payload.target_value !== undefined && { target_value: payload.target_value }),
    };

    const { error } = await supabase.auth.updateUser({ data: nextMeta });
    if (error) throw error;

    const {
      data: { user: updated },
    } = await supabase.auth.getUser();
    if (updated) {
      setProfile(userToProfile(updated));
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAuthToken(session.access_token);
        await api.put<Profile>('/profile', payload);
      }
    } catch {
      // Backend optional
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setToken(null);
    setProfile(null);
    setAuthToken(null);
  };

  const onboardingComplete = isProfileComplete(profile);

  const value = useMemo<AuthContextType>(
    () => ({
      token,
      loading,
      profile,
      onboardingComplete,
      signup,
      verifyOtp,
      resendOtp,
      login,
      loginWithGoogle,
      saveProfile,
      refreshProfile: refreshProfileInternal,
      logout,
    }),
    [token, loading, profile, onboardingComplete]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
