"use client";

import type { ChangeEvent } from "react";

type LogoImageFieldProps = {
  label: string;
  logoImage: string | null;
  previewAlt: string;
  onReplace: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function LogoImageField({
  label,
  logoImage,
  previewAlt,
  onReplace,
  onRemove,
  disabled = false
}: LogoImageFieldProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onReplace(event.target.files?.[0] || null);
  }

  return (
    <>
      <label>
        {label}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled}
          onChange={handleFileChange}
        />
      </label>

      <p className="muted" style={{ marginTop: 6, marginBottom: 10 }}>
        Logo image extraction is currently in development and may be inaccurate. Please review and
        adjust manually.
      </p>

      {logoImage && (
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <button className="button-secondary" disabled={disabled} onClick={onRemove}>
            Remove Logo Image
          </button>
        </div>
      )}

      {logoImage && (
        <div style={{ marginBottom: 10 }}>
          <img
            src={logoImage}
            alt={previewAlt}
            style={{
              maxWidth: 220,
              maxHeight: 120,
              objectFit: "contain",
              border: "1px solid #d6dfd8",
              borderRadius: 8,
              background: "#fff"
            }}
          />
        </div>
      )}
    </>
  );
}