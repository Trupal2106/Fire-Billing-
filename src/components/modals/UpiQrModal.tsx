import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { CompanySettings, Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { generateUpiUri, generateUpiQrDataUrl } from '../../utils/upiQrGenerator';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  companySettings: CompanySettings;
  onRecordPayment?: (invoice: Invoice, amount: number) => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  invoice,
  companySettings,
  onRecordPayment
}) => {
  if (!isOpen || !invoice) return null;

  const [paymentMode, setPaymentMode] = useState<'balance' | 'full' | 'custom'>(
    invoice.balanceDue > 0 ? 'balance' : 'full'
  );
  const [customAmount, setCustomAmount] = useState<number>(invoice.balanceDue || invoice.grandTotal);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Compute selected amount
  const selectedAmount =
    paymentMode === 'full'
      ? invoice.grandTotal
      : paymentMode === 'balance'
      ? invoice.balanceDue
      : Math.max(1, Number(customAmount) || 0);

  const upiUri = generateUpiUri({
    upiId: companySettings.upiId || 'patelfire@upi',
    payeeName: companySettings.companyName || 'Patel Electricals & Fire System Solutions',
    amount: selectedAmount,
    invoiceNo: invoice.invoiceNo,
    note: `Inv ${invoice.invoiceNo} ${companySettings.companyName}`
  });

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    generateUpiQrDataUrl({
      upiId: companySettings.upiId || 'patelfire@upi',
      payeeName: companySettings.companyName || 'Patel Electricals & Fire System Solutions',
      amount: selectedAmount,
      invoiceNo: invoice.invoiceNo,
      note: `Invoice ${invoice.invoiceNo}`
    }, 280)
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to build QR', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAmount, invoice.invoiceNo, companySettings.upiId, companySettings.companyName]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `UPI_QR_${invoice.invoiceNo.replace(/\//g, '_')}_Rs${selectedAmount}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Scan & Pay via UPI</h3>
              <p className="text-[11px] text-slate-500">Invoice: {invoice.invoiceNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Amount Selector Tabs */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">
              Select Payment Amount:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('balance')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  paymentMode === 'balance'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-[10px] text-slate-500 font-normal">Pay Balance</span>
                <span className="text-xs">{formatCurrency(invoice.balanceDue)}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('full')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  paymentMode === 'full'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-[10px] text-slate-500 font-normal">Pay Full</span>
                <span className="text-xs">{formatCurrency(invoice.grandTotal)}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('custom')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  paymentMode === 'custom'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-[10px] text-slate-500 font-normal">Custom</span>
                <span className="text-xs">Custom ₹</span>
              </button>
            </div>

            {paymentMode === 'custom' && (
              <div className="mt-2.5">
                <label className="text-[10px] font-medium text-slate-600 block mb-1">Enter Custom Amount (₹):</label>
                <input
                  type="number"
                  min="1"
                  max={invoice.grandTotal}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
                  placeholder="Enter amount"
                />
              </div>
            )}
          </div>

          {/* Dynamic QR Code Canvas Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center min-w-[200px] min-h-[200px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                  <span className="text-[11px]">Generating UPI QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`UPI QR Code for ${formatCurrency(selectedAmount)}`}
                  className="w-48 h-48 rounded"
                />
              ) : (
                <div className="text-slate-400 text-center p-4">QR generation unavailable</div>
              )}
            </div>

            {/* Amount Badge */}
            <div className="mt-3 text-center">
              <span className="text-base font-bold text-slate-900 block">
                {formatCurrency(selectedAmount)}
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                UPI ID: <strong className="text-slate-700">{companySettings.upiId || 'patelfire@upi'}</strong>
              </p>
              <p className="text-[10px] text-slate-400">Payee: {companySettings.companyName}</p>
            </div>
          </div>

          {/* Verification Disclaimer */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Note:</strong> Scanning this QR initiates a real UPI request in the customer's payment app (GPay, PhonePe, Paytm, BHIM). The invoice is <em>not automatically marked as paid</em> until you record the payment entry with the transaction reference.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            {qrDataUrl && (
              <button
                onClick={handleDownloadQr}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 flex items-center gap-1.5"
                title="Download QR Image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </button>
            )}
          </div>

          {onRecordPayment && invoice.balanceDue > 0 && (
            <button
              onClick={() => {
                onClose();
                onRecordPayment(invoice, selectedAmount);
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
            >
              Record Paid ({formatCurrency(selectedAmount)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
