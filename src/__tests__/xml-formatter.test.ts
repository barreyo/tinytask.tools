import { describe, it, expect } from 'vitest';
import { escapeHtml, highlightXml } from '../lib/xml-formatter';

// ── escapeHtml ────────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than', () => {
    expect(escapeHtml('<tag>')).toBe('&lt;tag&gt;');
  });

  it('escapes greater-than', () => {
    expect(escapeHtml('3 > 2')).toBe('3 &gt; 2');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes all special characters together', () => {
    const result = escapeHtml('<a href="x&y">');
    expect(result).toBe('&lt;a href=&quot;x&amp;y&quot;&gt;');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles multiple occurrences of the same character', () => {
    expect(escapeHtml('a & b & c')).toBe('a &amp; b &amp; c');
  });
});

// ── highlightXml ──────────────────────────────────────────────────────────────

describe('highlightXml', () => {
  it('highlights an XML declaration', () => {
    const result = highlightXml('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('xml-decl');
  });

  it('highlights a processing instruction', () => {
    const result = highlightXml('<?xml-stylesheet type="text/xsl" href="style.xsl"?>');
    expect(result).toContain('xml-pi');
  });

  it('highlights an XML comment', () => {
    const result = highlightXml('<!-- this is a comment -->');
    expect(result).toContain('xml-comment');
  });

  it('highlights a CDATA section', () => {
    const result = highlightXml('<![CDATA[some raw content]]>');
    expect(result).toContain('xml-cdata');
  });

  it('highlights an opening tag name', () => {
    const result = highlightXml('<root>');
    expect(result).toContain('xml-tag');
    expect(result).toContain('root');
  });

  it('highlights a self-closing tag name', () => {
    const result = highlightXml('<br />');
    expect(result).toContain('xml-tag');
  });

  it('highlights a closing tag name', () => {
    const result = highlightXml('</root>');
    expect(result).toContain('xml-tag');
    expect(result).toContain('root');
  });

  it('highlights tag attributes', () => {
    const result = highlightXml('<a href="https://example.com">');
    expect(result).toContain('xml-attr-name');
    expect(result).toContain('xml-attr-value');
    expect(result).toContain('href');
    expect(result).toContain('https://example.com');
  });

  it('escapes special characters in tag content', () => {
    const result = highlightXml('<tag value="a&amp;b">');
    // The raw & in the source XML should be escaped in the HTML output
    expect(result).toContain('&amp;');
  });

  it('processes multi-line XML line by line', () => {
    const xml = '<root>\n  <child />\n</root>';
    const lines = highlightXml(xml).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('xml-tag');
    expect(lines[1]).toContain('xml-tag');
    expect(lines[2]).toContain('xml-tag');
  });

  it('returns plain text for plain text lines', () => {
    // A line with no XML structure is returned as-is (HTML-escaped)
    const result = highlightXml('just some text');
    expect(result).toBe('just some text');
  });

  it('handles indented closing tags', () => {
    const result = highlightXml('  </item>');
    expect(result).toContain('xml-tag');
    expect(result).toContain('item');
  });

  it('preserves indentation before tags', () => {
    const result = highlightXml('  <item>');
    expect(result).toContain('  '); // indent is preserved
  });
});
