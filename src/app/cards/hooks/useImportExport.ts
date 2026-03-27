import { useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api-client";
import { cachedCardsToCsv, type CachedCard } from "@/lib/idb";
import Papa from "papaparse";
import { normalizeImportCard, download } from '../utils';
import { ImportCardPayload } from '../types';

export function useImportExport(
  online: boolean,
  setError: (error: string) => void,
  loadCards: () => Promise<void>
) {
  const [statusMessage, setStatusMessage] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const exportOnline = useCallback(async (format: "csv" | "json", query: string) => {
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
  }, [setError]);

  const exportOffline = useCallback((format: "csv" | "json", cards: CachedCard[]) => {
    if (format === "json") {
      download("business-cards.cached.json", JSON.stringify(cards, null, 2), "application/json");
      return;
    }
    download("business-cards.cached.csv", cachedCardsToCsv(cards), "text/csv");
  }, []);

  const importCardsFromFile = useCallback(async (fileCandidate: File | null) => {
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
  }, [online, setError, loadCards]);

  return { statusMessage, setStatusMessage, importCardsFromFile, exportOnline, exportOffline, importInputRef };
}