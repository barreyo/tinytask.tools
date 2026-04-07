// ── NACHA / ACH fixed-width file parser, validator, and generator ──
// Every record is exactly 94 characters. Fields are sliced by position.

export const RECORD_LINE_LENGTH = 94;

// ── Lookup tables ──────────────────────────────────────────────────

const TRANSACTION_CODES: Record<string, string> = {
  '22': 'Checking Credit (Deposit)',
  '23': 'Checking Credit Prenote',
  '24': 'Checking Credit Zero-Dollar with Remittance',
  '27': 'Checking Debit (Payment)',
  '28': 'Checking Debit Prenote',
  '29': 'Checking Debit Zero-Dollar with Remittance',
  '32': 'Savings Credit (Deposit)',
  '33': 'Savings Credit Prenote',
  '34': 'Savings Credit Zero-Dollar with Remittance',
  '37': 'Savings Debit (Payment)',
  '38': 'Savings Debit Prenote',
  '39': 'Savings Debit Zero-Dollar with Remittance',
  '21': 'Return/NOC for Checking Credit',
  '26': 'Return/NOC for Checking Debit',
  '31': 'Return/NOC for Savings Credit',
  '36': 'Return/NOC for Savings Debit',
  '41': 'GL Credit',
  '42': 'GL Credit Prenote',
  '43': 'GL Credit Zero-Dollar with Remittance',
  '46': 'GL Debit',
  '47': 'GL Debit Prenote',
  '48': 'GL Debit Zero-Dollar with Remittance',
  '51': 'Loan Credit',
  '52': 'Loan Credit Prenote',
  '53': 'Loan Credit Zero-Dollar with Remittance',
  '55': 'Loan Debit (Reversal Only)',
  '56': 'Loan Debit Prenote',
};

const SERVICE_CLASS_CODES: Record<string, string> = {
  '200': 'Mixed Debits and Credits',
  '220': 'Credits Only',
  '225': 'Debits Only',
  '280': 'Automated Accounting Advices',
};

const SEC_CODES: Record<string, string> = {
  ACK: 'Acknowledgment Entry for CCD',
  ADV: 'Automated Accounting Advice',
  ARC: 'Accounts Receivable',
  ATX: 'Acknowledgment Entry for CTX',
  BOC: 'Back Office Conversion',
  CCD: 'Corporate Credit or Debit',
  CIE: 'Customer Initiated Entry',
  COR: 'Notification of Change',
  CTX: 'Corporate Trade Exchange',
  DNE: 'Death Notification Entry',
  ENR: 'Automated Enrollment Entry',
  IAT: 'International ACH Transaction',
  MTE: 'Machine Transfer Entry',
  POP: 'Point of Purchase',
  POS: 'Point of Sale',
  PPD: 'Prearranged Payment/Deposit',
  RCK: 'Re-presented Check',
  SHR: 'Shared Network Entry',
  TEL: 'Telephone Initiated',
  TRC: 'Truncated Check Entry',
  TRX: 'Check Truncation Entries Exchange',
  WEB: 'Internet/Mobile Initiated',
  XCK: 'Destroyed Check Entry',
};

export function describeTransactionCode(code: string): string {
  return TRANSACTION_CODES[code] ?? `Unknown (${code})`;
}

export function describeServiceClassCode(code: string): string {
  return SERVICE_CLASS_CODES[code] ?? `Unknown (${code})`;
}

export function describeSecCode(code: string): string {
  return SEC_CODES[code.trim()] ?? code.trim();
}

// ── Record types ───────────────────────────────────────────────────

export interface FileHeader {
  recordType: '1';
  priorityCode: string;
  immediateDestination: string;
  immediateOrigin: string;
  fileCreationDate: string;
  fileCreationTime: string;
  fileIdModifier: string;
  recordSize: string;
  blockingFactor: string;
  formatCode: string;
  destinationName: string;
  originName: string;
  referenceCode: string;
}

export interface BatchHeader {
  recordType: '5';
  serviceClassCode: string;
  companyName: string;
  companyDiscretionaryData: string;
  companyIdentification: string;
  secCode: string;
  companyEntryDescription: string;
  companyDescriptiveDate: string;
  effectiveEntryDate: string;
  settlementDate: string;
  originatorStatusCode: string;
  originatingDfi: string;
  batchNumber: string;
}

export interface EntryDetail {
  recordType: '6';
  transactionCode: string;
  receivingDfi: string;
  checkDigit: string;
  dfiAccountNumber: string;
  amount: number;
  identificationNumber: string;
  receiverName: string;
  discretionaryData: string;
  addendaIndicator: string;
  traceNumber: string;
  addenda: AddendaRecord[];
}

export interface AddendaRecord {
  recordType: '7';
  addendaTypeCode: string;
  paymentRelatedInfo: string;
  addendaSequenceNumber: string;
  entryDetailSequenceNumber: string;
}

export interface BatchControl {
  recordType: '8';
  serviceClassCode: string;
  entryAddendaCount: string;
  entryHash: string;
  totalDebit: number;
  totalCredit: number;
  companyIdentification: string;
  messageAuthCode: string;
  reserved: string;
  originatingDfi: string;
  batchNumber: string;
}

export interface FileControl {
  recordType: '9';
  batchCount: string;
  blockCount: string;
  entryAddendaCount: string;
  entryHash: string;
  totalDebit: number;
  totalCredit: number;
  reserved: string;
}

export interface Batch {
  header: BatchHeader;
  entries: EntryDetail[];
  control: BatchControl;
}

export interface ValidationError {
  line?: number;
  message: string;
  hint?: string;
}

export interface FileSummary {
  totalBatches: number;
  totalEntries: number;
  totalAddenda: number;
  totalDebitDollars: string;
  totalCreditDollars: string;
  secCodes: string[];
  originName: string;
  destinationName: string;
  fileCreationDate: string;
  fileCreationTime: string;
}

export interface BatchLineMap {
  header: number;
  control?: number;
  entries: { entry: number; addenda: number[] }[];
}

export interface LineMap {
  fileHeader?: number;
  fileControl?: number;
  batches: BatchLineMap[];
}

export interface NachaFile {
  fileHeader: FileHeader | null;
  batches: Batch[];
  fileControl: FileControl | null;
  paddingLines: number;
  errors: ValidationError[];
  summary: FileSummary;
  lineMap: LineMap;
}

// Per moov-io/ach: 27-29 checking debit, 37-39 savings debit,
// 46-48 GL debit, 55-56 loan debit
const DEBIT_TRANSACTION_CODES = new Set([
  '27',
  '28',
  '29',
  '37',
  '38',
  '39',
  '46',
  '47',
  '48',
  '55',
  '56',
]);

export function isDebitTransactionCode(tc: string): boolean {
  return DEBIT_TRANSACTION_CODES.has(tc);
}

// ── Formatting helpers ─────────────────────────────────────────────

export function formatAmount(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatNachaDate(yymmdd: string): string {
  if (!yymmdd || yymmdd.trim().length < 6) return yymmdd;
  const s = yymmdd.trim();
  return `20${s.slice(0, 2)}-${s.slice(2, 4)}-${s.slice(4, 6)}`;
}

// ── Parsers ────────────────────────────────────────────────────────

function parseFileHeader(line: string): FileHeader {
  return {
    recordType: '1',
    priorityCode: line.slice(1, 3),
    immediateDestination: line.slice(3, 13).trim(),
    immediateOrigin: line.slice(13, 23).trim(),
    fileCreationDate: line.slice(23, 29),
    fileCreationTime: line.slice(29, 33),
    fileIdModifier: line.slice(33, 34),
    recordSize: line.slice(34, 37),
    blockingFactor: line.slice(37, 39),
    formatCode: line.slice(39, 40),
    destinationName: line.slice(40, 63).trim(),
    originName: line.slice(63, 86).trim(),
    referenceCode: line.slice(86, 94).trim(),
  };
}

function parseBatchHeader(line: string): BatchHeader {
  return {
    recordType: '5',
    serviceClassCode: line.slice(1, 4),
    companyName: line.slice(4, 20).trim(),
    companyDiscretionaryData: line.slice(20, 40).trim(),
    companyIdentification: line.slice(40, 50).trim(),
    secCode: line.slice(50, 53).trim(),
    companyEntryDescription: line.slice(53, 63).trim(),
    companyDescriptiveDate: line.slice(63, 69).trim(),
    effectiveEntryDate: line.slice(69, 75),
    settlementDate: line.slice(75, 78),
    originatorStatusCode: line.slice(78, 79),
    originatingDfi: line.slice(79, 87),
    batchNumber: line.slice(87, 94),
  };
}

function parseEntryDetail(line: string): EntryDetail {
  return {
    recordType: '6',
    transactionCode: line.slice(1, 3),
    receivingDfi: line.slice(3, 11),
    checkDigit: line.slice(11, 12),
    dfiAccountNumber: line.slice(12, 29).trim(),
    amount: parseInt(line.slice(29, 39), 10) || 0,
    identificationNumber: line.slice(39, 54).trim(),
    receiverName: line.slice(54, 76).trim(),
    discretionaryData: line.slice(76, 78).trim(),
    addendaIndicator: line.slice(78, 79),
    traceNumber: line.slice(79, 94),
    addenda: [],
  };
}

function parseAddenda(line: string): AddendaRecord {
  return {
    recordType: '7',
    addendaTypeCode: line.slice(1, 3),
    paymentRelatedInfo: line.slice(3, 83).trim(),
    addendaSequenceNumber: line.slice(83, 87),
    entryDetailSequenceNumber: line.slice(87, 94),
  };
}

function parseBatchControl(line: string): BatchControl {
  return {
    recordType: '8',
    serviceClassCode: line.slice(1, 4),
    entryAddendaCount: line.slice(4, 10),
    entryHash: line.slice(10, 20),
    totalDebit: parseInt(line.slice(20, 32), 10) || 0,
    totalCredit: parseInt(line.slice(32, 44), 10) || 0,
    companyIdentification: line.slice(44, 54).trim(),
    messageAuthCode: line.slice(54, 73).trim(),
    reserved: line.slice(73, 79),
    originatingDfi: line.slice(79, 87),
    batchNumber: line.slice(87, 94),
  };
}

function parseFileControl(line: string): FileControl {
  return {
    recordType: '9',
    batchCount: line.slice(1, 7),
    blockCount: line.slice(7, 13),
    entryAddendaCount: line.slice(13, 21),
    entryHash: line.slice(21, 31),
    totalDebit: parseInt(line.slice(31, 43), 10) || 0,
    totalCredit: parseInt(line.slice(43, 55), 10) || 0,
    reserved: line.slice(55, 94),
  };
}

// ── Main parser ────────────────────────────────────────────────────

export function parseNacha(raw: string): NachaFile {
  const VALID_RECORD_TYPES = new Set(['1', '5', '6', '7', '8', '9']);
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) =>
      l.length > 0 && l.length < RECORD_LINE_LENGTH && VALID_RECORD_TYPES.has(l[0])
        ? l.padEnd(RECORD_LINE_LENGTH)
        : l,
    );
  const errors: ValidationError[] = [];
  let fileHeader: FileHeader | null = null;
  let fileControl: FileControl | null = null;
  const batches: Batch[] = [];
  let currentBatch: Batch | null = null;
  let lastEntry: EntryDetail | null = null;
  let paddingLines = 0;

  const lineMap: LineMap = { batches: [] };
  let currentBatchLineMap: BatchLineMap | null = null;
  let currentEntryLineInfo: { entry: number; addenda: number[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) continue;

    const lineNum = i + 1;
    const isPadding = /^9+$/.test(line);

    if (line.length !== RECORD_LINE_LENGTH && !isPadding) {
      errors.push({
        line: lineNum,
        message: `Line is ${line.length} chars (expected ${RECORD_LINE_LENGTH})`,
        hint: `Every NACHA record must be exactly ${RECORD_LINE_LENGTH} characters. This line is ${line.length < RECORD_LINE_LENGTH ? 'too short — pad it with spaces on the right' : 'too long — truncate it'} to ${RECORD_LINE_LENGTH} characters.`,
      });
      continue;
    }

    const type = line[0];

    switch (type) {
      case '1':
        fileHeader = parseFileHeader(line);
        lineMap.fileHeader = lineNum;
        break;

      case '5':
        currentBatch = { header: parseBatchHeader(line), entries: [], control: null! };
        currentBatchLineMap = { header: lineNum, entries: [] };
        lastEntry = null;
        currentEntryLineInfo = null;
        break;

      case '6':
        if (!currentBatch) {
          errors.push({
            line: lineNum,
            message: 'Entry Detail record outside of a batch',
            hint: 'Entry Detail (type 6) records must appear between a Batch Header (type 5) and a Batch Control (type 8). Add a Batch Header record before this entry.',
          });
          break;
        }
        lastEntry = parseEntryDetail(line);
        currentBatch.entries.push(lastEntry);
        currentEntryLineInfo = { entry: lineNum, addenda: [] };
        currentBatchLineMap?.entries.push(currentEntryLineInfo);
        break;

      case '7':
        if (!lastEntry) {
          errors.push({
            line: lineNum,
            message: 'Addenda record without a preceding Entry Detail',
            hint: 'Addenda (type 7) records must immediately follow an Entry Detail (type 6) record that has its Addenda Indicator (position 79) set to "1". Insert an Entry Detail before this addenda, or move this addenda after an existing entry.',
          });
          break;
        }
        lastEntry.addenda.push(parseAddenda(line));
        currentEntryLineInfo?.addenda.push(lineNum);
        break;

      case '8':
        if (!currentBatch) {
          errors.push({
            line: lineNum,
            message: 'Batch Control record without a Batch Header',
            hint: 'Every Batch Control (type 8) must be paired with a preceding Batch Header (type 5). Add a Batch Header before the entries that precede this control, or remove this orphaned control record.',
          });
          break;
        }
        currentBatch.control = parseBatchControl(line);
        if (currentBatchLineMap) {
          currentBatchLineMap.control = lineNum;
          lineMap.batches.push(currentBatchLineMap);
        }
        batches.push(currentBatch);
        currentBatch = null;
        currentBatchLineMap = null;
        lastEntry = null;
        currentEntryLineInfo = null;
        break;

      case '9':
        if (isPadding && line.length <= RECORD_LINE_LENGTH) {
          paddingLines++;
        } else if (!fileControl) {
          fileControl = parseFileControl(line);
          lineMap.fileControl = lineNum;
        } else {
          paddingLines++;
        }
        break;

      default:
        errors.push({
          line: lineNum,
          message: `Unknown record type "${type}"`,
          hint: `The first character of each line must be a valid record type: 1 (File Header), 5 (Batch Header), 6 (Entry Detail), 7 (Addenda), 8 (Batch Control), or 9 (File Control/padding). Check that this line starts at the correct position and isn't shifted.`,
        });
    }
  }

  if (currentBatch) {
    errors.push({
      message: 'Unterminated batch (missing Batch Control record)',
      hint: 'The last batch in the file is missing its Batch Control (type 8) record. Every Batch Header (type 5) must have a corresponding Batch Control with matching totals, counts, and hash.',
    });
  }

  const totalEntries = batches.reduce((s, b) => s + b.entries.length, 0);
  const totalAddenda = batches.reduce(
    (s, b) => s + b.entries.reduce((a, e) => a + e.addenda.length, 0),
    0,
  );
  const secCodes = [...new Set(batches.map((b) => b.header.secCode))];

  const totalDebit =
    fileControl?.totalDebit ?? batches.reduce((s, b) => s + (b.control?.totalDebit ?? 0), 0);
  const totalCredit =
    fileControl?.totalCredit ?? batches.reduce((s, b) => s + (b.control?.totalCredit ?? 0), 0);

  const summary: FileSummary = {
    totalBatches: batches.length,
    totalEntries,
    totalAddenda,
    totalDebitDollars: formatAmount(totalDebit),
    totalCreditDollars: formatAmount(totalCredit),
    secCodes,
    originName: fileHeader?.originName ?? '',
    destinationName: fileHeader?.destinationName ?? '',
    fileCreationDate: fileHeader ? formatNachaDate(fileHeader.fileCreationDate) : '',
    fileCreationTime: fileHeader?.fileCreationTime ?? '',
  };

  return { fileHeader, batches, fileControl, paddingLines, errors, summary, lineMap };
}

// ── Validator ──────────────────────────────────────────────────────

export function validateNacha(file: NachaFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const lm = file.lineMap;

  if (!file.fileHeader) {
    errors.push({
      message: 'Missing File Header record (type 1)',
      hint: 'Every NACHA file must begin with a File Header record (first character "1"). It contains the routing numbers, names, and creation date. This is always the very first line of the file.',
    });
  }
  if (!file.fileControl) {
    errors.push({
      message: 'Missing File Control record (type 9)',
      hint: 'Every NACHA file must end with a File Control record (first character "9") that summarizes batch count, entry/addenda count, hash totals, and debit/credit totals for the entire file.',
    });
  }
  if (file.batches.length === 0) {
    errors.push({
      message: 'File contains no batches',
      hint: 'A valid NACHA file requires at least one batch. Each batch starts with a Batch Header (type 5), contains one or more Entry Detail (type 6) records, and ends with a Batch Control (type 8).',
    });
  }

  for (let bi = 0; bi < file.batches.length; bi++) {
    const batch = file.batches[bi];
    const batchLabel = `Batch ${bi + 1}`;
    const blm = lm.batches[bi];

    if (!batch.control) {
      errors.push({
        line: blm?.header,
        message: `${batchLabel}: missing Batch Control record`,
        hint: 'Every Batch Header (type 5) must have a matching Batch Control (type 8) at the end. Add a type 8 record after the last entry in this batch with the correct counts, hash, and totals.',
      });
      continue;
    }

    if (batch.header.serviceClassCode !== batch.control.serviceClassCode) {
      errors.push({
        line: blm?.control,
        message: `${batchLabel}: Service Class Code mismatch (header=${batch.header.serviceClassCode}, control=${batch.control.serviceClassCode})`,
        hint: `The Service Class Code in positions 2-4 must be identical in both the Batch Header and Batch Control. Change the control record to match "${batch.header.serviceClassCode}", or update both to the correct value (200=Mixed, 220=Credits Only, 225=Debits Only).`,
      });
    }

    const expectedCount = batch.entries.reduce((s, e) => s + 1 + e.addenda.length, 0);
    const actualCount = parseInt(batch.control.entryAddendaCount, 10);
    if (actualCount !== expectedCount) {
      errors.push({
        line: blm?.control,
        message: `${batchLabel}: Entry/Addenda count mismatch (control says ${actualCount}, counted ${expectedCount})`,
        hint: `Positions 5-10 of the Batch Control must equal the total number of Entry Detail (type 6) and Addenda (type 7) records in this batch. Update it to "${String(expectedCount).padStart(6, '0')}".`,
      });
    }

    const computedHash =
      batch.entries.reduce((s, e) => s + parseInt(e.receivingDfi, 10), 0) % 10_000_000_000;
    const controlHash = parseInt(batch.control.entryHash, 10);
    if (controlHash !== computedHash) {
      errors.push({
        line: blm?.control,
        message: `${batchLabel}: Entry hash mismatch (control says ${controlHash}, computed ${computedHash})`,
        hint: `Positions 11-20 of the Batch Control must equal the sum of all Entry Detail receiving DFI routing numbers (first 8 digits), mod 10^10. The correct value is ${computedHash}. Update the field to "${String(computedHash).padStart(10, '0')}".`,
      });
    }

    let debitTotal = 0;
    let creditTotal = 0;
    for (const entry of batch.entries) {
      if (isDebitTransactionCode(entry.transactionCode)) {
        debitTotal += entry.amount;
      } else {
        creditTotal += entry.amount;
      }
    }
    if (batch.control.totalDebit !== debitTotal) {
      errors.push({
        line: blm?.control,
        message: `${batchLabel}: Debit total mismatch (control says ${formatAmount(batch.control.totalDebit)}, computed ${formatAmount(debitTotal)})`,
        hint: `Positions 21-32 of the Batch Control must equal the sum of all debit entry amounts (transaction codes 27-29, 37-39, 46-48, 55-56) in cents. Update it to "${String(debitTotal).padStart(12, '0')}".`,
      });
    }
    if (batch.control.totalCredit !== creditTotal) {
      errors.push({
        line: blm?.control,
        message: `${batchLabel}: Credit total mismatch (control says ${formatAmount(batch.control.totalCredit)}, computed ${formatAmount(creditTotal)})`,
        hint: `Positions 33-44 of the Batch Control must equal the sum of all credit entry amounts (transaction codes 22-24, 32-34, 41-43, 51-53) in cents. Update it to "${String(creditTotal).padStart(12, '0')}".`,
      });
    }

    const seenTraces = new Map<string, number>();
    for (let ei = 0; ei < batch.entries.length; ei++) {
      const tn = batch.entries[ei].traceNumber.trim();
      if (!tn) continue;
      const prevIdx = seenTraces.get(tn);
      if (prevIdx !== undefined) {
        const entryLine = blm?.entries[ei]?.entry;
        errors.push({
          line: entryLine,
          message: `${batchLabel}: Duplicate trace number ${tn} (entries ${prevIdx + 1} and ${ei + 1})`,
          hint: 'Each Entry Detail within a batch must have a unique trace number (positions 80-94). The trace number is the ODFI routing number (8 digits) followed by a unique ascending sequence number (7 digits). Change the last 7 digits to a unique value.',
        });
      } else {
        seenTraces.set(tn, ei);
      }
    }
  }

  if (file.fileControl) {
    const fc = file.fileControl;
    const fcLine = lm.fileControl;

    const expectedBatches = file.batches.length;
    const actualBatches = parseInt(fc.batchCount, 10);
    if (actualBatches !== expectedBatches) {
      errors.push({
        line: fcLine,
        message: `File Control: Batch count mismatch (control says ${actualBatches}, counted ${expectedBatches})`,
        hint: `Positions 2-7 of the File Control must equal the number of Batch Header/Control pairs in the file. Update it to "${String(expectedBatches).padStart(6, '0')}".`,
      });
    }

    const expectedEntryAddenda = file.batches.reduce(
      (s, b) => s + b.entries.reduce((a, e) => a + 1 + e.addenda.length, 0),
      0,
    );
    const actualEntryAddenda = parseInt(fc.entryAddendaCount, 10);
    if (actualEntryAddenda !== expectedEntryAddenda) {
      errors.push({
        line: fcLine,
        message: `File Control: Entry/Addenda count mismatch (control says ${actualEntryAddenda}, counted ${expectedEntryAddenda})`,
        hint: `Positions 14-21 of the File Control must equal the total number of Entry Detail (type 6) and Addenda (type 7) records across all batches. Update it to "${String(expectedEntryAddenda).padStart(8, '0')}".`,
      });
    }

    const expectedFileHash =
      file.batches.reduce((s, b) => s + (b.control ? parseInt(b.control.entryHash, 10) : 0), 0) %
      10_000_000_000;
    const actualFileHash = parseInt(fc.entryHash, 10);
    if (actualFileHash !== expectedFileHash) {
      errors.push({
        line: fcLine,
        message: `File Control: Entry hash mismatch (control says ${actualFileHash}, computed ${expectedFileHash})`,
        hint: `Positions 22-31 of the File Control must equal the sum of all Batch Control entry hash values, mod 10^10. Update it to "${String(expectedFileHash).padStart(10, '0')}".`,
      });
    }

    const expectedDebit = file.batches.reduce((s, b) => s + (b.control?.totalDebit ?? 0), 0);
    if (fc.totalDebit !== expectedDebit) {
      errors.push({
        line: fcLine,
        message: `File Control: Total debit mismatch (control says ${formatAmount(fc.totalDebit)}, batches sum to ${formatAmount(expectedDebit)})`,
        hint: `Positions 32-43 of the File Control must equal the sum of all Batch Control total debit fields. Update it to "${String(expectedDebit).padStart(12, '0')}".`,
      });
    }

    const expectedCredit = file.batches.reduce((s, b) => s + (b.control?.totalCredit ?? 0), 0);
    if (fc.totalCredit !== expectedCredit) {
      errors.push({
        line: fcLine,
        message: `File Control: Total credit mismatch (control says ${formatAmount(fc.totalCredit)}, batches sum to ${formatAmount(expectedCredit)})`,
        hint: `Positions 44-55 of the File Control must equal the sum of all Batch Control total credit fields. Update it to "${String(expectedCredit).padStart(12, '0')}".`,
      });
    }
  }

  return errors;
}

// ── Generator ──────────────────────────────────────────────────────

function padRight(s: string, len: number): string {
  return s.slice(0, len).padEnd(len, ' ');
}

function padLeft(s: string, len: number, ch = '0'): string {
  return s.slice(0, len).padStart(len, ch);
}

function numStr(n: number, len: number): string {
  return String(n).slice(0, len).padStart(len, '0');
}

export function generateFileHeader(h: FileHeader): string {
  return (
    '1' +
    padLeft(h.priorityCode || '01', 2) +
    padRight(' ' + h.immediateDestination, 10) +
    padRight(' ' + h.immediateOrigin, 10) +
    padLeft(h.fileCreationDate, 6) +
    padRight(h.fileCreationTime || '', 4) +
    padRight(h.fileIdModifier || 'A', 1) +
    '094' +
    '10' +
    '1' +
    padRight(h.destinationName || '', 23) +
    padRight(h.originName || '', 23) +
    padRight(h.referenceCode || '', 8)
  );
}

export function generateBatchHeader(h: BatchHeader): string {
  return (
    '5' +
    padLeft(h.serviceClassCode, 3) +
    padRight(h.companyName, 16) +
    padRight(h.companyDiscretionaryData || '', 20) +
    padRight(h.companyIdentification, 10) +
    padRight(h.secCode, 3) +
    padRight(h.companyEntryDescription, 10) +
    padRight(h.companyDescriptiveDate || '', 6) +
    padLeft(h.effectiveEntryDate || '', 6) +
    padRight(h.settlementDate || '', 3) +
    padRight(h.originatorStatusCode || '1', 1) +
    padLeft(h.originatingDfi, 8) +
    padLeft(h.batchNumber, 7)
  );
}

export function generateEntryDetail(e: EntryDetail): string {
  return (
    '6' +
    padLeft(e.transactionCode, 2) +
    padLeft(e.receivingDfi, 8) +
    padLeft(e.checkDigit, 1) +
    padRight(e.dfiAccountNumber, 17) +
    numStr(e.amount, 10) +
    padRight(e.identificationNumber || '', 15) +
    padRight(e.receiverName, 22) +
    padRight(e.discretionaryData || '', 2) +
    padLeft(e.addendaIndicator || '0', 1) +
    padLeft(e.traceNumber, 15)
  );
}

export function generateAddenda(a: AddendaRecord): string {
  return (
    '7' +
    padLeft(a.addendaTypeCode || '05', 2) +
    padRight(a.paymentRelatedInfo || '', 80) +
    padLeft(a.addendaSequenceNumber || '1', 4) +
    padLeft(a.entryDetailSequenceNumber, 7)
  );
}

export function generateBatchControl(c: BatchControl): string {
  return (
    '8' +
    padLeft(c.serviceClassCode, 3) +
    padLeft(c.entryAddendaCount, 6) +
    padLeft(c.entryHash, 10) +
    numStr(c.totalDebit, 12) +
    numStr(c.totalCredit, 12) +
    padRight(c.companyIdentification, 10) +
    padRight(c.messageAuthCode || '', 19) +
    padRight('', 6) +
    padLeft(c.originatingDfi, 8) +
    padLeft(c.batchNumber, 7)
  );
}

export function generateFileControl(fc: FileControl): string {
  return (
    '9' +
    padLeft(fc.batchCount, 6) +
    padLeft(fc.blockCount, 6) +
    padLeft(fc.entryAddendaCount, 8) +
    padLeft(fc.entryHash, 10) +
    numStr(fc.totalDebit, 12) +
    numStr(fc.totalCredit, 12) +
    padRight('', 39)
  );
}

export interface GeneratorInput {
  immediateDestination: string;
  immediateOrigin: string;
  destinationName: string;
  originName: string;
  referenceCode?: string;
  batches: GeneratorBatchInput[];
}

export interface GeneratorBatchInput {
  serviceClassCode: string;
  companyName: string;
  companyIdentification: string;
  secCode: string;
  companyEntryDescription: string;
  effectiveEntryDate: string;
  entries: GeneratorEntryInput[];
}

export interface GeneratorEntryInput {
  transactionCode: string;
  routingNumber: string;
  accountNumber: string;
  amount: number;
  receiverName: string;
  identificationNumber?: string;
  addendaInfo?: string;
}

function computeCheckDigit(routing: string): string {
  const r = routing.slice(0, 8).padStart(8, '0');
  const weights = [3, 7, 1, 3, 7, 1, 3, 7];
  const sum = weights.reduce((s, w, i) => s + w * parseInt(r[i], 10), 0);
  return String((10 - (sum % 10)) % 10);
}

export function generateNachaFile(input: GeneratorInput): string {
  const now = new Date();
  const yymmdd =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const hhmm = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');

  const fileHeader = generateFileHeader({
    recordType: '1',
    priorityCode: '01',
    immediateDestination: input.immediateDestination,
    immediateOrigin: input.immediateOrigin,
    fileCreationDate: yymmdd,
    fileCreationTime: hhmm,
    fileIdModifier: 'A',
    recordSize: '094',
    blockingFactor: '10',
    formatCode: '1',
    destinationName: input.destinationName,
    originName: input.originName,
    referenceCode: input.referenceCode || '',
  });

  const lines: string[] = [fileHeader];
  let totalEntryAddenda = 0;
  let totalFileDebit = 0;
  let totalFileCredit = 0;
  let fileEntryHash = 0;

  for (let bi = 0; bi < input.batches.length; bi++) {
    const batch = input.batches[bi];
    const batchNum = String(bi + 1);

    lines.push(
      generateBatchHeader({
        recordType: '5',
        serviceClassCode: batch.serviceClassCode,
        companyName: batch.companyName,
        companyDiscretionaryData: '',
        companyIdentification: batch.companyIdentification,
        secCode: batch.secCode,
        companyEntryDescription: batch.companyEntryDescription,
        companyDescriptiveDate: '',
        effectiveEntryDate: batch.effectiveEntryDate,
        settlementDate: '',
        originatorStatusCode: '1',
        originatingDfi: input.immediateOrigin.replace(/\D/g, '').slice(0, 8),
        batchNumber: batchNum,
      }),
    );

    let batchEntryAddenda = 0;
    let batchDebit = 0;
    let batchCredit = 0;
    let batchHash = 0;

    for (let ei = 0; ei < batch.entries.length; ei++) {
      const entry = batch.entries[ei];
      const routing = entry.routingNumber.replace(/\D/g, '').slice(0, 9);
      const rDfi = routing.slice(0, 8);
      const checkDig = routing.length >= 9 ? routing[8] : computeCheckDigit(routing);
      const hasAddenda = !!entry.addendaInfo;
      const traceNum =
        input.immediateOrigin.replace(/\D/g, '').slice(0, 8) + padLeft(String(ei + 1), 7);

      lines.push(
        generateEntryDetail({
          recordType: '6',
          transactionCode: entry.transactionCode,
          receivingDfi: rDfi,
          checkDigit: checkDig,
          dfiAccountNumber: entry.accountNumber,
          amount: entry.amount,
          identificationNumber: entry.identificationNumber || '',
          receiverName: entry.receiverName,
          discretionaryData: '',
          addendaIndicator: hasAddenda ? '1' : '0',
          traceNumber: traceNum,
          addenda: [],
        }),
      );
      batchEntryAddenda++;

      if (hasAddenda) {
        lines.push(
          generateAddenda({
            recordType: '7',
            addendaTypeCode: '05',
            paymentRelatedInfo: entry.addendaInfo!,
            addendaSequenceNumber: '0001',
            entryDetailSequenceNumber: padLeft(String(ei + 1), 7),
          }),
        );
        batchEntryAddenda++;
      }

      if (isDebitTransactionCode(entry.transactionCode)) {
        batchDebit += entry.amount;
      } else {
        batchCredit += entry.amount;
      }
      batchHash += parseInt(rDfi, 10);
    }

    const truncatedHash = batchHash % 10_000_000_000;

    lines.push(
      generateBatchControl({
        recordType: '8',
        serviceClassCode: batch.serviceClassCode,
        entryAddendaCount: String(batchEntryAddenda),
        entryHash: String(truncatedHash),
        totalDebit: batchDebit,
        totalCredit: batchCredit,
        companyIdentification: batch.companyIdentification,
        messageAuthCode: '',
        reserved: '',
        originatingDfi: input.immediateOrigin.replace(/\D/g, '').slice(0, 8),
        batchNumber: batchNum,
      }),
    );

    totalEntryAddenda += batchEntryAddenda;
    totalFileDebit += batchDebit;
    totalFileCredit += batchCredit;
    fileEntryHash += truncatedHash;
  }

  const fileEntryHashTrunc = fileEntryHash % 10_000_000_000;
  const lineCountSoFar = lines.length + 1; // +1 for file control
  const blockCount = Math.ceil(lineCountSoFar / 10);
  const totalLinesNeeded = blockCount * 10;
  const paddingNeeded = totalLinesNeeded - lineCountSoFar;

  lines.push(
    generateFileControl({
      recordType: '9',
      batchCount: String(input.batches.length),
      blockCount: String(blockCount),
      entryAddendaCount: String(totalEntryAddenda),
      entryHash: String(fileEntryHashTrunc),
      totalDebit: totalFileDebit,
      totalCredit: totalFileCredit,
      reserved: '',
    }),
  );

  for (let p = 0; p < paddingNeeded; p++) {
    lines.push('9'.repeat(RECORD_LINE_LENGTH));
  }

  return lines.join('\n');
}

// ── Sample NACHA file for demo purposes ────────────────────────────

export const SAMPLE_NACHA = [
  '101 076401251 0764012511602150800A094101DEST BANK NAME         ORIGIN BANK NAME',
  '5200ACME CORP                           1234567890PPDPAYROLL         160215   1076401250000001',
  '62207640125100012345678      0000100000               JOHN DOE                0076401250000001',
  '62207640125100098765432      0000200000               JANE SMITH              0076401250000002',
  '820000000200152802500000000000000000003000001234567890                         076401250000001',
  '5220ACME CORP                           1234567890CCDVENDOR PAY      160215   1076401250000002',
  '62209101298100011223344      0000050000               SUPPLIER INC            1076401250000001',
  '705INVOICE 12345 PAYMENT FOR SERVICES RENDERED                                     00010000001',
  '822000000200091012980000000000000000000500001234567890                         076401250000002',
  '9000002000001000000040024381548000000000000000000350000',
]
  .map((l) => l.padEnd(RECORD_LINE_LENGTH))
  .join('\n');
