import axios, { AxiosError, AxiosInstance } from 'axios';
import { getToken } from '@/src/lib/orchestro-client';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-Idempotency-Key'] = crypto.randomUUID();
  // Attach the Bearer token from the auth session (same token used by orchestroClient)
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message =
      error.response?.data?.message ??
      error.message ??
      'Something went wrong. Please try again.';

    console.log('[apiClient] error — status:', status, '| url:', url, '| message:', message);

    if (status === 401 && typeof window !== 'undefined') {
      console.log('[apiClient] 401 detected — dispatching auth:unauthorized event');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
