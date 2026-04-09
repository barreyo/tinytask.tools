import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export interface GifOptions {
  start: number;
  end: number;
  fps: number;
  maxWidth: number;
  quality?: number;
}

export interface GifProgress {
  current: number;
  total: number;
}

export interface CapturedFrame {
  blob: Blob;
  timeSeconds: number;
  width: number;
  height: number;
}

export function clampDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
): { width: number; height: number } {
  if (srcWidth <= maxWidth) {
    return { width: srcWidth, height: srcHeight };
  }
  const ratio = maxWidth / srcWidth;
  return {
    width: maxWidth,
    height: Math.round(srcHeight * ratio),
  };
}

export function estimateFrameCount(start: number, end: number, fps: number): number {
  return Math.max(1, Math.round((end - start) * fps));
}

export async function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - time) < 0.001) {
      resolve();
      return;
    }

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

export async function extractFrame(
  video: HTMLVideoElement,
  time: number,
  maxWidth = 0,
): Promise<CapturedFrame> {
  await seekTo(video, time);

  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  const { width, height } =
    maxWidth > 0 ? clampDimensions(srcW, srcH, maxWidth) : { width: srcW, height: srcH };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
  });

  return { blob, timeSeconds: time, width, height };
}

export async function* generateGif(
  video: HTMLVideoElement,
  opts: GifOptions,
): AsyncGenerator<GifProgress, Blob> {
  const { start, end, fps, maxWidth, quality = 10 } = opts;
  const duration = end - start;
  const totalFrames = estimateFrameCount(start, end, fps);
  const delay = Math.round(1000 / fps);

  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  const { width, height } =
    maxWidth > 0 ? clampDimensions(srcW, srcH, maxWidth) : { width: srcW, height: srcH };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const encoder = GIFEncoder();

  for (let i = 0; i < totalFrames; i++) {
    const t = start + (i / Math.max(1, totalFrames - 1)) * duration;
    await seekTo(video, Math.min(t, end));

    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Convert RGBA → RGB array for quantization
    const rgb = new Uint8Array(width * height * 3);
    for (let j = 0; j < width * height; j++) {
      rgb[j * 3] = pixels[j * 4];
      rgb[j * 3 + 1] = pixels[j * 4 + 1];
      rgb[j * 3 + 2] = pixels[j * 4 + 2];
    }

    const palette = quantize(rgb, 256, { colorSpace: 'rgb', oneBitAlpha: false });
    const indexed = applyPalette(rgb, palette);

    encoder.writeFrame(indexed, width, height, {
      palette,
      delay,
      quality,
    });

    yield { current: i + 1, total: totalFrames };
  }

  encoder.finish();
  const buf = encoder.bytes();
  return new Blob([buf], { type: 'image/gif' });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
