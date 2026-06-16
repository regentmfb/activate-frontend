import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateClientReference(): string {
  return `CR-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function formatCurrency(value: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(value);
}

export function maskValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
