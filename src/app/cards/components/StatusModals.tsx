import { FC } from 'react';
import { StatusModal } from '@/components/StatusModal';
import { CachedCard } from '@/lib/idb';

interface StatusModalsProps {
  showDiscardModal: boolean;
  setShowDiscardModal: (show: boolean) => void;
  clearEditState: () => void;
  deleteCandidate: CachedCard | null;
  setDeleteCandidate: (card: CachedCard | null) => void;
  confirmDelete: () => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
}

export const StatusModals: FC<StatusModalsProps> = ({
  showDiscardModal,
  setShowDiscardModal,
  clearEditState,
  deleteCandidate,
  setDeleteCandidate,
  confirmDelete,
  statusMessage,
  setStatusMessage
}) => {
  return (
    <>
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
    </>
  );
};