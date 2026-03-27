import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { type CachedCard } from "@/lib/idb";
import { toUpdatePayload } from '../utils';

export function useStyleCard(
  online: boolean,
  loadCards: () => Promise<void>,
  setError: (error: string) => void,
  setStatusMessage: (message: string) => void,
  busyCardId: string | null,
  setBusyCardId: (id: string | null) => void
) {
  const [stylingCard, setStylingCard] = useState<CachedCard | null>(null);

  const startStyle = useCallback((card: CachedCard) => {
    setStylingCard({ ...card });
  }, []);

  const closeStyle = useCallback(() => {
    setStylingCard(null);
  }, []);

  const saveStyle = useCallback(async () => {
    if (!stylingCard) return;
    if (!online) {
      setError("Styling requires internet connection.");
      return;
    }

    setBusyCardId(stylingCard.id);
    setError("");

    try {
      const res = await apiFetch(`/api/cards/${stylingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toUpdatePayload(stylingCard))
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save card style");
      }

      await loadCards();
      setStylingCard(null);
      setStatusMessage("Card style updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save card style");
      await loadCards();
    } finally {
      setBusyCardId(null);
    }
  }, [stylingCard, online, loadCards, setError, setStatusMessage, setBusyCardId]);

  const updateStyleForm = useCallback((updates: Partial<CachedCard>) => {
    setStylingCard((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const updateStyleField = useCallback((field: keyof CachedCard, value: any) => {
    setStylingCard((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  return { stylingCard, startStyle, saveStyle, closeStyle, updateStyleForm, updateStyleField };
};