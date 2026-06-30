import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@src/lib/api-client';
import { appToast } from '@src/lib/toast';

export type ActivateDraft = {
  id: string;
  staffId: string;
  accountCategory: string;
  accountType: string;
  draftData: any;
  createdAt: string;
  updatedAt: string;
};

export const draftsKeys = {
  all: ['drafts'] as const,
  lists: () => [...draftsKeys.all, 'list'] as const,
};

export function useGetDrafts() {
  return useQuery({
    queryKey: draftsKeys.lists(),
    queryFn: async (): Promise<ActivateDraft[]> => {
      const { data } = await apiClient.get('/drafts');
      return data.data;
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { draftId?: string; accountCategory: string; accountType: string; draftData: any }) => {
      const { data } = await apiClient.post('/drafts', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: draftsKeys.lists() });
    },
    onError: () => {
      appToast.error('Failed to save draft');
    },
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/drafts/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: draftsKeys.lists() });
    },
    onError: () => {
      appToast.error('Failed to delete draft');
    },
  });
}
