"use client";

import { useEffect, useState } from "react";
import { StatusModal } from "@/components/StatusModal";
import { apiFetch } from "@/lib/api-client";
import type { CreateCardInput, ExtractedCard } from "@/lib/schemas";

type DuplicateResponse = {
  duplicate: true;
  existingCard: {
    id: string;
    name: string;
    company: string | null;
    logoImage: string | null;
    phones: { value: string }[];
    emails: { value: string }[];
    websites: { value: string }[];
  };
  extractedCard: CreateCardInput;
  message: string;
};

const EMPTY_CARD: CreateCardInput = {
  name: "",
  company: null,
  template: "classic",
  colorScheme: "forest",
  logoImage: null,
  jobTitle: null,
  address: null,
  notes: null,
  phoneNumbers: [],
  emails: [],
  websites: [],
  confidence: null,
  rawText: null,
  imageUrl: null
};

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function cropLogoFromFile(
  file: File,
  box: NonNullable<ExtractedCard["logoBox"]>
): Promise<string | null> {
  let bitmap: ImageBitmap | null = null;

  try {
    // Align crop math with what Vision saw by honoring EXIF orientation.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      bitmap = null;
    }
  }

  if (!bitmap) {
    return null;
  }

  function makeCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function boxToCrop(
    mode: "topLeft" | "center",
    pad: number
  ): { sx: number; sy: number; sw: number; sh: number } | null {
    const bw = Math.max(1, Math.round(clamp01(box.width) * bitmap!.width));
    const bh = Math.max(1, Math.round(clamp01(box.height) * bitmap!.height));

    const baseX = mode === "center" ? box.x - box.width / 2 : box.x;
    const baseY = mode === "center" ? box.y - box.height / 2 : box.y;

    const bx = Math.round(clamp01(baseX) * bitmap!.width);
    const by = Math.round(clamp01(baseY) * bitmap!.height);

    const padX = Math.round(bw * pad);
    const padY = Math.round(bh * pad);

    const sx = Math.max(0, bx - padX);
    const sy = Math.max(0, by - padY);
    const ex = Math.min(bitmap!.width, bx + bw + padX);
    const ey = Math.min(bitmap!.height, by + bh + padY);

    const sw = ex - sx;
    const sh = ey - sy;

    if (sw <= 2 || sh <= 2) {
      return null;
    }

    return { sx, sy, sw, sh };
  }

  function trimLikelyCardRegion(source: HTMLCanvasElement): HTMLCanvasElement {
    const w = source.width;
    const h = source.height;
    const ctx = source.getContext("2d");
    if (!ctx) return source;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const isLight = (r: number, g: number, b: number) => r >= 170 && g >= 170 && b >= 170;

    const colScores = new Array<number>(w).fill(0);
    for (let x = 0; x < w; x++) {
      let light = 0;
      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        if (isLight(data[idx], data[idx + 1], data[idx + 2])) {
          light++;
        }
      }
      colScores[x] = light / h;
    }

    const rowScores = new Array<number>(h).fill(0);
    for (let y = 0; y < h; y++) {
      let light = 0;
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (isLight(data[idx], data[idx + 1], data[idx + 2])) {
          light++;
        }
      }
      rowScores[y] = light / w;
    }

    function bestRun(values: number[], minRatio: number): { start: number; end: number } | null {
      let best: { start: number; end: number } | null = null;
      let runStart = -1;

      for (let i = 0; i < values.length; i++) {
        if (values[i] >= minRatio) {
          if (runStart === -1) runStart = i;
        } else if (runStart !== -1) {
          const run = { start: runStart, end: i - 1 };
          if (!best || run.end - run.start > best.end - best.start) {
            best = run;
          }
          runStart = -1;
        }
      }

      if (runStart !== -1) {
        const run = { start: runStart, end: values.length - 1 };
        if (!best || run.end - run.start > best.end - best.start) {
          best = run;
        }
      }

      return best;
    }

    const colRun = bestRun(colScores, 0.06);
    const rowRun = bestRun(rowScores, 0.04);

    let rx = 0;
    let ry = 0;
    let rw = w;
    let rh = h;

    if (colRun) {
      const runWidth = colRun.end - colRun.start + 1;
      if (runWidth >= Math.round(w * 0.08)) {
        const pad = Math.round(runWidth * 0.2);
        rx = Math.max(0, colRun.start - pad);
        rw = Math.min(w - rx, runWidth + pad * 2);
      }
    }

    if (rowRun) {
      const runHeight = rowRun.end - rowRun.start + 1;
      if (runHeight >= Math.round(h * 0.08)) {
        const pad = Math.round(runHeight * 0.2);
        ry = Math.max(0, rowRun.start - pad);
        rh = Math.min(h - ry, runHeight + pad * 2);
      }
    }

    if (rw <= 2 || rh <= 2) {
      return source;
    }

    const out = makeCanvas(rw, rh);
    const outCtx = out.getContext("2d");
    if (!outCtx) return source;
    outCtx.drawImage(source, rx, ry, rw, rh, 0, 0, rw, rh);
    return out;
  }

  function scoreCanvas(source: HTMLCanvasElement): number {
    const w = source.width;
    const h = source.height;
    const ctx = source.getContext("2d");
    if (!ctx) return Number.NEGATIVE_INFINITY;

    const data = ctx.getImageData(0, 0, w, h).data;
    const total = w * h;

    let white = 0;
    let brown = 0;
    let dark = 0;
    let edges = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (r >= 185 && g >= 185 && b >= 185) white++;
        if (r > g + 12 && g > b + 12 && r > 90 && g > 60) brown++;
        if (r < 45 && g < 45 && b < 45) dark++;

        if (x > 0) {
          const p = idx - 4;
          const d =
            Math.abs(r - data[p]) +
            Math.abs(g - data[p + 1]) +
            Math.abs(b - data[p + 2]);
          if (d >= 85) edges++;
        }
      }
    }

    const whiteRatio = white / total;
    const brownRatio = brown / total;
    const darkRatio = dark / total;
    const edgeRatio = edges / total;

    return whiteRatio * 1.3 + edgeRatio * 0.9 - brownRatio * 2.0 - darkRatio * 0.25;
  }

  function normalizeOnWhite(source: HTMLCanvasElement): string | null {
    const sw = source.width;
    const sh = source.height;
    if (sw <= 1 || sh <= 1) return null;

    const outputWidth = 320;
    const outputHeight = 180;
    const outputCanvas = makeCanvas(outputWidth, outputHeight);
    const outputCtx = outputCanvas.getContext("2d");
    if (!outputCtx) return null;

    outputCtx.fillStyle = "#ffffff";
    outputCtx.fillRect(0, 0, outputWidth, outputHeight);

    const maxDrawWidth = outputWidth * 0.82;
    const maxDrawHeight = outputHeight * 0.82;
    const scale = Math.min(maxDrawWidth / sw, maxDrawHeight / sh);
    const drawWidth = Math.max(1, Math.round(sw * scale));
    const drawHeight = Math.max(1, Math.round(sh * scale));
    const dx = Math.round((outputWidth - drawWidth) / 2);
    const dy = Math.round((outputHeight - drawHeight) / 2);

    outputCtx.drawImage(source, 0, 0, sw, sh, dx, dy, drawWidth, drawHeight);
    return outputCanvas.toDataURL("image/png");
  }

  try {
    const candidates: Array<{ mode: "topLeft" | "center"; pad: number }> = [
      { mode: "topLeft", pad: 0.15 },
      { mode: "topLeft", pad: 0.8 },
      { mode: "center", pad: 0.15 },
      { mode: "center", pad: 0.8 }
    ];

    let best: { canvas: HTMLCanvasElement; score: number } | null = null;

    for (const candidate of candidates) {
      const crop = boxToCrop(candidate.mode, candidate.pad);
      if (!crop) continue;

      const rawCanvas = makeCanvas(crop.sw, crop.sh);
      const rawCtx = rawCanvas.getContext("2d");
      if (!rawCtx) continue;
      rawCtx.drawImage(bitmap, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);

      const refined = trimLikelyCardRegion(rawCanvas);
      const score = scoreCanvas(refined);

      if (!best || score > best.score) {
        best = { canvas: refined, score };
      }
    }

    if (!best) {
      return null;
    }

    return normalizeOnWhite(best.canvas);
  } finally {
    bitmap.close();
  }
}
export default function CapturePage() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [file, setFile] = useState<File | null>(null);
  const [card, setCard] = useState<CreateCardInput>(EMPTY_CARD);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateResponse | null>(null);
  const [mergeCard, setMergeCard] = useState<CreateCardInput>(EMPTY_CARD);
  const [modalMessage, setModalMessage] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const update = () => setOnline(navigator.onLine);
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }
  }, []);

  useEffect(() => {
    (async () => {
      const authRes = await apiFetch("/api/auth/me");
      if (!authRes.ok) {
        setAuthenticated(false);
        setApiReady(false);
        return;
      }

      setAuthenticated(true);
      const res = await apiFetch("/api/settings/api-key");
      if (res.ok) {
        const data = await res.json();
        setApiReady(!!data.hasApiKey);
      } else {
        setApiReady(false);
      }
    })().catch(() => {
      setAuthenticated(false);
      setApiReady(false);
    });
  }, []);

  async function extract() {
    if (!file) {
      setError("Choose a card image first.");
      return;
    }

    setBusy(true);
    setError("");
    setDuplicate(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiFetch("/api/cards/extract", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      const extracted = data.extractedCard as ExtractedCard;
      let logoImage = extracted.logoImage ?? null;
      if (extracted.logoBox) {
        logoImage = await cropLogoFromFile(file, extracted.logoBox);
      }

      setCard({
        name: extracted.name,
        company: extracted.company || null,
        template: extracted.template || "classic",
        colorScheme: extracted.colorScheme || "forest",
        logoImage: logoImage || null,
        jobTitle: extracted.jobTitle || null,
        address: extracted.address || null,
        notes: extracted.notes || null,
        phoneNumbers: extracted.phoneNumbers || [],
        emails: extracted.emails || [],
        websites: extracted.websites || [],
        confidence: extracted.confidence ?? null,
        rawText: extracted.rawText ?? null,
        imageUrl: extracted.imageUrl ?? null
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setBusy(false);
    }
  }

  async function save(saveAsNew = false) {
    setBusy(true);
    setError("");

    try {
      const res = await apiFetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, saveAsNew })
      });

      const data = await res.json();
      if (res.status === 409) {
        setDuplicate(data);
        setMergeCard(data.extractedCard);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to save card");
      }
      setCard(EMPTY_CARD);
      setFile(null);
      setDuplicate(null);
      setModalMessage("Card saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save card");
    } finally {
      setBusy(false);
    }
  }

  async function merge() {
    if (!duplicate) return;
    setBusy(true);
    setError("");

    try {
      const res = await apiFetch("/api/cards/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingCardId: duplicate.existingCard.id, mergedCard: mergeCard })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to merge card");
      }
      setDuplicate(null);
      setCard(EMPTY_CARD);
      setModalMessage("Card merged successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setBusy(false);
    }
  }

  async function replaceLogoFromFile(fileCandidate: File | null, target: "card" | "merge") {
    if (!fileCandidate) return;
    const dataUrl = await readFileAsDataUrl(fileCandidate);
    if (target === "card") {
      setCard((prev) => ({ ...prev, logoImage: dataUrl }));
    } else {
      setMergeCard((prev) => ({ ...prev, logoImage: dataUrl }));
    }
  }

  return (
    <>
      <section className="panel">
        <h1>Virtual Business Card Wallet</h1>
        <p className="muted">Phone and all fields except name are optional. You can edit extracted values before saving, or create a card manually.</p>
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
            disabled={!online || authenticated === false || !apiReady || busy}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
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
          <button disabled={!online || authenticated === false || !apiReady || !file || busy} onClick={extract}>
            Extract Fields
          </button>
          <button disabled={!online || authenticated === false || !apiReady || !card.name || busy} onClick={() => save(false)}>
            Save Card
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Extracted / Editable Card</h2>
        <div className="grid">
          <label>
            Name (required)
            <input
              value={card.name}
              onChange={(e) => setCard((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label>
            Company
            <input
              value={card.company || ""}
              onChange={(e) => setCard((prev) => ({ ...prev, company: e.target.value || null }))}
            />
          </label>
          <label>
            Job Title
            <input
              value={card.jobTitle || ""}
              onChange={(e) => setCard((prev) => ({ ...prev, jobTitle: e.target.value || null }))}
            />
          </label>
          <label>
            Address
            <input
              value={card.address || ""}
              onChange={(e) => setCard((prev) => ({ ...prev, address: e.target.value || null }))}
            />
          </label>
        </div>

        <label>
          Logo Image
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => replaceLogoFromFile(e.target.files?.[0] || null, "card")} />
        </label>
        <p className="muted" style={{ marginTop: 6, marginBottom: 10 }}>
          Logo image extraction is currently in development and may be inaccurate. Please review and adjust manually.
        </p>
        {card.logoImage && (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <button className="button-secondary" onClick={() => setCard((prev) => ({ ...prev, logoImage: null }))}>
              Remove Logo Image
            </button>
          </div>
        )}
        {card.logoImage && (
          <div style={{ marginBottom: 10 }}>
            <img src={card.logoImage} alt="Extracted logo" style={{ maxWidth: 220, maxHeight: 120, objectFit: "contain", border: "1px solid #d6dfd8", borderRadius: 8, background: "#fff" }} />
          </div>
        )}
        <label>
          Phone Numbers (comma/newline separated)
          <textarea
            value={card.phoneNumbers.join("\n")}
            onChange={(e) =>
              setCard((prev) => ({
                ...prev,
                phoneNumbers: splitList(e.target.value)
              }))
            }
          />
        </label>
        <label>
          Emails (comma/newline separated)
          <textarea
            value={card.emails.join("\n")}
            onChange={(e) =>
              setCard((prev) => ({
                ...prev,
                emails: splitList(e.target.value)
              }))
            }
          />
        </label>
        <label>
          Websites (comma/newline separated)
          <textarea
            value={card.websites.join("\n")}
            onChange={(e) =>
              setCard((prev) => ({
                ...prev,
                websites: splitList(e.target.value)
              }))
            }
          />
        </label>
        <label>
          Notes
          <textarea
            value={card.notes || ""}
            onChange={(e) => setCard((prev) => ({ ...prev, notes: e.target.value || null }))}
          />
        </label>
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      </section>

      {duplicate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="duplicate-modal-title">
          <div className="modal-card modal-card-wide">
            <h2 id="duplicate-modal-title">Duplicate Warning</h2>
            <p>{duplicate.message}</p>
            <div className="row">
              <div>
                <h3>Existing</h3>
                <p>
                  <strong>{duplicate.existingCard.name}</strong>
                </p>
                <p>{duplicate.existingCard.company}</p>
                {duplicate.existingCard.logoImage && (
                  <img src={duplicate.existingCard.logoImage} alt="Existing logo" style={{ maxWidth: 180, maxHeight: 100, objectFit: "contain", border: "1px solid #d6dfd8", borderRadius: 8, background: "#fff" }} />
                )}
                <p>{duplicate.existingCard.phones.map((p) => p.value).join(", ")}</p>
                <p>{duplicate.existingCard.emails.map((e) => e.value).join(", ")}</p>
                <p>{duplicate.existingCard.websites.map((w) => w.value).join(", ")}</p>
              </div>
              <div>
                <h3>Merged (Editable)</h3>
                <input
                  value={mergeCard.name}
                  onChange={(e) => setMergeCard((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  value={mergeCard.company || ""}
                  onChange={(e) => setMergeCard((prev) => ({ ...prev, company: e.target.value || null }))}
                />
                <label>
                  Logo
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => replaceLogoFromFile(e.target.files?.[0] || null, "merge")} />
                </label>
                <p className="muted" style={{ marginTop: 6, marginBottom: 10 }}>
                  Logo image extraction is currently in development and may be inaccurate. Please review and adjust manually.
                </p>
                {mergeCard.logoImage && (
                  <img src={mergeCard.logoImage} alt="Merged logo" style={{ maxWidth: 180, maxHeight: 100, objectFit: "contain", border: "1px solid #d6dfd8", borderRadius: 8, background: "#fff" }} />
                )}                <div style={{ marginTop: 8 }}>
                  <button className="button-secondary" onClick={() => setMergeCard((prev) => ({ ...prev, logoImage: null }))}>
                    Remove Logo Image
                  </button>
                </div>
                <textarea
                  value={mergeCard.phoneNumbers.join("\n")}
                  onChange={(e) =>
                    setMergeCard((prev) => ({ ...prev, phoneNumbers: splitList(e.target.value) }))
                  }
                />
                <textarea
                  value={mergeCard.emails.join("\n")}
                  onChange={(e) => setMergeCard((prev) => ({ ...prev, emails: splitList(e.target.value) }))}
                />
                <textarea
                  value={mergeCard.websites.join("\n")}
                  onChange={(e) =>
                    setMergeCard((prev) => ({ ...prev, websites: splitList(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" disabled={busy} onClick={() => setDuplicate(null)}>
                Close
              </button>
              <button disabled={busy || !mergeCard.name} onClick={merge}>
                Merge Into Existing
              </button>
              <button disabled={busy || !card.name} onClick={() => save(true)}>
                Save As New
              </button>
            </div>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={!!modalMessage}
        title="Success"
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />
    </>
  );
}





