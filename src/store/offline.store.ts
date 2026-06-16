import { create } from 'zustand';
import { OfflineDraft } from '@/src/modules/account-opening/types/account-opening.types';

type OfflineState = {
  drafts: OfflineDraft[];
  pendingSyncCount: number;
  setDrafts: (drafts: OfflineDraft[]) => void;
  addDraft: (draft: OfflineDraft) => void;
  updateDraft: (clientReference: string, updates: Partial<OfflineDraft>) => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  drafts: [],
  pendingSyncCount: 0,
  setDrafts: (drafts) =>
    set({
      drafts,
      pendingSyncCount: drafts.filter((d) => d.syncStatus === 'PENDING_SYNC').length,
    }),
  addDraft: (draft) =>
    set((state) => ({
      drafts: [...state.drafts, draft],
      pendingSyncCount:
        draft.syncStatus === 'PENDING_SYNC'
          ? state.pendingSyncCount + 1
          : state.pendingSyncCount,
    })),
  updateDraft: (clientReference, updates) =>
    set((state) => {
      const drafts = state.drafts.map((d) =>
        d.clientReference === clientReference ? { ...d, ...updates } : d
      );
      return {
        drafts,
        pendingSyncCount: drafts.filter((d) => d.syncStatus === 'PENDING_SYNC').length,
      };
    }),
}));
