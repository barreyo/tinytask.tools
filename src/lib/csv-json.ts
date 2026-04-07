import Papa from 'papaparse';

export interface CsvToJsonOptions {
  delimiter?: string; // '' = auto-detect
  header?: boolean;
  skipEmpty?: boolean;
}

export interface JsonToCsvOptions {
  delimiter?: string;
  header?: boolean;
}

export interface ParseResult {
  data: unknown;
  errors: string[];
}

export function csvToJson(csv: string, options: CsvToJsonOptions = {}): ParseResult {
  const result = Papa.parse(csv, {
    delimiter: options.delimiter || '',
    header: options.header ?? true,
    skipEmptyLines: options.skipEmpty ?? true,
    dynamicTyping: true,
  });

  const errors = result.errors.map((e) => `Row ${e.row ?? '?'}: ${e.message}`);

  return {
    data: result.data,
    errors,
  };
}

export function jsonToCsv(json: string, options: JsonToCsvOptions = {}): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { data: '', errors: [`Invalid JSON: ${(e as Error).message}`] };
  }

  if (!Array.isArray(parsed)) {
    return { data: '', errors: ['JSON must be an array of objects to convert to CSV'] };
  }

  const csv = Papa.unparse(parsed as object[], {
    delimiter: options.delimiter || ',',
    header: options.header ?? true,
  });

  return { data: csv, errors: [] };
}
