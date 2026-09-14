import { Invoice, Quotation, PaymentReceipt, AmcContract, CompanySettings } from '../types';
import { formatCurrency, formatDate } from './formatters';
import { generateInvoicePDF, generateQuotationPDF, generatePaymentReceiptPDF } from './pdfGenerator';

/**
 * Clean phone number to Indian country code standard (e.g. 91XXXXXXXXXX)
 */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

/**
 * 1. Send Invoice on WhatsApp:
 * Downloads the PDF invoice, then opens WhatsApp Web / App with pre-filled message
 */
export async function sendInvoiceOnWhatsApp(
  invoice: Invoice,
  company: CompanySettings,
  customerMobile?: string
) {
  // 1. Trigger PDF download
  try {
    generateInvoicePDF(invoice, company);
  } catch (err) {
    console.error('PDF generation before WhatsApp share error:', err);
  }

  // 2. Format professional WhatsApp message
  const targetPhone = formatWhatsAppNumber(customerMobile || invoice.customerMobile);
  const message = `*INVOICE: ${invoice.invoiceNo}*
Dear *${invoice.customerName}*,

Please find your Tax Invoice from *${company.companyName}*.

*Invoice Details:*
• Invoice No: ${invoice.invoiceNo}
• Date: ${formatDate(invoice.invoiceDate)}
• Total Amount: ${formatCurrency(invoice.grandTotal)}
• Amount Paid: ${formatCurrency(invoice.amountPaid)}
• *Balance Due: ${formatCurrency(invoice.balanceDue)}*
• Payment Status: ${invoice.status.toUpperCase()}

${company.upiId ? `*Pay via UPI:* ${company.upiId}\n` : ''}*Bank Details:*
Bank: ${company.bankName}
A/C: ${company.accountNumber}
IFSC: ${company.ifscCode}

_The PDF invoice has been downloaded. Thank you for your business!_

*${company.companyName}*
Phone: ${company.phone}`;

  const encodedText = encodeURIComponent(message);
  const url = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  // Open WhatsApp in new tab / app
  window.open(url, '_blank');
}

/**
 * 2. Send Quotation on WhatsApp
 */
export function sendQuotationOnWhatsApp(
  quotation: Quotation,
  company: CompanySettings,
  customerMobile?: string
) {
  try {
    generateQuotationPDF(quotation, company);
  } catch (err) {
    console.error('PDF generation before WhatsApp share error:', err);
  }

  const targetPhone = formatWhatsAppNumber(customerMobile || quotation.customerMobile);
  const message = `*ESTIMATE / QUOTATION: ${quotation.quotationNo}*
Dear *${quotation.customerName}*,

Greetings from *${company.companyName}*.

Please find attached formal quotation for Fire Safety & Protection Systems.

*Quotation Summary:*
• Quotation No: ${quotation.quotationNo}
• Date: ${formatDate(quotation.date)}
• Valid Until: ${formatDate(quotation.validUntil)}
• *Estimated Total: ${formatCurrency(quotation.grandTotal)}*

_The PDF copy has been saved. Please review and confirm your approval._

*${company.companyName}*
Phone: ${company.phone}`;

  const url = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');
}

/**
 * 3. Send Payment Receipt on WhatsApp
 */
export function sendPaymentReceiptOnWhatsApp(
  receipt: PaymentReceipt,
  company: CompanySettings,
  customerMobile?: string
) {
  try {
    generatePaymentReceiptPDF(receipt, { name: receipt.customerName, mobile: customerMobile }, company);
  } catch (err) {
    console.error('PDF generation error:', err);
  }

  const targetPhone = formatWhatsAppNumber(customerMobile);
  const message = `*PAYMENT ACKNOWLEDGEMENT*
Dear *${receipt.customerName}*,

We gratefully acknowledge receipt of your payment:

*Receipt Details:*
• Receipt No: ${receipt.receiptNo}
• Date: ${formatDate(receipt.paymentDate)}
• *Amount Received: ${formatCurrency(receipt.amount)}*
• Mode: ${receipt.paymentMethod}
${receipt.invoiceNo ? `• For Invoice: ${receipt.invoiceNo}\n` : ''}${receipt.referenceNo ? `• Reference No: ${receipt.referenceNo}\n` : ''}
Thank you for your prompt payment!

*${company.companyName}*
Phone: ${company.phone}`;

  const url = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');
}

/**
 * 4. Send AMC Service Reminder on WhatsApp
 */
export function sendAmcReminderOnWhatsApp(
  amc: AmcContract,
  periodName: string,
  targetDate: string,
  company: CompanySettings
) {
  const targetPhone = formatWhatsAppNumber(amc.customerMobile);
  const message = `*FIRE SAFETY SERVICE REMINDER*
Dear *${amc.customerName}*,

This is a scheduled service reminder for your Annual Maintenance Contract (*${amc.contractNo}* - ${amc.title}).

*Upcoming Maintenance Visit:*
• Scope / Visit: ${periodName}
• Scheduled Target Date: ${formatDate(targetDate)}
• Site Address: ${amc.siteAddress}

Our certified technician will contact your site manager prior to arrival for periodic inspection and testing.

*${company.companyName}*
Phone: ${company.phone}`;

  const url = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');
}
