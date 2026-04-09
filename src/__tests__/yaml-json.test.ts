import { describe, it, expect } from 'vitest';
import { detectDirection, yamlToJson, jsonToYaml, convert } from '../lib/yamlJson';

// ── detectDirection ───────────────────────────────────────────────────────────

describe('detectDirection', () => {
  it('detects JSON object as json-to-yaml', () => {
    expect(detectDirection('{"key": "value"}')).toBe('json-to-yaml');
  });

  it('detects JSON array as json-to-yaml', () => {
    expect(detectDirection('[1, 2, 3]')).toBe('json-to-yaml');
  });

  it('detects YAML mapping as yaml-to-json', () => {
    expect(detectDirection('key: value')).toBe('yaml-to-json');
  });

  it('detects YAML document marker as yaml-to-json', () => {
    expect(detectDirection('---\nkey: value')).toBe('yaml-to-json');
  });

  it('ignores leading whitespace when detecting JSON', () => {
    expect(detectDirection('  {"key": 1}')).toBe('json-to-yaml');
    expect(detectDirection('\n{"key": 1}')).toBe('json-to-yaml');
  });
});

// ── yamlToJson ────────────────────────────────────────────────────────────────

describe('yamlToJson', () => {
  it('converts a simple YAML mapping to JSON', () => {
    const result = yamlToJson('name: Alice\nage: 30');
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('Alice');
    expect(parsed.age).toBe(30);
  });

  it('converts YAML boolean values', () => {
    const parsed = JSON.parse(yamlToJson('flag: true'));
    expect(parsed.flag).toBe(true);
  });

  it('converts YAML null values', () => {
    const parsed = JSON.parse(yamlToJson('value: null'));
    expect(parsed.value).toBeNull();
  });

  it('converts YAML sequences to arrays', () => {
    const parsed = JSON.parse(yamlToJson('items:\n  - 1\n  - 2\n  - 3'));
    expect(parsed.items).toEqual([1, 2, 3]);
  });

  it('converts nested YAML mappings', () => {
    const yaml = 'db:\n  host: localhost\n  port: 5432';
    const parsed = JSON.parse(yamlToJson(yaml));
    expect(parsed.db.host).toBe('localhost');
    expect(parsed.db.port).toBe(5432);
  });

  it('outputs pretty-printed JSON with 2-space indent', () => {
    const result = yamlToJson('x: 1');
    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });

  it('handles YAML inline flow sequences', () => {
    const parsed = JSON.parse(yamlToJson('nums: [1, 2, 3]'));
    expect(parsed.nums).toEqual([1, 2, 3]);
  });

  it('handles multi-line strings', () => {
    const yaml = 'text: |\n  line one\n  line two';
    const parsed = JSON.parse(yamlToJson(yaml));
    expect(parsed.text).toContain('line one');
    expect(parsed.text).toContain('line two');
  });
});

// ── jsonToYaml ────────────────────────────────────────────────────────────────

describe('jsonToYaml', () => {
  it('converts a simple JSON object to YAML', () => {
    const result = jsonToYaml('{"name": "Alice"}');
    expect(result).toContain('name:');
    expect(result).toContain('Alice');
  });

  it('converts JSON array to YAML sequence', () => {
    const result = jsonToYaml('[1, 2, 3]');
    expect(result).toContain('- 1');
    expect(result).toContain('- 2');
    expect(result).toContain('- 3');
  });

  it('converts nested JSON object to YAML mapping', () => {
    const result = jsonToYaml('{"db": {"host": "localhost"}}');
    expect(result).toContain('db:');
    expect(result).toContain('host:');
    expect(result).toContain('localhost');
  });

  it('round-trips through YAML and back', () => {
    const json = '{"name": "Bob", "scores": [10, 20, 30]}';
    const yaml = jsonToYaml(json);
    const back = JSON.parse(yamlToJson(yaml));
    expect(back.name).toBe('Bob');
    expect(back.scores).toEqual([10, 20, 30]);
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToYaml('not json at all')).toThrow();
  });

  it('converts null values', () => {
    const result = jsonToYaml('{"value": null}');
    expect(result).toContain('null');
  });

  it('converts boolean values', () => {
    const result = jsonToYaml('{"flag": false}');
    expect(result).toContain('false');
  });
});

// ── convert ───────────────────────────────────────────────────────────────────

describe('convert', () => {
  it('delegates yaml-to-json correctly', () => {
    const result = convert('x: 1', 'yaml-to-json');
    expect(JSON.parse(result).x).toBe(1);
  });

  it('delegates json-to-yaml correctly', () => {
    const result = convert('{"x": 1}', 'json-to-yaml');
    expect(result).toContain('x:');
  });
});
