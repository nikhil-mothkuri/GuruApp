import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  isGuru: false,
  isStudent: true,
  isAdmin: false,
};

const mockAuth = {
  user: mockUser,
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
};

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
});

describe('authStore — setAuth', () => {
  it('sets user, accessToken, and refreshToken', () => {
    useAuthStore.getState().setAuth(mockAuth);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-token-abc');
    expect(state.refreshToken).toBe('refresh-token-xyz');
  });
});

describe('authStore — clearAuth', () => {
  it('resets all auth state to null', () => {
    useAuthStore.getState().setAuth(mockAuth);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });
});

describe('authStore — updateTokens', () => {
  it('updates only tokens, leaves user unchanged', () => {
    useAuthStore.getState().setAuth(mockAuth);
    useAuthStore.getState().updateTokens('new-access', 'new-refresh');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
    expect(state.user).toEqual(mockUser);
  });
});
