"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusModal } from "@/components/StatusModal";
import { apiFetch } from "@/lib/api-client";
import { cacheCards, cachedCardsToCsv, getCachedCards, type CachedCard } from "@/lib/idb";
import Papa from "papaparse";

type CardTemplate =
  | "classic"
  | "split"
  | "minimal"
  | "right-anchor"
  | "center-focus"
  | "text-over-logo"
  | "text-under-logo";
type CardColorScheme = "forest" | "ocean" | "sunset" | "slate" | "modern-black" | "classic-ivory" | "royal-plum" | "neon-cyan" | "earth-clay" | "mint-paper" | "rose-gold" | "midnight-amber" | "skyline" | "mono-paper";
type CardSortOption = "name-asc" | "name-desc" | "company-asc" | "company-desc" | "color";

type ServerCard = {
  id: string;
  name: string;
  company: string | null;
  template: CardTemplate;
  colorScheme: CardColorScheme;
  logoImage: string | null;
  jobTitle: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  phones: { value: string }[];
  emails: { value: string }[];
  websites: { value: string }[];
};

type ImportCardPayload = {
  name: string;
  company: string | null;
  template: CardTemplate;
  colorScheme: CardColorScheme;
  logoImage: string | null;
  jobTitle: string | null;
  address: string | null;
  notes: string | null;
  phoneNumbers: string[];
  emails: string[];
  websites: string[];
  confidence: null;
  rawText: null;
  imageUrl: null;
};

const TEMPLATE_OPTIONS: { value: CardTemplate; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "split", label: "Split Accent" },
  { value: "minimal", label: "Minimal" },
  { value: "right-anchor", label: "Right Logo" },
  { value: "center-focus", label: "Focus" },
  { value: "text-over-logo", label: "Z Pattern" },
  { value: "text-under-logo", label: "Centered" }
];

const COLOR_SCHEME_OPTIONS: { value: CardColorScheme; label: string }[] = [
  { value: "forest", label: "Forest" },
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
  { value: "slate", label: "Slate" },
  { value: "modern-black", label: "Modern Black" },
  { value: "classic-ivory", label: "Classic Ivory" },
  { value: "royal-plum", label: "Royal Plum" },
  { value: "neon-cyan", label: "Neon Cyan" },
  { value: "earth-clay", label: "Earth Clay" },
  { value: "mint-paper", label: "Mint Paper" },
  { value: "rose-gold", label: "Rose Gold" },
  { value: "midnight-amber", label: "Midnight Amber" },
  { value: "skyline", label: "Skyline" },
  { value: "mono-paper", label: "Mono Paper" }
];

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function splitPipeSeparated(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeImportCard(record: unknown): ImportCardPayload | null {
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
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function normalizeForCompare(card: CachedCard) {
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

function download(filename: string, content: string, type: string) {
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

function toUpdatePayload(card: CachedCard) {
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

export default function CardsPage() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState<CardSortOption>("name-asc");
  const [cards, setCards] = useState<CachedCard[]>([]);
  const [isMobileHeaderExpanded, setIsMobileHeaderExpanded] = useState(false);
  const [error, setError] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CachedCard | null>(null);
  const [editOriginal, setEditOriginal] = useState<CachedCard | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<CachedCard | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [stylingCard, setStylingCard] = useState<CachedCard | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const hasUnsavedEditChanges = useMemo(() => {
    if (!editForm || !editOriginal) return false;
    return (
      JSON.stringify(normalizeForCompare(editForm)) !==
      JSON.stringify(normalizeForCompare(editOriginal))
    );
  }, [editForm, editOriginal]);

  const loadCards = useCallback(async () => {
    setError("");

    if (navigator.onLine) {
      const res = await apiFetch("/api/cards");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch cards");
        return;
      }

      const normalized: CachedCard[] = (data.cards as ServerCard[]).map((card) => ({
        id: card.id,
        name: card.name,
        company: card.company,
        template: card.template || "classic",
        colorScheme: card.colorScheme || "forest",
        logoImage: card.logoImage,
        jobTitle: card.jobTitle,
        address: card.address,
        notes: card.notes,
        phones: card.phones.map((p) => p.value),
        emails: card.emails.map((e) => e.value),
        websites: card.websites.map((w) => w.value),
        createdAt: card.createdAt
      }));

      setCards(normalized);
      await cacheCards(normalized);
      return;
    }

    const cached = await getCachedCards();
    setCards(cached);
  }, []);

  const displayedCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = cards.filter((card) => {
      if (!normalizedQuery) return true;

      const content = [
        card.name,
        card.company || "",
        card.jobTitle || "",
        card.address || "",
        card.notes || "",
        card.phones.join(" "),
        card.emails.join(" "),
        card.websites.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return content.includes(normalizedQuery);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      const aCompany = (a.company || "").toLowerCase();
      const bCompany = (b.company || "").toLowerCase();
      const aColor = (a.colorScheme || "forest").toLowerCase();
      const bColor = (b.colorScheme || "forest").toLowerCase();

      if (sortOption === "name-asc") return aName.localeCompare(bName);
      if (sortOption === "name-desc") return bName.localeCompare(aName);
      if (sortOption === "company-asc") return aCompany.localeCompare(bCompany) || aName.localeCompare(bName);
      if (sortOption === "company-desc") return bCompany.localeCompare(aCompany) || aName.localeCompare(bName);
      return aColor.localeCompare(bColor) || aName.localeCompare(bName);
    });

    return sorted;
  }, [cards, query, sortOption]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    loadCards().catch((e) => setError(e instanceof Error ? e.message : "Failed to load cards"));

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [loadCards]);

  useEffect(() => {
    const id = setTimeout(() => {
      loadCards().catch((e) => setError(e instanceof Error ? e.message : "Failed to load cards"));
    }, 150);
    return () => clearTimeout(id);
  }, [online, loadCards]);

  async function exportOnline(format: "csv" | "json") {
    const res = await apiFetch(`/api/export?format=${format}&query=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Export failed");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-cards.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportOffline(format: "csv" | "json") {
    if (format === "json") {
      download("business-cards.cached.json", JSON.stringify(cards, null, 2), "application/json");
      return;
    }
    download("business-cards.cached.csv", cachedCardsToCsv(cards), "text/csv");
  }


async function importCardsFromFile(fileCandidate: File | null) {
  if (!fileCandidate) return;

  if (!online) {
    setError("Importing requires internet connection.");
    return;
  }

  setError("");

  try {
    const text = await fileCandidate.text();
    const extension = fileCandidate.name.split(".").pop()?.toLowerCase();

    let records: unknown[] = [];

    if (extension === "json") {
      const parsed = JSON.parse(text);
      records = Array.isArray(parsed) ? parsed : [];
    }

    else if (extension === "csv" || extension === "tsv") {
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: extension === "tsv" ? "\t" : ","
      });

      records = parsed.data as unknown[];
    }

    else {
      throw new Error("Unsupported file type. Please upload JSON, CSV, or TSV.");
    }

    const cardsToImport = records
      .map((record) => normalizeImportCard(record))
      .filter((record): record is ImportCardPayload => !!record);

    if (cardsToImport.length === 0) {
      throw new Error("No valid cards found in file.");
    }

    let imported = 0;
    let failed = 0;

    for (const card of cardsToImport) {
      const res = await apiFetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, saveAsNew: true })
      });

      if (res.ok) imported++;
      else failed++;
    }

    await loadCards();

    setStatusMessage(
      failed > 0
        ? `Imported ${imported} cards. ${failed} card(s) failed to import.`
        : `Imported ${imported} cards.`
    );

  } catch (e) {
    setError(e instanceof Error ? e.message : "Import failed");
  }
}

  function clearEditState() {
    setEditingCardId(null);
    setEditForm(null);
    setEditOriginal(null);
    setShowDiscardModal(false);
  }

  function startEdit(card: CachedCard) {
    setEditingCardId(card.id);
    setEditForm({ ...card });
    setEditOriginal({ ...card });
  }

  function requestCancelEdit() {
    if (hasUnsavedEditChanges) {
      setShowDiscardModal(true);
      return;
    }
    clearEditState();
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (editingCardId && editForm) {
        requestCancelEdit();
        return;
      }

      if (stylingCard) {
        setStylingCard(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingCardId, editForm, stylingCard, requestCancelEdit]);


  async function saveEdit() {
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
  }

  function startStyle(card: CachedCard) {
    setStylingCard({ ...card });
  }

  async function saveStyle() {
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
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;
    if (!online) {
      setError("Deleting requires internet connection.");
      setDeleteCandidate(null);
      return;
    }

    setBusyCardId(deleteCandidate.id);
    setError("");

    try {
      const res = await apiFetch(`/api/cards/${deleteCandidate.id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete card");
      }

      await loadCards();
      setDeleteCandidate(null);
      if (editingCardId === deleteCandidate.id) {
        clearEditState();
      }
      setStatusMessage("Card deleted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete card");
    } finally {
      setBusyCardId(null);
    }
  }

  async function replaceEditLogo(fileCandidate: File | null) {
    if (!fileCandidate) return;
    const dataUrl = await readFileAsDataUrl(fileCandidate);
    setEditForm((prev) => (prev ? { ...prev, logoImage: dataUrl } : prev));
  }

  return (
    <section className="panel card-deck-panel">
            <div className="card-deck-header">
        <div className="card-deck-heading">
          <div>
            <h1>Wallet</h1>
          </div>
          <button
            type="button"
            className="button-secondary card-deck-mobile-toggle"
            aria-expanded={isMobileHeaderExpanded}
            aria-controls="card-deck-controls"
            onClick={() => setIsMobileHeaderExpanded((prev) => !prev)}
          >
            <>
              {isMobileHeaderExpanded ? "Hide Search" : "Search Wallet"}
            </>
          </button>
        </div>

        <div id="card-deck-controls" className={`card-deck-controls${isMobileHeaderExpanded ? " is-open" : ""}`}>
            <p className="muted">Search by name, company, phone, email, or website.</p>
          <div className="row">
            <input placeholder="Search cards" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={() => loadCards()}>Refresh</button>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <label>
              Sort
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as CardSortOption)}>
                <option value="name-asc">Name (asc)</option>
                <option value="name-desc">Name (desc)</option>
                <option value="company-asc">Company (asc)</option>
                <option value="company-desc">Company (desc)</option>
                <option value="color">Color (grouped)</option>
              </select>
            </label>
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <button onClick={() => (online ? exportOnline("json") : exportOffline("json"))}>Export JSON</button>
            <button onClick={() => (online ? exportOnline("csv") : exportOffline("csv"))}>Export CSV</button>
            <button disabled={!online} onClick={() => importInputRef.current?.click()}>Import JSON</button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                void importCardsFromFile(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />

            <button disabled={!online} onClick={() => importInputRef.current?.click()}>Import CSV</button>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => {
                void importCardsFromFile(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />
          </div>

          {!online && <p>Offline export uses cached records only.</p>}
          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        </div>
      </div>
      <div
        className="card-deck-list"
        aria-label="Card deck list"
      >
        {displayedCards.length === 0 && <p>No cards found.</p>}
        {displayedCards.map((card) => (
        <article key={card.id} className="panel card-deck-item">
          <div className={`business-card theme-${card.colorScheme || "forest"} template-${card.template || "classic"}`}>
            <div className="card-icon-actions">
              <button
                type="button"
                className="card-icon-button"
                aria-label="Style card"
                title="Style"
                disabled={!online || busyCardId === card.id}
                onClick={() => startStyle(card)}
              >
                {"\u{1F58C}"}
              </button>
              <button
                type="button"
                className="card-icon-button"
                aria-label="Edit card"
                title="Edit"
                disabled={!online || busyCardId === card.id}
                onClick={() => startEdit(card)}
              >
                {"\u2699"}
              </button>
            </div>
            {(card.template || "classic") === "split" && (
              <div className="business-card-accent" aria-hidden="true" />
            )}
            <div className="business-card-main">
              <div className="business-card-top">
                {card.logoImage && <img src={card.logoImage} alt="Card logo" className="business-card-logo" />}
                <div className="business-card-identity">
                  <h3 className="business-card-name">{card.name}</h3>
                  {card.company && <p className="business-card-company">{card.company}</p>}
                  {card.jobTitle && <p className="business-card-job">{card.jobTitle}</p>}
                </div>
              </div>
              <div className="business-card-contact">
                {card.phones[0] && <p>Phone: {card.phones[0]}</p>}
                {card.emails[0] && <p>Email: {card.emails[0]}</p>}
                {card.websites[0] && <p>Web: {card.websites[0]}</p>}
              </div>
              {card.address && <p className="business-card-address">{card.address}</p>}
            </div>
          </div>
        </article>
      ))}
      </div>

      {stylingCard && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="style-modal-title">
          <div className="modal-card modal-card-wide">
            <h2 id="style-modal-title">Card Style</h2>
            <p className="muted">Preview and customize this card look.</p>
            <div className="style-spotlight">
              <div className={`business-card theme-${stylingCard.colorScheme || "forest"} template-${stylingCard.template || "classic"}`}>
                {(stylingCard.template || "classic") === "split" && <div className="business-card-accent" aria-hidden="true" />}
                <div className="business-card-main">
                  <div className="business-card-top">
                    {stylingCard.logoImage && <img src={stylingCard.logoImage} alt="Card logo" className="business-card-logo" />}
                    <div className="business-card-identity">
                      <h3 className="business-card-name">{stylingCard.name}</h3>
                      {stylingCard.company && <p className="business-card-company">{stylingCard.company}</p>}
                      {stylingCard.jobTitle && <p className="business-card-job">{stylingCard.jobTitle}</p>}
                    </div>
                  </div>
                  <div className="business-card-contact">
                    {stylingCard.phones[0] && <p>Phone: {stylingCard.phones[0]}</p>}
                    {stylingCard.emails[0] && <p>Email: {stylingCard.emails[0]}</p>}
                    {stylingCard.websites[0] && <p>Web: {stylingCard.websites[0]}</p>}
                  </div>
                  {stylingCard.address && <p className="business-card-address">{stylingCard.address}</p>}
                </div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <label>
                Color Scheme
                <select
                  value={stylingCard.colorScheme || "forest"}
                  onChange={(e) =>
                    setStylingCard((prev) =>
                      prev ? { ...prev, colorScheme: e.target.value as CardColorScheme } : prev
                    )
                  }
                >
                  {COLOR_SCHEME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Template
                <select
                  value={stylingCard.template || "classic"}
                  onChange={(e) =>
                    setStylingCard((prev) =>
                      prev ? { ...prev, template: e.target.value as CardTemplate } : prev
                    )
                  }
                >
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button disabled={busyCardId === stylingCard.id} onClick={saveStyle}>
                Save Style
              </button>
              <button className="button-secondary" onClick={() => setStylingCard(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCardId && editForm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
          <div className="modal-card modal-card-wide">
            <h2 id="edit-modal-title">Edit Card</h2>
            <label>
              Name
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              />
            </label>
            <label>
              Company
              <input
                value={editForm.company || ""}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, company: e.target.value || null } : prev))
                }
              />
            </label>
            <label>
              Logo Image
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => replaceEditLogo(e.target.files?.[0] || null)} />
            </label>
            <p className="muted" style={{ marginTop: 6, marginBottom: 10 }}>
              Logo image extraction is currently in development and may be inaccurate. Please review and adjust manually.
            </p>
            {editForm.logoImage && (
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <button className="button-secondary" onClick={() => setEditForm((prev) => (prev ? { ...prev, logoImage: null } : prev))}>
                  Remove Logo Image
                </button>
              </div>
            )}
            {editForm.logoImage && (
              <div style={{ marginBottom: 10 }}>
                <img src={editForm.logoImage} alt="Editable logo" style={{ maxWidth: 220, maxHeight: 120, objectFit: "contain", border: "1px solid #d6dfd8", borderRadius: 8, background: "#fff" }} />
              </div>
            )}
            <label>
              Job Title
              <input
                value={editForm.jobTitle || ""}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, jobTitle: e.target.value || null } : prev))
                }
              />
            </label>
            <label>
              Address
              <input
                value={editForm.address || ""}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, address: e.target.value || null } : prev))
                }
              />
            </label>
            <label>
              Phones (comma/newline separated)
              <textarea
                value={editForm.phones.join("\n")}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, phones: splitList(e.target.value) } : prev))
                }
              />
            </label>
            <label>
              Emails (comma/newline separated)
              <textarea
                value={editForm.emails.join("\n")}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, emails: splitList(e.target.value) } : prev))
                }
              />
            </label>
            <label>
              Websites (comma/newline separated)
              <textarea
                value={editForm.websites.join("\n")}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, websites: splitList(e.target.value) } : prev))
                }
              />
            </label>
            <label>
              Notes
              <textarea
                value={editForm.notes || ""}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, notes: e.target.value || null } : prev))
                }
              />
            </label>
            <div className="modal-actions">
              <button disabled={busyCardId === editingCardId || !editForm.name.trim()} onClick={saveEdit}>
                Save Changes
              </button>
              <button
                className="button-danger"
                disabled={busyCardId === editingCardId}
                onClick={() => setDeleteCandidate(editForm)}
              >
                Delete Card
              </button>
              <button className="button-secondary" disabled={busyCardId === editingCardId} onClick={requestCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={showDiscardModal}
        title="Discard unsaved changes?"
        message="You have unsaved edits for this card. If you continue, your changes will be lost."
        onClose={() => setShowDiscardModal(false)}
        onConfirm={clearEditState}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />

      <StatusModal
        isOpen={!!deleteCandidate}
        title="Delete card?"
        message={
          deleteCandidate
            ? `This will permanently remove ${deleteCandidate.name}. This action cannot be undone.`
            : ""
        }
        onClose={() => setDeleteCandidate(null)}
        onConfirm={confirmDelete}
        confirmLabel="Delete Card"
        cancelLabel="Keep Card"
        tone="danger"
      />

      <StatusModal
        isOpen={!!statusMessage}
        title="Success"
        message={statusMessage}
        onClose={() => setStatusMessage("")}
      />
    </section>
  );
}





