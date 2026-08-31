"use client";

import { useCallback, useState } from "react";
import type {
  Addons, Details, SignatureDraft, Style,
} from "@/lib/signature/types";

/**
 * Editor state with typed, path-aware updaters.
 *
 * Panels are nested (style, details, addons.qr, …), so rather than threading a
 * dozen setters through the tree each panel gets a narrow updater that patches
 * only its own slice.
 */
export interface DraftApi {
  draft: SignatureDraft;
  setDraft: React.Dispatch<React.SetStateAction<SignatureDraft>>;
  patch: (partial: Partial<SignatureDraft>) => void;
  patchDetails: (partial: Partial<Details>) => void;
  patchStyle: (partial: Partial<Style>) => void;
  patchAddon: <K extends keyof Addons>(key: K, partial: Partial<Addons[K]>) => void;
  /** True once the user has changed anything, used to gate autosave. */
  dirty: boolean;
  markClean: () => void;
}

export function useSignatureDraft(initial: SignatureDraft): DraftApi {
  const [draft, setDraft] = useState<SignatureDraft>(initial);
  const [dirty, setDirty] = useState(false);

  const patch = useCallback((partial: Partial<SignatureDraft>) => {
    setDirty(true);
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const patchDetails = useCallback((partial: Partial<Details>) => {
    setDirty(true);
    setDraft((prev) => ({ ...prev, details: { ...prev.details, ...partial } }));
  }, []);

  const patchStyle = useCallback((partial: Partial<Style>) => {
    setDirty(true);
    setDraft((prev) => ({ ...prev, style: { ...prev.style, ...partial } }));
  }, []);

  const patchAddon = useCallback(
    <K extends keyof Addons>(key: K, partial: Partial<Addons[K]>) => {
      setDirty(true);
      setDraft((prev) => ({
        ...prev,
        addons: { ...prev.addons, [key]: { ...prev.addons[key], ...partial } },
      }));
    },
    [],
  );

  const wrappedSetDraft = useCallback<React.Dispatch<React.SetStateAction<SignatureDraft>>>(
    (value) => {
      setDirty(true);
      setDraft(value);
    },
    [],
  );

  const markClean = useCallback(() => setDirty(false), []);

  return { draft, setDraft: wrappedSetDraft, patch, patchDetails, patchStyle, patchAddon, dirty, markClean };
}

/** Stable-enough ids for list items created in the browser. */
export function localId(prefix: string): string {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}
