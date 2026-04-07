import * as yaml from 'js-yaml';

export type Direction = 'yaml-to-json' | 'json-to-yaml';

/**
 * Detects whether the input looks more like YAML or JSON.
 * Returns 'json' if the trimmed input starts with { or [, otherwise 'yaml'.
 */
export function detectDirection(input: string): Direction {
  const trimmed = input.trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json-to-yaml';
  }
  return 'yaml-to-json';
}

export function yamlToJson(src: string): string {
  const parsed = yaml.load(src);
  return JSON.stringify(parsed, null, 2);
}

export function jsonToYaml(src: string): string {
  const parsed = JSON.parse(src);
  return yaml.dump(parsed, { indent: 2, lineWidth: -1 });
}

export function convert(src: string, direction: Direction): string {
  if (direction === 'yaml-to-json') return yamlToJson(src);
  return jsonToYaml(src);
}
