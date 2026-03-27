import { apiFetch } from "@/lib/api-client";
import type { CreateCardInput } from "@/lib/schemas";

export function getCurrentUser() {
  return apiFetch("/api/auth/me");
}

export function getApiKeySettings() {
  return apiFetch("/api/settings/api-key");
}

export function extractCardFromImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return apiFetch("/api/cards/extract", {
    method: "POST",
    body: formData
  });
}

export function saveCard(card: CreateCardInput, saveAsNew: boolean) {
  return apiFetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card, saveAsNew })
  });
}

export function mergeCardIntoExisting(existingCardId: string, mergedCard: CreateCardInput) {
  return apiFetch("/api/cards/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      existingCardId,
      mergedCard
    })
  });
}