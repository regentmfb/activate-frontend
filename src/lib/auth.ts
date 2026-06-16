// Auth uses HTTP-only cookies set by the backend.
// This file holds client-side auth helpers only.

export function clearClientSession(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
