import QRCode from 'qrcode';

export interface UpiPaymentDetails {
  upiId: string;
  payeeName: string;
  amount: number;
  invoiceNo: string;
  note?: string;
}

/**
 * Builds a standard UPI payment URI string
 * Format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=TRANSACTION_NOTE
 */
export function generateUpiUri({
  upiId,
  payeeName,
  amount,
  invoiceNo,
  note
}: UpiPaymentDetails): string {
  const cleanUpiId = (upiId || 'patelfire@upi').trim();
  const cleanPayee = (payeeName || 'Patel Electricals & Fire System Solutions').trim();
  const validAmount = Math.max(0, Number(amount) || 0).toFixed(2);
  const transNote = note ? note.trim() : `Invoice ${invoiceNo}`;

  const params = new URLSearchParams({
    pa: cleanUpiId,
    pn: cleanPayee,
    am: validAmount,
    cu: 'INR',
    tn: transNote
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates a base64 Data URL image of the UPI QR code
 */
export async function generateUpiQrDataUrl(
  details: UpiPaymentDetails,
  width: number = 250
): Promise<string> {
  try {
    const uri = generateUpiUri(details);
    return await QRCode.toDataURL(uri, {
      width,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Error generating UPI QR code:', err);
    return '';
  }
}
