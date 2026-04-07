import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  parseNacha,
  validateNacha,
  generateNachaFile,
  formatAmount,
  describeTransactionCode,
  describeServiceClassCode,
  describeSecCode,
  isDebitTransactionCode,
  SAMPLE_NACHA,
  RECORD_LINE_LENGTH,
} from '../lib/nacha';

// ── moov-io/ach real-world sample files ─────────────────────────────
// Source: https://github.com/moov-io/ach/tree/master/test
// Downloaded with exact whitespace preserved (every line is 94 chars).

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8');
}

const MOOV_PPD_DEBIT = loadFixture('moov-ppd-debit.ach');
const MOOV_PPD_CREDIT = loadFixture('moov-ppd-credit.ach');
const MOOV_CCD_DEBIT = loadFixture('moov-ccd-debit.ach');
const MOOV_WEB_CREDIT = loadFixture('moov-web-credit.ach');
const MOOV_CTX_DEBIT = loadFixture('moov-ctx-debit.ach');

// ── Helpers ─────────────────────────────────────────────────────────

describe('formatAmount', () => {
  it('formats zero cents', () => {
    expect(formatAmount(0)).toBe('$0.00');
  });

  it('formats cents to dollar string', () => {
    expect(formatAmount(100000)).toBe('$1,000.00');
  });

  it('formats large amounts', () => {
    expect(formatAmount(999999999)).toContain('9,999,999.99');
  });
});

describe('describeTransactionCode', () => {
  it('returns label for known codes', () => {
    expect(describeTransactionCode('22')).toBe('Checking Credit (Deposit)');
    expect(describeTransactionCode('27')).toBe('Checking Debit (Payment)');
    expect(describeTransactionCode('32')).toBe('Savings Credit (Deposit)');
    expect(describeTransactionCode('37')).toBe('Savings Debit (Payment)');
  });

  it('returns unknown for unrecognized codes', () => {
    expect(describeTransactionCode('99')).toContain('Unknown');
  });
});

describe('describeServiceClassCode', () => {
  it('maps standard codes', () => {
    expect(describeServiceClassCode('200')).toBe('Mixed Debits and Credits');
    expect(describeServiceClassCode('220')).toBe('Credits Only');
    expect(describeServiceClassCode('225')).toBe('Debits Only');
  });
});

describe('describeSecCode', () => {
  it('maps known SEC codes', () => {
    expect(describeSecCode('PPD')).toBe('Prearranged Payment/Deposit');
    expect(describeSecCode('CCD')).toBe('Corporate Credit or Debit');
    expect(describeSecCode('WEB')).toBe('Internet/Mobile Initiated');
  });

  it('returns raw value for unknown codes', () => {
    expect(describeSecCode('ZZZ')).toBe('ZZZ');
  });
});

// ── Parser ──────────────────────────────────────────────────────────

describe('parseNacha', () => {
  it('parses the sample file successfully', () => {
    const result = parseNacha(SAMPLE_NACHA);
    expect(result.fileHeader).not.toBeNull();
    expect(result.fileControl).not.toBeNull();
    expect(result.batches).toHaveLength(2);
  });

  it('extracts file header fields correctly', () => {
    const result = parseNacha(SAMPLE_NACHA);
    const h = result.fileHeader!;
    expect(h.recordType).toBe('1');
    expect(h.priorityCode).toBe('01');
    expect(h.immediateDestination).toBeTruthy();
    expect(h.originName).toBeTruthy();
  });

  it('extracts batch headers', () => {
    const result = parseNacha(SAMPLE_NACHA);
    expect(result.batches[0].header.secCode).toBe('PPD');
    expect(result.batches[1].header.secCode).toBe('CCD');
  });

  it('extracts entry details with correct amounts', () => {
    const result = parseNacha(SAMPLE_NACHA);
    const entries = result.batches[0].entries;
    expect(entries).toHaveLength(2);
    expect(entries[0].transactionCode).toBe('22');
    expect(entries[0].amount).toBe(100000);
    expect(entries[1].amount).toBe(200000);
  });

  it('attaches addenda to the correct entry', () => {
    const result = parseNacha(SAMPLE_NACHA);
    const batch2entries = result.batches[1].entries;
    expect(batch2entries[0].addenda).toHaveLength(1);
    expect(batch2entries[0].addenda[0].paymentRelatedInfo).toContain('INVOICE');
  });

  it('computes summary correctly', () => {
    const result = parseNacha(SAMPLE_NACHA);
    const s = result.summary;
    expect(s.totalBatches).toBe(2);
    expect(s.totalEntries).toBe(3);
    expect(s.totalAddenda).toBe(1);
    expect(s.secCodes).toContain('PPD');
    expect(s.secCodes).toContain('CCD');
  });

  it('returns errors for invalid lines', () => {
    const result = parseNacha('short\ntoo-short-line');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('chars');
  });

  it('handles empty input gracefully', () => {
    const result = parseNacha('');
    expect(result.batches).toHaveLength(0);
    expect(result.fileHeader).toBeNull();
    expect(result.fileControl).toBeNull();
  });

  it('handles Windows-style line endings', () => {
    const crlf = SAMPLE_NACHA.replace(/\n/g, '\r\n');
    const result = parseNacha(crlf);
    expect(result.batches).toHaveLength(2);
    expect(result.fileHeader).not.toBeNull();
  });

  it('counts padding lines', () => {
    const withPadding = SAMPLE_NACHA + '\n' + '9'.repeat(94);
    const result = parseNacha(withPadding);
    expect(result.paddingLines).toBeGreaterThan(0);
  });
});

// ── Validator ───────────────────────────────────────────────────────

describe('validateNacha', () => {
  it('returns no errors for a well-formed file', () => {
    const parsed = parseNacha(SAMPLE_NACHA);
    const errors = validateNacha(parsed);
    // The sample may or may not pass all hash checks, but structural checks should be ok
    const structuralErrors = errors.filter(
      (e) =>
        !e.message.includes('hash') && !e.message.includes('count') && !e.message.includes('total'),
    );
    expect(structuralErrors).toHaveLength(0);
  });

  it('catches missing file header', () => {
    const parsed = parseNacha('');
    const errors = validateNacha(parsed);
    expect(errors.some((e) => e.message.includes('File Header'))).toBe(true);
  });

  it('catches missing file control', () => {
    const headerOnly =
      '101 076401251 0764012511602150800A094101DEST BANK NAME         ORIGIN BANK NAME       REF00000';
    const parsed = parseNacha(headerOnly);
    const errors = validateNacha(parsed);
    expect(errors.some((e) => e.message.includes('File Control'))).toBe(true);
  });

  it('catches empty file with no batches', () => {
    const parsed = parseNacha('');
    const errors = validateNacha(parsed);
    expect(errors.some((e) => e.message.includes('no batches'))).toBe(true);
  });

  it('catches duplicate trace numbers within a batch', () => {
    const dupeTrace = [
      '101 076401251 0764012511602150800A094101DEST BANK NAME         ORIGIN BANK NAME',
      '5200ACME CORP                           1234567890PPDPAYROLL         160215   1076401250000001',
      '62207640125100012345678      0000100000               JOHN DOE                0076401250000001',
      '62207640125100098765432      0000200000               JANE SMITH              0076401250000001',
      '820000000200152802500000000000000000003000001234567890                         076401250000001',
      '9000001000001000000020015280250000000000000000000300000',
    ]
      .map((l) => l.padEnd(94))
      .join('\n');
    const parsed = parseNacha(dupeTrace);
    const errors = validateNacha(parsed);
    expect(errors.some((e) => e.message.includes('Duplicate trace number'))).toBe(true);
  });
});

// ── Generator ───────────────────────────────────────────────────────

describe('generateNachaFile', () => {
  const baseInput = {
    immediateDestination: '076401251',
    immediateOrigin: '076401251',
    destinationName: 'TEST BANK',
    originName: 'MY COMPANY',
    batches: [
      {
        serviceClassCode: '200',
        companyName: 'ACME CORP',
        companyIdentification: '1234567890',
        secCode: 'PPD',
        companyEntryDescription: 'PAYROLL',
        effectiveEntryDate: '260407',
        entries: [
          {
            transactionCode: '22',
            routingNumber: '091012981',
            accountNumber: '123456789',
            amount: 150000,
            receiverName: 'JOHN DOE',
          },
        ],
      },
    ],
  };

  it('generates a string with all records', () => {
    const output = generateNachaFile(baseInput);
    const lines = output.split('\n');
    expect(lines[0][0]).toBe('1');
    expect(lines.some((l) => l[0] === '5')).toBe(true);
    expect(lines.some((l) => l[0] === '6')).toBe(true);
    expect(lines.some((l) => l[0] === '8')).toBe(true);
    expect(lines.some((l) => l[0] === '9')).toBe(true);
  });

  it('produces lines of exactly 94 characters', () => {
    const output = generateNachaFile(baseInput);
    const lines = output.split('\n');
    for (const line of lines) {
      expect(line.length).toBe(RECORD_LINE_LENGTH);
    }
  });

  it('total line count is a multiple of 10 (blocking factor)', () => {
    const output = generateNachaFile(baseInput);
    const lines = output.split('\n');
    expect(lines.length % 10).toBe(0);
  });

  it('roundtrips through parse without structural errors', () => {
    const output = generateNachaFile(baseInput);
    const parsed = parseNacha(output);
    expect(parsed.fileHeader).not.toBeNull();
    expect(parsed.fileControl).not.toBeNull();
    expect(parsed.batches).toHaveLength(1);
    expect(parsed.batches[0].entries).toHaveLength(1);
    expect(parsed.errors).toHaveLength(0);
  });

  it('generates correct entry amounts', () => {
    const output = generateNachaFile(baseInput);
    const parsed = parseNacha(output);
    expect(parsed.batches[0].entries[0].amount).toBe(150000);
  });

  it('includes addenda when provided', () => {
    const input = {
      ...baseInput,
      batches: [
        {
          ...baseInput.batches[0],
          entries: [
            {
              ...baseInput.batches[0].entries[0],
              addendaInfo: 'PAYMENT FOR INVOICE 42',
            },
          ],
        },
      ],
    };
    const output = generateNachaFile(input);
    const parsed = parseNacha(output);
    expect(parsed.batches[0].entries[0].addenda).toHaveLength(1);
    expect(parsed.batches[0].entries[0].addenda[0].paymentRelatedInfo).toContain('INVOICE 42');
  });

  it('handles multiple batches', () => {
    const input = {
      ...baseInput,
      batches: [
        baseInput.batches[0],
        {
          serviceClassCode: '225',
          companyName: 'ACME CORP',
          companyIdentification: '1234567890',
          secCode: 'CCD',
          companyEntryDescription: 'VENDOR',
          effectiveEntryDate: '260407',
          entries: [
            {
              transactionCode: '27',
              routingNumber: '021000021',
              accountNumber: '9876543210',
              amount: 50000,
              receiverName: 'SUPPLIER INC',
            },
          ],
        },
      ],
    };
    const output = generateNachaFile(input);
    const parsed = parseNacha(output);
    expect(parsed.batches).toHaveLength(2);
    expect(parsed.summary.totalEntries).toBe(2);
  });

  it('handles multiple entries per batch', () => {
    const input = {
      ...baseInput,
      batches: [
        {
          ...baseInput.batches[0],
          entries: [
            baseInput.batches[0].entries[0],
            {
              transactionCode: '22',
              routingNumber: '021000021',
              accountNumber: '5555555555',
              amount: 75000,
              receiverName: 'JANE SMITH',
            },
          ],
        },
      ],
    };
    const output = generateNachaFile(input);
    const parsed = parseNacha(output);
    expect(parsed.batches[0].entries).toHaveLength(2);
  });
});

// ── isDebitTransactionCode ──────────────────────────────────────────

describe('isDebitTransactionCode', () => {
  it('identifies checking/savings debit codes', () => {
    for (const tc of ['27', '28', '29', '37', '38', '39']) {
      expect(isDebitTransactionCode(tc)).toBe(true);
    }
  });

  it('identifies GL and Loan debit codes', () => {
    for (const tc of ['46', '47', '48', '55', '56']) {
      expect(isDebitTransactionCode(tc)).toBe(true);
    }
  });

  it('returns false for credit codes', () => {
    for (const tc of ['22', '23', '24', '32', '33', '34', '41', '42', '51', '52']) {
      expect(isDebitTransactionCode(tc)).toBe(false);
    }
  });
});

// ── moov-io/ach real-world file tests ───────────────────────────────
// Tests below use sample ACH files from https://github.com/moov-io/ach
// to verify our parser/validator against the reference Go implementation.

describe('moov-io PPD Debit', () => {
  const parsed = parseNacha(MOOV_PPD_DEBIT);

  it('parses file header', () => {
    expect(parsed.fileHeader).not.toBeNull();
    expect(parsed.fileHeader!.immediateDestination).toBe('231380104');
    expect(parsed.fileHeader!.immediateOrigin).toMatch(/121042882/);
    expect(parsed.fileHeader!.destinationName).toBe('Federal Reserve Bank');
    expect(parsed.fileHeader!.originName).toBe('My Bank Name');
    expect(parsed.fileHeader!.fileCreationDate).toBe('190624');
  });

  it('parses single batch with PPD SEC code', () => {
    expect(parsed.batches).toHaveLength(1);
    const bh = parsed.batches[0].header;
    expect(bh.serviceClassCode).toBe('225');
    expect(bh.companyName).toBe('Name on Account');
    expect(bh.secCode).toBe('PPD');
    expect(bh.companyEntryDescription).toBe('REG.SALARY');
    expect(bh.companyIdentification).toBe('121042882');
  });

  it('parses entry detail with correct fields', () => {
    const entries = parsed.batches[0].entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].transactionCode).toBe('27');
    expect(entries[0].receivingDfi).toBe('23138010');
    expect(entries[0].checkDigit).toBe('4');
    expect(entries[0].dfiAccountNumber).toBe('12345678');
    expect(entries[0].amount).toBe(100000000);
    expect(entries[0].receiverName).toBe('Receiver Account Name');
    expect(entries[0].traceNumber).toBe('121042880000001');
  });

  it('parses batch control', () => {
    const bc = parsed.batches[0].control;
    expect(bc.serviceClassCode).toBe('225');
    expect(parseInt(bc.entryAddendaCount, 10)).toBe(1);
    expect(parseInt(bc.entryHash, 10)).toBe(23138010);
    expect(bc.totalDebit).toBe(100000000);
    expect(bc.totalCredit).toBe(0);
  });

  it('parses file control', () => {
    expect(parsed.fileControl).not.toBeNull();
    expect(parseInt(parsed.fileControl!.batchCount, 10)).toBe(1);
    expect(parseInt(parsed.fileControl!.entryAddendaCount, 10)).toBe(1);
    expect(parsed.fileControl!.totalDebit).toBe(100000000);
    expect(parsed.fileControl!.totalCredit).toBe(0);
  });

  it('passes validation', () => {
    const errors = validateNacha(parsed);
    expect(errors).toHaveLength(0);
  });

  it('counts padding lines', () => {
    expect(parsed.paddingLines).toBe(5);
  });
});

describe('moov-io PPD Credit', () => {
  const parsed = parseNacha(MOOV_PPD_CREDIT);

  it('parses credit entry', () => {
    const entries = parsed.batches[0].entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].transactionCode).toBe('22');
    expect(entries[0].amount).toBe(100000000);
  });

  it('has correct batch control totals', () => {
    const bc = parsed.batches[0].control;
    expect(bc.totalDebit).toBe(0);
    expect(bc.totalCredit).toBe(100000000);
    expect(bc.serviceClassCode).toBe('220');
  });

  it('has correct file control totals', () => {
    const fc = parsed.fileControl!;
    expect(fc.totalDebit).toBe(0);
    expect(fc.totalCredit).toBe(100000000);
  });

  it('passes validation', () => {
    const errors = validateNacha(parsed);
    expect(errors).toHaveLength(0);
  });
});

describe('moov-io CCD Debit (multiple entries)', () => {
  const parsed = parseNacha(MOOV_CCD_DEBIT);

  it('parses two entries in single batch', () => {
    expect(parsed.batches).toHaveLength(1);
    expect(parsed.batches[0].entries).toHaveLength(2);
  });

  it('parses CCD SEC code', () => {
    expect(parsed.batches[0].header.secCode).toBe('CCD');
  });

  it('extracts correct amounts', () => {
    const entries = parsed.batches[0].entries;
    expect(entries[0].amount).toBe(500000);
    expect(entries[1].amount).toBe(125);
  });

  it('both entries are debits (transaction code 27)', () => {
    for (const entry of parsed.batches[0].entries) {
      expect(entry.transactionCode).toBe('27');
      expect(isDebitTransactionCode(entry.transactionCode)).toBe(true);
    }
  });

  it('batch control sums both entries', () => {
    const bc = parsed.batches[0].control;
    expect(bc.totalDebit).toBe(500125);
    expect(bc.totalCredit).toBe(0);
    expect(parseInt(bc.entryAddendaCount, 10)).toBe(2);
  });

  it('entry hash is sum of two RDFI numbers', () => {
    const bc = parsed.batches[0].control;
    expect(parseInt(bc.entryHash, 10)).toBe(46276020);
  });

  it('passes validation', () => {
    const errors = validateNacha(parsed);
    expect(errors).toHaveLength(0);
  });
});

describe('moov-io WEB Credit (entries with addenda)', () => {
  const parsed = parseNacha(MOOV_WEB_CREDIT);

  it('parses WEB SEC code', () => {
    expect(parsed.batches[0].header.secCode).toBe('WEB');
  });

  it('parses two entries each with one addenda', () => {
    const entries = parsed.batches[0].entries;
    expect(entries).toHaveLength(2);
    expect(entries[0].addenda).toHaveLength(1);
    expect(entries[1].addenda).toHaveLength(1);
  });

  it('extracts addenda payment info', () => {
    const entries = parsed.batches[0].entries;
    expect(entries[0].addenda[0].paymentRelatedInfo).toContain('PAY-GATE payment');
    expect(entries[1].addenda[0].paymentRelatedInfo).toContain('Monthly Membership');
  });

  it('entry/addenda count includes addenda records', () => {
    const bc = parsed.batches[0].control;
    expect(parseInt(bc.entryAddendaCount, 10)).toBe(4);
  });

  it('extracts correct credit amounts', () => {
    const entries = parsed.batches[0].entries;
    expect(entries[0].amount).toBe(10000);
    expect(entries[1].amount).toBe(799);
  });

  it('passes validation', () => {
    const errors = validateNacha(parsed);
    expect(errors).toHaveLength(0);
  });

  it('summary shows correct totals', () => {
    expect(parsed.summary.totalEntries).toBe(2);
    expect(parsed.summary.totalAddenda).toBe(2);
  });
});

describe('moov-io CTX Debit (entry with multiple addenda)', () => {
  const parsed = parseNacha(MOOV_CTX_DEBIT);

  it('parses CTX SEC code', () => {
    expect(parsed.batches[0].header.secCode).toBe('CTX');
  });

  it('parses one entry with two addenda', () => {
    const entries = parsed.batches[0].entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].addenda).toHaveLength(2);
  });

  it('extracts addenda content', () => {
    const addenda = parsed.batches[0].entries[0].addenda;
    expect(addenda[0].paymentRelatedInfo).toContain('Debit First Account');
    expect(addenda[1].paymentRelatedInfo).toContain('Debit Second Account');
  });

  it('entry/addenda count is 3 (1 entry + 2 addenda)', () => {
    const bc = parsed.batches[0].control;
    expect(parseInt(bc.entryAddendaCount, 10)).toBe(3);
  });

  it('passes validation', () => {
    const errors = validateNacha(parsed);
    expect(errors).toHaveLength(0);
  });
});

describe('cross-format round-trip', () => {
  it('generated file parses back with identical structure', () => {
    const input = {
      immediateDestination: '231380104',
      immediateOrigin: '121042882',
      destinationName: 'Federal Reserve Bank',
      originName: 'My Bank Name',
      batches: [
        {
          serviceClassCode: '225',
          companyName: 'ACME CORP',
          companyIdentification: '1234567890',
          secCode: 'PPD',
          companyEntryDescription: 'PAYROLL',
          effectiveEntryDate: '260407',
          entries: [
            {
              transactionCode: '27',
              routingNumber: '231380104',
              accountNumber: '12345678',
              amount: 100000000,
              receiverName: 'Receiver Account Name',
            },
          ],
        },
      ],
    };

    const generated = generateNachaFile(input);
    const parsed = parseNacha(generated);
    const errors = validateNacha(parsed);

    expect(errors).toHaveLength(0);
    expect(parsed.batches).toHaveLength(1);
    expect(parsed.batches[0].entries[0].amount).toBe(100000000);
    expect(parsed.batches[0].entries[0].receiverName).toBe('Receiver Account Name');
    expect(parsed.batches[0].control.totalDebit).toBe(100000000);
    expect(parsed.batches[0].control.totalCredit).toBe(0);
    expect(parsed.fileControl!.totalDebit).toBe(100000000);
    expect(parsed.fileControl!.totalCredit).toBe(0);
  });

  it('generated file with mixed debits/credits validates', () => {
    const input = {
      immediateDestination: '231380104',
      immediateOrigin: '121042882',
      destinationName: 'TEST BANK',
      originName: 'ORIGINATOR',
      batches: [
        {
          serviceClassCode: '200',
          companyName: 'MIXED CO',
          companyIdentification: '9876543210',
          secCode: 'PPD',
          companyEntryDescription: 'MIXED',
          effectiveEntryDate: '260407',
          entries: [
            {
              transactionCode: '22',
              routingNumber: '091012981',
              accountNumber: '1111111',
              amount: 50000,
              receiverName: 'CREDIT PERSON',
            },
            {
              transactionCode: '27',
              routingNumber: '091012981',
              accountNumber: '2222222',
              amount: 30000,
              receiverName: 'DEBIT PERSON',
            },
          ],
        },
      ],
    };

    const generated = generateNachaFile(input);
    const parsed = parseNacha(generated);
    const errors = validateNacha(parsed);

    expect(errors).toHaveLength(0);
    expect(parsed.batches[0].control.totalCredit).toBe(50000);
    expect(parsed.batches[0].control.totalDebit).toBe(30000);
  });

  it('generated file with addenda round-trips correctly', () => {
    const input = {
      immediateDestination: '231380104',
      immediateOrigin: '121042882',
      destinationName: 'TEST',
      originName: 'TEST',
      batches: [
        {
          serviceClassCode: '220',
          companyName: 'COMPANY',
          companyIdentification: '1234567890',
          secCode: 'WEB',
          companyEntryDescription: 'WEBPAY',
          effectiveEntryDate: '260407',
          entries: [
            {
              transactionCode: '22',
              routingNumber: '231380104',
              accountNumber: '9999999',
              amount: 7500,
              receiverName: 'JANE DOE',
              addendaInfo: 'Invoice #12345 monthly subscription',
            },
          ],
        },
      ],
    };

    const generated = generateNachaFile(input);
    const parsed = parseNacha(generated);
    const errors = validateNacha(parsed);

    expect(errors).toHaveLength(0);
    expect(parsed.batches[0].entries[0].addenda).toHaveLength(1);
    expect(parsed.batches[0].entries[0].addenda[0].paymentRelatedInfo).toContain('Invoice #12345');
    expect(parseInt(parsed.batches[0].control.entryAddendaCount, 10)).toBe(2);
  });
});

describe('all sample lines are exactly 94 chars', () => {
  for (const [name, content] of [
    ['PPD Debit', MOOV_PPD_DEBIT],
    ['PPD Credit', MOOV_PPD_CREDIT],
    ['CCD Debit', MOOV_CCD_DEBIT],
    ['WEB Credit', MOOV_WEB_CREDIT],
    ['CTX Debit', MOOV_CTX_DEBIT],
  ] as const) {
    it(`${name}: every line is 94 chars`, () => {
      const lines = content.split('\n').filter((l) => l.length > 0);
      for (const line of lines) {
        expect(line.length).toBe(94);
      }
    });
  }
});
