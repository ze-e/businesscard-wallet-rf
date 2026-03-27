import { useState, useCallback, useMemo, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { cacheCards, getCachedCards, type CachedCard } from "@/lib/idb";
import { CardSortOption, ServerCard } from '../types';

export function useCards(query: string, sortOption: CardSortOption) {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [cards, setCards] = useState<CachedCard[]>([]);
  const [error, setError] = useState("");

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

  return { online, cards, error, loadCards, displayedCards };
}