import { CompanySettings, Invoice, Quotation, PaymentReceipt } from '../types';

/**
 * Format a document number with a customizable prefix, separator, and zero-padded sequence.
 * 
 * Example:
 * prefix: 'ag/2026', num: 1, padding: 2, separator: '/' -> 'ag/2026/01'
 * prefix: 'ag/2026/', num: 2, padding: 2 -> 'ag/2026/02'
 * prefix: 'FCSS-2026', num: 5, padding: 3, separator: '-' -> 'FCSS-2026-005'
 */
export function formatDocumentNumber(
  prefix: string = 'ag/2026',
  num: number = 1,
  padding: number = 2,
  separator: string = '/'
): string {
  const cleanPrefix = (prefix || 'ag/2026').trim();
  const safeNum = Math.max(1, isNaN(num) ? 1 : num);
  const safePadding = Math.max(1, Math.min(6, padding || 2));
  const paddedNum = String(safeNum).padStart(safePadding, '0');

  // Check if prefix already ends with a punctuation/separator (/ or - or _)
  const lastChar = cleanPrefix.slice(-1);
  if (lastChar === '/' || lastChar === '-' || lastChar === '_') {
    return `${cleanPrefix}${paddedNum}`;
  }

  const cleanSep = separator !== undefined ? separator : '/';
  return `${cleanPrefix}${cleanSep}${paddedNum}`;
}

/**
 * Parses an existing document number string to extract prefix, number, and padding.
 */
export function parseDocumentNumber(docNo: string): { prefix: string; num: number; padding: number; separator: string } {
  if (!docNo) {
    return { prefix: 'ag/2026', num: 1, padding: 2, separator: '/' };
  }

  const match = docNo.match(/^(.*?)(\/|-|_)?(\d+)$/);
  if (match) {
    const prefix = match[1] || 'ag/2026';
    const separator = match[2] || '/';
    const rawDigits = match[3];
    const num = parseInt(rawDigits, 10) || 1;
    const padding = rawDigits.length;
    return { prefix, num, padding, separator };
  }

  return { prefix: docNo, num: 1, padding: 2, separator: '/' };
}

/**
 * Calculate the next available Invoice Number based on company settings and existing invoices.
 */
export function generateNextInvoiceNumber(
  settings?: CompanySettings | null,
  existingInvoices: Invoice[] = []
): string {
  const prefix = settings?.invoicePrefix?.trim() || 'ag/2026';
  const padding = settings?.invoicePadding ?? 2;
  const separator = settings?.invoiceSeparator ?? '/';

  // Determine starting counter
  let nextNum = settings?.invoiceNextNumber ?? 1;

  // Check existing invoices with matching prefix to ensure no collision / correct sequential order
  if (existingInvoices.length > 0) {
    let maxFound = 0;
    const normalizedPrefix = prefix.replace(/[\/\-_]+$/, '').toLowerCase();

    for (const inv of existingInvoices) {
      if (!inv.invoiceNo) continue;
      const parsed = parseDocumentNumber(inv.invoiceNo);
      const parsedPrefix = parsed.prefix.replace(/[\/\-_]+$/, '').toLowerCase();

      if (parsedPrefix === normalizedPrefix || inv.invoiceNo.toLowerCase().includes(normalizedPrefix)) {
        if (parsed.num > maxFound) {
          maxFound = parsed.num;
        }
      }
    }

    if (maxFound >= nextNum) {
      nextNum = maxFound + 1;
    }
  }

  return formatDocumentNumber(prefix, nextNum, padding, separator);
}

/**
 * Calculate the next available Quotation Number.
 */
export function generateNextQuotationNumber(
  settings?: CompanySettings | null,
  existingQuotations: Quotation[] = []
): string {
  const prefix = settings?.quotationPrefix?.trim() || 'ag/QTN/2026';
  const padding = settings?.quotationPadding ?? 2;
  const separator = settings?.quotationSeparator ?? '/';

  let nextNum = settings?.quotationNextNumber ?? 1;

  if (existingQuotations.length > 0) {
    let maxFound = 0;
    const normalizedPrefix = prefix.replace(/[\/\-_]+$/, '').toLowerCase();

    for (const q of existingQuotations) {
      if (!q.quotationNo) continue;
      const parsed = parseDocumentNumber(q.quotationNo);
      const parsedPrefix = parsed.prefix.replace(/[\/\-_]+$/, '').toLowerCase();

      if (parsedPrefix === normalizedPrefix || q.quotationNo.toLowerCase().includes(normalizedPrefix)) {
        if (parsed.num > maxFound) {
          maxFound = parsed.num;
        }
      }
    }

    if (maxFound >= nextNum) {
      nextNum = maxFound + 1;
    }
  }

  return formatDocumentNumber(prefix, nextNum, padding, separator);
}

/**
 * Calculate the next available Payment Receipt Number.
 */
export function generateNextReceiptNumber(
  settings?: CompanySettings | null,
  existingReceipts: PaymentReceipt[] = []
): string {
  const prefix = settings?.receiptPrefix?.trim() || 'ag/REC/2026';
  const padding = settings?.receiptPadding ?? 2;
  const separator = settings?.receiptSeparator ?? '/';

  let nextNum = settings?.receiptNextNumber ?? 1;

  if (existingReceipts.length > 0) {
    let maxFound = 0;
    const normalizedPrefix = prefix.replace(/[\/\-_]+$/, '').toLowerCase();

    for (const r of existingReceipts) {
      if (!r.receiptNo) continue;
      const parsed = parseDocumentNumber(r.receiptNo);
      const parsedPrefix = parsed.prefix.replace(/[\/\-_]+$/, '').toLowerCase();

      if (parsedPrefix === normalizedPrefix || r.receiptNo.toLowerCase().includes(normalizedPrefix)) {
        if (parsed.num > maxFound) {
          maxFound = parsed.num;
        }
      }
    }

    if (maxFound >= nextNum) {
      nextNum = maxFound + 1;
    }
  }

  return formatDocumentNumber(prefix, nextNum, padding, separator);
}
