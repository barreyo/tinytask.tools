export interface ImageOptimizeOptions {
  quality: number; // 0–1
  maxDimension: number | null; // null = no resize
}

export interface ImageOptimizeResult {
  blob: Blob;
  originalSize: number;
  optimizedSize: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  savings: number;
  savingsPercent: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export function calcOutputDimensions(
  width: number,
  height: number,
  maxDimension: number | null,
): ImageDimensions {
  if (maxDimension === null || (width <= maxDimension && height <= maxDimension)) {
    return { width, height };
  }
  if (width >= height) {
    return { width: maxDimension, height: Math.round((height / width) * maxDimension) };
  }
  return { width: Math.round((width / height) * maxDimension), height: maxDimension };
}

export function optimizeImage(
  file: File,
  options: ImageOptimizeOptions,
): Promise<ImageOptimizeResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file.'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to decode image.'));

      img.onload = () => {
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        const { width: outputWidth, height: outputHeight } = calcOutputDimensions(
          originalWidth,
          originalHeight,
          options.maxDimension,
        );

        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable.'));
          return;
        }

        ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP conversion failed.'));
              return;
            }

            const savings = file.size - blob.size;
            const savingsPercent = file.size > 0 ? (savings / file.size) * 100 : 0;

            resolve({
              blob,
              originalSize: file.size,
              optimizedSize: blob.size,
              originalWidth,
              originalHeight,
              outputWidth,
              outputHeight,
              savings,
              savingsPercent,
            });
          },
          'image/webp',
          options.quality,
        );
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const MAX_DIMENSION_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'original', value: null },
  { label: '3840px (4K)', value: 3840 },
  { label: '2560px (2K)', value: 2560 },
  { label: '1920px (FHD)', value: 1920 },
  { label: '1280px (HD)', value: 1280 },
  { label: '1024px', value: 1024 },
  { label: '800px', value: 800 },
];
