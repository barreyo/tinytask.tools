import { formatToml, highlightToml } from '../lib/toml';
import { OUTPUT_LINE_CAP, truncationBanner } from '../lib/worker-utils';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface TomlRequest {
  id: string;
  src: string;
}

interface TomlSuccessResponse {
  id: string;
  ok: true;
  formatted: string;
  html: string;
  totalLines: number;
}

interface TomlErrorResponse {
  id: string;
  ok: false;
  errorHtml: string;
}

type TomlResponse = TomlSuccessResponse | TomlErrorResponse;

self.onmessage = (event: MessageEvent<TomlRequest>) => {
  const { id, src } = event.data;

  try {
    const formatted = formatToml(src);
    const highlighted = highlightToml(formatted);

    const lines = highlighted.split('\n');
    const totalLines = lines.length;
    const cappedLines = lines.slice(0, OUTPUT_LINE_CAP);

    const rows = cappedLines.map((line, i) => {
      const lineNum = `<span class="tf-ln" aria-hidden="true">${String(i + 1).padStart(4, '\u00a0')}</span>`;
      return `<div>${lineNum}<span class="tf-lc">${line || '\u00a0'}</span></div>`;
    });

    let html = `<pre class="tf-pre">${rows.join('')}</pre>`;
    if (totalLines > OUTPUT_LINE_CAP) {
      html += truncationBanner(OUTPUT_LINE_CAP, totalLines);
    }

    const response: TomlResponse = { id, ok: true, formatted, html, totalLines };
    self.postMessage(response);
  } catch (err) {
    const message = (err as Error).message ?? 'Unknown parse error';
    const lineColMatch = message.match(/line\s+(\d+)/i);
    const errLineNum = lineColMatch ? parseInt(lineColMatch[1], 10) - 1 : null;
    const srcLines = src.split('\n');

    let errorHtml: string;
    if (errLineNum !== null && errLineNum >= 0 && errLineNum < srcLines.length) {
      const rows: string[] = srcLines.map((rawLine, i) => {
        const isError = i === errLineNum;
        const rowClass = isError ? ' class="tf-line--error"' : '';
        const lineNum = `<span class="tf-ln" aria-hidden="true">${String(i + 1).padStart(4, '\u00a0')}</span>`;
        const lineContent = `<span class="tf-lc">${escapeHtml(rawLine) || '\u00a0'}</span>`;
        let row = `<div${rowClass}>${lineNum}${lineContent}</div>`;

        if (isError) {
          const caretRow = `<div class="tf-line--caret"><span class="tf-ln" aria-hidden="true">${'\u00a0'.repeat(4)}</span><span class="tf-lc"><span class="tf-caret">^</span></span></div>`;
          const msgRow = `<div class="tf-line--msg"><span class="tf-ln" aria-hidden="true">${'\u00a0'.repeat(4)}</span><span class="tf-lc tf-error-msg">${escapeHtml(message)}</span></div>`;
          row += caretRow + msgRow;
        }

        return row;
      });

      errorHtml = `<pre class="tf-pre">${rows.join('')}</pre>`;
    } else {
      errorHtml = `<pre class="tf-pre"><div class="tf-line--msg"><span class="tf-lc tf-error-msg">${escapeHtml(message)}</span></div></pre>`;
    }

    const response: TomlResponse = { id, ok: false, errorHtml };
    self.postMessage(response);
  }
};
