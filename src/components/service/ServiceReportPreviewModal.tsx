import React from 'react';
import {
  X,
  Printer,
  Download,
  Wrench,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  User,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { ServiceReport, CompanySettings } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { generateServiceReportPDF } from '../../utils/pdfGenerator';

interface ServiceReportPreviewModalProps {
  isOpen: boolean;
  report: ServiceReport | null;
  companySettings: CompanySettings;
  onClose: () => void;
}

export const ServiceReportPreviewModal: React.FC<ServiceReportPreviewModalProps> = ({
  isOpen,
  report,
  companySettings,
  onClose
}) => {
  if (!isOpen || !report) return null;

  const materials = Array.isArray(report.materialsUsed) ? report.materialsUsed : [];
  const materialsTotal = materials.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const labourCharge = Number(report.labourCharge) || 0;
  const totalAmount = Number(report.totalBillable) || (materialsTotal + labourCharge);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    generateServiceReportPDF(report, companySettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Service Report Preview</span>
                <span className="text-[11px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-mono">
                  {report.reportNo}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Official Fire Safety Inspection Sheet & Testing Certificate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 print:bg-white print:p-0">
          <div className="bg-white max-w-3xl mx-auto p-8 sm:p-10 rounded-xl shadow-xs border border-slate-200 print:border-0 print:shadow-none space-y-6 text-slate-800">
            {/* Header / Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-purple-600">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2.5">
                  {companySettings.logo ? (
                    <img
                      src={companySettings.logo}
                      alt={companySettings.companyName}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                      FS
                    </div>
                  )}
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {companySettings.companyName || 'FIRE CARE SAFETY SOLUTION'}
                  </h1>
                </div>
                <p className="text-xs text-slate-600">
                  {companySettings.tagline || 'Fire Protection, Extinguishers, Hydrant & Safety Solutions'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {companySettings.address}, {companySettings.city}, {companySettings.state} - {companySettings.pinCode || companySettings.pincode}
                </p>
                <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500 pt-0.5">
                  <span>Phone: <strong className="text-slate-700">{companySettings.phone || companySettings.mobile}</strong></span>
                  {companySettings.email && <span>Email: <strong className="text-slate-700">{companySettings.email}</strong></span>}
                  {companySettings.gstin && <span>GSTIN: <strong className="text-slate-700 font-mono">{companySettings.gstin}</strong></span>}
                </div>
              </div>

              <div className="text-right sm:self-center bg-purple-50 p-3.5 rounded-xl border border-purple-100 min-w-[200px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  SERVICE INSPECTION REPORT
                </span>
                <p className="text-base font-black text-purple-900 font-mono mt-0.5">
                  {report.reportNo}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Date: <strong className="text-slate-800">{formatDate(report.date)}</strong>
                </p>
                <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IS 2190:2010 Standard</span>
                </div>
              </div>
            </div>

            {/* Customer & Technician Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer & Site Details</span>
                <p className="font-bold text-slate-900 text-sm">{report.customerName}</p>
                <p className="text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{report.siteAddress || 'Registered Office / Factory premises'}</span>
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Lead Inspection Engineer</span>
                <p className="font-bold text-slate-900 text-sm">{report.technicianName || 'Certified Engineer'}</p>
                {report.technicianPhone && (
                  <p className="text-slate-600 flex items-center sm:justify-end gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.technicianPhone}</span>
                  </p>
                )}
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {report.status || 'Completed'}
                </span>
              </div>
            </div>

            {/* Equipment Under Service */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-purple-600" />
                <span>Equipment Inspected</span>
              </h3>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-500">Equipment Type: </span>
                  <strong className="text-slate-900">{report.equipmentType || 'Fire Safety Extinguishers / Panel'}</strong>
                </div>
                {report.equipmentSerialNo && (
                  <div>
                    <span className="text-slate-500">Serial / Asset Tag: </span>
                    <strong className="text-slate-900 font-mono">{report.equipmentSerialNo}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Checklist & Findings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Inspection Scope & Engineering Findings
              </h3>

              {report.inspectionDetails && (
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Scope of Inspection:</span>
                  <p className="text-slate-600 whitespace-pre-line">{report.inspectionDetails}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {report.findings && (
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Findings & Good Condition:</span>
                    </span>
                    <p className="text-slate-700 whitespace-pre-line">{report.findings}</p>
                  </div>
                )}

                {report.defects && (
                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Defects / Observations:</span>
                    </span>
                    <p className="text-slate-700 whitespace-pre-line">{report.defects}</p>
                  </div>
                )}
              </div>

              {report.recommendedAction && (
                <div className="text-xs bg-purple-50/60 p-3 rounded-lg border border-purple-100">
                  <span className="font-bold text-purple-900 block mb-0.5">Corrective Action Taken & Recommendations:</span>
                  <p className="text-slate-700 whitespace-pre-line">{report.recommendedAction}</p>
                </div>
              )}
            </div>

            {/* Spares & Parts Replaced Table */}
            {materials.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Parts & Consumables Supplied
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Description of Spare / Material</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Rate</th>
                        <th className="py-2 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {materials.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{m.item}</td>
                          <td className="py-2 px-3 text-center font-mono">{m.qty}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatCurrency(m.rate)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatCurrency(m.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                {materials.length > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Parts & Spares:</span>
                    <span className="font-mono font-semibold">{formatCurrency(materialsTotal)}</span>
                  </div>
                )}
                {labourCharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Service & Labour:</span>
                    <span className="font-mono font-semibold">{formatCurrency(labourCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Billable:</span>
                  <span className="font-mono text-purple-700">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Customer Remarks */}
            {report.customerRemarks && (
              <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Client Feedback & Remarks:</span>
                <p className="text-slate-600 italic">"{report.customerRemarks}"</p>
              </div>
            )}

            {/* Signatures & Stamps */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div className="text-left space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Acceptance</span>
                <div className="h-14 flex items-end">
                  <p className="font-semibold text-xs text-slate-800 border-b border-slate-300 pb-1 w-48">
                    {report.customerSignatureName || report.customerName}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400">Client Authorized Signature & Site Stamp</p>
              </div>

              <div className="text-right space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">For {companySettings.companyName}</span>
                <div className="h-14 flex items-end justify-end">
                  {companySettings.signature ? (
                    <img
                      src={companySettings.signature}
                      alt="Signature"
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <p className="font-bold text-xs text-purple-900 border-b border-slate-300 pb-1 w-48 text-right">
                      {report.technicianSignatureName || report.technicianName || 'Authorized Engineer'}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Certified Fire Safety Inspector</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
