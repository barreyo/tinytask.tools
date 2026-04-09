// XML highlighting worker.
// DOMParser is not available in workers, so the main thread handles parsing
// and serialization. This worker only runs highlightXml + line-number rendering,
// which is the expensive string-processing step for large documents.

import { highlightXml, escapeHtml } from '../lib/xml-formatter';
import { OUTPUT_LINE_CAP, truncationBanner } from '../lib/worker-utils';

interface XmlHighlightRequest {
  id: string;
  formatted: string;
}

interface XmlHighlightSuccessResponse {
  id: string;
  ok: true;
  html: string;
  totalLines: number;
}

interface XmlHighlightErrorResponse {
  id: string;
  ok: false;
  errorHtml: string;
}

type XmlHighlightResponse = XmlHighlightSuccessResponse | XmlHighlightErrorResponse;

self.onmessage = (event: MessageEvent<XmlHighlightRequest>) => {
  const { id, formatted } = event.data;

  try {
    const lines = formatted.split('\n');
    const totalLines = lines.length;
    const cappedLines = lines.slice(0, OUTPUT_LINE_CAP);
    const highlighted = highlightXml(cappedLines.join('\n'));

    const rows = highlighted.split('\n').map((line, i) => {
      const lineNum = `<span class="xf-ln" aria-hidden="true">${String(i + 1).padStart(4, '\u00a0')}</span>`;
      return `<div>${lineNum}<span class="xf-lc">${line || '\u00a0'}</span></div>`;
    });

    let html = `<pre class="xf-pre">${rows.join('')}</pre>`;
    if (totalLines > OUTPUT_LINE_CAP) {
      html += truncationBanner(OUTPUT_LINE_CAP, totalLines);
    }

    const response: XmlHighlightResponse = { id, ok: true, html, totalLines };
    self.postMessage(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Highlight error';
    const errorHtml = `<pre class="xf-pre"><div class="xf-line--msg"><span class="xf-lc xf-error-msg">${escapeHtml(message)}</span></div></pre>`;
    const response: XmlHighlightResponse = { id, ok: false, errorHtml };
    self.postMessage(response);
  }
};
