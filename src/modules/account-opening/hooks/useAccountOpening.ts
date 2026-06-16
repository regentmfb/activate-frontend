'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountOpeningApi } from '../api/account-opening.api';
import { appToast } from '@src/lib/toast';
import type { InitiateAccountPayload, AccountEnquiryResponse, GetAllAccountsParams } from '../types/account-request.types';

export const ACCOUNT_QUERY_KEYS = {
  myRequests: ['accounts', 'my'] as const,
  detail: (id: string) => ['accounts', id] as const,
  enquiry: (accountNumber: string) => ['accounts', 'enquiry', accountNumber] as const,
  all: (params?: GetAllAccountsParams) => ['accounts', 'all', params] as const,
};

export function useMyAccountRequests() {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.myRequests,
    queryFn: accountOpeningApi.getMyRequests,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAccountRequest(id: string, options?: { enabled?: boolean; refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.detail(id),
    queryFn: () => accountOpeningApi.getById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1000 * 30,
    refetchInterval: options?.refetchInterval,
  });
}

export function useInitiateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitiateAccountPayload) => accountOpeningApi.initiate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.myRequests });
    },
    onError: (err: Error) => {
      appToast.error(err.message || 'Failed to initiate account request');
    },
  });
}

export function useCancelAccountRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountOpeningApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.myRequests });
      appToast.success('Account request cancelled');
    },
    onError: (err: Error) => appToast.error(err.message),
  });
}

export function useRetryAccountRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountOpeningApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.myRequests });
      appToast.success('Retry queued successfully');
    },
    onError: (err: Error) => appToast.error(err.message),
  });
}

export function useAccountEnquiry(accountNumber: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.enquiry(accountNumber),
    queryFn: () => accountOpeningApi.enquiry(accountNumber),
    enabled: options?.enabled ?? !!accountNumber,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllAccountRequests(params?: GetAllAccountsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.all(params),
    queryFn: () => accountOpeningApi.getAll(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAccountRequestsByCustomer(customerId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['accounts', 'by-customer', customerId],
    queryFn: () => accountOpeningApi.getByCustomerId(customerId),
    enabled: options?.enabled ?? !!customerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCheckExistence() {
  return useMutation({
    mutationFn: ({ identifier, accountType }: { identifier: string; accountType: 'SAVINGS' | 'CURRENT' }) =>
      accountOpeningApi.checkExistence(identifier, accountType),
  });
}

