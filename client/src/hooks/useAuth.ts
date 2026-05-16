import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { api } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginDto, SignupDto, GoogleAuthDto } from '@guruapp/shared';

export function useAuth() {
  return useAuthStore(useShallow((s) => ({ user: s.user, accessToken: s.accessToken })));
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (dto: LoginDto) => api.post('/auth/login', dto).then((r) => r.data.data),
    onSuccess: (data) => setAuth(data),
  });
}

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (dto: SignupDto) => api.post('/auth/signup', dto).then((r) => r.data.data),
    onSuccess: (data) => setAuth(data),
  });
}

export function useGoogleAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (dto: GoogleAuthDto) => api.post('/auth/google', dto).then((r) => r.data.data),
    onSuccess: (data) => setAuth(data),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      clearAuth();
      qc.clear();
    },
  });
}
