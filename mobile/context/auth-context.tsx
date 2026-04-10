import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { api, setAuthToken } from '@/lib/api';
import type { Profile, TokenResponse } from '@/types/api';

const TOKEN_KEY = 'ironfit_access_token';

type AuthContextType = {
  token: string | null;
  loading: boolean;
  profile: Profile | null;
  signup: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await SecureStore.getItemAsync(TOKEN_KEY);
      if (saved) {
        setToken(saved);
        setAuthToken(saved);
        try {
          await refreshProfileInternal();
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setToken(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    void bootstrap();
  }, []);

  const setSession = async (accessToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setAuthToken(accessToken);
  };

  const refreshProfileInternal = async () => {
    if (!token) return;
    const res = await api.get<Profile>('/profile');
    setProfile(res.data);
  };

  const signup = async (email: string, password: string) => {
    const res = await api.post<TokenResponse>('/auth/signup', { email, password });
    await setSession(res.data.access_token);
    await refreshProfileInternal();
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<TokenResponse>('/auth/login', { email, password });
    await setSession(res.data.access_token);
    await refreshProfileInternal();
  };

  const loginWithGoogle = async () => {
    // Temporarily disabled while Google OAuth setup is pending.
    return;
  };

  const saveProfile = async (payload: Partial<Profile>) => {
    if (!token) {
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
    const res = await api.put<Profile>('/profile', payload);
    setProfile(res.data);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setProfile(null);
    setAuthToken(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      token,
      loading,
      profile,
      signup,
      login,
      loginWithGoogle,
      saveProfile,
      refreshProfile: refreshProfileInternal,
      logout,
    }),
    [token, loading, profile]
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
