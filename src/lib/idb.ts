"use client";

const DB_NAME = "business-card-deck";
const STORE = "cards";

export type CachedCard = {
  id: string;
  name: string;
  company?: string | null;
  template?: "classic" | "split" | "minimal" | "right-anchor" | "center-focus" | "text-over-logo" | "text-under-logo";
  colorScheme?: "forest" | "ocean" | "sunset" | "slate" | "modern-black" | "classic-ivory" | "royal-plum" | "neon-cyan" | "earth-clay" | "mint-paper" | "rose-gold" | "midnight-amber" | "skyline" | "mono-paper";
  logoImage?: string | null;
  jobTitle?: string | null;
  address?: string | null;
  notes?: string | null;
  phones: string[];
  emails: string[];
  websites: string[];
  createdAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheCards(cards: CachedCard[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  store.clear();
  for (const card of cards) {
    store.put(card);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedCards(): Promise<CachedCard[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const req = store.getAll();

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as CachedCard[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export function cachedCardsToCsv(cards: CachedCard[]): string {
  const headers = [
    "id",
    "name",
    "company",
    "template",
    "colorScheme",
    "hasLogoImage",
    "jobTitle",
    "address",
    "phones",
    "emails",
    "websites",
    "notes",
    "createdAt"
  ];

  const esc = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = cards.map((card) =>
    [
      card.id,
      card.name,
      card.company || "",
      card.template || "classic",
      card.colorScheme || "forest",
      card.logoImage ? "true" : "false",
      card.jobTitle || "",
      card.address || "",
      card.phones.join(" | "),
      card.emails.join(" | "),
      card.websites.join(" | "),
      card.notes || "",
      card.createdAt
    ]
      .map(esc)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
