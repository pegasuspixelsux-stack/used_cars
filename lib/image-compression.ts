"use client";

const MAX_DIMENSION = 1920;
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const MIN_QUALITY = 0.4;

/**
 * Resizes (if needed) and re-encodes an image as WebP entirely in the
 * browser via <canvas>, stepping the quality down until it fits under
 * maxSizeBytes (or hits minQuality) — used by CarPhotoPositioner so every
 * photo is already resized/capped before it ever reaches Firebase Storage.
 * WebP gives noticeably smaller files than JPEG at equivalent quality;
 * every browser this dashboard targets (desktop/mobile Chrome, Safari,
 * Firefox, Edge) supports canvas WebP encoding.
 * Falls back to the original file if anything in the pipeline fails,
 * rather than blocking the upload over a compression bug.
 */
export async function compressImage(
  file: File,
  options: { maxDimension?: number; maxSizeBytes?: number; minQuality?: number } = {},
): Promise<File> {
  const { maxDimension = MAX_DIMENSION, maxSizeBytes = MAX_SIZE_BYTES, minQuality = MIN_QUALITY } = options;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const { width, height } = scaledDimensions(image.naturalWidth, image.naturalHeight, maxDimension);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, width, height);

    let quality = 0.85;
    let blob = await canvasToBlob(canvas, quality);
    while (blob && blob.size > maxSizeBytes && quality > minQuality) {
      quality -= 0.15;
      blob = await canvasToBlob(canvas, quality);
    }
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^./\\]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch (error) {
    console.error("compressImage: falling back to original file", error);
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function scaledDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) return { width, height };
  const scale = maxDimension / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}
