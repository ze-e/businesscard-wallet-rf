import { CardTemplate, CardColorScheme, ImportCardPayload } from './types';
import { CachedCard } from '@/lib/idb';

/** Splits a string by commas or newlines into trimmed array */
export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Splits a pipe-separated string into trimmed array */
export function splitPipeSeparated(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Normalizes import record to ImportCardPayload */
export function normalizeImportCard(record: unknown): ImportCardPayload | null {
  if (!record || typeof record !== "object") return null;
  const source = record as Record<string, unknown>;
  const name = typeof source.name === "string" ? source.name.trim() : "";
  if (!name) return null;

  const template = typeof source.template === "string" ? source.template : "classic";
  const colorScheme = typeof source.colorScheme === "string" ? source.colorScheme : "forest";
  const phonesFromObjects = Array.isArray(source.phones)
    ? source.phones
        .map((p) => (p && typeof p === "object" ? (p as { value?: unknown }).value : p))
        .filter((v): v is string => typeof v === "string" && !!v.trim())
        .map((v) => v.trim())
    : [];
  const emailsFromObjects = Array.isArray(source.emails)
    ? source.emails
        .map((e) => (e && typeof e === "object" ? (e as { value?: unknown }).value : e))
        .filter((v): v is string => typeof v === "string" && !!v.trim())
        .map((v) => v.trim())
    : [];
  const websitesFromObjects = Array.isArray(source.websites)
    ? source.websites
        .map((w) => (w && typeof w === "object" ? (w as { value?: unknown }).value : w))
        .filter((v): v is string => typeof v === "string" && !!v.trim())
        .map((v) => v.trim())
    : [];

  const phones =
    phonesFromObjects.length > 0
      ? phonesFromObjects
      : Array.isArray(source.phoneNumbers)
        ? source.phoneNumbers.filter((v): v is string => typeof v === "string" && !!v.trim()).map((v) => v.trim())
        : Array.isArray(source.phones)
          ? source.phones.filter((v): v is string => typeof v === "string" && !!v.trim()).map((v) => v.trim())
          : splitPipeSeparated(source.phones);

  const emails =
    emailsFromObjects.length > 0
      ? emailsFromObjects
      : Array.isArray(source.emails)
        ? source.emails.filter((v): v is string => typeof v === "string" && !!v.trim()).map((v) => v.trim())
        : splitPipeSeparated(source.emails);

  const websites =
    websitesFromObjects.length > 0
      ? websitesFromObjects
      : Array.isArray(source.websites)
        ? source.websites.filter((v): v is string => typeof v === "string" && !!v.trim()).map((v) => v.trim())
        : splitPipeSeparated(source.websites);

  return {
    name,
    company: typeof source.company === "string" ? source.company.trim() || null : null,
    template: template as CardTemplate,
    colorScheme: colorScheme as CardColorScheme,
    logoImage: typeof source.logoImage === "string" ? source.logoImage : null,
    jobTitle: typeof source.jobTitle === "string" ? source.jobTitle.trim() || null : null,
    address: typeof source.address === "string" ? source.address.trim() || null : null,
    notes: typeof source.notes === "string" ? source.notes.trim() || null : null,
    phoneNumbers: phones,
    emails,
    websites,
    confidence: null,
    rawText: null,
    imageUrl: null
  };
}

/** Reads file as data URL */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Normalizes card for comparison */
export function normalizeForCompare(card: CachedCard) {
  return {
    name: card.name,
    company: card.company || "",
    template: card.template || "classic",
    colorScheme: card.colorScheme || "forest",
    logoImage: card.logoImage || "",
    jobTitle: card.jobTitle || "",
    address: card.address || "",
    notes: card.notes || "",
    phones: card.phones,
    emails: card.emails,
    websites: card.websites
  };
}

/** Downloads content as file */
export function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Converts card to update payload */
export function toUpdatePayload(card: CachedCard) {
  return {
    card: {
      name: card.name,
      company: card.company || null,
      template: card.template || "classic",
      colorScheme: card.colorScheme || "forest",
      logoImage: card.logoImage || null,
      jobTitle: card.jobTitle || null,
      address: card.address || null,
      notes: card.notes || null,
      phoneNumbers: card.phones,
      emails: card.emails,
      websites: card.websites,
      confidence: null,
      rawText: null,
      imageUrl: null
    }
  };
}