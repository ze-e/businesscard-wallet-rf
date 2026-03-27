"use client";

import { useEffect, useState } from "react";
import type { CreateCardInput, ExtractedCard } from "@/lib/schemas";
import { EMPTY_CARD, mapExtractedCardToCreateCardInput } from "@/lib/cards/card-mappers";
import type { DuplicateResponse } from "@/lib/cards/card-types";
import {
  extractCardFromImage,
  getApiKeySettings,
  getCurrentUser,
  mergeCardIntoExisting,
  saveCard
} from "@/lib/cards/card-wallet-api";
import { readFileAsDataUrl } from "@/lib/files/read-file-as-data-url";
import { cropLogoFromFile } from "@/lib/logo/crop-logo-from-file";

export function useCapturePage() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [file, setFile] = useState<File | null>(null);
  const [card, setCardState] = useState<CreateCardInput>(EMPTY_CARD);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateResponse | null>(null);
  const [mergeCard, setMergeCardState] = useState<CreateCardInput>(EMPTY_CARD);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateOnlineStatus = () => {
      setOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const authResponse = await getCurrentUser();
        if (!authResponse.ok) {
          setAuthenticated(false);
          setApiReady(false);
          return;
        }

        setAuthenticated(true);

        const settingsResponse = await getApiKeySettings();
        if (!settingsResponse.ok) {
          setApiReady(false);
          return;
        }

        const settingsData = await settingsResponse.json();
        setApiReady(!!settingsData.hasApiKey);
      } catch {
        setAuthenticated(false);
        setApiReady(false);
      }
    }

    void bootstrap();
  }, []);

  function setCard(updater: (prev: CreateCardInput) => CreateCardInput) {
    setCardState((prev) => updater(prev));
  }

  function setMergeCard(updater: (prev: CreateCardInput) => CreateCardInput) {
    setMergeCardState((prev) => updater(prev));
  }

  async function extract() {
    if (!file) {
      setError("Choose a card image first.");
      return;
    }

    setBusy(true);
    setError("");
    setDuplicate(null);

    try {
      const response = await extractCardFromImage(file);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      const extractedCard = data.extractedCard as ExtractedCard;
      let logoImage = extractedCard.logoImage ?? null;

      if (extractedCard.logoBox) {
        logoImage = await cropLogoFromFile(file, extractedCard.logoBox);
      }

      setCardState(mapExtractedCardToCreateCardInput(extractedCard, logoImage));
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Extraction failed");
    } finally {
      setBusy(false);
    }
  }

  async function save(saveAsNew = false) {
    setBusy(true);
    setError("");

    try {
      const response = await saveCard(card, saveAsNew);
      const data = await response.json();

      if (response.status === 409) {
        const duplicateResponse = data as DuplicateResponse;
        setDuplicate(duplicateResponse);
        setMergeCardState(duplicateResponse.extractedCard);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to save card");
      }

      setCardState(EMPTY_CARD);
      setFile(null);
      setDuplicate(null);
      setModalMessage("Card saved successfully.");
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Failed to save card");
    } finally {
      setBusy(false);
    }
  }

  async function merge() {
    if (!duplicate) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await mergeCardIntoExisting(duplicate.existingCard.id, mergeCard);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to merge card");
      }

      setDuplicate(null);
      setCardState(EMPTY_CARD);
      setModalMessage("Card merged successfully.");
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Merge failed");
    } finally {
      setBusy(false);
    }
  }

  async function replaceLogoFromFile(fileCandidate: File | null, target: "card" | "merge") {
    if (!fileCandidate) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(fileCandidate);

    if (target === "card") {
      setCardState((prev) => ({
        ...prev,
        logoImage: dataUrl
      }));
      return;
    }

    setMergeCardState((prev) => ({
      ...prev,
      logoImage: dataUrl
    }));
  }

  function removeCardLogo() {
    setCardState((prev) => ({
      ...prev,
      logoImage: null
    }));
  }

  function removeMergeCardLogo() {
    setMergeCardState((prev) => ({
      ...prev,
      logoImage: null
    }));
  }

  function closeDuplicate() {
    setDuplicate(null);
  }

  function clearModalMessage() {
    setModalMessage("");
  }

  return {
    online,
    file,
    card,
    error,
    busy,
    apiReady,
    authenticated,
    duplicate,
    mergeCard,
    modalMessage,
    setFile,
    setCard,
    setMergeCard,
    extract,
    save,
    merge,
    closeDuplicate,
    clearModalMessage,
    replaceLogoFromFile,
    removeCardLogo,
    removeMergeCardLogo
  };
}