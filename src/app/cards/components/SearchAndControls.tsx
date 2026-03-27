import { FC } from 'react';
import { CardSortOption } from '../types';

interface SearchAndControlsProps {
  isMobileHeaderExpanded: boolean;
  query: string;
  setQuery: (query: string) => void;
  sortOption: CardSortOption;
  setSortOption: (option: CardSortOption) => void;
  onImport: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const SearchAndControls: FC<SearchAndControlsProps> = ({
  isMobileHeaderExpanded,
  query,
  setQuery,
  sortOption,
  setSortOption,
  onImport,
  onExport,
  isExporting
}) => {
  if (!isMobileHeaderExpanded) return null;

  return (
    <div className="search-and-controls">
      <input
        type="text"
        placeholder="Search cards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value as CardSortOption)}>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="company-asc">Company A-Z</option>
        <option value="company-desc">Company Z-A</option>
        <option value="color">Color</option>
      </select>
      <button onClick={onImport}>Import</button>
      <button onClick={onExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
};