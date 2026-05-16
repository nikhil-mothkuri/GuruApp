import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '@guruapp/shared';

type User = AuthResponse['user'];

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
      updateTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
    }),
    {
      name: 'sakshambharat-auth',
      // Persist only user identity — tokens now live in httpOnly cookies.
      // accessToken/refreshToken kept in memory for the Authorization header fallback.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
