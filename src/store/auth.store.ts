import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '@src/modules/auth/types/auth.types';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Role perspective returned by /dashboard/my — used for dashboard routing */
  dashboardView: string | null;
  /** Whether the staff member has set a PIN in Activate's DB. null = not yet checked. */
  hasPin: boolean | null;
  setUser: (user: AuthUser) => void;
  setDashboardView: (view: string) => void;
  setHasPin: (v: boolean) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      dashboardView: null,
      hasPin: null,
      setUser: (user) => {
        console.log('[AuthStore] setUser:', user?.email, '| id:', user?.id);
        set({ user, isAuthenticated: true });
      },
      setDashboardView: (view) => {
        set({ dashboardView: view });
      },
      setHasPin: (v) => {
        set({ hasPin: v });
      },
      clearUser: () => {
        console.log('[AuthStore] clearUser called');
        set({ user: null, isAuthenticated: false, dashboardView: null, hasPin: null });
      },
    }),
    {
      name: 'activate-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        dashboardView: state.dashboardView,
        hasPin: state.hasPin,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[AuthStore] rehydration error:', error);
        } else {
          console.log('[AuthStore] rehydrated — isAuthenticated:', state?.isAuthenticated, '| user:', state?.user?.email ?? null);
        }
      },
    }
  )
);
