export interface FieldDef {
  name: string;
  description: string;
  type: string;
  maxLength: number;
}

export interface BitmapResult {
  primary: boolean[];
  secondary?: boolean[];
  error?: string;
}

export interface ActiveField {
  bit: number;
  name: string;
  description: string;
  type: string;
  maxLength: number;
}

export const ISO8583_FIELDS: Record<number, FieldDef> = {
  1: {
    name: 'Secondary Bitmap',
    description: 'Indicates a secondary bitmap follows, enabling bits 65–128.',
    type: 'b',
    maxLength: 8,
  },
  2: {
    name: 'Primary Account Number (PAN)',
    description: 'The payment card account number (up to 19 digits).',
    type: 'n',
    maxLength: 19,
  },
  3: {
    name: 'Processing Code',
    description:
      'Identifies the type of transaction and the accounts affected (e.g., 00 = Purchase).',
    type: 'n',
    maxLength: 6,
  },
  4: {
    name: 'Amount, Transaction',
    description: 'The transaction amount in the smallest currency unit (e.g., cents).',
    type: 'n',
    maxLength: 12,
  },
  5: {
    name: 'Amount, Settlement',
    description: 'The amount in the settlement currency.',
    type: 'n',
    maxLength: 12,
  },
  6: {
    name: 'Amount, Cardholder Billing',
    description: 'The amount in the cardholder billing currency.',
    type: 'n',
    maxLength: 12,
  },
  7: {
    name: 'Transmission Date & Time',
    description: 'Date and time of message transmission (MMDDhhmmss).',
    type: 'n',
    maxLength: 10,
  },
  8: {
    name: 'Amount, Cardholder Billing Fee',
    description: 'The fee charged to the cardholder.',
    type: 'n',
    maxLength: 8,
  },
  9: {
    name: 'Conversion Rate, Settlement',
    description: 'Exchange rate used to convert transaction amount to settlement amount.',
    type: 'n',
    maxLength: 8,
  },
  10: {
    name: 'Conversion Rate, Cardholder Billing',
    description: 'Exchange rate used to convert transaction amount to cardholder billing amount.',
    type: 'n',
    maxLength: 8,
  },
  11: {
    name: 'Systems Trace Audit Number (STAN)',
    description: 'Unique number assigned by the originator to identify each transaction.',
    type: 'n',
    maxLength: 6,
  },
  12: {
    name: 'Local Transaction Time',
    description: 'Local time when the transaction took place (HHMMSS).',
    type: 'n',
    maxLength: 6,
  },
  13: {
    name: 'Local Transaction Date',
    description: 'Local date when the transaction took place (MMDD).',
    type: 'n',
    maxLength: 4,
  },
  14: {
    name: 'Expiration Date',
    description: 'Card expiration date in YYMM format.',
    type: 'n',
    maxLength: 4,
  },
  15: {
    name: 'Settlement Date',
    description: 'Date the transaction is to be settled (MMDD).',
    type: 'n',
    maxLength: 4,
  },
  16: {
    name: 'Currency Conversion Date',
    description: 'Date on which the currency conversion rate was applied (MMDD).',
    type: 'n',
    maxLength: 4,
  },
  17: {
    name: 'Capture Date',
    description: 'Date on which the transaction was captured (MMDD).',
    type: 'n',
    maxLength: 4,
  },
  18: {
    name: 'Merchant Category Code (MCC)',
    description: 'Identifies the type of business of the card acceptor (ISO 18245).',
    type: 'n',
    maxLength: 4,
  },
  19: {
    name: 'Acquiring Institution Country Code',
    description: 'ISO 3166 country code of the acquirer.',
    type: 'n',
    maxLength: 3,
  },
  20: {
    name: 'PAN Extended Country Code',
    description: 'Country code associated with the PAN.',
    type: 'n',
    maxLength: 3,
  },
  21: {
    name: 'Forwarding Institution Country Code',
    description: 'ISO 3166 country code of the forwarding institution.',
    type: 'n',
    maxLength: 3,
  },
  22: {
    name: 'Point of Service Entry Mode',
    description: 'How the PAN was entered (e.g., 01 = manual, 05 = chip, 07 = contactless).',
    type: 'n',
    maxLength: 3,
  },
  23: {
    name: 'Application PAN Sequence Number',
    description: 'Sequence number for cards with multiple PANs.',
    type: 'n',
    maxLength: 3,
  },
  24: {
    name: 'Network International Identifier (NII)',
    description: 'Identifies the network and the function of the message (also Function Code).',
    type: 'n',
    maxLength: 3,
  },
  25: {
    name: 'Point of Service Condition Code',
    description: 'Describes conditions at the point of service.',
    type: 'n',
    maxLength: 2,
  },
  26: {
    name: 'Point of Service Capture Code',
    description: 'Indicates how the transaction data was captured.',
    type: 'n',
    maxLength: 2,
  },
  27: {
    name: 'Authorizing ID Response Length',
    description: 'Length of field 38 (Authorization ID Response).',
    type: 'n',
    maxLength: 1,
  },
  28: {
    name: 'Amount, Transaction Fee',
    description: 'Fee associated with the transaction.',
    type: 'x+n',
    maxLength: 9,
  },
  29: {
    name: 'Amount, Settlement Fee',
    description: 'Fee associated with settlement.',
    type: 'x+n',
    maxLength: 9,
  },
  30: {
    name: 'Amount, Transaction Processing Fee',
    description: 'Processing fee for the transaction.',
    type: 'x+n',
    maxLength: 9,
  },
  31: {
    name: 'Amount, Settlement Processing Fee',
    description: 'Processing fee for settlement.',
    type: 'x+n',
    maxLength: 9,
  },
  32: {
    name: 'Acquiring Institution ID Code',
    description: 'Identification code of the acquirer (up to 11 digits).',
    type: 'n',
    maxLength: 11,
  },
  33: {
    name: 'Forwarding Institution ID Code',
    description: 'Identification code of the forwarding institution.',
    type: 'n',
    maxLength: 11,
  },
  34: {
    name: 'Primary Account Number Extended',
    description: 'Extended PAN for cards with more than 19 digits.',
    type: 'ns',
    maxLength: 28,
  },
  35: {
    name: 'Track 2 Data',
    description: 'Data encoded on the magnetic stripe Track 2 (card number, expiry, service code).',
    type: 'z',
    maxLength: 37,
  },
  36: {
    name: 'Track 3 Data',
    description: 'Data encoded on the magnetic stripe Track 3.',
    type: 'z',
    maxLength: 104,
  },
  37: {
    name: 'Retrieval Reference Number',
    description: 'Reference number assigned by the acquirer for transaction retrieval.',
    type: 'an',
    maxLength: 12,
  },
  38: {
    name: 'Authorization Identification Response',
    description: 'Approval code returned by the authorizer.',
    type: 'an',
    maxLength: 6,
  },
  39: {
    name: 'Response Code',
    description: 'Two-character code indicating the outcome (e.g., 00 = Approved, 05 = Declined).',
    type: 'an',
    maxLength: 2,
  },
  40: {
    name: 'Service Restriction Code',
    description: 'Restricts service based on geographic and/or terminal capabilities.',
    type: 'an',
    maxLength: 3,
  },
  41: {
    name: 'Card Acceptor Terminal ID',
    description: '8-character unique identifier of the terminal.',
    type: 'ans',
    maxLength: 8,
  },
  42: {
    name: 'Card Acceptor ID Code',
    description: '15-character identifier of the card acceptor.',
    type: 'ans',
    maxLength: 15,
  },
  43: {
    name: 'Card Acceptor Name/Location',
    description: 'Name and location of the card acceptor (merchant name, city, country).',
    type: 'ans',
    maxLength: 40,
  },
  44: {
    name: 'Additional Response Data',
    description: 'Additional data returned by the authorizer.',
    type: 'an',
    maxLength: 25,
  },
  45: {
    name: 'Track 1 Data',
    description: 'Data encoded on the magnetic stripe Track 1 (name, PAN, expiry).',
    type: 'ans',
    maxLength: 76,
  },
  46: {
    name: 'Additional Data – ISO',
    description: 'Additional data defined by ISO standards.',
    type: 'ans',
    maxLength: 999,
  },
  47: {
    name: 'Additional Data – National',
    description: 'Additional data for national use.',
    type: 'ans',
    maxLength: 999,
  },
  48: {
    name: 'Additional Data – Private',
    description: 'Private/proprietary additional data field.',
    type: 'ans',
    maxLength: 999,
  },
  49: {
    name: 'Currency Code, Transaction',
    description: 'ISO 4217 currency code of the transaction (e.g., 840 = USD, 978 = EUR).',
    type: 'n',
    maxLength: 3,
  },
  50: {
    name: 'Currency Code, Settlement',
    description: 'ISO 4217 currency code used for settlement.',
    type: 'n',
    maxLength: 3,
  },
  51: {
    name: 'Currency Code, Cardholder Billing',
    description: 'ISO 4217 currency code used for cardholder billing.',
    type: 'n',
    maxLength: 3,
  },
  52: {
    name: 'PIN Data',
    description: 'Encrypted personal identification number block.',
    type: 'b',
    maxLength: 8,
  },
  53: {
    name: 'Security Related Control Info',
    description: 'Cryptographic information for transaction security.',
    type: 'n',
    maxLength: 16,
  },
  54: {
    name: 'Additional Amounts',
    description: 'Additional balance and amount information (e.g., available balance).',
    type: 'an',
    maxLength: 120,
  },
  55: {
    name: 'ICC Data (EMV)',
    description: 'Integrated Circuit Card data from EMV chip card transactions.',
    type: 'b',
    maxLength: 999,
  },
  56: {
    name: 'Reserved (ISO) – Message Reason Code',
    description: 'Reserved for ISO use; often used as message reason code.',
    type: 'n',
    maxLength: 4,
  },
  57: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  58: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  59: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  60: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use; often payment service information.',
    type: 'ans',
    maxLength: 999,
  },
  61: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  62: {
    name: 'Reserved for Private Use (Invoice)',
    description: 'Reserved for private use; often carries invoice or transaction reference number.',
    type: 'ans',
    maxLength: 999,
  },
  63: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  64: {
    name: 'Message Authentication Code (MAC)',
    description: 'Cryptographic MAC for message integrity verification.',
    type: 'b',
    maxLength: 8,
  },
  65: {
    name: 'Bitmap, Extended (Tertiary)',
    description: 'Indicates a tertiary bitmap follows, enabling bits 129–192.',
    type: 'b',
    maxLength: 8,
  },
  66: {
    name: 'Settlement Code',
    description: 'Identifies the settlement cycle.',
    type: 'n',
    maxLength: 1,
  },
  67: {
    name: 'Extended Payment Code',
    description: 'Used for installment or recurring payments.',
    type: 'n',
    maxLength: 2,
  },
  68: {
    name: 'Receiving Institution Country Code',
    description: 'Country code of the receiving institution.',
    type: 'n',
    maxLength: 3,
  },
  69: {
    name: 'Settlement Institution Country Code',
    description: 'Country code of the settlement institution.',
    type: 'n',
    maxLength: 3,
  },
  70: {
    name: 'Network Management Info Code',
    description: 'Identifies the type of network management message (e.g., 001 = Sign-on).',
    type: 'n',
    maxLength: 3,
  },
  71: {
    name: 'Message Number',
    description: 'Sequence number of the message.',
    type: 'n',
    maxLength: 4,
  },
  72: {
    name: 'Message Number, Last',
    description: 'Sequence number of the last message in a cycle.',
    type: 'n',
    maxLength: 4,
  },
  73: {
    name: 'Date, Action',
    description: 'Date of the action (YYMMDD).',
    type: 'n',
    maxLength: 6,
  },
  74: {
    name: 'Credits, Number',
    description: 'Number of credit transactions in a batch.',
    type: 'n',
    maxLength: 10,
  },
  75: {
    name: 'Credits, Reversal Number',
    description: 'Number of credit reversals in a batch.',
    type: 'n',
    maxLength: 10,
  },
  76: {
    name: 'Debits, Number',
    description: 'Number of debit transactions in a batch.',
    type: 'n',
    maxLength: 10,
  },
  77: {
    name: 'Debits, Reversal Number',
    description: 'Number of debit reversals in a batch.',
    type: 'n',
    maxLength: 10,
  },
  78: {
    name: 'Transfer Number',
    description: 'Number of transfer transactions in a batch.',
    type: 'n',
    maxLength: 10,
  },
  79: {
    name: 'Transfer, Reversal Number',
    description: 'Number of transfer reversals in a batch.',
    type: 'n',
    maxLength: 10,
  },
  80: {
    name: 'Inquiries Number',
    description: 'Number of inquiry transactions in a batch.',
    type: 'n',
    maxLength: 10,
  },
  81: {
    name: 'Authorizations, Number',
    description: 'Number of authorization transactions in a batch.',
    type: 'n',
    maxLength: 10,
  },
  82: {
    name: 'Credits, Processing Fee Amount',
    description: 'Total processing fees for credit transactions.',
    type: 'n',
    maxLength: 12,
  },
  83: {
    name: 'Credits, Transaction Fee Amount',
    description: 'Total transaction fees for credit transactions.',
    type: 'n',
    maxLength: 12,
  },
  84: {
    name: 'Debits, Processing Fee Amount',
    description: 'Total processing fees for debit transactions.',
    type: 'n',
    maxLength: 12,
  },
  85: {
    name: 'Debits, Transaction Fee Amount',
    description: 'Total transaction fees for debit transactions.',
    type: 'n',
    maxLength: 12,
  },
  86: {
    name: 'Credits, Amount',
    description: 'Total amount of credit transactions in a batch.',
    type: 'n',
    maxLength: 16,
  },
  87: {
    name: 'Credits, Reversal Amount',
    description: 'Total amount of credit reversals in a batch.',
    type: 'n',
    maxLength: 16,
  },
  88: {
    name: 'Debits, Amount',
    description: 'Total amount of debit transactions in a batch.',
    type: 'n',
    maxLength: 16,
  },
  89: {
    name: 'Debits, Reversal Amount',
    description: 'Total amount of debit reversals in a batch.',
    type: 'n',
    maxLength: 16,
  },
  90: {
    name: 'Original Data Elements',
    description: 'Key fields from the original message being reversed or amended.',
    type: 'n',
    maxLength: 42,
  },
  91: {
    name: 'File Update Code',
    description: 'Identifies the type of file update action.',
    type: 'an',
    maxLength: 1,
  },
  92: {
    name: 'File Security Code',
    description: 'Security code for file updates.',
    type: 'an',
    maxLength: 2,
  },
  93: {
    name: 'Response Indicator',
    description: 'Indicates the reason for the response.',
    type: 'an',
    maxLength: 5,
  },
  94: {
    name: 'Service Indicator',
    description: 'Service level indicator for routing.',
    type: 'an',
    maxLength: 7,
  },
  95: {
    name: 'Replacement Amounts',
    description: 'Corrected amounts that replace original transaction amounts.',
    type: 'an',
    maxLength: 42,
  },
  96: {
    name: 'Message Security Code',
    description: 'Security code used for message integrity.',
    type: 'b',
    maxLength: 8,
  },
  97: {
    name: 'Amount, Net Settlement',
    description: 'Net amount due for settlement.',
    type: 'x+n',
    maxLength: 17,
  },
  98: { name: 'Payee', description: 'Name of the payee.', type: 'ans', maxLength: 25 },
  99: {
    name: 'Settlement Institution ID Code',
    description: 'Identification of the settlement institution.',
    type: 'n',
    maxLength: 11,
  },
  100: {
    name: 'Receiving Institution ID Code',
    description: 'Identification of the receiving/destination institution.',
    type: 'n',
    maxLength: 11,
  },
  101: {
    name: 'File Name',
    description: 'Name of the file being transmitted.',
    type: 'ans',
    maxLength: 17,
  },
  102: {
    name: 'Account Identification 1',
    description: 'Source account for the transaction.',
    type: 'ans',
    maxLength: 28,
  },
  103: {
    name: 'Account Identification 2',
    description: 'Destination account for the transaction.',
    type: 'ans',
    maxLength: 28,
  },
  104: {
    name: 'Transaction Description',
    description: 'Free-text description of the transaction.',
    type: 'ans',
    maxLength: 100,
  },
  105: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  106: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  107: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  108: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  109: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  110: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  111: {
    name: 'Reserved for ISO Use',
    description: 'Reserved for ISO use.',
    type: 'ans',
    maxLength: 999,
  },
  112: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  113: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  114: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  115: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  116: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  117: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  118: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  119: {
    name: 'Reserved for National Use',
    description: 'Reserved for national use.',
    type: 'ans',
    maxLength: 999,
  },
  120: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  121: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  122: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  123: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  124: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  125: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  126: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  127: {
    name: 'Reserved for Private Use',
    description: 'Reserved for private/proprietary use.',
    type: 'ans',
    maxLength: 999,
  },
  128: {
    name: 'MAC, Secondary Bitmap',
    description: 'Message Authentication Code for the secondary bitmap block.',
    type: 'b',
    maxLength: 8,
  },
};

export function parseBitmap(hex: string): BitmapResult {
  const clean = hex.replace(/\s/g, '').toLowerCase();

  if (!/^[0-9a-f]+$/.test(clean)) {
    return {
      primary: [],
      error: 'Invalid hex string — only hexadecimal characters (0–9, a–f) are allowed.',
    };
  }

  if (clean.length < 16) {
    return { primary: [], error: 'Primary bitmap requires at least 16 hex characters (64 bits).' };
  }

  if (clean.length > 32) {
    return { primary: [], error: 'Bitmap cannot exceed 32 hex characters (128 bits).' };
  }

  const primaryHex = clean.slice(0, 16);
  const primary = hexToBits(primaryHex);

  if (!primary[0]) {
    return { primary };
  }

  if (clean.length < 32) {
    return {
      primary,
      error:
        'Bit 1 is set, indicating a secondary bitmap, but only 16 hex characters were provided. Supply 32 hex characters for the full 128-bit bitmap.',
    };
  }

  const secondaryHex = clean.slice(16, 32);
  const secondary = hexToBits(secondaryHex);
  return { primary, secondary };
}

function hexToBits(hex: string): boolean[] {
  const bits: boolean[] = [];
  for (const ch of hex) {
    const val = parseInt(ch, 16);
    for (let b = 3; b >= 0; b--) {
      bits.push(((val >> b) & 1) === 1);
    }
  }
  return bits;
}

export function getActiveFields(result: BitmapResult): ActiveField[] {
  const active: ActiveField[] = [];
  const bitmaps = [result.primary, ...(result.secondary ? [result.secondary] : [])];
  bitmaps.forEach((bitmap, bitmapIndex) => {
    bitmap.forEach((set, bitIndex) => {
      if (set) {
        const bit = bitmapIndex * 64 + bitIndex + 1;
        const def = ISO8583_FIELDS[bit];
        if (def) {
          active.push({ bit, ...def });
        }
      }
    });
  });
  return active;
}

export function bitmapToHex(bits: boolean[]): string {
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    let val = 0;
    for (let j = 0; j < 4; j++) {
      if (bits[i + j]) val |= 1 << (3 - j);
    }
    hex += val.toString(16);
  }
  return hex.toUpperCase();
}
