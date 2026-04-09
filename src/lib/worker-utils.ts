// Shared helpers for Web Worker communication across formatter tools.

/** Number of highlighted lines to render in the DOM; full text is always kept. */
export const OUTPUT_LINE_CAP = 5_000;

/** Returns a debounce delay in ms scaled to input length to keep the UI snappy
 *  for small inputs while avoiding hammering workers with large payloads. */
export function getDebounceMs(length: number): number {
  if (length < 50_000) return 150;
  if (length < 500_000) return 400;
  if (length < 2_000_000) return 800;
  return 1_500;
}

export interface WorkerRequest {
  id: string;
  src: string;
}

export interface WorkerSuccessResponse {
  id: string;
  ok: true;
  formatted: string;
  html: string;
  /** Total line count before any cap was applied */
  totalLines: number;
}

export interface WorkerErrorResponse {
  id: string;
  ok: false;
  errorHtml: string;
}

export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

/** Build the truncation banner appended when output lines exceed the cap. */
export function truncationBanner(shown: number, total: number): string {
  return `<div class="worker-truncation">showing first ${shown.toLocaleString()} of ${total.toLocaleString()} lines — use download for the full output</div>`;
}
