import apiClient from '@/src/lib/api-client';
import type { ApiTask } from '../types/tasks.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

type PaginatedResponse<T> = {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const http = apiClient;

export const tasksApi = {
  
  getMyTasks: async (params?: {
    page?: number;
    limit?: number;
    statusGroup?: 'active' | 'review' | 'completed' | 'all';
    searchQuery?: string;
  }): Promise<{ tasks: ApiTask[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const { data } = await http.get<ApiEnvelope<PaginatedResponse<ApiTask[]> | ApiTask[]>>(
      '/activate/tasks/my',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          statusGroup: params?.statusGroup ?? 'active',
          searchQuery: params?.searchQuery || undefined,
        },
      }
    );

    let tasksData: ApiTask[];
    let meta = { total: 0, page: 1, limit: 20, totalPages: 1 };

    if (data.data && typeof data.data === 'object' && 'data' in data.data) {
      const paginated = data.data as PaginatedResponse<ApiTask[]>;
      tasksData = paginated.data;
      if (paginated.meta) meta = paginated.meta;
    } else if (Array.isArray(data.data)) {
      tasksData = data.data;
      meta.total = tasksData.length;
    } else {
      tasksData = [];
    }

    return { tasks: tasksData, meta };
  },

  getTaskById: async (id: string): Promise<ApiTask> => {
    const { data } = await http.get<ApiEnvelope<ApiTask>>(`/activate/tasks/${id}`);
    return data.data;
  },

  complete: async (id: string): Promise<ApiTask> => {
    const { data } = await http.post<ApiEnvelope<ApiTask>>(`/activate/tasks/${id}/complete`);
    return data.data;
  },

  cancel: async (id: string): Promise<ApiTask> => {
    const { data } = await http.post<ApiEnvelope<ApiTask>>(`/activate/tasks/${id}/cancel`);
    return data.data;
  },

  getPendingCount: async (): Promise<number> => {
    const { data } = await http.get<ApiEnvelope<{ count: number } | number>>('/activate/tasks/pending-count');
    if (data && data.data !== undefined) {
      if (typeof data.data === 'object' && data.data !== null && 'count' in data.data) {
        return (data.data as { count: number }).count;
      }
      if (typeof data.data === 'number') {
        return data.data;
      }
    }
    const raw = data as unknown as { count: number } | number;
    if (typeof raw === 'number') return raw;
    return raw?.count ?? 0;
  },
};
