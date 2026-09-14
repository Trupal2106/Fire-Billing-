import React, { useEffect, useState } from 'react';
import { Invoice, CompanySettings, Customer } from '../../types';
import { formatCurrency, formatDate, numberToIndianWords } from '../../utils/formatters';
import { generateUpiQrDataUrl } from '../../utils/upiQrGenerator';
import { getFireShieldLogoDataUrl, getAuthorisedStampDataUrl } from '../../utils/billDesignAssets';

interface BillPreviewCardProps {
  invoice: Invoice;
  companySettings: CompanySettings;
  customer?: Customer;
}

export const BillPreviewCard: React.FC<BillPreviewCardProps> = ({
  invoice,
  companySettings,
  customer
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function loadQr() {
      const upiId = companySettings.upiId || 'patelfiresolutions@sbi';
      const payeeName = companySettings.companyName || 'Fire Care Safety Solution';
      const amount = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal;
      const url = await generateUpiQrDataUrl({
        upiId,
        payeeName,
        amount,
        invoiceNo: invoice.invoiceNo,
        note: `Invoice ${invoice.invoiceNo}`
      }, 160);
      if (isMounted) {
        setQrDataUrl(url);
      }
    }
    loadQr();
    return () => {
      isMounted = false;
    };
  }, [invoice, companySettings]);

  const shieldLogo = companySettings.logo || getFireShieldLogoDataUrl();
  const stampSeal = companySettings.signature || getAuthorisedStampDataUrl(companySettings.companyName || 'FIRE CARE SAFETY SOLUTION');

  // Customer billing details
  const custName = (invoice.customerName || customer?.name || 'CUSTOMER NAME').toUpperCase();
  const custBillingAddr = invoice.billingAddress || customer?.billingAddress || 'Ahmedabad, Gujarat';
  const custShippingAddr = invoice.shippingAddress || customer?.shippingAddress || custBillingAddr;
  const custMobile = invoice.customerMobile || customer?.mobile || '9825755192';
  const custGstin = invoice.customerGstin || customer?.gstin || 'URP';
  const custPan = customer?.pan || (custGstin && custGstin.length >= 12 ? custGstin.substring(2, 12) : '-');
  const placeOfSupply = invoice.customerState || companySettings.state || 'Gujarat';

  // Company details
  const compName = (companySettings.companyName || 'FIRE CARE SAFETY SOLUTION').toUpperCase();
  const compAddress = `${companySettings.address}, ${companySettings.city}, ${companySettings.state} - ${companySettings.pinCode || companySettings.pincode || '380013'}`;
  const compMobile = companySettings.phone || '9499819990';
  const compGstin = companySettings.gstin || '24AAAFP1234F1Z8';
  const compPan = companySettings.pan || (compGstin.length >= 12 ? compGstin.substring(2, 12) : 'FZWP1941R');
  const compEmail = companySettings.email || 'firecaresafetysolution@gmail.com';
  const compMsme = 'UDYAM-GJ-01-0609442';

  // Item sums
  const totalQty = invoice.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  const totalTax = invoice.items.reduce((acc, it) => {
    return acc + (Number(it.cgstAmount || 0) + Number(it.sgstAmount || 0) + Number(it.igstAmount || 0));
  }, 0);

  const amountInWords = numberToIndianWords(invoice.grandTotal);

  return (
    <div className="bg-white text-black p-6 sm:p-8 font-sans shadow-lg border border-slate-300 max-w-[850px] mx-auto rounded-none print:shadow-none print:p-0 print:border-none">
      {/* Top Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-extrabold tracking-tight text-slate-900 text-xs sm:text-sm">TAX INVOICE</span>
        <span className="text-[10px] sm:text-xs text-slate-500 font-medium px-2 py-0.5 border border-slate-400 rounded-xs">
          ORIGINAL FOR RECIPIENT
        </span>
      </div>

      {/* Company Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
          <img src={shieldLogo} alt="Company Logo" className="w-full h-full object-contain" />
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase leading-none mb-1.5">
            {compName}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-800 leading-snug font-medium">
            {compAddress}
          </p>
          <div className="text-[11px] sm:text-xs text-slate-900 mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-medium">
            <span><strong>Mobile:</strong> {compMobile}</span>
            <span><strong>GSTIN:</strong> {compGstin}</span>
            <span><strong>PAN Number:</strong> {compPan}</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-900 flex flex-wrap gap-x-4 gap-y-0.5 font-medium">
            <span><strong>Email:</strong> {compEmail}</span>
            <span><strong>MSME:</strong> {compMsme}</span>
          </div>
        </div>
      </div>

      {/* Invoice Meta Bar */}
      <div className="border-t-4 border-black bg-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium mb-4">
        <div>
          <span className="font-bold text-slate-900">Invoice No.:</span>{' '}
          <span className="font-semibold text-slate-950">{invoice.invoiceNo}</span>
        </div>
        <div>
          <span className="font-bold text-slate-900">Invoice Date:</span>{' '}
          <span className="font-semibold text-slate-950">{formatDate(invoice.invoiceDate)}</span>
        </div>
        <div>
          <span className="font-bold text-slate-900">Due Date:</span>{' '}
          <span className="font-semibold text-slate-950">{formatDate(invoice.dueDate)}</span>
        </div>
        {invoice.poNumber && (
          <div>
            <span className="font-bold text-slate-900">PO No.:</span>{' '}
            <span className="font-semibold text-slate-950 font-mono">{invoice.poNumber}</span>
          </div>
        )}
        {invoice.poDate && (
          <div>
            <span className="font-bold text-slate-900">PO Date:</span>{' '}
            <span className="font-semibold text-slate-950">{formatDate(invoice.poDate)}</span>
          </div>
        )}
      </div>

      {/* Bill To & Ship To Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5 text-xs">
        {/* Bill To */}
        <div>
          <h3 className="font-black text-slate-950 tracking-wide uppercase text-xs mb-1.5">
            BILL TO
          </h3>
          <p className="font-black text-slate-950 uppercase leading-tight mb-1 text-[13px]">
            {custName}
          </p>
          <p className="text-slate-800 uppercase leading-relaxed text-[11px] mb-1 font-medium">
            {custBillingAddr}
          </p>
          <div className="space-y-0.5 text-slate-900 font-medium text-[11px]">
            <p><strong>Mobile:</strong> {custMobile}</p>
            <p><strong>GSTIN:</strong> {custGstin}</p>
            <p><strong>PAN Number:</strong> {custPan}</p>
            <p><strong>Place of Supply:</strong> {placeOfSupply}</p>
          </div>
        </div>

        {/* Ship To */}
        <div>
          <h3 className="font-black text-slate-950 tracking-wide uppercase text-xs mb-1.5">
            SHIP TO
          </h3>
          <p className="font-black text-slate-950 uppercase leading-tight mb-1 text-[13px]">
            {custName}
          </p>
          <p className="text-slate-800 uppercase leading-relaxed text-[11px] font-medium">
            {custShippingAddr}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-y-2 border-black font-black text-slate-950 uppercase tracking-wider">
              <th className="py-2.5 px-2">ITEMS</th>
              <th className="py-2.5 px-2 text-center">QTY.</th>
              <th className="py-2.5 px-2 text-right">RATE</th>
              <th className="py-2.5 px-2 text-right">TAX</th>
              <th className="py-2.5 px-2 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, idx) => {
              const itemTax = (Number(item.cgstAmount || 0) + Number(item.sgstAmount || 0) + Number(item.igstAmount || 0));
              const effectiveTaxRate = item.gstRate || (invoice.isInterstate ? (item.igstRate || 18) : ((item.cgstRate || 9) + (item.sgstRate || 9)));

              return (
                <tr key={idx} className="align-top font-medium">
                  <td className="py-3 px-2">
                    <span className="font-black text-slate-950 uppercase block text-[12px]">{item.name}</span>
                    {item.description && (
                      <span className="text-[10px] text-slate-600 block mt-0.5">{item.description}</span>
                    )}
                    {item.hsnSac && (
                      <span className="text-[9px] text-slate-400 block mt-0.5">HSN: {item.hsnSac}</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-900 whitespace-nowrap">
                    {item.quantity} {item.unit?.toUpperCase() || 'PCS'}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-slate-900 whitespace-nowrap">
                    {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap">
                    <div className="font-medium text-slate-900">
                      {itemTax.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      ({effectiveTaxRate}%)
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-slate-950 whitespace-nowrap">
                    {item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Subtotal Row */}
          <tfoot>
            <tr className="border-y-2 border-black font-black text-slate-950 text-xs sm:text-sm">
              <td className="py-2.5 px-2 uppercase font-extrabold">SUBTOTAL</td>
              <td className="py-2.5 px-2 text-center font-extrabold">{totalQty}</td>
              <td className="py-2.5 px-2"></td>
              <td className="py-2.5 px-2 text-right font-extrabold">
                ₹ {totalTax.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 px-2 text-right font-extrabold">
                ₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom 2 Columns: Bank & QR on Left, Summary & Signature on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 text-xs">
        {/* Left 6 Columns */}
        <div className="md:col-span-6 space-y-4">
          {/* Bank Details */}
          {invoice.showBankDetails !== false && (
            <div>
              <h4 className="font-black text-slate-950 uppercase tracking-wide text-xs mb-1.5">
                BANK DETAILS
              </h4>
              <div className="space-y-0.5 text-[11.5px] text-slate-900 font-medium">
                <p><strong>Name:</strong> {compName}</p>
                <p><strong>IFSC Code:</strong> {companySettings.ifscCode || 'CBIN0280548'}</p>
                <p><strong>Account No:</strong> {companySettings.accountNumber || '5959030132'}</p>
                <p><strong>Bank:</strong> {companySettings.bankName || 'Central Bank of India'}, {companySettings.branch || 'BRANCH'}</p>
              </div>
            </div>
          )}

          {/* Payment QR Code */}
          {invoice.showPaymentQr !== false && (
            <div>
              <h4 className="font-black text-slate-950 uppercase tracking-wide text-xs mb-1.5">
                PAYMENT QR CODE
              </h4>
              <div className="flex items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <p className="text-[11.5px] text-slate-900">
                    <strong>UPI ID:</strong> {companySettings.upiId || '919499819990@centralbank'}
                  </p>
                  {/* UPI Apps Icons Strip */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">PhonePe</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">GPay</span>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">Paytm</span>
                    <span className="text-[10px] font-extrabold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">UPI</span>
                  </div>
                </div>

                {/* QR Image */}
                {qrDataUrl && (
                  <div className="w-20 h-20 sm:w-22 sm:h-22 border border-slate-300 p-1 bg-white shrink-0">
                    <img src={qrDataUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="pt-2">
            <h4 className="font-black text-slate-950 uppercase tracking-wide text-[11px] mb-1">
              TERMS AND CONDITIONS
            </h4>
            <p className="text-[10.5px] text-slate-700 leading-relaxed font-normal">
              {invoice.terms || companySettings.termsAndConditions || 'Fire Extinguisher Refilling: 50% advance payment along with the work order and the remaining 50% payment after delivery/completion of the work.'}
            </p>
          </div>
        </div>

        {/* Right 6 Columns */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-4">
          {/* Summary Totals Table */}
          <div className="space-y-1.5 text-xs text-slate-900">
            <div className="flex justify-between py-0.5">
              <span className="font-semibold text-slate-800">Taxable Amount</span>
              <span className="font-semibold text-slate-950">
                ₹ {invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>

            {invoice.isInterstate ? (
              <div className="flex justify-between py-0.5">
                <span className="font-semibold text-slate-800">IGST @18%</span>
                <span className="font-semibold text-slate-950">
                  ₹ {invoice.igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-0.5">
                  <span className="font-semibold text-slate-800">CGST @9%</span>
                  <span className="font-semibold text-slate-950">
                    ₹ {invoice.cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-semibold text-slate-800">SGST @9%</span>
                  <span className="font-semibold text-slate-950">
                    ₹ {invoice.sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}

            <div className="border-t border-black my-1 pt-1"></div>

            <div className="flex justify-between py-0.5 text-sm">
              <span className="font-black text-slate-950">Total Amount</span>
              <span className="font-black text-slate-950">
                ₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="font-medium text-slate-800">Received Amount</span>
              <span className="font-semibold text-slate-950">
                ₹ {(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-0.5 text-sm">
              <span className="font-black text-slate-950">Balance</span>
              <span className="font-black text-slate-950">
                ₹ {invoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Amount in Words */}
            <div className="pt-3 text-right">
              <p className="font-bold text-[11px] text-black uppercase">Total Amount (in words)</p>
              <p className="text-[12px] text-black font-extrabold uppercase">{amountInWords}</p>
            </div>
          </div>

          {/* Stamp and Authorised Signatory */}
          <div className="pt-4 flex flex-col items-end text-right">
            <div className="w-24 h-24 mb-1">
              <img src={stampSeal} alt="Seal & Stamp" className="w-full h-full object-contain transform -rotate-6 opacity-90" />
            </div>
            <p className="font-black text-slate-950 text-[11px] uppercase tracking-wider">
              AUTHORISED SIGNATORY FOR
            </p>
            <p className="font-black text-slate-950 text-xs uppercase tracking-wide">
              {compName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
