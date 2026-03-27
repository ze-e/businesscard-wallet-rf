import type { ExtractedCard } from "@/lib/schemas";
import { clamp01 } from "@/lib/cards/card-form";

type LogoBox = NonNullable<ExtractedCard["logoBox"]>;
type CropMode = "topLeft" | "center";

type CropBox = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

type CropCandidate = {
  mode: CropMode;
  pad: number;
};

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getCropBox(
  bitmap: ImageBitmap,
  box: LogoBox,
  mode: CropMode,
  pad: number
): CropBox | null {
  const boxWidth = Math.max(1, Math.round(clamp01(box.width) * bitmap.width));
  const boxHeight = Math.max(1, Math.round(clamp01(box.height) * bitmap.height));

  const baseX = mode === "center" ? box.x - box.width / 2 : box.x;
  const baseY = mode === "center" ? box.y - box.height / 2 : box.y;

  const boxX = Math.round(clamp01(baseX) * bitmap.width);
  const boxY = Math.round(clamp01(baseY) * bitmap.height);

  const padX = Math.round(boxWidth * pad);
  const padY = Math.round(boxHeight * pad);

  const sx = Math.max(0, boxX - padX);
  const sy = Math.max(0, boxY - padY);
  const ex = Math.min(bitmap.width, boxX + boxWidth + padX);
  const ey = Math.min(bitmap.height, boxY + boxHeight + padY);

  const sw = ex - sx;
  const sh = ey - sy;

  if (sw <= 2 || sh <= 2) {
    return null;
  }

  return { sx, sy, sw, sh };
}

function trimLikelyCardRegion(source: HTMLCanvasElement): HTMLCanvasElement {
  const width = source.width;
  const height = source.height;
  const context = source.getContext("2d");

  if (!context) {
    return source;
  }

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const isLight = (r: number, g: number, b: number) => r >= 170 && g >= 170 && b >= 170;

  const columnScores = new Array<number>(width).fill(0);
  for (let x = 0; x < width; x++) {
    let lightPixels = 0;

    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      if (isLight(data[index], data[index + 1], data[index + 2])) {
        lightPixels++;
      }
    }

    columnScores[x] = lightPixels / height;
  }

  const rowScores = new Array<number>(height).fill(0);
  for (let y = 0; y < height; y++) {
    let lightPixels = 0;

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (isLight(data[index], data[index + 1], data[index + 2])) {
        lightPixels++;
      }
    }

    rowScores[y] = lightPixels / width;
  }

  function bestRun(values: number[], minRatio: number): { start: number; end: number } | null {
    let best: { start: number; end: number } | null = null;
    let runStart = -1;

    for (let index = 0; index < values.length; index++) {
      if (values[index] >= minRatio) {
        if (runStart === -1) {
          runStart = index;
        }
        continue;
      }

      if (runStart !== -1) {
        const run = { start: runStart, end: index - 1 };
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

  const columnRun = bestRun(columnScores, 0.06);
  const rowRun = bestRun(rowScores, 0.04);

  let rx = 0;
  let ry = 0;
  let rw = width;
  let rh = height;

  if (columnRun) {
    const runWidth = columnRun.end - columnRun.start + 1;
    if (runWidth >= Math.round(width * 0.08)) {
      const pad = Math.round(runWidth * 0.2);
      rx = Math.max(0, columnRun.start - pad);
      rw = Math.min(width - rx, runWidth + pad * 2);
    }
  }

  if (rowRun) {
    const runHeight = rowRun.end - rowRun.start + 1;
    if (runHeight >= Math.round(height * 0.08)) {
      const pad = Math.round(runHeight * 0.2);
      ry = Math.max(0, rowRun.start - pad);
      rh = Math.min(height - ry, runHeight + pad * 2);
    }
  }

  if (rw <= 2 || rh <= 2) {
    return source;
  }

  const outputCanvas = makeCanvas(rw, rh);
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    return source;
  }

  outputContext.drawImage(source, rx, ry, rw, rh, 0, 0, rw, rh);
  return outputCanvas;
}

function scoreCanvas(source: HTMLCanvasElement): number {
  const width = source.width;
  const height = source.height;
  const context = source.getContext("2d");

  if (!context) {
    return Number.NEGATIVE_INFINITY;
  }

  const { data } = context.getImageData(0, 0, width, height);
  const totalPixels = width * height;

  let white = 0;
  let brown = 0;
  let dark = 0;
  let edges = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      if (r >= 185 && g >= 185 && b >= 185) {
        white++;
      }

      if (r > g + 12 && g > b + 12 && r > 90 && g > 60) {
        brown++;
      }

      if (r < 45 && g < 45 && b < 45) {
        dark++;
      }

      if (x > 0) {
        const previous = index - 4;
        const difference =
          Math.abs(r - data[previous]) +
          Math.abs(g - data[previous + 1]) +
          Math.abs(b - data[previous + 2]);

        if (difference >= 85) {
          edges++;
        }
      }
    }
  }

  const whiteRatio = white / totalPixels;
  const brownRatio = brown / totalPixels;
  const darkRatio = dark / totalPixels;
  const edgeRatio = edges / totalPixels;

  return whiteRatio * 1.3 + edgeRatio * 0.9 - brownRatio * 2.0 - darkRatio * 0.25;
}

function normalizeOnWhite(source: HTMLCanvasElement): string | null {
  const sourceWidth = source.width;
  const sourceHeight = source.height;

  if (sourceWidth <= 1 || sourceHeight <= 1) {
    return null;
  }

  const outputWidth = 320;
  const outputHeight = 180;
  const outputCanvas = makeCanvas(outputWidth, outputHeight);
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    return null;
  }

  outputContext.fillStyle = "#ffffff";
  outputContext.fillRect(0, 0, outputWidth, outputHeight);

  const maxDrawWidth = outputWidth * 0.82;
  const maxDrawHeight = outputHeight * 0.82;
  const scale = Math.min(maxDrawWidth / sourceWidth, maxDrawHeight / sourceHeight);

  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
  const dx = Math.round((outputWidth - drawWidth) / 2);
  const dy = Math.round((outputHeight - drawHeight) / 2);

  outputContext.drawImage(source, 0, 0, sourceWidth, sourceHeight, dx, dy, drawWidth, drawHeight);
  return outputCanvas.toDataURL("image/png");
}

async function createBitmapFromFile(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, {
      imageOrientation: "from-image"
    } as ImageBitmapOptions);
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      return null;
    }
  }
}

export async function cropLogoFromFile(file: File, box: LogoBox): Promise<string | null> {
  const bitmap = await createBitmapFromFile(file);

  if (!bitmap) {
    return null;
  }

  try {
    const candidates: CropCandidate[] = [
      { mode: "topLeft", pad: 0.15 },
      { mode: "topLeft", pad: 0.8 },
      { mode: "center", pad: 0.15 },
      { mode: "center", pad: 0.8 }
    ];

    let best: { canvas: HTMLCanvasElement; score: number } | null = null;

    for (const candidate of candidates) {
      const crop = getCropBox(bitmap, box, candidate.mode, candidate.pad);
      if (!crop) {
        continue;
      }

      const rawCanvas = makeCanvas(crop.sw, crop.sh);
      const rawContext = rawCanvas.getContext("2d");
      if (!rawContext) {
        continue;
      }

      rawContext.drawImage(
        bitmap,
        crop.sx,
        crop.sy,
        crop.sw,
        crop.sh,
        0,
        0,
        crop.sw,
        crop.sh
      );

      const refinedCanvas = trimLikelyCardRegion(rawCanvas);
      const score = scoreCanvas(refinedCanvas);

      if (!best || score > best.score) {
        best = {
          canvas: refinedCanvas,
          score
        };
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