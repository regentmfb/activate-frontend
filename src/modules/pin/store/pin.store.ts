import { create } from 'zustand';
import { PinVerificationReason } from '../types/pin.types';

const TOKEN_EXPIRY_MS = 20 * 60 * 1000; // 20 minutes

type PinStore = {
  isOpen: boolean;
  reason: PinVerificationReason | null;
  onSuccess: (() => void) | null;
  onCancel: (() => void) | null;
  revealToken: string | null;
  tokenExpiry: number | null;

  open: (reason: PinVerificationReason, onSuccess: () => void, onCancel?: () => void) => void;
  close: () => void;
  setRevealToken: (token: string) => void;
  clearToken: () => void;
  isTokenValid: () => boolean;
  getRevealToken: () => string | null;
};

export const usePinStore = create<PinStore>((set, get) => ({
  isOpen: false,
  reason: null,
  onSuccess: null,
  onCancel: null,
  revealToken: null,
  tokenExpiry: null,

  open: (reason, onSuccess, onCancel) => {
    set({ isOpen: true, reason, onSuccess, onCancel: onCancel ?? null });
  },

  close: () => {
    set({ isOpen: false, reason: null, onSuccess: null, onCancel: null });
  },

  setRevealToken: (token) => {
    set({ revealToken: token, tokenExpiry: Date.now() + TOKEN_EXPIRY_MS });
  },

  clearToken: () => {
    set({ revealToken: null, tokenExpiry: null });
  },

  isTokenValid: () => {
    const { tokenExpiry } = get();
    if (!tokenExpiry) return false;
    return Date.now() < tokenExpiry;
  },

  getRevealToken: () => {
    const { revealToken, tokenExpiry } = get();
    if (!tokenExpiry || Date.now() >= tokenExpiry) return null;
    return revealToken;
  },
}));
