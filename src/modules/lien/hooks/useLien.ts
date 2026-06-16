'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePinVerification } from '@/src/modules/pin/hooks/usePinVerification';
import { appToast } from '@/src/lib/toast';
import { lienApi } from '../api/lien.api';
import type {
  PlaceLienPayload,
  ReleaseLienPayload,
  SubmitLienRequestPayload,
  ReviewLienRequestPayload,
} from '../types/lien.types';

export const LIEN_QUERY_KEYS = {
  activeLiens: (page: number = 1, limit: number = 10) => ['liens', 'active', page, limit] as const,
  requests: (page: number = 1, limit: number = 10, status?: string) =>
    ['liens', 'requests', page, limit, status] as const,
  requestById: (id: string) => ['liens', 'requests', id] as const,
};

// ── Query: Get Active Liens ───────────────────────────────────────────────────

export function useActiveLiens(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: LIEN_QUERY_KEYS.activeLiens(page, limit),
    queryFn: () => lienApi.getActiveLiens(page, limit),
    staleTime: 1000 * 60 * 2,
  });
}

// ── Query: Get Lien Requests ──────────────────────────────────────────────────

export function useLienRequests(page: number = 1, limit: number = 10, status?: string) {
  return useQuery({
    queryKey: LIEN_QUERY_KEYS.requests(page, limit, status),
    queryFn: () => lienApi.getRequests(page, limit, status),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLienRequestById(id: string) {
  return useQuery({
    queryKey: LIEN_QUERY_KEYS.requestById(id),
    queryFn: () => lienApi.getRequestById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

// ── Mutation: RM Submits a Lien Request ──────────────────────────────────────

export function useSubmitLienRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitLienRequestPayload) => lienApi.submitRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liens', 'requests'] });
      appToast.success('Lien request submitted. Awaiting Team Lead approval.');
    },
    onError: (error: Error) => {
      appToast.lienError(error.message);
    },
  });
}

// ── Mutation: Team Lead / CMO Reviews a Lien Request ─────────────────────────

export function useReviewLienRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewLienRequestPayload }) =>
      lienApi.reviewRequest(id, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['liens', 'requests'] });
      if (result.status === 'REJECTED') {
        appToast.success('Lien request rejected.');
      } else if (result.status === 'PENDING_CMO' || result.status === 'PENDING_CMO_REVIEW') {
        appToast.success('Lien request approved and escalated to CMO.');
      } else if (result.status === 'PENDING_OPERATIONS') {
        appToast.success('Lien request forwarded to Operations.');
      } else {
        appToast.success('Lien request updated.');
      }
    },
    onError: (error: Error) => {
      appToast.lienError(error.message);
    },
  });
}

// ── Mutation: Operations Places the Lien ─────────────────────────────────────

export function usePlaceLienFromRequest() {
  const { requirePin, revealToken } = usePinVerification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return new Promise<void>((resolve, reject) => {
        requirePin('PLACE_LIEN', async () => {
          try {
            if (!revealToken) throw new Error('PIN verification required');
            const result = await lienApi.placeFromRequest(requestId, revealToken);
            appToast.lienPlaced(result.reference);
            resolve();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to place lien';
            appToast.lienError(message);
            reject(error);
          }
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liens'] });
    },
  });
}

// ── Mutation: Place Lien (legacy — compliance workflow) ───────────────────────

export function usePlaceLien() {
  const { requirePin, revealToken } = usePinVerification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PlaceLienPayload) => {
      return new Promise<void>((resolve, reject) => {
        requirePin('PLACE_LIEN', async () => {
          try {
            if (!revealToken) throw new Error('PIN verification required');
            const result = await lienApi.place(payload, revealToken);
            appToast.lienPlaced(result.reference);
            resolve();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to place lien';
            appToast.lienError(message);
            reject(error);
          }
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liens', 'active'] });
    },
  });
}

// ── Mutation: Release Lien ────────────────────────────────────────────────────

export function useReleaseLien() {
  const { requirePin, revealToken } = usePinVerification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReleaseLienPayload) => {
      return new Promise<void>((resolve, reject) => {
        requirePin('REMOVE_LIEN', async () => {
          try {
            if (!revealToken) throw new Error('PIN verification required');
            const result = await lienApi.release(payload, revealToken);
            appToast.lienReleased();
            resolve();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to release lien';
            appToast.lienError(message);
            reject(error);
          }
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liens', 'active'] });
    },
  });
}