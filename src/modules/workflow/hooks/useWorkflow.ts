'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePinVerification } from '@/src/modules/pin/hooks/usePinVerification';
import { appToast } from '@/src/lib/toast';
import { workflowApi } from '../api/workflow.api';
import type {
  ReviewApprovalPayload,
  NonCompliantPayload,
  ComplianceLienPayload,
  UpdateComplianceAccountPayload,
} from '../types/workflow.types';

export const WORKFLOW_QUERY_KEYS = {
  reviews: ['workflow', 'reviews'] as const,
  reviewById: (id: string) => ['workflow', 'reviews', id] as const,
  complianceAccounts: (status?: string) => ['workflow', 'compliance', 'accounts', status] as const,
  complianceAccountById: (id: string) => ['workflow', 'compliance', 'accounts', id] as const,
};

// ── Existing workflow hooks ──────────────────────────────────────────────────

export function useWorkflowReviews() {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.reviews,
    queryFn: workflowApi.getReviews,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useWorkflowReviewById(id: string) {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.reviewById(id),
    queryFn: () => workflowApi.getReviewById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useApproveWorkflowReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      workflowApi.approveReview(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.reviews });
      appToast.success('Review approved successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message);
    },
  });
}

export function useRejectWorkflowReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      workflowApi.rejectReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.reviews });
      appToast.success('Review rejected successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message);
    },
  });
}

// ── Compliance review hooks ──────────────────────────────────────────────────

export function useComplianceAccounts(status?: 'pending' | 'reviewed' | 'rejected') {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.complianceAccounts(status),
    queryFn: () => workflowApi.getComplianceAccounts(status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useComplianceAccountById(id: string) {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.complianceAccountById(id),
    queryFn: () => workflowApi.getComplianceAccountById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useApproveComplianceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewApprovalPayload }) =>
      workflowApi.reviewApproval(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'compliance', 'accounts'] });
      appToast.success('Compliance review approved successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message);
    },
  });
}

export function useMarkNonCompliant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NonCompliantPayload }) =>
      workflowApi.markNonCompliant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'compliance', 'accounts'] });
      appToast.success('Account marked as non-compliant');
    },
    onError: (error: Error) => {
      appToast.error(error.message);
    },
  });
}

export function usePlaceComplianceLien() {
  const queryClient = useQueryClient();
  const { requirePin, revealToken } = usePinVerification();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ComplianceLienPayload }) => {
      return new Promise<void>((resolve, reject) => {
        requirePin('PLACE_LIEN', async () => {
          try {
            if (!revealToken) {
              throw new Error('PIN verification failed - no reveal token available');
            }
            const result = await workflowApi.placeComplianceLien(id, payload, revealToken);
            appToast.success(`Lien placed successfully. Reference: ${result.reference}`);
            resolve();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to place lien';
            appToast.error(message);
            reject(error);
          }
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'compliance', 'accounts'] });
    },
  });
}

export function useUpdateComplianceAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateComplianceAccountPayload }) =>
      workflowApi.updateComplianceAccount(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'compliance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.complianceAccountById(id) });
      appToast.success('Compliance account request updated successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message || 'Failed to update compliance request details');
    },
  });
}