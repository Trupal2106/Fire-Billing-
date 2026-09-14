import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Filter,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import { PaymentReceipt, CompanySettings, Customer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generatePaymentReceiptPDF } from '../../utils/pdfGenerator';
import { exportPaymentsToExcel } from '../../utils/excelExporter';
import { sendPaymentReceiptOnWhatsApp } from '../../utils/whatsappHelper';

interface PaymentListViewProps {
  payments: PaymentReceipt[];
  customers: Customer[];
  companySettings: CompanySettings;
  onNewPayment: () => void;
  onDeletePayment: (payment: PaymentReceipt) => void;
}

export const PaymentListView: React.FC<PaymentListViewProps> = ({
  payments,
  customers,
  companySettings,
  onNewPayment,
  onDeletePayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch =
        p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.referenceNo && p.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;
      return true;
    });
  }, [payments, searchTerm, methodFilter]);

  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Payments Received & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log inward payments, Bank Transfer/UPI collections, and download official payment receipts
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportPaymentsToExcel(filteredPayments, `Payments_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="Export Payments to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={onNewPayment}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Receive Payment</span>
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Receipts Issued</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{payments.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Amount Collected</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalCollected)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Latest Payment Date</span>
          <div className="text-sm font-bold text-slate-800 mt-2">
            {payments && payments.length > 0 ? formatDate(payments[0].paymentDate) : 'No transactions'}
          </div>
        </div>
      </div>

      {/* Search & Method Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by receipt #, customer or UTR reference..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['all', 'Bank Transfer', 'UPI', 'Cash', 'Cheque'].map(m => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                methodFilter === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'all' ? 'All Modes' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No payment receipts found</p>
            <p className="text-xs text-slate-400 mt-1">Record a customer collection to generate a receipt</p>
            <button
              onClick={onNewPayment}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPayments.map(receipt => {
              const cust = customers.find(c => c.id === receipt.customerId);

              return (
                <div
                  key={receipt.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{receipt.receiptNo}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {receipt.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{receipt.customerName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Date: {formatDate(receipt.paymentDate)}
                        {receipt.referenceNo && ` • Ref/UTR: ${receipt.referenceNo}`}
                        {receipt.invoiceNo && ` • Inv: ${receipt.invoiceNo}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-left md:text-right shrink-0">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Received Amount</span>
                      <span className="text-base font-bold text-emerald-600 block">{formatCurrency(receipt.amount)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => sendPaymentReceiptOnWhatsApp(receipt, companySettings, cust?.mobile)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Send Receipt on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </button>

                      <button
                        onClick={() => generatePaymentReceiptPDF(receipt, cust || ({} as any), companySettings)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeletePayment(receipt)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
