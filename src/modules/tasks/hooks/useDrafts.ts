'use client';

import { useEffect, useState } from 'react';

export type DraftItem = {
  id: string;
  clientReference: string;
  accountType: 'INDIVIDUAL_SAVINGS' | 'INDIVIDUAL_CURRENT';
  customerName: string | null;
  currentStep: string;
  savedAt: string;
  resumeUrl: string;
};

const DRAFT_KEYS: { key: string; accountType: DraftItem['accountType']; resumeUrl: string }[] = [
  { key: 'activate_savings_draft',  accountType: 'INDIVIDUAL_SAVINGS',  resumeUrl: '/account-opening/individual-savings'  },
  { key: 'activate_current_draft',  accountType: 'INDIVIDUAL_CURRENT',  resumeUrl: '/account-opening/individual-current' },
];

function parseDraft(raw: string, meta: typeof DRAFT_KEYS[number]): DraftItem | null {
  try {
    const parsed = JSON.parse(raw);
    const state = parsed.state;
    const biodata = state?.biodata;
    const name = biodata ? `${biodata.firstName} ${biodata.lastName}`.trim() : null;
    return {
      id: meta.key,
      clientReference: state?.clientReference ?? '—',
      accountType: meta.accountType,
      customerName: name,
      currentStep: parsed.step ?? '—',
      savedAt: new Date().toISOString(), // localStorage has no timestamp, use now as fallback
      resumeUrl: meta.resumeUrl,
    };
  } catch {
    return null;
  }
}

export function useDrafts() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  function load() {
    const result: DraftItem[] = [];
    for (const meta of DRAFT_KEYS) {
      const raw = localStorage.getItem(meta.key);
      if (raw) {
        const item = parseDraft(raw, meta);
        if (item) result.push(item);
      }
    }
    setDrafts(result);
  }

  useEffect(() => {
    load();
    // Re-read when tab regains focus (staff switches back from account opening)
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  function discardDraft(id: string) {
    const meta = DRAFT_KEYS.find((m) => m.key === id);
    if (meta) localStorage.removeItem(meta.key);
    load();
  }

  return { drafts, discardDraft, reload: load };
}
