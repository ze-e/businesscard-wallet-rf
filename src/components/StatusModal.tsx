"use client";

import { useEffect } from "react";

type StatusModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

export function StatusModal({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default"
}: StatusModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmClass = tone === "danger" ? "button-danger" : "";

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
      <div className="modal-card">
        <h2 id="status-modal-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          {onConfirm ? (
            <>
              <button type="button" className="button-secondary" onClick={onClose}>
                {cancelLabel}
              </button>
              <button type="button" className={confirmClass} onClick={onConfirm}>
                {confirmLabel}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
