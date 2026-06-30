import { create } from 'zustand';

export type MessageType = 'success' | 'error' | 'info';

export interface BusinessMessageOptions {
  type: MessageType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
}

interface MessageState {
  isOpen: boolean;
  message: BusinessMessageOptions | null;
  showMessage: (options: BusinessMessageOptions) => void;
  closeMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isOpen: false,
  message: null,
  showMessage: (options) => set({ isOpen: true, message: options }),
  closeMessage: () => set({ isOpen: false }),
}));
