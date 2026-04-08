export interface XmlError {
  message: string;
  line: number | null;
  col: number | null;
}

export type FormatResult =
  | { formatted: string; error: null }
  | { formatted: null; error: XmlError };

// ── HTML escaping ─────────────────────────────────────────────────────────────

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── XML pretty-printer (DOM-based) ────────────────────────────────────────────

function serializeNode(node: Node, indent: number): string {
  const pad = '  '.repeat(indent);

  switch (node.nodeType) {
    case Node.ELEMENT_NODE: {
      const el = node as Element;
      const tag = el.tagName;
      const attrs = Array.from(el.attributes)
        .map((a) => ` ${a.name}="${a.value}"`)
        .join('');

      const children = Array.from(el.childNodes).filter((c) => {
        if (c.nodeType === Node.TEXT_NODE) {
          return (c.textContent ?? '').trim().length > 0;
        }
        return true;
      });

      if (children.length === 0) {
        return `${pad}<${tag}${attrs} />`;
      }

      // Single text child: inline
      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        const text = (children[0].textContent ?? '').trim();
        return `${pad}<${tag}${attrs}>${text}</${tag}>`;
      }

      const inner = children.map((c) => serializeNode(c, indent + 1)).join('\n');
      return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`;
    }

    case Node.TEXT_NODE: {
      const text = (node.textContent ?? '').trim();
      if (!text) return '';
      return `${pad}${text}`;
    }

    case Node.COMMENT_NODE: {
      return `${pad}<!--${node.textContent}-->`;
    }

    case Node.CDATA_SECTION_NODE: {
      return `${pad}<![CDATA[${node.textContent}]]>`;
    }

    case Node.PROCESSING_INSTRUCTION_NODE: {
      const pi = node as ProcessingInstruction;
      return `${pad}<?${pi.target} ${pi.data}?>`;
    }

    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE: {
      return Array.from(node.childNodes)
        .map((c) => serializeNode(c, indent))
        .filter(Boolean)
        .join('\n');
    }

    default:
      return '';
  }
}

// ── Parse error extraction from DOMParser ────────────────────────────────────

function extractParseError(doc: Document): XmlError | null {
  const errEl = doc.querySelector('parsererror');
  if (!errEl) return null;

  const text = errEl.textContent ?? 'Unknown XML error';

  // Firefox: "XML Parsing Error: ... Line N, Column M"
  // Chrome:  "error on line N at column M: ..."
  const lineColMatch =
    text.match(/line[:\s]+(\d+)[,\s]+col(?:umn)?[:\s]+(\d+)/i) ?? text.match(/(\d+):(\d+)/);

  const line = lineColMatch ? parseInt(lineColMatch[1], 10) : null;
  const col = lineColMatch ? parseInt(lineColMatch[2], 10) : null;

  // Clean up the message
  const message = text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split('\n')[0]
    .trim();

  return { message, line, col };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function formatXml(raw: string): FormatResult {
  if (typeof DOMParser === 'undefined') {
    return {
      formatted: null,
      error: {
        message: 'DOMParser is not available in this environment.',
        line: null,
        col: null,
      },
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'application/xml');

  const parseError = extractParseError(doc);
  if (parseError) {
    return { formatted: null, error: parseError };
  }

  // Build XML declaration if the source had one
  const hasDecl = raw.trimStart().startsWith('<?xml');
  const declLine = hasDecl ? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';

  const body = serializeNode(doc, 0);
  return { formatted: declLine + body, error: null };
}

// ── Syntax highlighting ───────────────────────────────────────────────────────

export function highlightXml(xml: string): string {
  // Process line by line preserving line structure
  const lines = xml.split('\n');
  return lines.map((line) => highlightLine(line)).join('\n');
}

function highlightLine(line: string): string {
  // XML declaration
  if (/^<\?xml/.test(line)) {
    return line.replace(/^(<\?)(\w+)(.*?)(\?>)$/, (_, open, name, rest, close) => {
      const attrs = highlightAttributes(rest);
      return `<span class="xml-decl">${escapeHtml(open)}<span class="xml-pi-target">${escapeHtml(name)}</span>${attrs}${escapeHtml(close)}</span>`;
    });
  }

  // Processing instruction
  if (/^<\?/.test(line) && line.endsWith('?>')) {
    return line.replace(
      /^(<\?)(\S+)(.*?)(\?>)$/,
      (_, open, target, data, close) =>
        `<span class="xml-pi">${escapeHtml(open)}<span class="xml-pi-target">${escapeHtml(target)}</span>${escapeHtml(data)}${escapeHtml(close)}</span>`,
    );
  }

  // Comment
  if (line.trimStart().startsWith('<!--')) {
    return `<span class="xml-comment">${escapeHtml(line)}</span>`;
  }

  // CDATA
  if (line.trimStart().startsWith('<![CDATA[')) {
    return `<span class="xml-cdata">${escapeHtml(line)}</span>`;
  }

  // Closing tag
  const closingMatch = line.match(/^(\s*)(<\/)([^>]+)(>)(.*)$/);
  if (closingMatch) {
    const [, indent, open, tag, close, rest] = closingMatch;
    return (
      escapeHtml(indent) +
      `${escapeHtml(open)}<span class="xml-tag">${escapeHtml(tag)}</span>${escapeHtml(close)}` +
      escapeHtml(rest)
    );
  }

  // Self-closing or opening tag
  const tagMatch = line.match(/^(\s*)(<)([^\s/>]+)(.*?)(\/?>)(.*)$/s);
  if (tagMatch) {
    const [, indent, lt, tag, attrStr, close, trailing] = tagMatch;
    const attrs = highlightAttributes(attrStr);
    return (
      escapeHtml(indent) +
      escapeHtml(lt) +
      `<span class="xml-tag">${escapeHtml(tag)}</span>` +
      attrs +
      escapeHtml(close) +
      (trailing ? highlightInlineText(trailing) : '')
    );
  }

  // Plain text / mixed content
  return escapeHtml(line);
}

function highlightAttributes(attrStr: string): string {
  if (!attrStr.trim()) return escapeHtml(attrStr);

  // Match name="value" or name='value'
  return attrStr.replace(
    /(\s+)([\w:.-]+)(=)(["'])([^"']*)(["'])/g,
    (_, space, name, eq, q1, val, q2) =>
      escapeHtml(space) +
      `<span class="xml-attr-name">${escapeHtml(name)}</span>` +
      escapeHtml(eq) +
      escapeHtml(q1) +
      `<span class="xml-attr-value">${escapeHtml(val)}</span>` +
      escapeHtml(q2),
  );
}

function highlightInlineText(text: string): string {
  // Text that appears after a closing > on the same line (inline content)
  return `<span class="xml-text">${escapeHtml(text)}</span>`;
}
