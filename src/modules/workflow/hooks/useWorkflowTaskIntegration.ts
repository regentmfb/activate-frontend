'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appToast } from '@/src/lib/toast';
import { workflowApi } from '../api/workflow.api';
import { WORKFLOW_QUERY_KEYS } from './useWorkflow';
import { TASKS_QUERY_KEYS } from '@/src/modules/tasks/hooks/useTaskBank';
import type { NonCompliantPayload } from '../types/workflow.types';

/**
 * Enhanced hook for marking accounts as non-compliant with automatic task creation
 */
export function useMarkNonCompliantWithTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: NonCompliantPayload }) => {
      // Mark as non-compliant - this automatically creates a task in the backend
      const result = await workflowApi.markNonCompliant(id, payload);
      return result;
    },
    onSuccess: (result) => {
      // Invalidate both workflow and task queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['workflow', 'compliance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate all task queries
      
      appToast.success('Account marked as non-compliant and task created for RM');
    },
    onError: (error: Error) => {
      appToast.error(error.message);
    },
  });
}

/**
 * Enhanced hook for approving compliance reviews with task completion
 */
export function useApproveComplianceWithTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => {
      // Approve compliance review - this may complete related tasks in the backend
      const result = await workflowApi.reviewApproval(id, { comments: comments || '' });
      return result;
    },
    onSuccess: () => {
      // Invalidate both workflow and task queries
      queryClient.invalidateQueries({ queryKey: ['workflow', 'compliance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      appToast.success('Compliance review approved successfully');
    },
    onError: (error: Error) => {
      appToast.error(error.message);
    },
  });
}

/**
 * Hook to get workflow-related tasks for a specific account
 */
export function useWorkflowTasksForAccount(accountId: string) {
  const queryClient = useQueryClient();
  
  // This would typically fetch tasks related to a specific account/workflow
  // For now, we'll use the existing task queries and filter client-side
  const allTasks = queryClient.getQueryData(['tasks', 'all']) as any[] || [];
  
  const workflowTasks = allTasks.filter(task => 
    task.activateRequestId === accountId || 
    task.taskType?.includes('COMPLIANCE') ||
    task.taskType?.includes('REVIEW')
  );

  return {
    tasks: workflowTasks,
    hasActiveTasks: workflowTasks.some(task => 
      task.status === 'PENDING' || task.status === 'IN_PROGRESS'
    ),
    completedTasksCount: workflowTasks.filter(task => task.status === 'COMPLETED').length,
  };
}