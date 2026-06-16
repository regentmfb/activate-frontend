import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'sonner';

const TOKEN_KEY = 'orchestro_token';

let _token: string | null = null;

export function getToken(): string | null {
  return _token;
}

export function saveToken(token: string): void {
  _token = token;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  _token = null;
  sessionStorage.removeItem(TOKEN_KEY);
}

function loadToken(): void {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (stored) _token = stored;
}

// Rehydrate on module load (runs once on page load/refresh)
if (typeof window !== 'undefined') loadToken();

const orchestroClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ORCHESTRO_API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

orchestroClient.interceptors.request.use((config) => {
  if (_token) config.headers['Authorization'] = `Bearer ${_token}`;
  return config;
});

orchestroClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (typeof data?.message === 'string' ? data.message : undefined) ??
      error.message ??
      'Something went wrong. Please try again.';

    console.log('[orchestroClient] error — status:', status, '| url:', url, '| message:', message);

    if (status === 401 && typeof window !== 'undefined') {
      console.log('[orchestroClient] 401 detected — dispatching auth:unauthorized event');
      clearToken();
      toast.error('Session expired. Please sign in again.');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(new Error(message));
  }
);

export default orchestroClient;
