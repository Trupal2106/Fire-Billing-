import React, { useEffect, useState } from 'react';
import { Invoice, CompanySettings, Customer } from '../../types';
import { BillCustomizationSettings, InvoiceColumnConfig } from '../../types/billCustomization';
import { formatCurrency, formatDate, numberToIndianWords } from '../../utils/formatters';
import { generateUpiQrDataUrl } from '../../utils/upiQrGenerator';
import { getFireShieldLogoDataUrl, getAuthorisedStampDataUrl } from '../../utils/billDesignAssets';

interface LiveBillPreviewProps {
  settings: BillCustomizationSettings;
  invoice: Invoice;
  companySettings: CompanySettings;
  customer?: Customer;
  className?: string;
  isPrintMode?: boolean;
}

export const LiveBillPreview: React.FC<LiveBillPreviewProps> = ({
  settings,
  invoice,
  companySettings,
  customer,
  className = '',
  isPrintMode = false
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const colors = settings.colors;
  const header = settings.header;
  const logo = settings.logo;
  const custConfig = settings.customer;
  const bank = settings.bank;
  const qr = settings.qr;
  const sig = settings.signature;
  const gstConfig = settings.gst;
  const paymentConfig = settings.payment;
  const termsConfig = settings.terms;
  const amountWordsConfig = settings.amountInWords;
  const footerConfig = settings.footer;
  const pageConfig = settings.page;

  // Calculate QR Amount
  const qrAmount = qr.amountType === 'outstanding_balance'
    ? (invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal)
    : qr.amountType === 'full_amount'
    ? invoice.grandTotal
    : (qr.customAmount || invoice.grandTotal);

  useEffect(() => {
    let isMounted = true;
    async function loadQr() {
      if (!qr.showQr) {
        setQrDataUrl('');
        return;
      }
      try {
        const upiId = companySettings.upiId || 'patelfiresolutions@sbi';
        const payeeName = companySettings.companyName || 'Patel Fire System Solutions';
        const url = await generateUpiQrDataUrl({
          upiId,
          payeeName,
          amount: qrAmount,
          invoiceNo: invoice.invoiceNo,
          note: `Invoice ${invoice.invoiceNo}`
        }, qr.size === 'large' ? 190 : qr.size === 'small' ? 120 : 150);
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (e) {
        console.error('Failed to generate preview QR', e);
      }
    }
    loadQr();
    return () => {
      isMounted = false;
    };
  }, [qr.showQr, qr.amountType, qr.size, qr.customAmount, qrAmount, invoice.invoiceNo, companySettings]);

  // Derived Company Data
  const compName = companySettings.companyName || 'PATEL ELECTRICALS & FIRE SYSTEM SOLUTIONS';
  const compAddress = `${companySettings.address || ''}, ${companySettings.city || ''}, ${companySettings.state || ''} - ${companySettings.pinCode || companySettings.pincode || '382445'}`;
  const compPhone = companySettings.phone || '+91 98765 43210';
  const compEmail = companySettings.email || 'info@patelfiresolutions.com';
  const compGstin = companySettings.gstin || '24AAAFP1234F1Z8';
  const compPan = companySettings.pan || (compGstin.length >= 12 ? compGstin.substring(2, 12) : 'AAAFP1234F');
  const compMsme = header.msmeNumber || 'UDYAM-GJ-01-0609442';
  const compWebsite = companySettings.website || 'www.patelfiresolutions.com';

  // Derived Customer Data
  const custName = (invoice.customerName || customer?.name || 'CUSTOMER NAME').toUpperCase();
  const custBillingAddr = invoice.billingAddress || customer?.billingAddress || 'Ahmedabad, Gujarat';
  const custShippingAddr = invoice.shippingAddress || customer?.shippingAddress || custBillingAddr;
  const custMobile = invoice.customerMobile || customer?.mobile || '-';
  const custEmail = customer?.email || '-';
  const custGstin = invoice.customerGstin || customer?.gstin || 'URP / Unregistered';
  const custPan = customer?.pan || (custGstin && custGstin.length >= 12 ? custGstin.substring(2, 12) : '-');
  const placeOfSupply = invoice.customerState || companySettings.state || 'Gujarat';

  // Items and visible columns
  const visibleColumns = settings.columns.filter(c => c.visible);

  // Logo asset
  const logoAsset = companySettings.logo || logo.logoUrl || getFireShieldLogoDataUrl();
  const stampAsset = companySettings.signature || sig.signatureImage || getAuthorisedStampDataUrl(compName);

  // Typography scale classes
  const fontScaleClass = pageConfig.fontSize === 'compact' ? 'text-[11px]' : pageConfig.fontSize === 'large' ? 'text-[13px]' : 'text-xs';
  const fontFamilyStyle = pageConfig.fontFamily === 'serif' ? 'font-serif' : pageConfig.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  // Page container sizing
  const pageSizeClass = pageConfig.pageSize === 'A5'
    ? 'max-w-[620px] min-h-[840px]'
    : pageConfig.pageSize === 'Letter'
    ? 'max-w-[850px] min-h-[1100px]'
    : 'max-w-[850px] min-h-[1120px]';

  const marginPaddingClass = pageConfig.margins === 'small' ? 'p-4 sm:p-5' : pageConfig.margins === 'large' ? 'p-8 sm:p-10' : 'p-6 sm:p-8';

  // Table row spacing
  const rowSpacingClass = pageConfig.rowSpacing === 'compact' ? 'py-1' : pageConfig.rowSpacing === 'spacious' ? 'py-2.5' : 'py-1.5';

  const amountInWords = numberToIndianWords(invoice.grandTotal);

  // Render cell value by column ID
  const renderCellContent = (col: InvoiceColumnConfig, item: any, index: number) => {
    switch (col.id) {
      case 'item':
        return (
          <div>
            <span className="font-bold text-slate-900 block">{item.name}</span>
            {item.description && (
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{item.description}</span>
            )}
          </div>
        );
      case 'description':
        return <span className="text-[10px] text-slate-600">{item.description || '-'}</span>;
      case 'hsnSac':
        return <span className="font-mono text-slate-700">{item.hsnSac || '-'}</span>;
      case 'quantity':
        return <span className="font-bold text-slate-900">{item.quantity}</span>;
      case 'unit':
        return <span className="text-slate-600">{item.unit || 'Nos'}</span>;
      case 'rate':
        return <span className="text-slate-900">{formatCurrency(item.rate)}</span>;
      case 'discount':
        return <span className="text-emerald-700">{item.discountPercent ? `${item.discountPercent}%` : item.discountAmount ? formatCurrency(item.discountAmount) : '-'}</span>;
      case 'taxableAmount':
        return <span className="font-medium text-slate-900">{formatCurrency(item.taxableAmount)}</span>;
      case 'gstRate':
        return <span className="font-semibold text-slate-800">{item.gstRate}%</span>;
      case 'cgst':
        return <span className="text-slate-700">{item.cgstAmount ? formatCurrency(item.cgstAmount) : '-'}</span>;
      case 'sgst':
        return <span className="text-slate-700">{item.sgstAmount ? formatCurrency(item.sgstAmount) : '-'}</span>;
      case 'igst':
        return <span className="text-slate-700">{item.igstAmount ? formatCurrency(item.igstAmount) : '-'}</span>;
      case 'taxAmount':
        const taxVal = (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0);
        return <span className="text-slate-800">{formatCurrency(taxVal)}</span>;
      case 'totalAmount':
        return <span className="font-bold text-slate-950">{formatCurrency(item.totalAmount)}</span>;
      default:
        return null;
    }
  };

  return (
    <div
      id="live-bill-preview-document"
      className={`bg-white text-slate-900 mx-auto shadow-xl border border-slate-300 transition-all ${fontFamilyStyle} ${fontScaleClass} ${pageSizeClass} ${marginPaddingClass} ${className} print:shadow-none print:p-0 print:border-none`}
      style={{
        backgroundColor: colors.pageBackground || '#ffffff',
        borderColor: colors.borderColor || '#cbd5e1'
      }}
    >
      {/* 1. Header Banner / Top Bar */}
      <div className="mb-4">
        {/* Title & Badge */}
        <div className={`flex items-center justify-between gap-3 pb-2 border-b mb-3 ${header.alignment === 'center' ? 'flex-col sm:flex-row text-center' : ''}`}
             style={{ borderColor: colors.borderColor }}>
          {header.showTitle && (
            <div className="flex items-center gap-2">
              <span
                className="font-black tracking-tight text-sm sm:text-base uppercase"
                style={{ color: colors.primary }}
              >
                {header.titleText || 'TAX INVOICE'}
              </span>
              {header.showRecipientBadge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider"
                  style={{
                    backgroundColor: colors.headerBg || '#f8fafc',
                    color: colors.headerText || colors.primary,
                    border: `1px solid ${colors.borderColor || '#cbd5e1'}`
                  }}
                >
                  {header.recipientBadgeText || 'ORIGINAL FOR RECIPIENT'}
                </span>
              )}
            </div>
          )}

          {/* Top Quick Meta */}
          <div className="text-[11px] font-medium text-slate-600 flex flex-wrap gap-x-3 gap-y-0.5">
            {header.showInvoiceNo && (
              <span>
                <strong>Invoice No:</strong> <span className="font-bold font-mono text-slate-900">{invoice.invoiceNo}</span>
              </span>
            )}
            {header.showInvoiceDate && (
              <span>
                <strong>Date:</strong> {formatDate(invoice.invoiceDate)}
              </span>
            )}
            {header.showDueDate && invoice.dueDate && (
              <span>
                <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Company Identity Header */}
        <div className={`flex ${logo.position === 'top_right' ? 'flex-row-reverse' : logo.position === 'top_center' ? 'flex-col items-center text-center' : 'flex-row'} items-start gap-4 mb-3`}>
          {/* Logo */}
          {logo.showLogo && (
            <div
              className={`shrink-0 ${
                logo.size === 'large' ? 'w-24 h-24' : logo.size === 'small' ? 'w-14 h-14' : 'w-20 h-20'
              }`}
            >
              <img src={logoAsset} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Company Details */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg sm:text-xl font-black tracking-tight uppercase leading-tight mb-1"
              style={{ color: colors.primary }}
            >
              {compName}
            </h1>
            <p className="text-[11px] text-slate-700 leading-snug font-medium">
              {compAddress}
            </p>
            <div className="text-[10px] sm:text-[11px] text-slate-800 mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
              {header.showPhone && <span><strong>Phone:</strong> {compPhone}</span>}
              {header.showEmail && <span><strong>Email:</strong> {compEmail}</span>}
              {header.showGstin && <span><strong>GSTIN:</strong> <span className="font-mono font-bold">{compGstin}</span></span>}
              {header.showPan && <span><strong>PAN:</strong> <span className="font-mono font-bold">{compPan}</span></span>}
              {header.showMsme && compMsme && <span><strong>MSME / UDYAM:</strong> <span className="font-mono">{compMsme}</span></span>}
              {header.showWebsite && <span><strong>Web:</strong> {compWebsite}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Section (Bill To / Ship To) */}
      <div
        className={`border rounded-lg p-3 mb-4 grid ${custConfig.layout === 'side_by_side' ? 'grid-cols-1 sm:grid-cols-2 gap-4' : 'grid-cols-1 gap-3'}`}
        style={{
          borderColor: colors.borderColor,
          backgroundColor: colors.tableHeaderBg ? `${colors.tableHeaderBg}40` : '#fafafa'
        }}
      >
        {/* Bill To */}
        {custConfig.showBillTo && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: colors.primary }}>
                DETAILS OF RECEIVER / BILLED TO:
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm uppercase leading-tight pt-0.5">
              {custName}
            </h2>
            {custConfig.showBillingAddress && (
              <p className="text-[11px] text-slate-700 leading-tight">{custBillingAddr}</p>
            )}
            <div className="text-[10px] sm:text-[11px] text-slate-800 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
              {custConfig.showCustomerMobile && <span><strong>Mobile:</strong> {custMobile}</span>}
              {custConfig.showCustomerEmail && custEmail !== '-' && <span><strong>Email:</strong> {custEmail}</span>}
              {custConfig.showCustomerGstin && <span><strong>GSTIN:</strong> <span className="font-mono font-bold">{custGstin}</span></span>}
              {custConfig.showCustomerPan && custPan !== '-' && <span><strong>PAN:</strong> <span className="font-mono">{custPan}</span></span>}
              {custConfig.showPlaceOfSupply && <span><strong>Place of Supply:</strong> {placeOfSupply}</span>}
            </div>
          </div>
        )}

        {/* Ship To */}
        {custConfig.showShipTo && (
          <div className="space-y-1 sm:border-l sm:pl-4 border-slate-200">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-600">
                DISPATCHED / SHIPPED TO:
              </span>
            </div>
            <h2 className="font-bold text-slate-800 text-xs sm:text-sm uppercase leading-tight pt-0.5">
              {custName}
            </h2>
            {custConfig.showShippingAddress && (
              <p className="text-[11px] text-slate-700 leading-tight">{custShippingAddr}</p>
            )}
            <div className="text-[10px] sm:text-[11px] text-slate-700 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
              <span><strong>Site Contact:</strong> {custMobile}</span>
              <span><strong>State Code:</strong> 24 (Gujarat)</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Items & Tax Table */}
      <div className="mb-4 overflow-x-auto border rounded-lg" style={{ borderColor: colors.borderColor }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              style={{
                backgroundColor: colors.tableHeaderBg || colors.primary,
                color: colors.tableHeaderText || '#ffffff'
              }}
            >
              <th className="py-2 px-2 text-[10px] font-black tracking-wider uppercase text-center w-8 border-r border-white/20">
                #
              </th>
              {visibleColumns.map((col, idx) => (
                <th
                  key={col.id}
                  className={`py-2 px-2 text-[10px] font-black tracking-wider uppercase ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${idx < visibleColumns.length - 1 ? 'border-r border-white/20' : ''}`}
                  style={{ width: col.widthPercent ? `${col.widthPercent}%` : 'auto' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: colors.borderColor }}>
            {invoice.items.map((item, idx) => (
              <tr
                key={item.id || idx}
                className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
              >
                <td className={`px-2 text-center font-mono font-medium text-slate-500 ${rowSpacingClass} border-r`} style={{ borderColor: colors.borderColor }}>
                  {idx + 1}
                </td>
                {visibleColumns.map((col, cIdx) => (
                  <td
                    key={col.id}
                    className={`px-2 ${rowSpacingClass} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${cIdx < visibleColumns.length - 1 ? 'border-r' : ''}`}
                    style={{ borderColor: colors.borderColor }}
                  >
                    {renderCellContent(col, item, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Totals, GST Breakdown & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4 items-start">
        {/* Left Column: Bank Details & Amount In Words */}
        <div className="sm:col-span-7 space-y-3">
          {/* Amount In Words */}
          {amountWordsConfig.showAmountInWords && (
            <div className="p-2.5 rounded-lg border bg-slate-50" style={{ borderColor: colors.borderColor }}>
              <span className="text-[10px] font-black text-black uppercase tracking-wider block">
                Total Amount In Words:
              </span>
              <p className="font-black text-black uppercase text-xs leading-snug mt-0.5">
                Indian Rupees {amountInWords}
              </p>
            </div>
          )}

          {/* Bank Details & QR Code (Bottom Left or Full Width) */}
          {(bank.showBankDetails || qr.showQr) && bank.position !== 'bottom_right' && (
            <div
              className="p-3 rounded-lg border flex flex-col sm:flex-row gap-3 items-start justify-between"
              style={{
                borderColor: colors.borderColor,
                backgroundColor: colors.headerBg ? `${colors.headerBg}30` : '#f8fafc'
              }}
            >
              {/* Bank Credentials */}
              {bank.showBankDetails && (
                <div className="flex-1 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1 pb-1 border-b border-slate-200">
                    <span className="font-black text-[10px] uppercase tracking-wider" style={{ color: colors.primary }}>
                      BANK & NEFT PAYMENT DETAILS
                    </span>
                  </div>
                  {bank.showBankName && <div><strong>Bank:</strong> {companySettings.bankName || 'State Bank of India'}</div>}
                  {bank.showAccountName && <div><strong>A/C Name:</strong> {companySettings.accountName || compName}</div>}
                  {bank.showAccountNumber && (
                    <div><strong>A/C No:</strong> <span className="font-mono font-bold">{companySettings.accountNumber || '398244510928'}</span></div>
                  )}
                  {bank.showIfsc && (
                    <div><strong>IFSC Code:</strong> <span className="font-mono font-bold">{companySettings.ifscCode || 'SBIN0004920'}</span></div>
                  )}
                  {bank.showBranch && <div><strong>Branch:</strong> Vatva GIDC Industrial, Ahmedabad</div>}
                  {bank.showAccountType && <div><strong>A/C Type:</strong> {bank.customAccountType || 'Current Account'}</div>}
                </div>
              )}

              {/* UPI QR Code */}
              {qr.showQr && qrDataUrl && (
                <div className="shrink-0 text-center flex flex-col items-center bg-white p-2 rounded-md border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight mb-1">
                    {qr.customLabel || 'Instant UPI Scan'}
                  </span>
                  <img
                    src={qrDataUrl}
                    alt="UPI QR"
                    className={`${qr.size === 'large' ? 'w-28 h-28' : qr.size === 'small' ? 'w-18 h-18' : 'w-24 h-24'} object-contain`}
                  />
                  {qr.showUpiId && (
                    <span className="text-[9px] font-mono font-bold text-emerald-800 mt-1 block">
                      {companySettings.upiId || 'patelfiresolutions@sbi'}
                    </span>
                  )}
                  {qr.showInstructions && (
                    <span className="text-[8px] text-slate-500 leading-none mt-0.5">
                      Pay ₹{formatCurrency(qrAmount)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Financial Totals & Balance Due */}
        <div className="sm:col-span-5 border rounded-lg divide-y text-[11px]" style={{ borderColor: colors.borderColor }}>
          {/* Subtotal / Taxable Amount */}
          {gstConfig.showTaxableAmount && (
            <div className="flex justify-between items-center px-3 py-1.5">
              <span className="text-slate-600 font-medium">Taxable Amount:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.taxableAmount)}</span>
            </div>
          )}

          {/* CGST */}
          {gstConfig.showCgst && (invoice.cgstTotal > 0 || !invoice.isInterstate) && (
            <div className="flex justify-between items-center px-3 py-1.5">
              <span className="text-slate-600 font-medium">CGST Total:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.cgstTotal || 0)}</span>
            </div>
          )}

          {/* SGST */}
          {gstConfig.showSgst && (invoice.sgstTotal > 0 || !invoice.isInterstate) && (
            <div className="flex justify-between items-center px-3 py-1.5">
              <span className="text-slate-600 font-medium">SGST Total:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.sgstTotal || 0)}</span>
            </div>
          )}

          {/* IGST */}
          {gstConfig.showIgst && (invoice.igstTotal > 0 || invoice.isInterstate) && (
            <div className="flex justify-between items-center px-3 py-1.5">
              <span className="text-slate-600 font-medium">IGST Total:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.igstTotal || 0)}</span>
            </div>
          )}

          {/* Round Off */}
          {gstConfig.showRoundOff && invoice.roundOff !== 0 && (
            <div className="flex justify-between items-center px-3 py-1.5 text-slate-500">
              <span>Round Off:</span>
              <span>{invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}</span>
            </div>
          )}

          {/* Grand Total */}
          {gstConfig.showGrandTotal && (
            <div
              className="flex justify-between items-center px-3 py-2 font-black text-sm"
              style={{
                backgroundColor: colors.headerBg || '#fef2f2',
                color: colors.primary || '#991b1b'
              }}
            >
              <span>GRAND TOTAL:</span>
              <span>₹{formatCurrency(invoice.grandTotal)}</span>
            </div>
          )}

          {/* Payment Status Summary */}
          {paymentConfig.showPaymentSummary && (
            <div className="bg-slate-50/60 p-2.5 space-y-1">
              {paymentConfig.showReceivedAmount && (
                <div className="flex justify-between items-center text-emerald-800 font-semibold">
                  <span>Amount Paid:</span>
                  <span>₹{formatCurrency(invoice.amountPaid || 0)}</span>
                </div>
              )}
              {paymentConfig.showBalanceDue && (
                <div className="flex justify-between items-center font-bold text-red-700">
                  <span>Balance Due:</span>
                  <span>₹{formatCurrency(invoice.balanceDue || 0)}</span>
                </div>
              )}
              {paymentConfig.showPaymentStatus && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[10px]">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold uppercase px-1.5 py-0.2 rounded-xs bg-slate-200 text-slate-800">
                    {invoice.status}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Terms & Conditions & Authorized Signatory Block */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end mb-4 pt-2 border-t" style={{ borderColor: colors.borderColor }}>
        {/* Terms */}
        <div className="sm:col-span-7 space-y-1">
          {termsConfig.showTerms && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                {termsConfig.heading || 'Terms & Conditions:'}
              </span>
              <ul className="text-[10px] text-slate-600 leading-snug space-y-0.5 list-none">
                {termsConfig.termsList.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Authorized Signature */}
        <div className="sm:col-span-5 text-right space-y-2">
          {sig.showSignature && (
            <div className="inline-flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                {sig.signatoryText || 'FOR'} {sig.companyName || compName}
              </span>

              {/* Stamp Seal / Signature Image */}
              <div
                className={`my-1 flex items-center justify-end ${
                  sig.size === 'large' ? 'h-24' : sig.size === 'small' ? 'h-14' : 'h-18'
                }`}
              >
                {sig.showStampSeal ? (
                  <img src={stampAsset} alt="Authorized Stamp" className="h-full object-contain" />
                ) : (
                  <div className="w-36 h-12 border-b border-dashed border-slate-400 flex items-end justify-center text-[10px] text-slate-400">
                    Authorized Signatory
                  </div>
                )}
              </div>

              <span className="text-[10px] font-black text-slate-900 uppercase">
                AUTHORISED SIGNATORY
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Footer Notes & Computer Generated Badge */}
      {footerConfig.showFooter && (
        <div className="pt-2 border-t text-center text-[10px] text-slate-500 space-y-1" style={{ borderColor: colors.borderColor }}>
          {footerConfig.showComputerGeneratedNote && (
            <p className="font-semibold text-slate-600">
              * This is a Computer Generated GST Tax Invoice and does not require a physical signature *
            </p>
          )}
          {footerConfig.customFooterText && (
            <p className="text-slate-500 italic">{footerConfig.customFooterText}</p>
          )}
          <div className="text-[9px] text-slate-400 flex flex-wrap justify-center gap-x-3">
            {footerConfig.showCompanyName && <span>{compName}</span>}
            {footerConfig.showGstin && <span>GSTIN: {compGstin}</span>}
            {footerConfig.showPhone && <span>Support: {compPhone}</span>}
            {footerConfig.showEmail && <span>{compEmail}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
