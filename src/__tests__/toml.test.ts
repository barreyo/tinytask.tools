import { describe, it, expect } from 'vitest';
import {
  detectDirection,
  tomlToJson,
  jsonToToml,
  formatToml,
  convert,
  highlightToml,
} from '../lib/toml';

// ── detectDirection ───────────────────────────────────────────────────────────

describe('detectDirection', () => {
  it('detects JSON object as json-to-toml', () => {
    expect(detectDirection('{"key": "value"}')).toBe('json-to-toml');
  });

  it('detects JSON array as json-to-toml', () => {
    expect(detectDirection('[1, 2, 3]')).toBe('json-to-toml');
  });

  it('detects TOML as toml-to-json', () => {
    expect(detectDirection('key = "value"')).toBe('toml-to-json');
  });

  it('detects plain TOML key-value as toml-to-json', () => {
    expect(detectDirection('name = "Alice"\nage = 30')).toBe('toml-to-json');
  });

  it('detects TOML section header as json-to-toml (starts with [ like JSON array)', () => {
    // The heuristic only checks the first character; [section] is ambiguous with
    // a JSON array opener so it is classified as json-to-toml.
    expect(detectDirection('[section]\nkey = 1')).toBe('json-to-toml');
  });

  it('ignores leading whitespace', () => {
    expect(detectDirection('  {"key": 1}')).toBe('json-to-toml');
    expect(detectDirection('\n{"key": 1}')).toBe('json-to-toml');
  });
});

// ── tomlToJson ────────────────────────────────────────────────────────────────

describe('tomlToJson', () => {
  it('converts a simple TOML key-value to JSON', () => {
    const result = tomlToJson('title = "TOML Example"');
    const parsed = JSON.parse(result);
    expect(parsed.title).toBe('TOML Example');
  });

  it('converts integer values', () => {
    const result = tomlToJson('count = 42');
    expect(JSON.parse(result).count).toBe(42);
  });

  it('converts boolean values', () => {
    const result = tomlToJson('flag = true');
    expect(JSON.parse(result).flag).toBe(true);
  });

  it('converts TOML array', () => {
    const result = tomlToJson('items = [1, 2, 3]');
    expect(JSON.parse(result).items).toEqual([1, 2, 3]);
  });

  it('converts TOML section to nested object', () => {
    const toml = '[database]\nhost = "localhost"\nport = 5432';
    const parsed = JSON.parse(tomlToJson(toml));
    expect(parsed.database.host).toBe('localhost');
    expect(parsed.database.port).toBe(5432);
  });

  it('outputs pretty-printed JSON (2-space indent)', () => {
    const result = tomlToJson('x = 1');
    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });

  it('throws on invalid TOML', () => {
    expect(() => tomlToJson('invalid = = toml')).toThrow();
  });
});

// ── jsonToToml ────────────────────────────────────────────────────────────────

describe('jsonToToml', () => {
  it('converts a simple JSON object to TOML', () => {
    const result = jsonToToml('{"title": "Example"}');
    expect(result).toContain('title');
    expect(result).toContain('Example');
  });

  it('converts integer values', () => {
    const result = jsonToToml('{"count": 42}');
    expect(result).toContain('42');
  });

  it('converts nested object to TOML section', () => {
    const result = jsonToToml('{"db": {"host": "localhost"}}');
    expect(result).toContain('[db]');
    expect(result).toContain('localhost');
  });

  it('round-trips through TOML and back', () => {
    const json = '{"name": "Alice", "age": 30}';
    const toml = jsonToToml(json);
    const backToJson = JSON.parse(tomlToJson(toml));
    expect(backToJson.name).toBe('Alice');
    expect(backToJson.age).toBe(30);
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToToml('not json')).toThrow();
  });
});

// ── formatToml ────────────────────────────────────────────────────────────────

describe('formatToml', () => {
  it('parses and re-serializes valid TOML', () => {
    const src = 'name = "Alice"\nage = 30';
    const result = formatToml(src);
    expect(result).toContain('name');
    expect(result).toContain('Alice');
  });

  it('throws on invalid TOML', () => {
    expect(() => formatToml('bad = = toml')).toThrow();
  });
});

// ── convert ───────────────────────────────────────────────────────────────────

describe('convert', () => {
  it('delegates toml-to-json correctly', () => {
    const result = convert('x = 1', 'toml-to-json');
    expect(JSON.parse(result).x).toBe(1);
  });

  it('delegates json-to-toml correctly', () => {
    const result = convert('{"x": 1}', 'json-to-toml');
    expect(result).toContain('x');
  });
});

// ── highlightToml ─────────────────────────────────────────────────────────────

describe('highlightToml', () => {
  it('wraps a comment in toml-comment span', () => {
    expect(highlightToml('# This is a comment')).toContain('toml-comment');
  });

  it('wraps a section header in toml-header span', () => {
    expect(highlightToml('[section]')).toContain('toml-header');
  });

  it('wraps an array-of-tables header in toml-header span', () => {
    expect(highlightToml('[[products]]')).toContain('toml-header');
  });

  it('wraps a key in toml-key span', () => {
    expect(highlightToml('name = "Alice"')).toContain('toml-key');
  });

  it('wraps a string value in toml-string span', () => {
    expect(highlightToml('name = "Alice"')).toContain('toml-string');
  });

  it('wraps a boolean value in toml-bool span', () => {
    expect(highlightToml('flag = true')).toContain('toml-bool');
  });

  it('wraps a number value in toml-number span', () => {
    expect(highlightToml('count = 42')).toContain('toml-number');
  });

  it('wraps a date value in toml-date span', () => {
    expect(highlightToml('birthday = 1990-01-15')).toContain('toml-date');
  });

  it('escapes HTML special characters in keys and values', () => {
    const result = highlightToml('key = "<value>"');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('handles blank lines gracefully', () => {
    const result = highlightToml('\n\n');
    expect(result).toBe('\n\n');
  });

  it('preserves multi-line structure', () => {
    const src = '# comment\n[section]\nkey = 1';
    const lines = highlightToml(src).split('\n');
    expect(lines).toHaveLength(3);
  });

  it('highlights inline trailing comment', () => {
    const result = highlightToml('key = 42 # inline');
    expect(result).toContain('toml-comment');
    expect(result).toContain('toml-number');
  });
});
