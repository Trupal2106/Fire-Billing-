import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Download,
  ArrowRight,
  Receipt,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Edit2
} from 'lucide-react';
import { Quotation, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateQuotationPDF } from '../../utils/pdfGenerator';
import { sendQuotationOnWhatsApp } from '../../utils/whatsappHelper';

interface QuotationListViewProps {
  quotations: Quotation[];
  companySettings: CompanySettings;
  onNewQuotation: () => void;
  onEditQuotation: (quotation: Quotation) => void;
  onConvertToInvoice: (quotation: Quotation) => void;
}

export const QuotationListView: React.FC<QuotationListViewProps> = ({
  quotations,
  companySettings,
  onNewQuotation,
  onEditQuotation,
  onConvertToInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch =
        q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      return true;
    });
  }, [quotations, searchTerm, statusFilter]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Quotations & Estimates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prepare project proposals and convert them directly to GST Invoices
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Quotation</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search quotation # or client name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['all', 'draft', 'sent', 'accepted', 'converted'].map(st => (
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

      {/* Quotations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No quotations found</p>
            <p className="text-xs text-slate-400 mt-1">Create an estimate or quotation for a customer</p>
            <button
              onClick={onNewQuotation}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quotation</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuotations.map(qtn => (
              <div
                key={qtn.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{qtn.quotationNo}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 uppercase">
                        {qtn.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{qtn.customerName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Date: {formatDate(qtn.date)} • Valid Until: {formatDate(qtn.validUntil)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left md:text-right shrink-0">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Quoted Amount</span>
                    <span className="text-sm font-bold text-slate-900 block">{formatCurrency(qtn.grandTotal)}</span>
                    <span className="text-[10px] text-slate-400 block">{qtn.items.length} items</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onConvertToInvoice(qtn)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
                      title="Convert to GST Invoice"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Convert to Invoice</span>
                    </button>

                    <button
                      onClick={() => sendQuotationOnWhatsApp(qtn, companySettings)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Send Quotation on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    </button>

                    <button
                      onClick={() => generateQuotationPDF(qtn, companySettings)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download Quotation PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditQuotation(qtn)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Quotation"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
