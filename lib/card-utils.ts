import type { CreateCardInput } from '@/types/card';

export const EMPTY_CARD: CreateCardInput = {
  name: '',
  company: '',
  title: '',
  jobDescription: '',
  logoImage: '',
  phoneNumbers: [],
  emails: [],
  websites: [],
  notes: '',
  image: '',
};

export const DuplicateResponse: string =
  'This card is a duplicate. You can merge or save it as a new card.';

export function splitList<T>(
  list: string[],
  delimiter: string = ',\n'
): string[] {
  return list
    .map((item) => item.split(delimiter)[0].trim())
    .filter(Boolean);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export async function cropLogoFromFile(
  file: File,
  image: HTMLImageElement,
  imageWidth: number,
  imageHeight: number,
  imageLeft: number,
  imageTop: number
): Promise<string> {
  const CANVAS_WIDTH = 100;
  const CANVAS_HEIGHT = 100;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.drawImage(
    image,
    imageLeft,
    imageTop,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob.toDataURL());
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
