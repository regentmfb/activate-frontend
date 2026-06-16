'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth.store';
import { clearToken } from '@/src/lib/orchestro-client';
import { appToast } from '@/src/lib/toast';
import { authApi } from '../api/auth.api';
import type { LoginPayload } from '../types/auth.types';

export const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'] as const,
};

export function useAuth() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  function logout() {
    clearUser();
    clearToken();
    queryClient.clear();
    appToast.logoutSuccess();
    router.push('/login');
  }

  return { user, isAuthenticated, logout };
}

export function useGetMe(options?: { enabled?: boolean }) {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: async () => {
      const user = await authApi.me();
      setUser(user);
      return user;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 10,
    retry: 1,
    throwOnError: false,
  });
}

export function useSignIn(onRedirecting?: () => void) {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => {
      setUser(user);
      appToast.loginSuccess(user.firstName);
      onRedirecting?.();
      router.replace('/dashboard');
    },
    onError: (error: Error) => {
      appToast.loginError(error.message);
    },
  });
}

export function useValidateToken(onRedirecting?: () => void) {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: async (token: string) => {
      await authApi.validate(token);
      const user = await authApi.me();
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      appToast.ssoSuccess();
      onRedirecting?.();
      router.replace('/dashboard');
    },
    onError: (error: Error) => {
      clearToken();
      appToast.ssoError(error.message);
    },
  });
}
