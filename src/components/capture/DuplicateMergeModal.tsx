"use client";

import type { CreateCardInput } from "@/lib/schemas";
import type { DuplicateResponse } from "@/lib/cards/card-types";
import { CardFormFields } from "@/components/capture/CardFormFields";
import { ExistingCardSummary } from "@/components/capture/ExistingCardSummary";

type DuplicateMergeModalProps = {
  duplicate: DuplicateResponse | null;
  mergeCard: CreateCardInput;
  onMergeCardChange: (updater: (prev: CreateCardInput) => CreateCardInput) => void;
  onReplaceMergeLogo: (file: File | null) => void;
  onRemoveMergeLogo: () => void;
  onClose: () => void;
  onMerge: () => void;
  onSaveAsNew: () => void;
  busy: boolean;
  saveAsNewDisabled: boolean;
};

export function DuplicateMergeModal({
  duplicate,
  mergeCard,
  onMergeCardChange,
  onReplaceMergeLogo,
  onRemoveMergeLogo,
  onClose,
  onMerge,
  onSaveAsNew,
  busy,
  saveAsNewDisabled
}: DuplicateMergeModalProps) {
  if (!duplicate) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-modal-title"
    >
      <div className="modal-card modal-card-wide">
        <h2 id="duplicate-modal-title">Duplicate Warning</h2>
        <p>{duplicate.message}</p>

        <div className="row">
          <ExistingCardSummary existingCard={duplicate.existingCard} />

          <div>
            <h3>Merged (Editable)</h3>

            <CardFormFields
              card={mergeCard}
              onChange={onMergeCardChange}
              onReplaceLogo={onReplaceMergeLogo}
              onRemoveLogo={onRemoveMergeLogo}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="button-secondary" disabled={busy} onClick={onClose}>
            Close
          </button>
          <button disabled={busy || !mergeCard.name} onClick={onMerge}>
            Merge Into Existing
          </button>
          <button disabled={saveAsNewDisabled} onClick={onSaveAsNew}>
            Save As New
          </button>
        </div>
      </div>
    </div>
  );
}