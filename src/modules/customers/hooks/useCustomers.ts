'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import type { Customer, CustomerSummary, CustomerDetailResponse } from '../types/customers.types';

export const CUSTOMERS_QUERY_KEYS = {
  list: (revealToken?: string) => ['customers', 'list', revealToken ?? 'masked'] as const,
  detail: (id: string, revealToken?: string) => ['customers', id, revealToken ?? 'masked'] as const,
};

// ── Normalise the API response ────────────────────────────────────────────────

function splitFullName(fullName: string): { firstName: string; lastName: string; middleName?: string } {
  const parts = (fullName ?? '').trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };
  return { firstName: parts[0], middleName: parts.slice(1, -1).join(' '), lastName: parts[parts.length - 1] };
}

function normaliseCustomer(raw: Record<string, unknown>): Customer {
  const { firstName, lastName, middleName } = splitFullName(raw.fullName as string ?? '');
  return {
    ...(raw as unknown as Customer),
    firstName: (raw.firstName as string) || firstName,
    lastName: (raw.lastName as string) || lastName,
    middleName: (raw.middleName as string) || middleName,
    mobileOnboarded: !!(raw.mobileActive ?? raw.mobileOnboarded),
    mobileActive: !!(raw.mobileActive ?? raw.mobileOnboarded),
  };
}

function extractCustomers(response: unknown): Customer[] {
  if (!response) return [];
  if (Array.isArray(response)) return response.map(normaliseCustomer);
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.customers)) return (r.customers as Record<string, unknown>[]).map(normaliseCustomer);
  if (Array.isArray(r.data)) return (r.data as Record<string, unknown>[]).map(normaliseCustomer);
  return [];
}

function extractSummary(response: unknown): CustomerSummary | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;
  return (r.summary as CustomerSummary) ?? (r.metrics as CustomerSummary) ?? null;
}

// ── Customers list ────────────────────────────────────────────────────────────

export function useCustomersList(revealToken?: string) {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.list(revealToken),
    queryFn: () => customersApi.getCustomers(revealToken),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCustomers() {
  const [search, setSearch] = useState('');
  const { revealToken } = usePinVerification();

  const { data: response, isLoading, error } = useCustomersList(revealToken ?? undefined);

  const allCustomers = extractCustomers(response);
  const summary = extractSummary(response);

  const filtered = allCustomers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.fullName ?? `${c.firstName} ${c.lastName}`).toLowerCase().includes(q) ||
      (c.accountNumber ?? '').includes(q)
    );
  });

  const mobileOnboardedCount = summary?.mobileOnboarded
    ?? allCustomers.filter((c) => c.mobileOnboarded).length;

  const withDepositCount = summary?.withDeposit
    ?? allCustomers.filter((c) => c.hasDeposit).length;

  const rawPortfolio = summary?.portfolioValue;
  const totalPortfolioValue = typeof rawPortfolio === 'number'
    ? rawPortfolio
    : allCustomers.reduce((sum, c) => sum + (c.depositValue ?? 0), 0);

  return {
    customers: filtered,
    allCustomers,
    search,
    setSearch,
    isLoading,
    error,
    mobileOnboardedCount,
    withDepositCount,
    totalPortfolioValue,
    portfolioRevealed: !!revealToken,
  };
}

// ── Customer detail ───────────────────────────────────────────────────────────

export function useCustomerById(id: string, revealToken?: string, accountId?: string) {
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customers', id, revealToken ?? 'masked', accountId ?? 'primary'],
    queryFn: async () => {
      const result = await customersApi.getCustomerById(id, revealToken, accountId);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return { customer, isLoading, error };
}

// ── Customer Inflows ──────────────────────────────────────────────────────────

export const CUSTOMER_INFLOW_QUERY_KEYS = {
  inflows: (id: string, page: number, revealToken?: string) =>
    ['customers', id, 'inflows', page, revealToken ?? 'masked'] as const,
};

export function useCustomerInflows(id: string, page: number = 1, revealToken?: string) {
  return useQuery({
    queryKey: CUSTOMER_INFLOW_QUERY_KEYS.inflows(id, page, revealToken),
    queryFn: () => customersApi.getCustomerInflows(id, page, 20, revealToken),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCustomerBankOneDetails(id: string) {
  return useQuery({
    queryKey: ['customers', id, 'bankone'] as const,
    queryFn: () => customersApi.getCustomerBankOneDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
