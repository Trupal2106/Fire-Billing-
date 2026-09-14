import { LineItem } from '../types';
import { normalizeUnit } from '../constants/units';

export const INDIAN_STATES = [
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '08', name: 'Rajasthan' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '07', name: 'Delhi' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '06', name: 'Haryana' },
  { code: '03', name: 'Punjab' },
  { code: '32', name: 'Kerala' },
  { code: '21', name: 'Odisha' },
  { code: '10', name: 'Bihar' },
  { code: '30', name: 'Goa' },
  { code: '05', name: 'Uttarakhand' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '18', name: 'Assam' },
  { code: '20', name: 'Jharkhand' },
  { code: '22', name: 'Chhattisgarh' }
];

export function isInterstateTransaction(companyState: string, customerState: string): boolean {
  if (!companyState || !customerState) return false;
  return companyState.trim().toLowerCase() !== customerState.trim().toLowerCase();
}

export function calculateLineItem(
  item: {
    id?: string;
    productId?: string;
    name: string;
    description?: string;
    hsnSac: string;
    quantity: number;
    unit: string;
    rate: number;
    discountPercent?: number;
    gstRate: number;
  },
  isInterstate: boolean
): LineItem {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const discPercent = Number(item.discountPercent) || 0;
  const gstRate = Number(item.gstRate) || 0;

  const rawAmount = qty * rate;
  const discountAmount = Number(((rawAmount * discPercent) / 100).toFixed(2));
  const taxableAmount = Number((rawAmount - discountAmount).toFixed(2));

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterstate) {
    igstRate = gstRate;
    igstAmount = Number(((taxableAmount * igstRate) / 100).toFixed(2));
  } else {
    cgstRate = Number((gstRate / 2).toFixed(2));
    sgstRate = Number((gstRate / 2).toFixed(2));
    cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
    sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
  }

  const totalAmount = Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

  return {
    id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    productId: item.productId,
    name: item.name,
    description: item.description,
    hsnSac: item.hsnSac || '',
    quantity: qty,
    unit: normalizeUnit(item.unit || 'NOS'),
    rate,
    discountPercent: discPercent,
    discountAmount,
    taxableAmount,
    gstRate,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalAmount
  };
}

export function calculateDocumentTotals(
  items: any[],
  isInterstate: boolean,
  overallDiscount: number = 0,
  amountPaid: number = 0
) {
  let subtotal = 0;
  let totalDiscount = Number(overallDiscount) || 0;
  let taxableAmount = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  const calculatedItems: LineItem[] = (items || []).map(item => calculateLineItem(item, isInterstate));

  for (const item of calculatedItems) {
    const raw = (item.quantity || 0) * (item.rate || 0);
    subtotal += raw;
    totalDiscount += item.discountAmount || 0;
    taxableAmount += item.taxableAmount || 0;

    if (isInterstate) {
      igstTotal += item.igstAmount || 0;
    } else {
      cgstTotal += item.cgstAmount || 0;
      sgstTotal += item.sgstAmount || 0;
    }
  }

  subtotal = Number(subtotal.toFixed(2));
  totalDiscount = Number(totalDiscount.toFixed(2));
  taxableAmount = Number(taxableAmount.toFixed(2));
  cgstTotal = Number(cgstTotal.toFixed(2));
  sgstTotal = Number(sgstTotal.toFixed(2));
  igstTotal = Number(igstTotal.toFixed(2));

  const grossTotal = Number((taxableAmount + cgstTotal + sgstTotal + igstTotal).toFixed(2));
  const discountVal = Number(overallDiscount) || 0;
  const exactGrandTotal = Math.max(0, Number((grossTotal - discountVal).toFixed(2)));
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = Number((roundedGrandTotal - exactGrandTotal).toFixed(2));
  const paid = Number(amountPaid) || 0;
  const balanceDue = Math.max(0, Number((roundedGrandTotal - paid).toFixed(2)));

  return {
    items: calculatedItems,
    subtotal,
    totalDiscount,
    taxableAmount,
    cgstTotal,
    sgstTotal,
    igstTotal,
    roundOff,
    grandTotal: roundedGrandTotal,
    amountPaid: paid,
    balanceDue
  };
}

export const calculateInvoiceTotals = calculateDocumentTotals;
export const isInterstateSupply = isInterstateTransaction;
