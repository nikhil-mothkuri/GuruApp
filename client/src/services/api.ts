import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookies on every request
});

// Still attach Authorization header as fallback for environments
// where cookies are blocked (native apps, curl, tests)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = (async () => {
          try {
            // Cookies are sent automatically via withCredentials
            await axios.post('/api/auth/refresh', {}, { withCredentials: true });
          } catch {
            useAuthStore.getState().clearAuth();
          } finally {
            refreshing = null;
          }
        })();
      }
      await refreshing;
      return api(original);
    }
    return Promise.reject(error);
  },
);
