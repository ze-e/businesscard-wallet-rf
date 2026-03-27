import { FC, useRef } from 'react';
import { CardSortOption } from '../types';
import { CachedCard } from '@/lib/idb';

interface SearchAndControlsProps {
  query: string;
  setQuery: (query: string) => void;
  sortOption: CardSortOption;
  setSortOption: (option: CardSortOption) => void;
  online: boolean;
  loadCards: () => void;
  exportOnline: (format: "csv" | "json", query: string) => void;
  exportOffline: (format: "csv" | "json", cards: CachedCard[]) => void;
  importCardsFromFile: (file: File | null) => void;
  isMobileHeaderExpanded: boolean;
  error: string;
  cards: CachedCard[];
}

export const SearchAndControls: FC<SearchAndControlsProps> = ({
  query,
  setQuery,
  sortOption,
  setSortOption,
  online,
  loadCards,
  exportOnline,
  exportOffline,
  importCardsFromFile,
  isMobileHeaderExpanded,
  error,
  cards
}) => {
  const jsonImportRef = useRef<HTMLInputElement | null>(null);
  const csvImportRef = useRef<HTMLInputElement | null>(null);

  return (
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
        <button onClick={() => (online ? exportOnline("json", query) : exportOffline("json", cards))}>Export JSON</button>
        <button onClick={() => (online ? exportOnline("csv", query) : exportOffline("csv", cards))}>Export CSV</button>
        <button disabled={!online} onClick={() => jsonImportRef.current?.click()}>Import JSON</button>
        <input
          ref={jsonImportRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            void importCardsFromFile(e.target.files?.[0] || null);
            e.currentTarget.value = "";
          }}
        />

        <button disabled={!online} onClick={() => csvImportRef.current?.click()}>Import CSV</button>
        <input
          ref={csvImportRef}
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
  );
};