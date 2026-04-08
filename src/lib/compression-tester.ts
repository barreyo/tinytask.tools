export type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw' | 'br';

export interface CompressionResult {
  format: CompressionFormat;
  label: string;
  supported: boolean;
  originalBytes: number;
  compressedBytes: number;
  ratio: number;
  savings: number;
  compressed: Uint8Array | null;
  error: string | null;
}

export interface CompressionSummary {
  originalBytes: number;
  originalText: string;
  encoding: 'utf-8';
  results: CompressionResult[];
}

const FORMAT_LABELS: Record<CompressionFormat, string> = {
  gzip: 'gzip',
  deflate: 'deflate (zlib)',
  'deflate-raw': 'deflate-raw',
  br: 'brotli',
};

// Formats to try, in display order
export const FORMATS: CompressionFormat[] = ['gzip', 'deflate', 'deflate-raw', 'br'];

async function compressBytes(bytes: Uint8Array, format: CompressionFormat): Promise<Uint8Array> {
  const cs = new CompressionStream(format as CompressionFormat);
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function isSupportedFormat(format: CompressionFormat): Promise<boolean> {
  try {
    const cs = new CompressionStream(format as CompressionFormat);
    const writer = cs.writable.getWriter();
    writer.write(new Uint8Array([0]));
    writer.close();
    const reader = cs.readable.getReader();
    // consume to avoid leaks
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
    return true;
  } catch {
    return false;
  }
}

export async function compress(text: string): Promise<CompressionSummary> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const originalBytes = bytes.byteLength;

  const results: CompressionResult[] = await Promise.all(
    FORMATS.map(async (format): Promise<CompressionResult> => {
      const label = FORMAT_LABELS[format];

      if (typeof CompressionStream === 'undefined') {
        return {
          format,
          label,
          supported: false,
          originalBytes,
          compressedBytes: 0,
          ratio: 0,
          savings: 0,
          compressed: null,
          error: 'CompressionStream API not available in this browser.',
        };
      }

      const supported = await isSupportedFormat(format);
      if (!supported) {
        return {
          format,
          label,
          supported: false,
          originalBytes,
          compressedBytes: 0,
          ratio: 0,
          savings: 0,
          compressed: null,
          error: `${label} is not supported in this browser.`,
        };
      }

      try {
        const compressed = await compressBytes(bytes, format);
        const compressedBytes = compressed.byteLength;
        const ratio = originalBytes > 0 ? compressedBytes / originalBytes : 1;
        const savings = 1 - ratio;
        return {
          format,
          label,
          supported: true,
          originalBytes,
          compressedBytes,
          ratio,
          savings,
          compressed,
          error: null,
        };
      } catch (e) {
        return {
          format,
          label,
          supported: true,
          originalBytes,
          compressedBytes: 0,
          ratio: 0,
          savings: 0,
          compressed: null,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }),
  );

  return { originalBytes, originalText: text, encoding: 'utf-8', results };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
