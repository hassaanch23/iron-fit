import axios from 'axios';
import Constants from 'expo-constants';

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
