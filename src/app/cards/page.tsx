"use client";

import { useState } from "react";
import { CardDeckHeader } from "./components/CardDeckHeader";
import { SearchAndControls } from "./components/SearchAndControls";
import { CardList } from "./components/CardList";
import { EditCardModal } from "./components/EditCardModal";
import { StyleCardModal } from "./components/StyleCardModal";
import { StatusModals } from "./components/StatusModals";
import { useCards } from "./hooks/useCards";
import { useEditCard } from "./hooks/useEditCard";
import { useStyleCard } from "./hooks/useStyleCard";
import { useImportExport } from "./hooks/useImportExport";
import { CardSortOption } from "./types";

export default function CardsPage() {
  const [isMobileHeaderExpanded, setIsMobileHeaderExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<CardSortOption>("name-asc");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [busyCardId, setBusyCardId] = useState<string | null>(null);

  const cardsState = useCards(searchQuery, sortOption);
  const editState = useEditCard(
    cardsState.online,
    cardsState.loadCards,
    setError,
    setStatusMessage,
    busyCardId,
    setBusyCardId
  );
  const styleState = useStyleCard(
    cardsState.online,
    cardsState.loadCards,
    setError,
    setStatusMessage,
    busyCardId,
    setBusyCardId
  );
  const importExportState = useImportExport(
    cardsState.online,
    setError,
    cardsState.loadCards
  );

  return (
    <div className="cards-page">
      <CardDeckHeader
        isMobileHeaderExpanded={isMobileHeaderExpanded}
        setIsMobileHeaderExpanded={setIsMobileHeaderExpanded}
      />

      <SearchAndControls
        isMobileHeaderExpanded={isMobileHeaderExpanded}
        query={searchQuery}
        setQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        onImport={() => importExportState.importCardsFromFile(null)}
        onExport={() => importExportState.exportOnline("csv", searchQuery)}
        isExporting={false}
      />

      <CardList
        displayedCards={cardsState.displayedCards}
        online={cardsState.online}
        busyCardId={busyCardId}
        startEdit={editState.startEdit}
        startStyle={styleState.startStyle}
      />

      <EditCardModal
        isOpen={!!editState.editingCardId}
        card={editState.editForm}
        onClose={editState.requestCancelEdit}
        onSave={editState.saveEdit}
        isSaving={busyCardId === editState.editingCardId}
        onUpdateField={editState.updateEditField}
        onReplaceLogo={editState.replaceEditLogo}
      />

      <StyleCardModal
        isOpen={!!styleState.stylingCard}
        card={styleState.stylingCard}
        onClose={styleState.closeStyle}
        onSave={styleState.saveStyle}
        isSaving={busyCardId === styleState.stylingCard?.id}
        onUpdateField={styleState.updateStyleField}
      />

      <StatusModals
        showDiscardModal={editState.showDiscardModal}
        setShowDiscardModal={(show) => show ? editState.requestCancelEdit() : editState.clearEditState()}
        clearEditState={editState.clearEditState}
        deleteCandidate={null}
        setDeleteCandidate={() => {}}
        confirmDelete={() => {}}
        statusMessage={statusMessage}
        setStatusMessage={setStatusMessage}
      />
    </div>
  );
}