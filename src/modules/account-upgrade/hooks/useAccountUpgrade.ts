'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountUpgradeApi } from '../api/account-upgrade.api';
import { appToast } from '@src/lib/toast';
import type { Tier2UpgradePayload, Tier3UpgradePayload } from '../types/account-upgrade.types';

export const UPGRADE_QUERY_KEYS = {
  all: (params?: object) => ['tier-upgrades', 'list', params] as const,
  detail: (id: string) => ['tier-upgrades', id] as const,
};

// ── List all tier upgrades ────────────────────────────────────────────────────

export function useUpgradesList(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: UPGRADE_QUERY_KEYS.all(params),
    queryFn: () => accountUpgradeApi.getUpgrades(params),
    staleTime: 1000 * 60 * 2,
  });
}

// ── Single upgrade record ─────────────────────────────────────────────────────

export function useUpgradeById(id: string) {
  return useQuery({
    queryKey: UPGRADE_QUERY_KEYS.detail(id),
    queryFn: () => accountUpgradeApi.getUpgradeById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

// ── Submit Tier 2 upgrade ─────────────────────────────────────────────────────

export function useSubmitTier2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activateRequestId, payload }: { activateRequestId: string; payload: Tier2UpgradePayload }) =>
      accountUpgradeApi.submitTier2(activateRequestId, payload),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['tier-upgrades'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err: Error) => {
      appToast.error(err.message || 'Failed to submit Tier 2 upgrade');
    },
  });
}

// ── Submit Tier 3 upgrade ─────────────────────────────────────────────────────

export function useSubmitTier3() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activateRequestId, payload }: { activateRequestId: string; payload: Tier3UpgradePayload }) =>
      accountUpgradeApi.submitTier3(activateRequestId, payload),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['tier-upgrades'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err: Error) => {
      appToast.error(err.message || 'Failed to submit Tier 3 upgrade');
    },
  });
}

// ── Retry a failed upgrade ────────────────────────────────────────────────────

export function useRetryUpgrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountUpgradeApi.retryUpgrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tier-upgrades'] });
      appToast.success('Upgrade retry initiated');
    },
    onError: (err: Error) => {
      appToast.error(err.message || 'Failed to retry upgrade');
    },
  });
}
