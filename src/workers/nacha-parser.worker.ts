import {
  parseNacha,
  validateNacha,
  formatAmount,
  describeTransactionCode,
  describeServiceClassCode,
  describeSecCode,
  type ValidationError,
} from '../lib/nacha';

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Field definitions (mirrors the component's field layout tables) ───────────

interface FieldDef {
  start: number;
  end: number;
  name: string;
  fmt?: (val: string) => string;
  desc?: string;
}

const FILE_HEADER_FIELDS: FieldDef[] = [
  { start: 0, end: 1, name: 'Record Type', desc: 'Always "1" for File Header' },
  { start: 1, end: 3, name: 'Priority Code', desc: 'Always "01"' },
  {
    start: 3,
    end: 13,
    name: 'Immediate Destination',
    desc: 'Routing number of the ACH Operator or receiving point',
  },
  { start: 13, end: 23, name: 'Immediate Origin', desc: 'Routing number of the sending point' },
  { start: 23, end: 29, name: 'File Creation Date', desc: 'Date file was prepared (YYMMDD)' },
  { start: 29, end: 33, name: 'File Creation Time', desc: 'Time file was created (HHmm)' },
  {
    start: 33,
    end: 34,
    name: 'File ID Modifier',
    desc: 'Distinguishes between multiple files created on the same date (A-Z, 0-9)',
  },
  { start: 34, end: 37, name: 'Record Size', desc: 'Always "094"' },
  { start: 37, end: 39, name: 'Blocking Factor', desc: 'Always "10"' },
  { start: 39, end: 40, name: 'Format Code', desc: 'Always "1"' },
  {
    start: 40,
    end: 63,
    name: 'Destination Name',
    desc: 'Name of the receiving ACH Operator or institution',
  },
  {
    start: 63,
    end: 86,
    name: 'Origin Name',
    desc: 'Name of the originating ACH Operator or institution',
  },
  {
    start: 86,
    end: 94,
    name: 'Reference Code',
    desc: "Optional field for originator's internal use",
  },
];

const BATCH_HEADER_FIELDS: FieldDef[] = [
  { start: 0, end: 1, name: 'Record Type', desc: 'Always "5" for Batch Header' },
  {
    start: 1,
    end: 4,
    name: 'Service Class Code',
    fmt: (v) => describeServiceClassCode(v.trim()),
    desc: '200=Mixed, 220=Credits Only, 225=Debits Only',
  },
  {
    start: 4,
    end: 20,
    name: 'Company Name',
    desc: "Originator's company name, may appear on receiver's statement",
  },
  {
    start: 20,
    end: 40,
    name: 'Discretionary Data',
    desc: 'Optional field for originator/ODFI internal codes',
  },
  {
    start: 40,
    end: 50,
    name: 'Company ID',
    desc: '10-digit ID assigned by ODFI (often FEIN preceded by a code)',
  },
  {
    start: 50,
    end: 53,
    name: 'SEC Code',
    fmt: (v) => describeSecCode(v),
    desc: 'Standard Entry Class code determines entry format and rules',
  },
  {
    start: 53,
    end: 63,
    name: 'Entry Description',
    desc: "Description shown on receiver's bank statement (e.g. PAYROLL)",
  },
  {
    start: 63,
    end: 69,
    name: 'Descriptive Date',
    desc: 'Optional date for receiver display purposes',
  },
  {
    start: 69,
    end: 75,
    name: 'Effective Entry Date',
    desc: 'Date entries settle to receiver accounts (YYMMDD)',
  },
  {
    start: 75,
    end: 78,
    name: 'Settlement Date',
    desc: 'Inserted by ACH Operator, blank when originating (Julian day)',
  },
  {
    start: 78,
    end: 79,
    name: 'Originator Status',
    desc: '1=Depository FI, 2=Federal Government, 0=ADV only',
  },
  {
    start: 79,
    end: 87,
    name: 'Originating DFI',
    desc: "First 8 digits of the originating institution's routing number",
  },
  { start: 87, end: 94, name: 'Batch Number', desc: 'Ascending sequence number within the file' },
];

const ENTRY_DETAIL_FIELDS: FieldDef[] = [
  { start: 0, end: 1, name: 'Record Type', desc: 'Always "6" for Entry Detail' },
  {
    start: 1,
    end: 3,
    name: 'Transaction Code',
    fmt: (v) => describeTransactionCode(v.trim()),
    desc: 'Determines account type (checking/savings) and direction (credit/debit)',
  },
  {
    start: 3,
    end: 11,
    name: 'Receiving DFI',
    desc: "First 8 digits of the receiver's bank routing number",
  },
  {
    start: 11,
    end: 12,
    name: 'Check Digit',
    desc: 'Last digit of the routing number (used for validation)',
  },
  {
    start: 12,
    end: 29,
    name: 'Account Number',
    desc: "Receiver's bank account number (left-justified, space-padded)",
  },
  {
    start: 29,
    end: 39,
    name: 'Amount',
    fmt: (v) => formatAmount(parseInt(v, 10) || 0),
    desc: 'Transaction amount in cents (zero-padded to 10 digits)',
  },
  {
    start: 39,
    end: 54,
    name: 'Identification #',
    desc: 'Internal ID used by originator to identify this entry',
  },
  {
    start: 54,
    end: 76,
    name: 'Receiver Name',
    desc: 'Name of the payment receiver (usually the account holder)',
  },
  {
    start: 76,
    end: 78,
    name: 'Discretionary Data',
    desc: 'Optional 2-char code for ODFI use; WEB/TEL use as Payment Type Code',
  },
  {
    start: 78,
    end: 79,
    name: 'Addenda Indicator',
    desc: '"1" = addenda record(s) follow, "0" = none',
  },
  {
    start: 79,
    end: 94,
    name: 'Trace Number',
    desc: 'ODFI routing (8 digits) + sequence (7 digits); unique within batch',
  },
];

const ADDENDA_FIELDS: FieldDef[] = [
  { start: 0, end: 1, name: 'Record Type', desc: 'Always "7" for Addenda' },
  {
    start: 1,
    end: 3,
    name: 'Addenda Type Code',
    desc: '"05" = payment-related info, "98" = change notification, "99" = return',
  },
  {
    start: 3,
    end: 83,
    name: 'Payment Related Info',
    desc: 'Free-form text with supplemental payment details (up to 80 chars)',
  },
  {
    start: 83,
    end: 87,
    name: 'Addenda Seq #',
    desc: 'Sequence number of this addenda within the entry (0001-9999)',
  },
  {
    start: 87,
    end: 94,
    name: 'Entry Detail Seq #',
    desc: 'Last 7 digits of the related Entry Detail trace number',
  },
];

const BATCH_CONTROL_FIELDS: FieldDef[] = [
  { start: 0, end: 1, name: 'Record Type', desc: 'Always "8" for Batch Control' },
  {
    start: 1,
    end: 4,
    name: 'Service Class Code',
    fmt: (v) => describeServiceClassCode(v.trim()),
    desc: 'Must match the Batch Header service class code',
  },
  {
    start: 4,
    end: 10,
    name: 'Entry/Addenda Count',
    desc: 'Total count of type "6" and "7" records in this batch',
  },
  {
    start: 10,
    end: 20,
    name: 'Entry Hash',
    desc: 'Sum of all Entry Detail receiving DFI routing numbers (mod 10^10)',
  },
  {
    start: 20,
    end: 32,
    name: 'Total Debit',
    fmt: (v) => formatAmount(parseInt(v, 10) || 0),
    desc: 'Sum of all debit transaction amounts in this batch (in cents)',
  },
  {
    start: 32,
    end: 44,
    name: 'Total Credit',
    fmt: (v) => formatAmount(parseInt(v, 10) || 0),
    desc: 'Sum of all credit transaction amounts in this batch (in cents)',
  },
  {
    start: 44,
    end: 54,
    name: 'Company ID',
    desc: 'Must match the Batch Header company identification',
  },
  {
    start: 54,
    end: 73,
    name: 'Message Auth Code',
    desc: 'Optional MAC for validating file integrity (usually blank)',
  },
  { start: 73, end: 79, name: 'Reserved', desc: 'Reserved for future use (blank)' },
  {
    start: 79,
    end: 87,
    name: 'Originating DFI',
    desc: 'Must match the Batch Header originating DFI',
  },
  { start: 87, end: 94, name: 'Batch Number', desc: 'Must match the Batch Header batch number' },
];

const FILE_CONTROL_FIELDS: FieldDef[] = [
  { start: 0, end: 1, name: 'Record Type', desc: 'Always "9" for File Control' },
  { start: 1, end: 7, name: 'Batch Count', desc: 'Total number of batches in the file' },
  {
    start: 7,
    end: 13,
    name: 'Block Count',
    desc: 'Total lines in the file divided by blocking factor (10), rounded up',
  },
  {
    start: 13,
    end: 21,
    name: 'Entry/Addenda Count',
    desc: 'Total count of type "6" and "7" records across all batches',
  },
  {
    start: 21,
    end: 31,
    name: 'Entry Hash',
    desc: 'Sum of all batch Entry Hash totals (mod 10^10)',
  },
  {
    start: 31,
    end: 43,
    name: 'Total Debit',
    fmt: (v) => formatAmount(parseInt(v, 10) || 0),
    desc: 'Sum of all batch Total Debit amounts (in cents)',
  },
  {
    start: 43,
    end: 55,
    name: 'Total Credit',
    fmt: (v) => formatAmount(parseInt(v, 10) || 0),
    desc: 'Sum of all batch Total Credit amounts (in cents)',
  },
  { start: 55, end: 94, name: 'Reserved', desc: 'Reserved for future use (blank)' },
];

const RECORD_TYPE_LABELS: Record<string, string> = {
  '1': 'File Header',
  '5': 'Batch Header',
  '6': 'Entry Detail',
  '7': 'Addenda',
  '8': 'Batch Control',
  '9': 'File Control',
};

function getFieldDefs(type: string): FieldDef[] {
  switch (type) {
    case '1':
      return FILE_HEADER_FIELDS;
    case '5':
      return BATCH_HEADER_FIELDS;
    case '6':
      return ENTRY_DETAIL_FIELDS;
    case '7':
      return ADDENDA_FIELDS;
    case '8':
      return BATCH_CONTROL_FIELDS;
    case '9':
      return FILE_CONTROL_FIELDS;
    default:
      return [];
  }
}

function renderLine(line: string, lineNum: number, errorLines?: Set<number>): string {
  if (!line || line.length === 0) return '';
  const type = line[0];
  const isPadding = /^9+$/.test(line);
  const hasError = errorLines?.has(lineNum) ?? false;
  const errorCls = hasError ? ' rec-error' : '';

  if (isPadding) {
    return `<div class="record-line rec-padding${errorCls}" data-line="${lineNum}"><span class="line-num">${lineNum}</span><span class="line-content">${escapeHtml(line)}</span></div>`;
  }

  const fields = getFieldDefs(type);
  const label = RECORD_TYPE_LABELS[type] || 'Unknown';
  const cls = `rec-${type}`;

  let spans = '';
  for (const f of fields) {
    const raw = line.slice(f.start, f.end);
    const fmtVal = f.fmt ? f.fmt(raw) : '';
    spans += `<span class="field-span" data-field-name="${escapeHtml(f.name)}" data-field-pos="${f.start + 1}-${f.end}" data-field-raw="${escapeHtml(raw)}" data-field-val="${escapeHtml(fmtVal)}" data-field-desc="${escapeHtml(f.desc || '')}">${escapeHtml(raw)}</span>`;
  }
  if (line.length > 94) {
    spans += `<span class="field-span">${escapeHtml(line.slice(94))}</span>`;
  }

  const errorMarker = hasError ? '<span class="rec-error-marker">!</span>' : '';

  return `<div class="record-line ${cls}${errorCls}" data-line="${lineNum}"><span class="line-num">${lineNum}</span><span class="rec-badge">${type}</span>${errorMarker}<span class="rec-label">${label}</span><span class="line-fields">${spans}</span></div>`;
}

function renderErrorItem(e: ValidationError): string {
  const hintAttr = e.hint ? ` data-error-hint="${escapeHtml(e.hint)}"` : '';
  const hintIcon = e.hint
    ? '<span class="error-hint-icon" aria-label="Hover for fix suggestion">?</span>'
    : '';
  if (e.line) {
    return `<li${hintAttr}><button class="error-line-btn" data-goto-line="${e.line}">line ${e.line}</button> ${escapeHtml(e.message)}${hintIcon}</li>`;
  }
  return `<li${hintAttr}><span class="error-bullet">●</span> ${escapeHtml(e.message)}${hintIcon}</li>`;
}

// ── Worker message interface ───────────────────────────────────────────────────

interface NachaRequest {
  id: string;
  raw: string;
}

interface NachaSuccessResponse {
  id: string;
  ok: true;
  isValid: boolean;
  errorCount: number;
  statusDetail: string;
  totalBatches: number;
  totalEntries: number;
  summaryHtml: string;
  errorItemsHtml: string;
  recordsHtml: string;
}

interface NachaErrorResponse {
  id: string;
  ok: false;
  error: string;
}

type NachaResponse = NachaSuccessResponse | NachaErrorResponse;

self.onmessage = (event: MessageEvent<NachaRequest>) => {
  const { id, raw } = event.data;

  try {
    const parsed = parseNacha(raw);
    const validationErrors = validateNacha(parsed);
    const allErrors = [...parsed.errors, ...validationErrors];

    const errorLineNums = new Set<number>();
    for (const e of allErrors) {
      if (e.line) errorLineNums.add(e.line);
    }

    const isValid = allErrors.length === 0;
    const s = parsed.summary;

    let statusDetail: string;
    if (isValid) {
      statusDetail = `${s.totalBatches} batch${s.totalBatches !== 1 ? 'es' : ''}, ${s.totalEntries} entr${s.totalEntries !== 1 ? 'ies' : 'y'} — all checks passed`;
    } else {
      statusDetail = `${allErrors.length} issue${allErrors.length !== 1 ? 's' : ''} found`;
    }

    const summaryHtml = `
      <div class="summary-item"><span class="summary-val">${escapeHtml(s.originName || '—')}</span><span class="summary-key">origin</span></div>
      <div class="summary-item"><span class="summary-val">${escapeHtml(s.destinationName || '—')}</span><span class="summary-key">destination</span></div>
      <div class="summary-item"><span class="summary-val">${escapeHtml(s.fileCreationDate || '—')}</span><span class="summary-key">created</span></div>
      <div class="summary-item"><span class="summary-val">${s.totalBatches}</span><span class="summary-key">batches</span></div>
      <div class="summary-item"><span class="summary-val">${s.totalEntries}</span><span class="summary-key">entries</span></div>
      <div class="summary-item"><span class="summary-val">${s.totalAddenda}</span><span class="summary-key">addenda</span></div>
      <div class="summary-item"><span class="summary-val summary-credit">${escapeHtml(s.totalCreditDollars)}</span><span class="summary-key">total credits</span></div>
      <div class="summary-item"><span class="summary-val summary-debit">${escapeHtml(s.totalDebitDollars)}</span><span class="summary-key">total debits</span></div>
      <div class="summary-item"><span class="summary-val">${escapeHtml(s.secCodes.join(', ') || '—')}</span><span class="summary-key">SEC codes</span></div>
    `;

    const errorItemsHtml = allErrors.map(renderErrorItem).join('');

    const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    let recordsHtml = '';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length === 0) continue;
      recordsHtml += renderLine(lines[i], i + 1, errorLineNums);
    }

    const response: NachaResponse = {
      id,
      ok: true,
      isValid,
      errorCount: allErrors.length,
      statusDetail,
      totalBatches: s.totalBatches,
      totalEntries: s.totalEntries,
      summaryHtml,
      errorItemsHtml,
      recordsHtml,
    };
    self.postMessage(response);
  } catch (err) {
    const response: NachaResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : 'Parse error',
    };
    self.postMessage(response);
  }
};
