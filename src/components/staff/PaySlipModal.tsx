import React from 'react';
import { X, Printer, Download, Building2, User, FileText } from 'lucide-react';
import { SalaryBreakup } from '../../utils/indianPayroll';
import { CompanySettings, StaffMember } from '../../types';
import { numberToIndianWords } from '../../utils/formatters';

interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakup: SalaryBreakup;
  staff: StaffMember;
  companySettings: CompanySettings;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  isOpen,
  onClose,
  breakup,
  staff,
  companySettings
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const compName = (companySettings.companyName || 'FIRE CARE SAFETY SOLUTION').toUpperCase();
  const compAddress = `${companySettings.address || ''}, ${companySettings.city || ''}, ${companySettings.state || ''} - ${companySettings.pinCode || companySettings.pincode || ''}`;
  const amountWords = numberToIndianWords(breakup.netSalary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8">
        {/* Top Modal Controls */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileText className="w-4 h-4 text-red-600" />
            <span>Salary Pay Slip - {breakup.month}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pay Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Canvas */}
        <div className="p-8 space-y-6 text-xs text-slate-900 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{compName}</h2>
              <p className="text-[11px] text-slate-600 max-w-md">{compAddress}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                GSTIN: {companySettings.gstin || '24AAAFP1234F1Z8'} • PAN: {companySettings.pan || 'AAAFP1234F'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                PAY SLIP
              </span>
              <p className="text-xs font-bold text-slate-800 mt-1">For Month: {breakup.month}</p>
            </div>
          </div>

          {/* Employee & Attendance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">Employee Name:</span>
              <span className="font-bold text-slate-900 text-xs">{staff.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Designation:</span>
              <span className="font-semibold text-slate-900">{staff.designation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Department:</span>
              <span className="font-semibold text-slate-900">{staff.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date of Joining:</span>
              <span className="font-mono text-slate-900">{staff.joiningDate}</span>
            </div>

            <div>
              <span className="text-slate-500 block">PAN Number:</span>
              <span className="font-mono font-bold text-slate-900">{staff.pan || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">EPFO UAN:</span>
              <span className="font-mono text-slate-900">{staff.uan || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ESIC IP No:</span>
              <span className="font-mono text-slate-900">{staff.esiIpNumber || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Bank Account:</span>
              <span className="font-mono text-slate-900">
                {staff.accountNumber ? `••••${staff.accountNumber.slice(-4)}` : '-'}
              </span>
            </div>
          </div>

          {/* Days Summary */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] p-2 bg-slate-100/70 rounded-lg">
            <div>
              <span className="text-slate-500 block">Total Month Days</span>
              <span className="font-bold text-slate-800">{breakup.totalDaysInMonth}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Present Days</span>
              <span className="font-bold text-emerald-700">{breakup.presentDays}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Leaves / Holidays</span>
              <span className="font-bold text-blue-700">{breakup.paidLeaveDays + breakup.holidaysCount}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payable Days</span>
              <span className="font-bold text-red-700">{breakup.payableDays}</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                <span>Earnings Description</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-mono font-semibold">₹ {breakup.basicSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">Dearness Allowance (DA)</span>
                  <span className="font-mono font-semibold">₹ {breakup.da.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold">₹ {breakup.hra.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">Special / Other Allowances</span>
                  <span className="font-mono font-semibold">₹ {breakup.allowances.toLocaleString('en-IN')}</span>
                </div>
                {breakup.overtimePay > 0 && (
                  <div className="px-3 py-1.5 flex justify-between text-emerald-700">
                    <span>Overtime Pay</span>
                    <span className="font-mono font-semibold">₹ {breakup.overtimePay.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="px-3 py-2 bg-slate-50 flex justify-between font-bold text-slate-900">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-emerald-700">₹ {breakup.totalEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                <span>Statutory Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">Provident Fund (EPF 12%)</span>
                  <span className="font-mono font-semibold">₹ {breakup.pfEmployee.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">Employee State Insurance (ESI 0.75%)</span>
                  <span className="font-mono font-semibold">₹ {breakup.esiEmployee.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-mono font-semibold">₹ {breakup.pt.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between text-slate-400">
                  <span>TDS / Income Tax</span>
                  <span className="font-mono">₹ 0</span>
                </div>
                <div className="px-3 py-2 bg-slate-50 flex justify-between font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-600">₹ {breakup.totalDeductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Net Take-Home Salary</span>
              <p className="text-[11px] text-emerald-700 italic mt-0.5">{amountWords}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-900 font-mono">
                ₹ {breakup.netSalary.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Employer Contributions & CTC (Informational) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-slate-500">Employer PF (12%): </span>
              <span className="font-mono font-bold">₹ {breakup.pfEmployer}</span>
            </div>
            <div>
              <span className="text-slate-500">Employer ESI (3.25%): </span>
              <span className="font-mono font-bold">₹ {breakup.esiEmployer}</span>
            </div>
            <div>
              <span className="text-slate-500">Total CTC (Cost to Company): </span>
              <span className="font-mono font-bold text-slate-900">₹ {breakup.totalCtc.toLocaleString('en-IN')}</span>
            </div>
            {breakup.isGstApplicable && (
              <div className="text-purple-700">
                <span>Manpower Billing (+{breakup.gstRate}% GST): </span>
                <span className="font-mono font-bold">₹ {breakup.clientInvoiceTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-8 flex justify-between items-end text-center">
            <div className="space-y-1">
              <div className="w-36 border-b border-slate-400"></div>
              <p className="text-[10px] text-slate-500 font-semibold">Employee Signature</p>
            </div>

            <div className="space-y-1 flex flex-col items-center">
              {companySettings.signature ? (
                <div className="w-24 h-14 mb-1">
                  <img src={companySettings.signature} alt="Sign & Stamp" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-36 border-b border-slate-400"></div>
              )}
              <p className="text-[10px] font-bold text-slate-800 uppercase">
                Authorised Signatory
              </p>
              <p className="text-[9px] text-slate-500">{compName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
