"use client";

import type { ChangeEvent } from "react";

type CardUploadPanelProps = {
  online: boolean;
  busy: boolean;
  authenticated: boolean | null;
  apiReady: boolean | null;
  file: File | null;
  cardName: string;
  onFileChange: (file: File | null) => void;
  onExtract: () => void;
  onSave: () => void;
};

export function CardUploadPanel({
  online,
  busy,
  authenticated,
  apiReady,
  file,
  cardName,
  onFileChange,
  onExtract,
  onSave
}: CardUploadPanelProps) {
  const disabled = !online || authenticated === false || !apiReady || busy;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] || null);
  }

  return (
    <section className="panel">
      <h1>Virtual Business Card Wallet</h1>
      <p className="muted">
        Phone and all fields except name are optional. You can edit extracted values before
        saving, or create a card manually.
      </p>

      {authenticated === false && (
        <p>
          Please <a href="/login">login</a> to access capture and your saved cards.
        </p>
      )}

      {authenticated !== false && !apiReady && (
        <p>
          OpenAI API key is missing. Go to <a href="/settings">Settings</a> and add your key.
        </p>
      )}

      <div className="card-upload">
        <input
          id="card-upload-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          capture="environment"
          disabled={disabled}
          onChange={handleFileChange}
          className="card-upload-input"
        />

        <label htmlFor="card-upload-input" className="card-upload-button">
          <span className="card-upload-icon">📷</span>

          <div className="card-upload-text">
            <strong>Scan Business Card</strong>
            <span>Tap to take a photo or upload an image</span>
            <span>PNG • JPG • WEBP</span>
          </div>
        </label>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <button disabled={disabled || !file} onClick={onExtract}>
          Extract Fields
        </button>
        <button disabled={disabled || !cardName} onClick={onSave}>
          Save Card
        </button>
      </div>
    </section>
  );
}