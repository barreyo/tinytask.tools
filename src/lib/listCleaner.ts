export type Separator = 'auto' | 'newline' | 'comma' | 'space' | 'tab' | 'pipe' | 'semicolon';
export type Joiner = 'newline' | 'comma' | 'comma-space' | 'tab' | 'pipe' | 'semicolon' | 'space';

export interface CleanOptions {
  removeDuplicates: boolean;
  sortAlpha: boolean;
  sortNumeric: boolean;
  reverse: boolean;
  trimWhitespace: boolean;
  removeEmpty: boolean;
  lowercase: boolean;
  uppercase: boolean;
}

function detectSeparator(input: string): Separator {
  const newlineCount = (input.match(/\n/g) ?? []).length;
  const commaCount = (input.match(/,/g) ?? []).length;
  const pipeCount = (input.match(/\|/g) ?? []).length;
  const semicolonCount = (input.match(/;/g) ?? []).length;
  const tabCount = (input.match(/\t/g) ?? []).length;

  if (newlineCount > 0) return 'newline';
  if (commaCount > 0) return 'comma';
  if (semicolonCount > 0) return 'semicolon';
  if (pipeCount > 0) return 'pipe';
  if (tabCount > 0) return 'tab';
  return 'space';
}

export function parseList(input: string, separator: Separator): string[] {
  if (!input.trim()) return [];

  const sep = separator === 'auto' ? detectSeparator(input) : separator;

  let items: string[];
  switch (sep) {
    case 'newline':
      items = input.split(/\r?\n/);
      break;
    case 'comma':
      items = input.split(',');
      break;
    case 'tab':
      items = input.split('\t');
      break;
    case 'pipe':
      items = input.split('|');
      break;
    case 'semicolon':
      items = input.split(';');
      break;
    case 'space':
      items = input.split(/\s+/);
      break;
    default:
      items = input.split(/\r?\n/);
  }

  return items;
}

export function cleanList(items: string[], options: CleanOptions): string[] {
  let result = [...items];

  if (options.trimWhitespace) {
    result = result.map((item) => item.trim());
  }

  if (options.removeEmpty) {
    result = result.filter((item) => item.length > 0);
  }

  if (options.lowercase) {
    result = result.map((item) => item.toLowerCase());
  } else if (options.uppercase) {
    result = result.map((item) => item.toUpperCase());
  }

  if (options.removeDuplicates) {
    result = [...new Set(result)];
  }

  if (options.sortNumeric) {
    result = result.sort((a, b) => {
      const na = parseFloat(a);
      const nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  } else if (options.sortAlpha) {
    result = result.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }

  if (options.reverse) {
    result = result.reverse();
  }

  return result;
}

export function joinList(items: string[], joiner: Joiner): string {
  switch (joiner) {
    case 'newline':
      return items.join('\n');
    case 'comma':
      return items.join(',');
    case 'comma-space':
      return items.join(', ');
    case 'tab':
      return items.join('\t');
    case 'pipe':
      return items.join(' | ');
    case 'semicolon':
      return items.join('; ');
    case 'space':
      return items.join(' ');
    default:
      return items.join('\n');
  }
}
