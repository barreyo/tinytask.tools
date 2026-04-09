import { convert, detectDirection } from '../lib/yamlJson';
import type { Direction } from '../lib/yamlJson';

// ── Syntax highlighting (mirrors component's inline helpers) ─────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightJson(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="yj-key">${escapeHtml(match)}</span>`;
        return `<span class="yj-string">${escapeHtml(match)}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="yj-bool">${match}</span>`;
      if (/null/.test(match)) return `<span class="yj-null">${match}</span>`;
      return `<span class="yj-number">${match}</span>`;
    },
  );
}

function highlightYaml(yamlStr: string): string {
  return yamlStr
    .split('\n')
    .map((line) => {
      const keyMatch = line.match(/^(\s*)([\w-]+)(\s*:)(.*)/);
      if (keyMatch) {
        const [, indent, key, colon, rest] = keyMatch;
        const escapedRest = escapeHtml(rest);
        const coloredRest = escapedRest
          .replace(/('([^']*)'|"([^"]*)")/g, '<span class="yj-string">$1</span>')
          .replace(/\b(true|false|null)\b/g, '<span class="yj-bool">$&</span>')
          .replace(/(?<![a-zA-Z])-?\d+(\.\d+)?/g, '<span class="yj-number">$&</span>');
        return `${escapeHtml(indent)}<span class="yj-key">${escapeHtml(key)}${escapeHtml(colon)}</span>${coloredRest}`;
      }
      const listMatch = line.match(/^(\s*-\s)(.*)/);
      if (listMatch) {
        return `<span class="yj-dim">${escapeHtml(listMatch[1])}</span>${escapeHtml(listMatch[2])}`;
      }
      return escapeHtml(line);
    })
    .join('\n');
}

// ── Worker message interface ───────────────────────────────────────────────────

interface YamlJsonRequest {
  id: string;
  src: string;
  /** If null, auto-detect from input */
  manualDirection: Direction | null;
}

interface YamlJsonSuccessResponse {
  id: string;
  ok: true;
  output: string;
  html: string;
  direction: Direction;
}

interface YamlJsonErrorResponse {
  id: string;
  ok: false;
  errorMessage: string;
  direction: Direction;
}

type YamlJsonResponse = YamlJsonSuccessResponse | YamlJsonErrorResponse;

self.onmessage = (event: MessageEvent<YamlJsonRequest>) => {
  const { id, src, manualDirection } = event.data;
  const direction: Direction = manualDirection ?? detectDirection(src);

  try {
    const output = convert(src, direction);

    const html =
      direction === 'yaml-to-json'
        ? highlightJson(output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
        : highlightYaml(output);

    const response: YamlJsonResponse = { id, ok: true, output, html, direction };
    self.postMessage(response);
  } catch (err) {
    const response: YamlJsonResponse = {
      id,
      ok: false,
      errorMessage: err instanceof Error ? err.message : 'Conversion error',
      direction,
    };
    self.postMessage(response);
  }
};
