import { describe, it, expect } from 'vitest';
import { csvToJson, jsonToCsv } from '../lib/csv-json';

// ── csvToJson ─────────────────────────────────────────────────────────────────

describe('csvToJson', () => {
  it('parses a simple CSV with header row', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const { data, errors } = csvToJson(csv);
    expect(errors).toHaveLength(0);
    expect(data).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
  });

  it('uses dynamic typing to convert numeric strings to numbers', () => {
    const { data } = csvToJson('x\n42');
    expect((data as Array<{ x: number }>)[0].x).toBe(42);
  });

  it('uses dynamic typing to convert boolean strings', () => {
    const { data } = csvToJson('flag\ntrue\nfalse');
    const rows = data as Array<{ flag: boolean }>;
    expect(rows[0].flag).toBe(true);
    expect(rows[1].flag).toBe(false);
  });

  it('skips empty lines by default', () => {
    const csv = 'name,age\nAlice,30\n\nBob,25';
    const { data } = csvToJson(csv);
    expect((data as unknown[]).length).toBe(2);
  });

  it('returns errors array on malformed CSV', () => {
    // Extra column in data row vs header
    const csv = 'a,b\n1,2,3';
    const { errors } = csvToJson(csv);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a custom delimiter', () => {
    const csv = 'name;age\nAlice;30';
    const { data, errors } = csvToJson(csv, { delimiter: ';' });
    expect(errors).toHaveLength(0);
    expect((data as Array<{ name: string; age: number }>)[0].name).toBe('Alice');
  });

  it('handles headerless CSV when header=false', () => {
    const csv = 'Alice,30\nBob,25';
    const { data } = csvToJson(csv, { header: false });
    // PapaParse returns arrays when header=false
    expect(Array.isArray((data as unknown[][])[0])).toBe(true);
  });

  it('returns empty array for empty CSV string', () => {
    const { data } = csvToJson('');
    expect((data as unknown[]).length).toBe(0);
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'name,city\nAlice,"New York, NY"';
    const { data, errors } = csvToJson(csv);
    expect(errors).toHaveLength(0);
    expect((data as Array<{ name: string; city: string }>)[0].city).toBe('New York, NY');
  });

  it('handles quoted fields containing newlines', () => {
    const csv = 'name,bio\nAlice,"line1\nline2"';
    const { data } = csvToJson(csv);
    expect((data as Array<{ bio: string }>)[0].bio).toContain('line1');
  });
});

// ── jsonToCsv ─────────────────────────────────────────────────────────────────

describe('jsonToCsv', () => {
  it('converts a JSON array of objects to CSV', () => {
    const json = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
    const { data, errors } = jsonToCsv(json);
    expect(errors).toHaveLength(0);
    expect(data).toContain('Alice');
    expect(data).toContain('Bob');
    expect(data).toContain('name');
    expect(data).toContain('age');
  });

  it('includes header row by default', () => {
    const json = '[{"x": 1}]';
    const { data } = jsonToCsv(json);
    // PapaParse uses CRLF line endings, so trim before comparing
    const lines = (data as string).split(/\r?\n/).filter(Boolean);
    expect(lines[0].trim()).toBe('x');
  });

  it('uses comma as default delimiter', () => {
    const json = '[{"a": 1, "b": 2}]';
    const { data } = jsonToCsv(json);
    expect(data).toContain(',');
  });

  it('accepts a custom delimiter', () => {
    const json = '[{"a": 1, "b": 2}]';
    const { data } = jsonToCsv(json, { delimiter: ';' });
    const lines = (data as string).split('\n').filter(Boolean);
    expect(lines[0]).toContain(';');
  });

  it('returns an error for invalid JSON', () => {
    const { data, errors } = jsonToCsv('not json');
    expect(data).toBe('');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Invalid JSON');
  });

  it('returns an error when JSON is not an array', () => {
    const { data, errors } = jsonToCsv('{"key": "value"}');
    expect(data).toBe('');
    expect(errors[0]).toContain('array');
  });

  it('handles an empty array', () => {
    const { data, errors } = jsonToCsv('[]');
    expect(errors).toHaveLength(0);
    expect(data).toBeDefined();
  });

  it('round-trips CSV → JSON → CSV preserving data', () => {
    const original = 'name,score\nAlice,100\nBob,95';
    const { data: jsonData } = csvToJson(original);
    const { data: csvData } = jsonToCsv(JSON.stringify(jsonData));
    // Should contain the same values
    expect(csvData).toContain('Alice');
    expect(csvData).toContain('100');
  });
});
