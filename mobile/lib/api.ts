import axios from 'axios';
import Constants from 'expo-constants';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const extraApiUrl = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const fallbackApiUrl = 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: envApiUrl ?? extraApiUrl ?? fallbackApiUrl,
  timeout: 10000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

/** On every request, attach the latest Supabase access_token. */
api.interceptors.request.use(async (config) => {
  if (!isSupabaseConfigured()) return config;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
