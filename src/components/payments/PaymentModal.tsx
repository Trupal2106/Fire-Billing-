import React, { useState, useEffect, useMemo } from 'react';
import { X, CreditCard, User, Receipt, DollarSign, Calendar, FileText, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, Invoice, PaymentReceipt, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateNextReceiptNumber } from '../../utils/numbering';

interface PaymentModalProps {
  isOpen: boolean;
  customers: Customer[];
  invoices: Invoice[];
  payments?: PaymentReceipt[];
  companySettings: CompanySettings;
  preselectedCustomer?: Customer | null;
  preselectedInvoice?: Invoice | null;
  onClose: () => void;
  onSavePayment: (paymentData: Omit<PaymentReceipt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  customers,
  invoices,
  payments = [],
  companySettings,
  preselectedCustomer,
  preselectedInvoice,
  onClose,
  onSavePayment
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const defaultReceiptNo = useMemo(() => {
    return generateNextReceiptNumber(companySettings, payments);
  }, [companySettings, payments]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedInvoice?.customerId || preselectedCustomer?.id || (customers?.[0]?.id || '')
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(preselectedInvoice?.id || '');
  const [receiptNo, setReceiptNo] = useState(defaultReceiptNo);
  const [paymentDate, setPaymentDate] = useState(todayStr);
  const [amount, setAmount] = useState<number>(preselectedInvoice?.balanceDue || 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card'>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedInvoice) {
      setSelectedCustomerId(preselectedInvoice.customerId);
      setSelectedInvoiceId(preselectedInvoice.id);
      setAmount(preselectedInvoice.balanceDue > 0 ? preselectedInvoice.balanceDue : preselectedInvoice.grandTotal);
    } else if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
      setSelectedInvoiceId('');
      setAmount(preselectedCustomer.currentOutstanding > 0 ? preselectedCustomer.currentOutstanding : 0);
    }
  }, [preselectedInvoice, preselectedCustomer, isOpen]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Customer unpaid invoices
  const customerUnpaidInvoices = useMemo(() => {
    if (!selectedCustomerId) return [];
    return invoices.filter(i => i.customerId === selectedCustomerId && i.status !== 'cancelled' && i.balanceDue > 0);
  }, [invoices, selectedCustomerId]);

  // When invoice selection changes
  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (invId) {
      const inv = invoices.find(i => i.id === invId);
      if (inv) {
        setAmount(inv.balanceDue);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const linkedInvoice = invoices.find(i => i.id === selectedInvoiceId);

      await onSavePayment({
        receiptNo,
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'Customer',
        invoiceId: selectedInvoiceId || undefined,
        invoiceNo: linkedInvoice?.invoiceNo || undefined,
        paymentDate,
        amount: Number(amount),
        paymentMethod,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined
      });

      // Confetti celebration for collection!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Receive Payment & Issue Receipt</h3>
              <p className="text-xs text-slate-500">Record cash/online collection against customer balance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Party / Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={e => {
                setSelectedCustomerId(e.target.value);
                setSelectedInvoiceId('');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500 bg-white"
            >
              <option value="">Select party...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - Outstanding: {formatCurrency(c.currentOutstanding || 0)}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-slate-600">Total Customer Outstanding:</span>
              <span className={`font-bold text-sm ${(selectedCustomer.currentOutstanding || 0) > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {formatCurrency(selectedCustomer.currentOutstanding || 0)}
              </span>
            </div>
          )}

          {/* Against Specific Invoice Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apply to Specific Invoice (Optional)
            </label>
            <select
              value={selectedInvoiceId}
              onChange={e => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500 bg-white"
            >
              <option value="">General On-Account Payment</option>
              {customerUnpaidInvoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNo} (Due: {formatCurrency(inv.balanceDue)} on {formatDate(inv.invoiceDate)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Received (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-bold text-emerald-700 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method & Ref / UTR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / UTR / Chq #</label>
              <input
                type="text"
                placeholder="e.g. UTR1234567890"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Receipt Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Receipt Number</label>
              <input
                type="text"
                value={receiptNo}
                onChange={e => setReceiptNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-700 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Optional remark"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Processing...' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
