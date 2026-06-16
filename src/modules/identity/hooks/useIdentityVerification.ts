'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appToast } from '@/src/lib/toast';
import { identityApi } from '../api/identity.api';
import type {
  StartVerificationPayload,
  VerifyCodePayload,
  ConfirmBiodataPayload,
  PictureVerificationPayload,
  ManualModePayload,
  RejectManualPayload,
} from '../types/identity.types';

export const IDENTITY_QUERY_KEYS = {
  session: (id: string) => ['identity', 'session', id] as const,
};

export function useStartVerification() {
  return useMutation({
    mutationFn: (payload: StartVerificationPayload) => identityApi.start(payload),
  });
}

export function useVerifyCode() {
  return useMutation({
    mutationFn: (payload: VerifyCodePayload) => identityApi.verifyCode(payload),
  });
}

export function useConfirmBiodata() {
  return useMutation({
    mutationFn: (payload: ConfirmBiodataPayload) => identityApi.confirmBiodata(payload),
  });
}

export function usePictureVerification() {
  return useMutation({
    mutationFn: (payload: PictureVerificationPayload) => identityApi.pictureVerification(payload),
  });
}

export function useSwitchToManual() {
  return useMutation({
    mutationFn: (payload: ManualModePayload) => identityApi.switchToManual(payload),
  });
}

export function useApproveManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => identityApi.approveManual(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: IDENTITY_QUERY_KEYS.session(id) });
      queryClient.invalidateQueries({ queryKey: ['identity', 'manual-sessions'] });
      appToast.success('Manual verification approved successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to approve manual verification');
    },
  });
}

export function useRejectManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectManualPayload }) =>
      identityApi.rejectManual(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: IDENTITY_QUERY_KEYS.session(id) });
      queryClient.invalidateQueries({ queryKey: ['identity', 'manual-sessions'] });
      appToast.success('Manual verification rejected successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to reject manual verification');
    },
  });
}

export function useVerificationSession(id: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: IDENTITY_QUERY_KEYS.session(id),
    queryFn: () => identityApi.getSession(id),
    enabled: options?.enabled ?? !!id,
    refetchInterval: options?.refetchInterval,
    staleTime: 0,
  });
}

export function useManualIdentitySessions(params?: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected' }) {
  return useQuery({
    queryKey: ['identity', 'manual-sessions', params] as const,
    queryFn: () => identityApi.getManualSessions(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateQoreIdSession() {
  return useMutation({
    mutationFn: (id: string) => identityApi.createQoreIdSession(id),
  });
}
