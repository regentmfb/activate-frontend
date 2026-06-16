'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationVerificationApi } from '../api/location-verification.api';
import { appToast } from '@src/lib/toast';
import type { 
  SubmitLocationVerificationPayload, 
  LocationManualReviewPayload 
} from '../types/location-verification.types';

export const LOCATION_VERIFICATION_KEYS = {
  detail: (id: string) => ['location-verifications', id] as const,
};

export function useSubmitLocationVerification() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubmitLocationVerificationPayload }) => 
      locationVerificationApi.submitLocationVerification(id, payload),
    onError: (err: Error) => appToast.error(`Location verification failed: ${err.message}`),
  });
}

export function useLocationVerification(id: string) {
  return useQuery({
    queryKey: LOCATION_VERIFICATION_KEYS.detail(id),
    queryFn: () => locationVerificationApi.getLocationVerification(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

export function useLatestLocationVerificationByRequest(requestId: string) {
  return useQuery({
    queryKey: ['location-verifications', 'request', requestId],
    queryFn: () => locationVerificationApi.getLatestByRequest(requestId),
    enabled: !!requestId,
    staleTime: 1000 * 30,
  });
}

export function useSubmitLocationManualReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LocationManualReviewPayload }) => 
      locationVerificationApi.submitManualReview(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LOCATION_VERIFICATION_KEYS.detail(id) });
      appToast.success('Location review submitted successfully');
    },
    onError: (err: Error) => appToast.error(`Review failed: ${err.message}`),
  });
}

export function useLocationVerifications(params: {
  status: 'pending' | 'approved' | 'rejected';
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: ['location-verifications', 'list', params],
    queryFn: () => locationVerificationApi.listVerifications(params),
    staleTime: 1000 * 30,
  });
}
