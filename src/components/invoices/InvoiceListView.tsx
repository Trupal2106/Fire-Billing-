import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Download,
  Eye,
  CreditCard,
  Filter,
  Calendar,
  Building2,
  AlertCircle,
  FileSpreadsheet,
  MessageSquare,
  QrCode,
  Edit2,
  Palette,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Invoice, CompanySettings } from '../../types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { exportInvoicesToExcel } from '../../utils/excelExporter';
import { sendInvoiceOnWhatsApp } from '../../utils/whatsappHelper';
import { UpiQrModal } from '../modals/UpiQrModal';

interface InvoiceListViewProps {
  invoices: Invoice[];
  companySettings: CompanySettings;
  onNewInvoice: () => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPaymentForInvoice: (invoice: Invoice) => void;
  onCustomizeInvoice?: () => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  companySettings,
  onNewInvoice,
  onEditInvoice,
  onViewInvoice,
  onRecordPaymentForInvoice,
  onCustomizeInvoice,
  onDeleteInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid' | 'cancelled'>('all');
  const [selectedQrInvoice, setSelectedQrInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch =
        inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceDate.includes(searchTerm);

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      return true;
    });
  }, [invoices, searchTerm, statusFilter]);

  const totalBilled = useMemo(() => {
    return invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }, [invoices]);

  const totalDue = useMemo(() => {
    return invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.balanceDue || 0), 0);
  }, [invoices]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            GST Tax Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, track, and generate GST-compliant billing invoices
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onCustomizeInvoice && (
            <button
              type="button"
              onClick={onCustomizeInvoice}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              title="Customize Bill & Invoice Design"
            >
              <Palette className="w-4 h-4 text-red-600" />
              <span>Customize Invoice</span>
            </button>
          )}

          <button
            onClick={() => exportInvoicesToExcel(filteredInvoices, `Invoices_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="Export Invoices to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={onNewInvoice}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create GST Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Invoices Issued</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{invoices.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Billed Amount</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalBilled)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Unpaid Receivables</span>
          <div className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(totalDue)}</div>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name or date..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(['all', 'unpaid', 'partial', 'paid', 'cancelled'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No invoices match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search filter or generate a new invoice</p>
            <button
              onClick={onNewInvoice}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map(inv => (
              <div
                key={inv.id}
                onClick={() => onViewInvoice(inv)}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left: Invoice ID & Customer */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-50 text-slate-700 group-hover:text-red-600 flex items-center justify-center font-bold shrink-0 transition-colors">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                        {inv.invoiceNo}
                      </h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClasses(inv.status)}`}>
                        {inv.status.toUpperCase()}
                      </span>
                      {inv.isInterstate && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-50 text-purple-700">
                          IGST
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Date: {formatDate(inv.invoiceDate)} • Due: {formatDate(inv.dueDate)}
                    </p>
                  </div>
                </div>

                {/* Middle: Totals */}
                <div className="flex items-center gap-6 text-left md:text-right shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Amount</span>
                    <span className="text-sm font-bold text-slate-900 block">{formatCurrency(inv.grandTotal)}</span>
                    <span className="text-[10px] text-slate-400 block">{inv.items.length} items</span>
                  </div>

                  <div className="pl-4 border-l border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Balance Due</span>
                    <span className={`text-sm font-bold block ${inv.balanceDue > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {formatCurrency(inv.balanceDue)}
                    </span>
                    {inv.balanceDue > 0 ? (
                      <span className="text-[10px] text-orange-600 font-medium block">Unpaid</span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-medium block">Paid in Full</span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0" onClick={e => e.stopPropagation()}>
                  {inv.balanceDue > 0 && inv.status !== 'cancelled' && (
                    <button
                      onClick={() => onRecordPaymentForInvoice(inv)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay</span>
                    </button>
                  )}

                  <button
                    onClick={() => sendInvoiceOnWhatsApp(inv, companySettings)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Send on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => setSelectedQrInvoice(inv)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Scan & Pay UPI QR"
                  >
                    <QrCode className="w-4 h-4 text-red-600" />
                  </button>

                  <button
                    onClick={() => generateInvoicePDF(inv, companySettings)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Download Tax Invoice PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {onEditInvoice && inv.status !== 'cancelled' && (
                    <button
                      onClick={() => onEditInvoice(inv)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Invoice"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}

                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View Invoice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {onDeleteInvoice && (
                    <button
                      onClick={() => setInvoiceToDelete(inv)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Tax Invoice?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to permanently delete invoice <span className="font-bold text-slate-800">{invoiceToDelete.invoiceNo}</span>? This action cannot be reversed.
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{invoiceToDelete.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{formatDate(invoiceToDelete.invoiceDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Amount:</span>
                <span className="font-bold text-slate-900">{formatCurrency(invoiceToDelete.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance Due:</span>
                <span className={`font-semibold ${invoiceToDelete.balanceDue > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {formatCurrency(invoiceToDelete.balanceDue)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const toDel = invoiceToDelete;
                  setInvoiceToDelete(null);
                  if (onDeleteInvoice && toDel) {
                    onDeleteInvoice(toDel);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      <UpiQrModal
        isOpen={Boolean(selectedQrInvoice)}
        onClose={() => setSelectedQrInvoice(null)}
        invoice={selectedQrInvoice}
        companySettings={companySettings}
        onRecordPayment={(inv) => {
          setSelectedQrInvoice(null);
          onRecordPaymentForInvoice(inv);
        }}
      />
    </div>
  );
};
