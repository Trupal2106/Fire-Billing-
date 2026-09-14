import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Invoice,
  Quotation,
  PaymentReceipt,
  Customer,
  CompanySettings,
  AmcContract,
  ServiceReport,
  PumpTestRecord,
  LedgerEntry,
  BillCustomizationSettings
} from '../types';
import { formatCurrency, formatDate, numberToIndianWords } from './formatters';
import { generateUpiQrDataUrl } from './upiQrGenerator';
import { getFireShieldLogoDataUrl, getAuthorisedStampDataUrl, svgToPngDataUrl } from './billDesignAssets';

function hexToRgb(hex?: string, defaultRgb: [number, number, number] = [0, 0, 0]): [number, number, number] {
  if (!hex || typeof hex !== 'string') return defaultRgb;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? defaultRgb : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? defaultRgb : [r, g, b];
  }
  return defaultRgb;
}

// Palette
const PRIMARY_COLOR: [number, number, number] = [185, 28, 28]; // #b91c1c (Patel Fire Red)
const DARK_SLATE: [number, number, number] = [30, 41, 59];
const LIGHT_GRAY: [number, number, number] = [241, 245, 249];

// 1. INVOICE PDF GENERATOR - Exact Match to User Bill Design Template & Customizations
export async function generateInvoicePDF(
  invoice: Invoice,
  company: CompanySettings,
  customer?: Customer,
  customSettings?: BillCustomizationSettings
) {
  const doc = new jsPDF({
    unit: 'mm',
    format: customSettings?.page?.pageSize?.toLowerCase() === 'a5' ? 'a5' : 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const marginX = customSettings?.page?.margins === 'small' ? 8 : (customSettings?.page?.margins === 'large' ? 18 : 14);
  const contentWidth = pageWidth - marginX * 2; // 182mm

  const primaryRgb = hexToRgb(customSettings?.colors?.primary, [185, 28, 28]);
  const headerBgRgb = hexToRgb(customSettings?.colors?.headerBg, [241, 245, 249]);
  const tableHeaderBgRgb = hexToRgb(customSettings?.colors?.tableHeaderBg, [255, 255, 255]);
  const tableHeaderTextRgb = hexToRgb(customSettings?.colors?.tableHeaderText, [0, 0, 0]);

  // 1. Top Header Badge: TAX INVOICE & [ ORIGINAL FOR RECIPIENT ]
  const showTitle = customSettings?.header?.showTitle !== false;
  const titleText = customSettings?.header?.titleText || 'TAX INVOICE';
  const showBadge = customSettings?.header?.showRecipientBadge !== false;
  const badgeText = customSettings?.header?.recipientBadgeText || 'ORIGINAL FOR RECIPIENT';

  let curY = 12;
  if (showTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text(titleText, marginX, curY);
  }

  // Bordered Gray Box for Badge
  if (showBadge) {
    const titleWidth = showTitle ? doc.getTextWidth(titleText) + 6 : 0;
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX + titleWidth, curY - 3.5, 48, 5, 0.5, 0.5, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(badgeText, marginX + titleWidth + 2, curY);
  }

  // 2. Company Logo & Details Header
  const compName = (company.companyName || 'FIRE CARE SAFETY SOLUTION').toUpperCase();
  const compAddress = `${company.address || '6B, B.D.PATEL HOUSE, Naranpura Road'}, ${company.city || 'Ahmedabad'}, ${company.state || 'Gujarat'} - ${company.pinCode || company.pincode || '380013'}`;
  const compMobile = company.phone || '9499819990';
  const compGstin = company.gstin || '24AAAFP1234F1Z8';
  const compPan = company.pan || (compGstin.length >= 12 ? compGstin.substring(2, 12) : 'FZWP1941R');
  const compEmail = company.email || 'firecaresafetysolution@gmail.com';
  const compMsme = 'UDYAM-GJ-01-0609442';

  const showLogo = customSettings?.logo?.showLogo !== false;
  let textStartX = marginX;

  // Embed Logo if enabled
  if (showLogo) {
    try {
      const rawLogoSvg = customSettings?.logo?.logoUrl || company.logo || getFireShieldLogoDataUrl();
      const logoPng = await svgToPngDataUrl(rawLogoSvg, 200, 200);
      const logoW = customSettings?.logo?.size === 'large' ? 24 : customSettings?.logo?.size === 'small' ? 14 : 18;
      doc.addImage(logoPng, 'PNG', marginX, 16, logoW, logoW);
      textStartX = marginX + logoW + 4;
    } catch (e) {
      console.error('Logo render note:', e);
      textStartX = marginX + 22;
    }
  }

  // Company Name and Details Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.text(compName, textStartX, 20.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const addrLines = doc.splitTextToSize(compAddress, contentWidth - (textStartX - marginX));
  doc.text(addrLines, textStartX, 25);

  const nextY = 25 + Math.min(addrLines.length * 3.5, 7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Mobile: ', textStartX, nextY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${compMobile}     `, textStartX + 11, nextY);

  const gstinOffset = textStartX + 11 + doc.getTextWidth(`${compMobile}     `);
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN: ', gstinOffset, nextY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${compGstin}     `, gstinOffset + 11, nextY);

  const panOffset = gstinOffset + 11 + doc.getTextWidth(`${compGstin}     `);
  doc.setFont('helvetica', 'bold');
  doc.text('PAN Number: ', panOffset, nextY);
  doc.setFont('helvetica', 'normal');
  doc.text(compPan, panOffset + 19, nextY);

  // Email & MSME Line
  doc.setFont('helvetica', 'bold');
  doc.text('Email: ', textStartX, nextY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${compEmail}     `, textStartX + 10, nextY + 3.8);

  const msmeOffset = textStartX + 10 + doc.getTextWidth(`${compEmail}     `);
  doc.setFont('helvetica', 'bold');
  doc.text('MSME: ', msmeOffset, nextY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.text(compMsme, msmeOffset + 11, nextY + 3.8);

  // 3. Invoice Meta Banner
  const bannerY = nextY + 7.5;
  // Solid top border line
  doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setLineWidth(0.8);
  doc.line(marginX, bannerY, marginX + contentWidth, bannerY);

  // Light gray / header fill
  doc.setFillColor(headerBgRgb[0], headerBgRgb[1], headerBgRgb[2]);
  doc.rect(marginX, bannerY + 0.8, contentWidth, 7, 'F');

  // Meta Texts
  const metaTextY = bannerY + 5.5;
  doc.setFontSize(8.5);
  // Left: Invoice No
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Invoice No.: ', marginX + 3, metaTextY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNo, marginX + 3 + doc.getTextWidth('Invoice No.: '), metaTextY);

  // Center: Invoice Date
  const centerText = `Invoice Date: ${formatDate(invoice.invoiceDate)}`;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date: ', pageWidth / 2 - 16, metaTextY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.invoiceDate), pageWidth / 2 - 16 + doc.getTextWidth('Invoice Date: '), metaTextY);

  // Right: Due Date
  const dueDateStr = formatDate(invoice.dueDate);
  doc.setFont('helvetica', 'bold');
  const dueTotalWidth = doc.getTextWidth(`Due Date: ${dueDateStr}`);
  doc.text('Due Date: ', marginX + contentWidth - dueTotalWidth - 3, metaTextY);
  doc.setFont('helvetica', 'normal');
  doc.text(dueDateStr, marginX + contentWidth - doc.getTextWidth(dueDateStr) - 3, metaTextY);

  // 4. BILL TO & SHIP TO Sections (2 Columns)
  const partyY = bannerY + 13;
  const colWidth = (contentWidth - 6) / 2;

  // BILL TO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.text('BILL TO', marginX, partyY);

  const custName = (invoice.customerName || customer?.name || 'CUSTOMER NAME').toUpperCase();
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  const custNameLines = doc.splitTextToSize(custName, colWidth);
  doc.text(custNameLines, marginX, partyY + 4.5);

  let currentLeftY = partyY + 4.5 + custNameLines.length * 3.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const custAddrLines = doc.splitTextToSize((invoice.billingAddress || customer?.billingAddress || 'Ahmedabad, Gujarat').toUpperCase(), colWidth);
  doc.text(custAddrLines, marginX, currentLeftY);

  currentLeftY += custAddrLines.length * 3.4;
  doc.setFont('helvetica', 'bold');
  doc.text('Mobile: ', marginX, currentLeftY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerMobile || customer?.mobile || '9825755192', marginX + 11, currentLeftY);

  currentLeftY += 3.4;
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN: ', marginX, currentLeftY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerGstin || customer?.gstin || '24AAAAJ1086G2ZY', marginX + 11, currentLeftY);

  currentLeftY += 3.4;
  const custPan = invoice.customerGstin && invoice.customerGstin.length >= 12 ? invoice.customerGstin.substring(2, 12) : 'AAAAJ1086G';
  doc.setFont('helvetica', 'bold');
  doc.text('PAN Number: ', marginX, currentLeftY);
  doc.setFont('helvetica', 'normal');
  doc.text(custPan, marginX + 19, currentLeftY);

  currentLeftY += 3.4;
  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supply: ', marginX, currentLeftY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerState || company.state || 'Gujarat', marginX + 23, currentLeftY);

  // SHIP TO
  const shipX = marginX + colWidth + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.text('SHIP TO', shipX, partyY);

  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(custNameLines, shipX, partyY + 4.5);

  let currentRightY = partyY + 4.5 + custNameLines.length * 3.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const shipAddrLines = doc.splitTextToSize((invoice.shippingAddress || invoice.billingAddress || 'Ahmedabad, Gujarat').toUpperCase(), colWidth);
  doc.text(shipAddrLines, shipX, currentRightY);
  currentRightY += shipAddrLines.length * 3.4;

  // 5. Items Table
  const tableStartY = Math.max(currentLeftY, currentRightY) + 5;

  const totalQty = invoice.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  const totalTax = invoice.items.reduce((acc, it) => {
    return acc + (Number(it.cgstAmount || 0) + Number(it.sgstAmount || 0) + Number(it.igstAmount || 0));
  }, 0);

  // Dynamic visible columns if customSettings present
  const visibleCols = customSettings?.columns?.filter(c => c.visible) || [];
  const useDynamicCols = visibleCols.length > 0;

  let tableHead: string[][];
  let tableRows: any[][];

  if (useDynamicCols) {
    tableHead = [visibleCols.map(c => c.label.toUpperCase())];
    tableRows = invoice.items.map((item, idx) => {
      const itemTax = (Number(item.cgstAmount || 0) + Number(item.sgstAmount || 0) + Number(item.igstAmount || 0));
      const effectiveTaxRate = item.gstRate || (invoice.isInterstate ? (item.igstRate || 18) : ((item.cgstRate || 9) + (item.sgstRate || 9)));

      return visibleCols.map(col => {
        switch (col.id) {
          case 'item':
            return item.name.toUpperCase() + (item.description ? `\n${item.description}` : '');
          case 'description':
            return item.description || '-';
          case 'hsnSac':
            return item.hsnSac || '-';
          case 'quantity':
            return `${item.quantity}`;
          case 'unit':
            return item.unit?.toUpperCase() || 'PCS';
          case 'rate':
            return item.rate.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          case 'discount':
            return (item.discountPercent || item.discountAmount) ? `${item.discountPercent || 0}%` : '-';
          case 'taxableAmount':
            return (item.taxableAmount || (item.quantity * item.rate)).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          case 'gstRate':
            return `${effectiveTaxRate}%`;
          case 'cgst':
            return (item.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          case 'sgst':
            return (item.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          case 'igst':
            return (item.igstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          case 'taxAmount':
            return `${itemTax.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
          case 'totalAmount':
            return item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          default:
            return '';
        }
      });
    });
  } else {
    tableHead = [['ITEMS', 'QTY.', 'RATE', 'TAX', 'AMOUNT']];
    tableRows = invoice.items.map((item) => {
      const itemTax = (Number(item.cgstAmount || 0) + Number(item.sgstAmount || 0) + Number(item.igstAmount || 0));
      const effectiveTaxRate = item.gstRate || (invoice.isInterstate ? (item.igstRate || 18) : ((item.cgstRate || 9) + (item.sgstRate || 9)));

      const itemTitle = item.name.toUpperCase();
      const subText = item.description ? `\n${item.description}` : '';

      return [
        itemTitle + subText,
        `${item.quantity} ${item.unit?.toUpperCase() || 'PCS'}`,
        item.rate.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
        `${itemTax.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}\n(${effectiveTaxRate}%)`,
        item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
      ];
    });
  }

  // Footer / Subtotal row
  const tableFoot = [[
    'SUBTOTAL',
    String(totalQty),
    '',
    `INR ${totalTax.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
    `INR ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  ]];

  autoTable(doc, {
    startY: tableStartY,
    head: tableHead,
    body: tableRows,
    foot: useDynamicCols ? undefined : tableFoot,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [0, 0, 0],
      cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 },
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fontStyle: 'bold',
      fontSize: 8.5,
      textColor: [tableHeaderTextRgb[0], tableHeaderTextRgb[1], tableHeaderTextRgb[2]],
      fillColor: [tableHeaderBgRgb[0], tableHeaderBgRgb[1], tableHeaderBgRgb[2]],
      lineColor: [0, 0, 0],
      lineWidth: { top: 0.6, bottom: 0.6, left: 0, right: 0 }
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42]
    },
    footStyles: {
      fontStyle: 'bold',
      fontSize: 8.5,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      lineColor: [0, 0, 0],
      lineWidth: { top: 0.6, bottom: 0.6, left: 0, right: 0 }
    },
    margin: { left: marginX, right: marginX }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Bottom Section (2 Columns)
  // Left Column: Bank Details, Payment QR Code, Terms and Conditions
  // Right Column: Taxable Amount, CGST/SGST/IGST, Total Amount, Received, Balance, Amount in words, Stamp & Signatory

  const leftColX = marginX;
  const leftColWidth = 90;
  const rightColX = marginX + 96;
  const rightColWidth = 86;

  let leftY = finalY;

  // BANK DETAILS
  const showBank = customSettings?.bank?.showBankDetails !== false;
  if (showBank) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('BANK DETAILS', leftColX, leftY);

    leftY += 4.5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Name: ', leftColX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(compName, leftColX + 11, leftY);

    leftY += 3.6;
    doc.setFont('helvetica', 'bold');
    doc.text('IFSC Code: ', leftColX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(company.ifscCode || 'CBIN0280548', leftColX + 17, leftY);

    leftY += 3.6;
    doc.setFont('helvetica', 'bold');
    doc.text('Account No: ', leftColX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(company.accountNumber || '5959030132', leftColX + 18, leftY);

    leftY += 3.6;
    doc.setFont('helvetica', 'bold');
    doc.text('Bank: ', leftColX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${company.bankName || 'Central Bank of India'}, ${company.branch || 'BRANCH'}`, leftColX + 10, leftY);
    leftY += 6.5;
  }

  // PAYMENT QR CODE
  const showQr = customSettings?.qr?.showQr !== false;
  if (showQr) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('PAYMENT QR CODE', leftColX, leftY);

    leftY += 4.5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('UPI ID: ', leftColX, leftY);
    doc.setFont('helvetica', 'normal');
    const upiId = company.upiId || '919499819990@centralbank';
    doc.text(upiId, leftColX + 12, leftY);

    // Render QR Image & UPI Badges
    try {
      const qrAmount = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal;
      const qrDataUrl = await generateUpiQrDataUrl({
        upiId,
        payeeName: compName,
        amount: qrAmount,
        invoiceNo: invoice.invoiceNo,
        note: `Invoice ${invoice.invoiceNo}`
      }, 150);

      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', leftColX + 60, leftY - 4.5, 20, 20);
      }
    } catch (e) {
      console.error('QR code render note:', e);
    }

    // Small UPI Badges below UPI ID
    leftY += 5;
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('PhonePe  |  GPay  |  Paytm  |  BHIM UPI', leftColX, leftY);
    leftY += 12;
  }

  // TERMS AND CONDITIONS
  const showTerms = customSettings?.terms?.showTerms !== false;
  if (showTerms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('TERMS AND CONDITIONS', leftColX, leftY);

    leftY += 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const termsText = customSettings?.terms?.termsList?.join('\n') || invoice.terms || company.termsAndConditions || 'Fire Extinguisher Refilling: 50% advance payment along with the work order and the remaining 50% payment after delivery/completion of the work.';
    const termLines = doc.splitTextToSize(termsText, leftColWidth);
    doc.text(termLines.slice(0, 4), leftColX, leftY);
  }

  // RIGHT COLUMN: Financial Summary
  let rightY = finalY;

  function addFinRow(label: string, value: string, isBold: boolean = false, fontSize: number = 8) {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    doc.text(label, rightColX, rightY);
    doc.text(value, marginX + contentWidth, rightY, { align: 'right' });
    rightY += 4.5;
  }

  addFinRow('Taxable Amount', `INR ${invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`, true);

  if (invoice.isInterstate) {
    addFinRow('IGST @18%', `INR ${invoice.igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
  } else {
    addFinRow('CGST @9%', `INR ${invoice.cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
    addFinRow('SGST @9%', `INR ${invoice.sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
  }

  // Solid line before total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(rightColX, rightY - 1.5, marginX + contentWidth, rightY - 1.5);

  addFinRow('Total Amount', `INR ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`, true, 9);
  addFinRow('Received Amount', `INR ${(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
  addFinRow('Balance', `INR ${invoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`, true, 9);

  // Total Amount in Words
  const showWords = customSettings?.amountInWords?.showAmountInWords !== false;
  if (showWords) {
    rightY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Total Amount (in words)', marginX + contentWidth, rightY, { align: 'right' });
    rightY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const words = numberToIndianWords(invoice.grandTotal);
    const wordsLines = doc.splitTextToSize(words, rightColWidth);
    doc.text(wordsLines, marginX + contentWidth, rightY, { align: 'right' });
    rightY += Math.max(wordsLines.length * 3.5, 6) + 4;
  } else {
    rightY += 6;
  }

  // Stamp and Signature
  const showSignature = customSettings?.signature?.showSignature !== false;
  if (showSignature) {
    try {
      if (customSettings?.signature?.signatureImage) {
        doc.addImage(customSettings.signature.signatureImage, 'PNG', marginX + contentWidth - 30, rightY - 8, 26, 26);
      } else if (customSettings?.signature?.showStampSeal !== false) {
        const rawStampSvg = getAuthorisedStampDataUrl(compName);
        const stampPng = await svgToPngDataUrl(rawStampSvg, 220, 220);
        doc.addImage(stampPng, 'PNG', marginX + contentWidth - 30, rightY - 8, 26, 26);
      }
    } catch (e) {
      console.error('Stamp render note:', e);
    }

    rightY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    const signatoryText = customSettings?.signature?.signatoryText || 'AUTHORISED SIGNATORY FOR';
    doc.text(signatoryText, marginX + contentWidth, rightY, { align: 'right' });
    rightY += 3.5;
    doc.setFontSize(8);
    doc.text(compName, marginX + contentWidth, rightY, { align: 'right' });
  }

  // Download PDF
  doc.save(`${invoice.invoiceNo.replace(/\//g, '_')}.pdf`);
}


// 2. QUOTATION PDF GENERATOR
export function generateQuotationPDF(quotation: Quotation, company: CompanySettings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Banner
  doc.setFillColor(30, 41, 59); // Slate Dark
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Company Name
  const compName = (company.companyName || company.name || 'FIRE CARE SAFETY SOLUTION').toUpperCase();
  const compPhone = company.phone || company.mobile || '9499819990';
  const compGstin = company.gstin || '24AAAFP1234F1Z8';
  const compPan = company.pan || (compGstin.length >= 12 ? compGstin.substring(2, 12) : 'FZWP1941R');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(compName, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(company.tagline || 'Fire Protection & Electrical Solutions', 14, 18);
  doc.text(`GSTIN: ${compGstin}  |  PAN: ${compPan}  |  Ph: ${compPhone}`, 14, 23);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FORMAL QUOTATION', pageWidth - 14, 14, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, pageWidth - 14, 20, { align: 'right' });

  // Customer & Meta Info Box
  const y = 34;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(14, y, 88, 36, 2, 2, 'FD');
  doc.roundedRect(108, y, 88, 36, 2, 2, 'FD');

  // Left: Customer
  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('QUOTATION FOR:', 18, y + 6);
  doc.setFontSize(9.5);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(quotation.customerName, 18, y + 12);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(quotation.billingAddress || 'Local Address', 80);
  doc.text(addressLines, 18, y + 17);

  // Right: Quotation Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.text('QUOTATION DETAILS:', 112, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Quotation No:', 112, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(quotation.quotationNo, 145, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Quotation Date:', 112, y + 19);
  doc.text(formatDate(quotation.date), 145, y + 19);

  doc.text('Status:', 112, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.status.toUpperCase(), 145, y + 25);

  // Table
  const tableColumns = ['#', 'Item Description / Scope', 'HSN/SAC', 'Qty', 'Unit', 'Rate (₹)', 'Taxable (₹)', 'GST (₹)', 'Total (₹)'];
  const tableRows = quotation.items.map((item, idx) => [
    idx + 1,
    item.name + (item.description ? `\n${item.description}` : ''),
    item.hsnSac || '-',
    item.quantity,
    item.unit,
    item.rate.toFixed(2),
    item.taxableAmount.toFixed(2),
    quotation.isInterstate ? item.igstAmount.toFixed(2) : (item.cgstAmount + item.sgstAmount).toFixed(2),
    item.totalAmount.toFixed(2)
  ]);

  autoTable(doc, {
    startY: y + 40,
    head: [tableColumns],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Totals Box
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(118, finalY, 78, 38, 2, 2, 'FD');

  let ty = finalY + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Taxable Amount:', 122, ty);
  doc.text(formatCurrency(quotation.taxableAmount), 192, ty, { align: 'right' });
  ty += 5;

  doc.text('Total GST (18%):', 122, ty);
  doc.text(formatCurrency(quotation.cgstTotal + quotation.sgstTotal + quotation.igstTotal), 192, ty, { align: 'right' });
  ty += 5;

  doc.setDrawColor(203, 213, 225);
  doc.line(122, ty, 192, ty);
  ty += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('Quoted Total:', 122, ty);
  doc.text(formatCurrency(quotation.grandTotal), 192, ty, { align: 'right' });

  // Terms and Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.text('TERMS OF OFFER:', 14, finalY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`1. Prices quoted are valid until ${formatDate(quotation.validUntil)}.`, 14, finalY + 12);
  doc.text('2. Standard delivery period: 3-5 working days from PO confirmation.', 14, finalY + 16);
  doc.text('3. Payment Terms: 50% Advance with Purchase Order, Balance against delivery/commissioning.', 14, finalY + 20);

  doc.save(`${quotation.quotationNo.replace(/\//g, '_')}.pdf`);
}

// 3. PAYMENT RECEIPT PDF GENERATOR
export function generatePaymentReceiptPDF(receipt: PaymentReceipt, customer: Partial<Customer> | undefined, company: CompanySettings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const compName = (company.companyName || company.name || 'FIRE CARE SAFETY SOLUTION').toUpperCase();
  const compPhone = company.phone || company.mobile || '9499819990';
  const compPin = company.pinCode || company.pincode || '380013';

  // Header Banner
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(compName, 12, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${company.address || 'Ahmedabad'}, ${company.city || 'Gujarat'} - ${compPin} | Ph: ${compPhone}`, 12, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT RECEIPT', pageWidth - 12, 12, { align: 'right' });

  // Receipt Content Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(12, 30, pageWidth - 24, 76, 3, 3, 'FD');

  let y = 38;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Receipt No:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(receipt.receiptNo, 55, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Date:', pageWidth - 60, y);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(receipt.paymentDate), pageWidth - 45, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.text('Received with thanks from:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.text(receipt.customerName, 65, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.text('The sum of Rupees:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  const words = doc.splitTextToSize(numberToIndianWords(receipt.amount), pageWidth - 80);
  doc.text(words, 65, y);

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Mode:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.text(`${receipt.paymentMethod} ${receipt.referenceNo ? `(Ref / UTR: ${receipt.referenceNo})` : ''}`, 65, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.text('Against Invoice / Account:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.invoiceNo || 'Account Balance Credit', 65, y);

  // Big Amount Badge
  y += 15;
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.roundedRect(18, y - 6, 60, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Amount: ${formatCurrency(receipt.amount)}`, 22, y + 3);

  // Signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`For ${company.companyName}`, pageWidth - 20, y, { align: 'right' });
  doc.text('Authorized Signatory', pageWidth - 20, y + 6, { align: 'right' });

  doc.save(`${receipt.receiptNo.replace(/\//g, '_')}.pdf`);
}

// 4. CUSTOMER LEDGER PDF GENERATOR
export function generateCustomerLedgerPDF(
  customer: Customer,
  entries: LedgerEntry[],
  company: CompanySettings,
  startDate?: string,
  endDate?: string
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  const compName = (company.companyName || company.name || 'FIRE CARE SAFETY SOLUTION').toUpperCase();
  const compPhone = company.phone || company.mobile || '9499819990';
  const compGstin = company.gstin || '24AAAFP1234F1Z8';

  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(compName, 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`GSTIN: ${compGstin} | Phone: ${compPhone}`, 14, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('STATEMENT OF ACCOUNT', pageWidth - 14, 13, { align: 'right' });

  // Customer Summary
  const y = 32;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(customer.name, 18, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${customer.gstin || 'Unregistered'} | Mobile: ${customer.mobile}`, 18, y + 12);
  doc.text(`Address: ${customer.billingAddress}, ${customer.city}`, 18, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Current Balance Due:', pageWidth - 80, y + 10);
  doc.setFontSize(12);
  doc.setTextColor(customer.currentOutstanding > 0 ? 194 : 16, customer.currentOutstanding > 0 ? 65 : 149, customer.currentOutstanding > 0 ? 12 : 193);
  doc.text(formatCurrency(customer.currentOutstanding), pageWidth - 80, y + 18);

  // Table
  const tableColumns = ['Date', 'Type', 'Reference No', 'Details', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)'];
  const tableRows = entries.map(e => [
    formatDate(e.date),
    e.type,
    e.referenceNo,
    e.description,
    e.debit > 0 ? e.debit.toFixed(2) : '-',
    e.credit > 0 ? e.credit.toFixed(2) : '-',
    e.balance.toFixed(2)
  ]);

  autoTable(doc, {
    startY: y + 28,
    head: [tableColumns],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`Ledger_${customer.name.replace(/\s+/g, '_')}.pdf`);
}

// 5. AMC CONTRACT CERTIFICATE PDF
export function generateAmcContractPDF(amc: AmcContract, customer: Customer, company: CompanySettings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Banner
  const compName = (company.companyName || company.name || 'FIRE CARE SAFETY SOLUTION').toUpperCase();

  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(compName, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('ANNUAL MAINTENANCE CONTRACT (AMC) CERTIFICATE & SCHEDULE', 14, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`CONTRACT #${amc.contractNo}`, pageWidth - 14, 15, { align: 'right' });

  let y = 36;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(14, y, pageWidth - 28, 42, 2, 2, 'FD');

  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(amc.title, 18, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Client: ${amc.customerName}`, 18, y + 14);
  doc.text(`Site Address: ${amc.siteAddress}`, 18, y + 20);
  doc.text(`Validity Period: ${formatDate(amc.startDate)} to ${formatDate(amc.endDate)}`, 18, y + 26);
  doc.text(`Service Frequency: ${amc.serviceFrequency} Visits`, 18, y + 32);
  doc.text(`Contract Value: ${formatCurrency(amc.totalAmount)} (incl. 18% GST)`, 18, y + 38);

  // Schedules Table
  const tableColumns = ['#', 'Quarter / Inspection Period', 'Scheduled Target Date', 'Completion Status', 'Service Notes'];
  const tableRows = amc.schedules.map((sch, i) => [
    i + 1,
    sch.periodName,
    formatDate(sch.scheduledDate),
    sch.status,
    sch.notes || '-'
  ]);

  autoTable(doc, {
    startY: y + 48,
    head: [tableColumns],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${amc.contractNo.replace(/\//g, '_')}_Certificate.pdf`);
}

// 6. SERVICE REPORT PDF GENERATOR
export function generateServiceReportPDF(report: ServiceReport, company: CompanySettings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const compName = (company.companyName || company.name || 'FIRE CARE SAFETY SOLUTION').toUpperCase();

  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(compName, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('FIRE SAFETY TECHNICAL INSPECTION & SERVICE REPORT', 14, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`REPORT #${report.reportNo}`, pageWidth - 14, 15, { align: 'right' });

  let y = 36;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Customer: ${report.customerName}`, 18, y + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Site Address: ${report.siteAddress}`, 18, y + 12);
  doc.text(`Date of Inspection: ${formatDate(report.date)} | Technician: ${report.technicianName}`, 18, y + 18);
  doc.text(`Equipment Covered: ${report.equipmentType} ${report.equipmentSerialNo ? `(S/N: ${report.equipmentSerialNo})` : ''}`, 18, y + 24);

  y += 36;

  function addSectionBox(title: string, content: string, height: number = 22) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, y, pageWidth - 28, height, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text(title.toUpperCase(), 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
    const lines = doc.splitTextToSize(content || 'None reported.', pageWidth - 36);
    doc.text(lines, 18, y + 10);
    y += height + 4;
  }

  addSectionBox('Inspection Details & Scope', report.inspectionDetails);
  addSectionBox('Observations & Findings', report.findings);
  addSectionBox('Defects / Non-Compliance Noticed', report.defects);
  addSectionBox('Corrective Actions Taken / Recommended', report.recommendedAction);

  // Signatures
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Technician Signature: ${report.technicianSignatureName}`, 18, y);
  doc.text(`Customer Signature: ${report.customerSignatureName || 'Verified on Site'}`, pageWidth - 18, y, { align: 'right' });

  doc.save(`${report.reportNo.replace(/\//g, '_')}.pdf`);
}

// 7. FIRE PUMP TESTING REPORT PDF
export function generatePumpTestPDF(test: PumpTestRecord, company: CompanySettings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pumpCompName = (company.companyName || company.name || 'FIRE CARE SAFETY SOLUTION').toUpperCase();

  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(pumpCompName, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('FIRE HYDRANT & SPRINKLER PUMP PERFORMANCE TEST REPORT', 14, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`TEST #${test.testNo}`, pageWidth - 14, 15, { align: 'right' });

  let y = 36;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Customer: ${test.customerName}`, 18, y + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Site: ${test.siteAddress}`, 18, y + 12);
  doc.text(`Test Date: ${formatDate(test.date)} | Inspector: ${test.technicianName}`, 18, y + 18);
  doc.text(`Pump Tested: ${test.pumpType} (${test.pumpNumber})`, 18, y + 24);

  // Table of hydraulic test parameters
  const tableData = [
    ['Suction Pressure', test.suctionPressure],
    ['Discharge Operating Pressure', test.dischargePressure],
    ['Shut-Off Pressure (Churn Pressure)', test.shutOffPressure || 'N/A'],
    ['Estimated Flow Rate', test.flowRateGPM || '2280 LPM (IS Standard)'],
    ['Mechanical Running Condition', test.runningCondition],
    ['Electrical / Starter Condition', test.electricalCondition],
    ['Diesel Engine / Battery Health', test.dieselCondition],
    ['Auto-Start Cut-In Test Result', test.autoStartTestResult],
    ['Technical Remarks & Recommendation', test.remarks]
  ];

  autoTable(doc, {
    startY: y + 34,
    head: [['Test Parameter / Inspection Checklist', 'Recorded Observation & Value']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${test.testNo.replace(/\//g, '_')}_PumpTest.pdf`);
}
