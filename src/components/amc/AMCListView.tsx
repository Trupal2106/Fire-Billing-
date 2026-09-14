import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  Award,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import { AmcContract, CompanySettings, Customer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateAmcContractPDF } from '../../utils/pdfGenerator';
import { exportAmcToExcel } from '../../utils/excelExporter';
import { sendAmcReminderOnWhatsApp } from '../../utils/whatsappHelper';

interface AMCListViewProps {
  contracts: AmcContract[];
  customers: Customer[];
  companySettings: CompanySettings;
  onNewContract: () => void;
  onEditContract: (contract: AmcContract) => void;
  onDeleteContract: (contract: AmcContract) => void;
}

export const AMCListView: React.FC<AMCListViewProps> = ({
  contracts,
  customers,
  companySettings,
  onNewContract,
  onEditContract,
  onDeleteContract
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  const now = new Date();

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch =
        c.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.siteAddress && c.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      const days = getDaysRemaining(c.endDate);
      if (statusFilter === 'active' && days < 0) return false;
      if (statusFilter === 'expiring' && (days < 0 || days > 30)) return false;
      if (statusFilter === 'expired' && days >= 0) return false;

      return true;
    });
  }, [contracts, searchTerm, statusFilter]);

  const activeCount = contracts.filter(c => getDaysRemaining(c.endDate) >= 0).length;
  const expiringCount = contracts.filter(c => {
    const d = getDaysRemaining(c.endDate);
    return d >= 0 && d <= 30;
  }).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            AMC & Maintenance Contracts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage annual maintenance agreements, visit schedules & issue fire safety compliance certificates
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportAmcToExcel(filteredContracts, `AMC_Agreements_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="Export AMC to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={onNewContract}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New AMC Agreement</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active AMC Contracts</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeCount}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Expiring in 30 Days</span>
          <div className={`text-xl font-bold mt-1 ${expiringCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {expiringCount}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Contract Value</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(contracts.reduce((sum, c) => sum + c.totalAmount, 0))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search AMC #, client name or site location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(['all', 'active', 'expiring', 'expired'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'expiring' ? 'Expiring Soon' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No AMC contracts found</p>
            <p className="text-xs text-slate-400 mt-1">Create an annual fire maintenance contract for a client</p>
            <button
              onClick={onNewContract}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create AMC</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredContracts.map(c => {
              const daysLeft = getDaysRemaining(c.endDate);
              const isExpired = daysLeft < 0;
              const isExpiringSoon = daysLeft >= 0 && daysLeft <= 30;

              const completedVisits = (c.schedules || []).filter(v => v.status === 'Completed').length;
              const totalVisits = (c.schedules || []).length;
              const cust = customers.find(cust => cust.id === c.customerId);

              return (
                <div
                  key={c.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{c.contractNo}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          isExpired
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isExpiringSoon
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : isExpiringSoon ? `${daysLeft} days left` : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{c.customerName}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        Site: {c.siteAddress}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Duration: {formatDate(c.startDate)} to {formatDate(c.endDate)} • Frequency: {c.serviceFrequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-left lg:text-right shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Annual Value</span>
                      <span className="text-sm font-bold text-slate-900 block">{formatCurrency(c.totalAmount)}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Visits Done: {completedVisits} / {totalVisits}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const nextVisit = c.schedules?.find(s => s.status !== 'Completed') || c.schedules?.[0];
                          sendAmcReminderOnWhatsApp(
                            c,
                            nextVisit?.periodName || 'Scheduled Maintenance',
                            nextVisit?.scheduledDate || c.startDate,
                            companySettings
                          );
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Send WhatsApp Service Reminder"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </button>

                      <button
                        onClick={() => generateAmcContractPDF(c, cust || ({} as any), companySettings)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                        title="Download AMC Compliance Certificate PDF"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Certificate</span>
                      </button>

                      <button
                        onClick={() => onEditContract(c)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Contract"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteContract(c)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Contract"
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
