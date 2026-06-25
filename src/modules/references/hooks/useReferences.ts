'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appToast } from '@/src/lib/toast';
import { referencesApi } from '../api/references.api';
import type { SubmitReferencesPayload, FailReferencePayload, ResubmitReferencePayload } from '../types/references.types';

export const REFERENCES_QUERY_KEYS = {
  pendingReferences: ['references', 'pending'] as const,
  allReferences: (status?: string) => ['references', 'all', status ?? 'all'] as const,
};

// ── Pending references — used by the Operations list page ─────────────────────

export function usePendingReferences() {
  return useQuery({
    queryKey: REFERENCES_QUERY_KEYS.pendingReferences,
    queryFn: referencesApi.getPendingReferences,
    staleTime: 1000 * 60 * 2,
  });
}

// ── All references with optional status filter ────────────────────────────────

export function useAllReferences(status?: 'PENDING' | 'PASSED' | 'FAILED') {
  return useQuery({
    queryKey: REFERENCES_QUERY_KEYS.allReferences(status),
    queryFn: () => referencesApi.getReferencesByStatus(status),
    staleTime: 1000 * 60 * 2,
  });
}

// ── References for a specific account — filtered client-side from all list ────
// Uses GET /activate/references (no per-account endpoint needed)

export function useReferencesByAccountId(accountId: string) {
  return useQuery({
    queryKey: ['references', 'account', accountId] as const,
    queryFn: () => referencesApi.getReferencesByAccountId(accountId),
    enabled: !!accountId,
    staleTime: 1000 * 30,
    // Treat any non-array response as an empty list to avoid .filter crashes
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

// ── Submit references ─────────────────────────────────────────────────────────

export function useSubmitReferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, payload }: { accountId: string; payload: SubmitReferencesPayload }) =>
      referencesApi.submitReferences(accountId, payload),
    onSuccess: (result, { payload }) => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      const count = result?.referencesCount ?? payload.references?.length ?? 1;
      appToast.success(`${count} reference${count > 1 ? 's' : ''} submitted successfully`);
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to submit references');
    },
  });
}

// ── Approve reference ─────────────────────────────────────────────────────────

export function usePassReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (referenceId: string) => referencesApi.passReference(referenceId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      if (result.autoTriggeredCBA) {
        appToast.success('Reference approved! Account opening automatically triggered.');
      } else {
        appToast.success('Reference approved successfully');
      }
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to approve reference');
    },
  });
}

// ── Reject reference ──────────────────────────────────────────────────────────

export function useFailReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ referenceId, payload }: { referenceId: string; payload: FailReferencePayload }) =>
      referencesApi.failReference(referenceId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      if (result.taskCreated) {
        appToast.success('Reference rejected and corrective task created for RM');
      } else {
        appToast.success('Reference rejected successfully');
      }
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to reject reference');
    },
  });
}

export function useResubmitReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ referenceId, payload }: { referenceId: string; payload: ResubmitReferencePayload }) =>
      referencesApi.resubmitReference(referenceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      appToast.success('Reference resubmitted successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to resubmit reference');
    },
  });
}
