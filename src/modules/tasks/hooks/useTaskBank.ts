'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { appToast } from '@src/lib/toast';
import type { ApiTask, Task } from '../types/tasks.types';
import type { AccountType } from '@src/modules/account-opening/types/account-opening.types';

export const TASKS_QUERY_KEYS = {
  myTasks: ['tasks', 'my'] as const,
  taskById: (id: string) => ['tasks', id] as const,
};

function apiTaskToTask(t: ApiTask): Task {
  return {
    id: t.id,
    customerName: t.customerName || t.customerId || 'Unknown',
    accountType: (t.accountType as AccountType) || 'INDIVIDUAL_SAVINGS',
    status: t.status as Task['status'],
    priority: t.priority ?? 'MEDIUM',
    updatedAt: t.completedAt ?? t.cancelledAt ?? t.updatedAt ?? t.createdAt,
    createdAt: t.createdAt,
    requestId: t.activateRequestId || '',
    title: t.title,
    description: t.description,
    taskType: t.taskType,
    customerId: t.customerId || undefined,
    activateRequestId: t.activateRequestId || undefined,
    assignedTo: t.assignedTo,
    assignedBy: t.assignedBy,
    escalatedAt: t.escalatedAt,
    escalationReason: t.escalationReason || undefined,
    request: t.request,
    customer: t.customer,
    verification: t.verification,
    documents: t.documents,
  };
}

// ── Task queries ──────────────────────────────────────────────────────────────

export function useTaskBank(params?: {
  page?: number;
  limit?: number;
  statusGroup?: 'active' | 'review' | 'completed' | 'all';
  searchQuery?: string;
}) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      ...TASKS_QUERY_KEYS.myTasks,
      params?.page ?? 1,
      params?.limit ?? 10,
      params?.statusGroup ?? 'active',
      params?.searchQuery ?? '',
    ],
    queryFn: () => tasksApi.getMyTasks(params),
    staleTime: 1000 * 60 * 2,
  });

  const tasksArray = data?.tasks ?? [];
  const tasks = useMemo(() => tasksArray.map(apiTaskToTask), [tasksArray]);

  return {
    tasks,
    rawTasks: tasksArray,
    meta: data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    isLoading,
    isFetching,
    error,
  };
}

export function useTaskById(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: TASKS_QUERY_KEYS.taskById(id),
    queryFn: () => tasksApi.getTaskById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  const task = useMemo(() => (data ? apiTaskToTask(data) : undefined), [data]);

  return {
    task,
    rawTask: data,
    isLoading,
    error,
  };
}

// ── Task mutations ────────────────────────────────────────────────────────────

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      appToast.success('Task marked as completed');
    },
    onError: (err: Error) => appToast.error(err.message),
  });
}

export function useCancelTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      appToast.success('Task cancelled');
    },
    onError: (err: Error) => appToast.error(err.message),
  });
}

export function usePendingTasksCount() {
  return useQuery({
    queryKey: ['tasks', 'pending-count'] as const,
    queryFn: () => tasksApi.getPendingCount(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // refresh count every 30 seconds
  });
}
