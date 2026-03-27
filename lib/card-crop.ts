/**
 * Crop a logo image from a file using HTML5 Canvas
 */

const CANVAS_WIDTH = 100;
const CANVAS_HEIGHT = 100;

/**
 * Crop the logo image to 100x100 pixels
 */
export async function cropLogoFromFile(
  file: File,
  image: HTMLImageElement,
  imageWidth: number,
  imageHeight: number,
  imageLeft: number,
  imageTop: number
): Promise<string> {
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
