import {
  autoFix,
  cleanErrorMessage,
  escapeHtml,
  extractErrorOffset,
  highlightJson,
  offsetToLineCol,
  renderWithLineNumbers,
} from '../utils/jsonFormatter';
import { OUTPUT_LINE_CAP, truncationBanner } from '../lib/worker-utils';
import type { WorkerRequest, WorkerResponse } from '../lib/worker-utils';

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, src } = event.data;

  if (!src.trim()) {
    const response: WorkerResponse = { id, ok: true, formatted: '', html: '', totalLines: 0 };
    self.postMessage(response);
    return;
  }

  const fixed = autoFix(src);

  try {
    const parsed = JSON.parse(fixed);
    const formatted = JSON.stringify(parsed, null, 2);
    const lines = formatted.split('\n');
    const totalLines = lines.length;

    const cappedLines = lines.slice(0, OUTPUT_LINE_CAP);
    const highlightedClean = highlightJson(cappedLines.join('\n'));
    let html = `<pre class="jf-pre">${renderWithLineNumbers(highlightedClean, null)}</pre>`;
    if (totalLines > OUTPUT_LINE_CAP) {
      html += truncationBanner(OUTPUT_LINE_CAP, totalLines);
    }

    const response: WorkerResponse = { id, ok: true, formatted, html, totalLines };
    self.postMessage(response);
  } catch (err) {
    const { message, offset } = extractErrorOffset(fixed, err as SyntaxError);

    let errorHtml: string;
    if (offset !== null) {
      const { line: errLine, col: errCol } = offsetToLineCol(fixed, offset);
      const srcLines = fixed.split('\n');

      const rows: string[] = srcLines.map((rawLine, i) => {
        const isError = i === errLine;
        const rowClass = isError ? ' class="jf-line--error"' : '';
        const lineNum = `<span class="jf-ln" aria-hidden="true">${String(i + 1).padStart(4, '\u00a0')}</span>`;
        const lineContent = `<span class="jf-lc">${escapeHtml(rawLine) || '\u00a0'}</span>`;
        let row = `<div${rowClass}>${lineNum}${lineContent}</div>`;

        if (isError) {
          const caretPad = '\u00a0'.repeat(errCol);
          const caretRow = `<div class="jf-line--caret"><span class="jf-ln" aria-hidden="true">${'\u00a0'.repeat(4)}</span><span class="jf-lc">${caretPad}<span class="jf-caret">^</span></span></div>`;
          const msgRow = `<div class="jf-line--msg"><span class="jf-ln" aria-hidden="true">${'\u00a0'.repeat(4)}</span><span class="jf-lc jf-error-msg">${escapeHtml(cleanErrorMessage(message))}</span></div>`;
          row += caretRow + msgRow;
        }

        return row;
      });

      errorHtml = `<pre class="jf-pre">${rows.join('')}</pre>`;
    } else {
      errorHtml = `<pre class="jf-pre"><div class="jf-line--msg"><span class="jf-lc jf-error-msg">${escapeHtml(cleanErrorMessage(message))}</span></div></pre>`;
    }

    const response: WorkerResponse = { id, ok: false, errorHtml };
    self.postMessage(response);
  }
};
