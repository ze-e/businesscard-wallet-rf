"use client";

import type { CreateCardInput } from "@/lib/schemas";
import { CardFormFields } from "@/components/capture/CardFormFields";

type EditableCardPanelProps = {
  title: string;
  card: CreateCardInput;
  onChange: (updater: (prev: CreateCardInput) => CreateCardInput) => void;
  onReplaceLogo: (file: File | null) => void;
  onRemoveLogo: () => void;
  error?: string;
  disabled?: boolean;
};

export function EditableCardPanel({
  title,
  card,
  onChange,
  onReplaceLogo,
  onRemoveLogo,
  error,
  disabled = false
}: EditableCardPanelProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>

      <CardFormFields
        card={card}
        onChange={onChange}
        onReplaceLogo={onReplaceLogo}
        onRemoveLogo={onRemoveLogo}
        disabled={disabled}
        showNotes
      />

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
    </section>
  );
}