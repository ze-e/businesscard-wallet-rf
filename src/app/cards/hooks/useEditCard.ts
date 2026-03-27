import { useState, useCallback, useMemo, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { type CachedCard } from "@/lib/idb";
import { normalizeForCompare, toUpdatePayload, readFileAsDataUrl } from '../utils';

export function useEditCard(
  online: boolean,
  loadCards: () => Promise<void>,
  setError: (error: string) => void,
  setStatusMessage: (message: string) => void,
  busyCardId: string | null,
  setBusyCardId: (id: string | null) => void
) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CachedCard | null>(null);
  const [editOriginal, setEditOriginal] = useState<CachedCard | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const hasUnsavedEditChanges = useMemo(() => {
    if (!editForm || !editOriginal) return false;
    return (
      JSON.stringify(normalizeForCompare(editForm)) !==
      JSON.stringify(normalizeForCompare(editOriginal))
    );
  }, [editForm, editOriginal]);

  const clearEditState = useCallback(() => {
    setEditingCardId(null);
    setEditForm(null);
    setEditOriginal(null);
    setShowDiscardModal(false);
  }, []);

  const startEdit = useCallback((card: CachedCard) => {
    setEditingCardId(card.id);
    setEditForm({ ...card });
    setEditOriginal({ ...card });
  }, []);

  const requestCancelEdit = useCallback(() => {
    if (hasUnsavedEditChanges) {
      setShowDiscardModal(true);
      return;
    }
    clearEditState();
  }, [hasUnsavedEditChanges, clearEditState]);

  const saveEdit = useCallback(async () => {
    if (!editingCardId || !editForm) return;
    if (!online) {
      setError("Editing requires internet connection.");
      return;
    }

    setBusyCardId(editingCardId);
    setError("");

    try {
      const res = await apiFetch(`/api/cards/${editingCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toUpdatePayload(editForm))
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update card");
      }

      await loadCards();
      clearEditState();
      setStatusMessage("Card updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update card");
    } finally {
      setBusyCardId(null);
    }
  }, [editingCardId, editForm, online, loadCards, setError, setStatusMessage, setBusyCardId, clearEditState]);

  const replaceEditLogo = useCallback(async (fileCandidate: File | null) => {
    if (!fileCandidate) return;
    const dataUrl = await readFileAsDataUrl(fileCandidate);
    setEditForm((prev) => (prev ? { ...prev, logoImage: dataUrl } : prev));
  }, []);

  const updateEditForm = useCallback((updates: Partial<CachedCard>) => {
    setEditForm((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const updateEditField = useCallback((field: keyof CachedCard, value: any) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (editingCardId && editForm) {
        requestCancelEdit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingCardId, editForm, requestCancelEdit]);

  return {
    editingCardId,
    editForm,
    editOriginal,
    showDiscardModal,
    hasUnsavedEditChanges,
    clearEditState,
    startEdit,
    requestCancelEdit,
    saveEdit,
    replaceEditLogo,
    updateEditForm,
    updateEditField
  };
}