"use client";

import type { CreateCardInput } from "@/lib/schemas";
import { splitList } from "@/lib/cards/card-form";
import { LogoImageField } from "@/components/capture/LogoImageField";
import { MultiValueTextarea } from "@/components/capture/MultiValueTextarea";

type CardFormFieldsProps = {
  card: CreateCardInput;
  onChange: (updater: (prev: CreateCardInput) => CreateCardInput) => void;
  onReplaceLogo: (file: File | null) => void;
  onRemoveLogo: () => void;
  disabled?: boolean;
  showNotes?: boolean;
};

export function CardFormFields({
  card,
  onChange,
  onReplaceLogo,
  onRemoveLogo,
  disabled = false,
  showNotes = false
}: CardFormFieldsProps) {
  return (
    <>
      <div className="grid">
        <label>
          Name (required)
          <input
            disabled={disabled}
            value={card.name}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                name: e.target.value
              }))
            }
          />
        </label>

        <label>
          Company
          <input
            disabled={disabled}
            value={card.company || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                company: e.target.value || null
              }))
            }
          />
        </label>

        <label>
          Job Title
          <input
            disabled={disabled}
            value={card.jobTitle || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                jobTitle: e.target.value || null
              }))
            }
          />
        </label>

        <label>
          Address
          <input
            disabled={disabled}
            value={card.address || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                address: e.target.value || null
              }))
            }
          />
        </label>
      </div>

      <LogoImageField
        label="Logo Image"
        logoImage={card.logoImage}
        previewAlt="Card logo"
        onReplace={onReplaceLogo}
        onRemove={onRemoveLogo}
        disabled={disabled}
      />

      <MultiValueTextarea
        label="Phone Numbers (comma/newline separated)"
        value={card.phoneNumbers}
        disabled={disabled}
        onChange={(nextValue: string) =>
          onChange((prev) => ({
            ...prev,
            phoneNumbers: splitList(nextValue)
          }))
        }
      />

      <MultiValueTextarea
        label="Emails (comma/newline separated)"
        value={card.emails}
        disabled={disabled}
        onChange={(nextValue: string) =>
          onChange((prev) => ({
            ...prev,
            emails: splitList(nextValue)
          }))
        }
      />

      <MultiValueTextarea
        label="Websites (comma/newline separated)"
        value={card.websites}
        disabled={disabled}
        onChange={(nextValue: string) =>
          onChange((prev) => ({
            ...prev,
            websites: splitList(nextValue)
          }))
        }
      />

      {showNotes && (
        <label>
          Notes
          <textarea
            disabled={disabled}
            value={card.notes || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                notes: e.target.value || null
              }))
            }
          />
        </label>
      )}
    </>
  );
}