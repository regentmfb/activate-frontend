import { create } from 'zustand';

type AppState = {
  isOnline: boolean;
  isPinModalOpen: boolean;
  pinAction: (() => void) | null;
  setOnline: (status: boolean) => void;
  openPinModal: (action: () => void) => void;
  closePinModal: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  isPinModalOpen: false,
  pinAction: null,
  setOnline: (status) => set({ isOnline: status }),
  openPinModal: (action) => set({ isPinModalOpen: true, pinAction: action }),
  closePinModal: () => set({ isPinModalOpen: false, pinAction: null }),
}));
