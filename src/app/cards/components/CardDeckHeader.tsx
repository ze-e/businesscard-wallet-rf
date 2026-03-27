import { FC } from 'react';

interface CardDeckHeaderProps {
  isMobileHeaderExpanded: boolean;
  setIsMobileHeaderExpanded: (expanded: boolean) => void;
}

export const CardDeckHeader: FC<CardDeckHeaderProps> = ({ isMobileHeaderExpanded, setIsMobileHeaderExpanded }) => {
  return (
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
    </div>
  );
};