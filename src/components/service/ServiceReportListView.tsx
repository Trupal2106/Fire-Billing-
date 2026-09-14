import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Download,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { ServiceReport, CompanySettings, Customer } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { generateServiceReportPDF } from '../../utils/pdfGenerator';

interface ServiceReportListViewProps {
  reports: ServiceReport[];
  customers: Customer[];
  companySettings: CompanySettings;
  onNewReport: () => void;
  onDeleteReport: (report: ServiceReport) => void;
}

export const ServiceReportListView: React.FC<ServiceReportListViewProps> = ({
  reports = [],
  customers = [],
  companySettings,
  onNewReport,
  onDeleteReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const safeReports = Array.isArray(reports) ? reports : [];

  const filteredReports = useMemo(() => {
    return safeReports.filter(r => {
      const q = (searchTerm || '').toLowerCase();
      return (
        (r.reportNo || '').toLowerCase().includes(q) ||
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.siteAddress && r.siteAddress.toLowerCase().includes(q)) ||
        (r.technicianName || '').toLowerCase().includes(q) ||
        (r.equipmentType || '').toLowerCase().includes(q)
      );
    });
  }, [safeReports, searchTerm]);

  const totalBillable = useMemo(() => {
    return safeReports.reduce((sum, r) => sum + (Number(r.totalBillable) || 0), 0);
  }, [safeReports]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Service & Inspection Reports
            </h1>
            <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
              {safeReports.length} {safeReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fire safety field inspection sheets, pressure test certifications & refilling records
          </p>
        </div>

        <button
          onClick={onNewReport}
          className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Service Report</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Inspections Conducted</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{safeReports.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Service & Spares Value</span>
          <div className="text-xl font-bold text-purple-600 mt-1">
            {formatCurrency(totalBillable)}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Compliance Standard</span>
          <div className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>IS 2190:2010 / NBC 2016</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search report #, customer, technician or equipment..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No service reports recorded</p>
            <p className="text-xs text-slate-400 mt-1">Create an extinguisher inspection or maintenance checklist</p>
            <button
              onClick={onNewReport}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Report</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map(rep => {
              const materials = Array.isArray(rep.materialsUsed) ? rep.materialsUsed : [];

              return (
                <div
                  key={rep.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{rep.reportNo}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rep.status || 'Completed'}
                        </span>
                        {rep.totalBillable ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {formatCurrency(rep.totalBillable)}
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-slate-800 font-semibold truncate">{rep.customerName}</p>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500">
                        {rep.siteAddress && <span>Site: <strong className="text-slate-700">{rep.siteAddress}</strong></span>}
                        {rep.technicianName && (
                          <span>Tech: <strong className="text-slate-700">{rep.technicianName}</strong></span>
                        )}
                        {rep.date && <span>Date: {formatDate(rep.date)}</span>}
                      </div>

                      {rep.equipmentType && (
                        <p className="text-[11px] text-purple-700 font-medium">
                          Equipment: {rep.equipmentType} {rep.equipmentSerialNo ? `(S/N: ${rep.equipmentSerialNo})` : ''}
                        </p>
                      )}

                      {rep.findings && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1.5">
                          <strong className="text-slate-700">Findings: </strong>{rep.findings}
                        </p>
                      )}

                      {materials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[10px] text-slate-400 font-medium self-center">Parts Used:</span>
                          {materials.map((m, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {m.item} ({m.qty} nos)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => generateServiceReportPDF(rep, companySettings)}
                      className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download PDF Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => onDeleteReport(rep)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
