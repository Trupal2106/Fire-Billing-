import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Users,
  Calculator,
  Sliders,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
  FileText,
  Building2,
  Phone,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Percent,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import { db } from '../../db/db';
import { StaffMember, AttendanceRecord, PublicHoliday, PayrollConfig, CompanySettings } from '../../types';
import { calculateStaffSalary, SalaryBreakup, DEFAULT_PAYROLL_CONFIG, DEFAULT_PUBLIC_HOLIDAYS_2026 } from '../../utils/indianPayroll';
import { StaffModal } from './StaffModal';
import { HolidayModal } from './HolidayModal';
import { PayrollCustomizeModal } from './PayrollCustomizeModal';
import { PaySlipModal } from './PaySlipModal';

interface StaffPayrollViewProps {
  companySettings: CompanySettings;
}

export const StaffPayrollView: React.FC<StaffPayrollViewProps> = ({ companySettings }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'calendar' | 'payroll' | 'staff'>('payroll');
  
  // Data State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [payrollConfig, setPayrollConfig] = useState<PayrollConfig>(DEFAULT_PAYROLL_CONFIG);
  const [loading, setLoading] = useState(true);

  // Filter & Selected Date / Month
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [paySlipBreakup, setPaySlipBreakup] = useState<{ breakup: SalaryBreakup; staff: StaffMember } | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, attData, holData, configData] = await Promise.all([
        db.staff.toArray(),
        db.attendance.toArray(),
        db.holidays.toArray(),
        db.payrollConfig.get('default')
      ]);

      setStaffList(staffData);
      setAttendanceRecords(attData);
      setHolidays(holData.length > 0 ? holData : DEFAULT_PUBLIC_HOLIDAYS_2026);
      if (configData) {
        setPayrollConfig(configData);
      }
    } catch (err) {
      console.error('Error loading staff & payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Staff
  const handleSaveStaff = async (staffMember: StaffMember) => {
    await db.staff.put(staffMember);
    await loadData();
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      await db.staff.delete(id);
      await loadData();
    }
  };

  // Save Holiday
  const handleAddHoliday = async (newHol: PublicHoliday) => {
    await db.holidays.put(newHol);
    await loadData();
  };

  const handleDeleteHoliday = async (id: string) => {
    await db.holidays.delete(id);
    await loadData();
  };

  // Save Config
  const handleSaveConfig = async (newConfig: PayrollConfig) => {
    await db.payrollConfig.put({ id: 'default', ...newConfig });
    setPayrollConfig(newConfig);
  };

  // Attendance Handlers
  const handleSetAttendanceStatus = async (
    staffId: string,
    status: 'Present' | 'Absent' | 'Half Day' | 'Paid Leave',
    overtimeHours?: number
  ) => {
    const staffObj = staffList.find(s => s.id === staffId);
    const existing = attendanceRecords.find(r => r.staffId === staffId && r.date === selectedDate);
    const updatedRecord: AttendanceRecord = {
      id: existing?.id || `att_${staffId}_${selectedDate}`,
      staffId,
      staffName: staffObj?.name || existing?.staffName || 'Staff Member',
      date: selectedDate,
      status,
      overtimeHours: overtimeHours !== undefined ? overtimeHours : existing?.overtimeHours || 0
    };

    await db.attendance.put(updatedRecord);
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.staffId === staffId && r.date === selectedDate));
      return [...filtered, updatedRecord];
    });
  };

  const handleMarkAllPresent = async () => {
    const activeStaff = staffList.filter(s => s.status === 'Active');
    const recordsToPut: AttendanceRecord[] = activeStaff.map(s => {
      const existing = attendanceRecords.find(r => r.staffId === s.id && r.date === selectedDate);
      return {
        id: existing?.id || `att_${s.id}_${selectedDate}`,
        staffId: s.id,
        staffName: s.name,
        date: selectedDate,
        status: 'Present' as const,
        overtimeHours: existing?.overtimeHours || 0
      };
    });

    await db.attendance.bulkPut(recordsToPut);
    await loadData();
  };

  // Compute Calculations for the selected month
  const activeStaff = staffList.filter(s => s.status === 'Active');
  const salaryBreakups = activeStaff.map(s =>
    calculateStaffSalary(s, attendanceRecords, selectedMonth, payrollConfig, holidays)
  );

  const totalGrossPoured = salaryBreakups.reduce((sum, b) => sum + b.totalEarnings, 0);
  const totalNetSalaryPoured = salaryBreakups.reduce((sum, b) => sum + b.netSalary, 0);
  const totalPfPoured = salaryBreakups.reduce((sum, b) => sum + b.pfEmployee + b.pfEmployer, 0);
  const totalEsiPoured = salaryBreakups.reduce((sum, b) => sum + b.esiEmployee + b.esiEmployer, 0);
  const totalGstPoured = salaryBreakups.reduce((sum, b) => sum + b.gstAmount, 0);

  // Calendar calculations
  const [calYear, calMonth] = selectedMonth.split('-').map(Number);
  const daysInCalMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay(); // 0 = Sun

  const monthHolidays = holidays.filter(h => h.date.startsWith(selectedMonth));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Staff, Calendar & Indian Payroll</h1>
              <p className="text-xs text-slate-500">
                Staff attendance, Indian public holidays calendar & statutory PF, ESI, PT, GST calculations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Customize PF, ESI & GST Rules</span>
          </button>

          <button
            onClick={() => {
              setStaffToEdit(null);
              setIsStaffModalOpen(true);
            }}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-red-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Active Staff</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{activeStaff.length} Employees</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{staffList.length} registered on rolls</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Net In-Hand Salary</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            ₹ {totalNetSalaryPoured.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">For month {selectedMonth}</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">EPFO PF (12% + 12%)</span>
          <span className="text-xl font-black text-blue-700 mt-1 block">
            ₹ {totalPfPoured.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Statutory EPF & EPS fund</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">ESIC (0.75% + 3.25%)</span>
          <span className="text-xl font-black text-indigo-700 mt-1 block">
            ₹ {totalEsiPoured.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Medical insurance fund</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Manpower Invoicing GST</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">
            ₹ {totalGstPoured.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">18% GST on client supply</span>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Indian Salary & PF/ESI/GST Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Daily Staff Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Public Holidays Calendar ({monthHolidays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({staffList.length})</span>
          </button>
        </div>

        {/* Month Selector for Calculations & Calendar */}
        <div className="flex items-center gap-2 py-1 shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Payroll Period:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* TAB 1: SALARY & STATUTORY CALCULATOR */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-700 rounded-xl font-bold">
                Indian Statutory Slabs Active:
              </div>
              <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                  EPF: {payrollConfig.pfEmployeeRate}% Emp + {payrollConfig.pfEmployerRate}% Co (Cap: ₹{payrollConfig.pfWageCeiling.toLocaleString('en-IN')})
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                  ESI: {payrollConfig.esiEmployeeRate}% Emp + {payrollConfig.esiEmployerRate}% Co (Limit: ₹{payrollConfig.esiGrossLimit.toLocaleString('en-IN')})
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                  PT: ₹{payrollConfig.ptAmount}/mo
                </span>
                <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md font-mono font-bold">
                  GST Manpower: {payrollConfig.gstRate}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCustomizeModalOpen(true)}
              className="text-red-700 hover:text-red-800 font-bold underline cursor-pointer shrink-0"
            >
              Modify Rule Percentages
            </button>
          </div>

          {/* Salary Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-4">Staff / Designation</th>
                    <th className="py-3 px-3">Payable Days</th>
                    <th className="py-3 px-3">Gross Salary</th>
                    <th className="py-3 px-3">PF Deduct (12%)</th>
                    <th className="py-3 px-3">ESI Deduct (0.75%)</th>
                    <th className="py-3 px-3">PT (Gujarat)</th>
                    <th className="py-3 px-3 font-extrabold text-emerald-800">Net Take-Home</th>
                    <th className="py-3 px-3">Total CTC (Co)</th>
                    <th className="py-3 px-3 text-purple-800">GST (18% Manpower)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {salaryBreakups.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No active staff members found. Add staff to calculate payroll.
                      </td>
                    </tr>
                  ) : (
                    salaryBreakups.map(breakup => {
                      const staff = staffList.find(s => s.id === breakup.staffId);
                      return (
                        <tr key={breakup.staffId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block text-xs">{breakup.staffName}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {breakup.designation} • {breakup.department}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 font-mono">
                              {breakup.payableDays} / {breakup.totalDaysInMonth}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {breakup.presentDays}P + {breakup.paidLeaveDays}L + {breakup.holidaysCount}H
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            ₹ {breakup.totalEarnings.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-blue-700">
                            ₹ {breakup.pfEmployee.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-indigo-700">
                            ₹ {breakup.esiEmployee.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            ₹ {breakup.pt}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm bg-emerald-50/40">
                            ₹ {breakup.netSalary.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-800">
                            ₹ {breakup.totalCtc.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-purple-700 font-semibold">
                            {breakup.isGstApplicable ? `₹ ${breakup.gstAmount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {staff && (
                              <button
                                onClick={() => setPaySlipBreakup({ breakup, staff })}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 ml-auto cursor-pointer transition-colors border border-red-200"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Pay Slip</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY STAFF ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700">Attendance Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Active Present</span>
              </button>
            </div>
          </div>

          {/* Attendance List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3">Designation / Phone</th>
                    <th className="py-3 px-3">Status for {selectedDate}</th>
                    <th className="py-3 px-3">Quick Mark Actions</th>
                    <th className="py-3 px-4">Overtime Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeStaff.map(staff => {
                    const record = attendanceRecords.find(
                      r => r.staffId === staff.id && r.date === selectedDate
                    );
                    const status = record?.status || 'Present'; // default present
                    const otHours = record?.overtimeHours || 0;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {staff.name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {staff.designation} • {staff.phone}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'Half Day'
                                ? 'bg-amber-100 text-amber-800'
                                : status === 'Paid Leave'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleSetAttendanceStatus(staff.id, 'Present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                status === 'Present'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleSetAttendanceStatus(staff.id, 'Half Day')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                status === 'Half Day'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              Half Day
                            </button>
                            <button
                              onClick={() => handleSetAttendanceStatus(staff.id, 'Paid Leave')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                status === 'Paid Leave'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              Paid Leave
                            </button>
                            <button
                              onClick={() => handleSetAttendanceStatus(staff.id, 'Absent')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                status === 'Absent'
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={otHours}
                              onChange={e =>
                                handleSetAttendanceStatus(
                                  staff.id,
                                  status,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold font-mono"
                            />
                            <span className="text-[11px] text-slate-500">hrs OT</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR & PUBLIC HOLIDAYS */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Indian Public & Company Holidays Calendar ({selectedMonth})
              </h2>
              <p className="text-xs text-slate-500">
                Official Gazetted, National and Company holidays accounted for in monthly payable days
              </p>
            </div>

            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Holiday</span>
            </button>
          </div>

          {/* Calendar Grid View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-2">
              <span className="text-rose-600">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Padding empty slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 bg-slate-50/50 rounded-xl border border-slate-100"></div>
              ))}

              {/* Day Cells */}
              {Array.from({ length: daysInCalMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
                const dayOfWeek = new Date(calYear, calMonth - 1, dayNum).getDay();
                const isSunday = dayOfWeek === 0;
                const holidayOnDay = holidays.find(h => h.date === dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setActiveTab('attendance');
                    }}
                    className={`h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer hover:border-red-400 ${
                      holidayOnDay
                        ? 'bg-red-50/60 border-red-200'
                        : isSunday
                        ? 'bg-rose-50/30 border-rose-100'
                        : isToday
                        ? 'bg-blue-50/50 border-blue-300'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold text-xs ${
                          isSunday ? 'text-rose-600' : isToday ? 'text-blue-600 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {dayNum} {isToday && '• Today'}
                      </span>
                      {isSunday && <span className="text-[9px] text-rose-500 font-semibold">Sunday</span>}
                    </div>

                    {holidayOnDay && (
                      <div className="mt-1 bg-white p-1 rounded-md border border-red-200 shadow-2xs">
                        <span className="font-bold text-[10px] text-red-700 line-clamp-2 leading-tight block">
                          {holidayOnDay.name}
                        </span>
                        <span className="text-[8px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-semibold inline-block mt-0.5">
                          {holidayOnDay.type}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Holidays in this Year */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-sm text-slate-900 mb-3">All Registered Indian Public Holidays</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {holidays.map(hol => (
                <div
                  key={hol.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{hol.name}</span>
                    <span className="font-mono text-[11px] text-red-600 font-semibold block">{hol.date}</span>
                    <span className="text-[10px] text-slate-500 block">{hol.description}</span>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        hol.type === 'National'
                          ? 'bg-blue-100 text-blue-800'
                          : hol.type === 'Gazetted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {hol.type} Holiday
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteHoliday(hol.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => {
                setStaffToEdit(null);
                setIsStaffModalOpen(true);
              }}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList
              .filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.phone.includes(searchQuery)
              )
              .map(staff => {
                const totalGross = staff.basicSalary + staff.da + staff.hra + staff.allowances;

                return (
                  <div
                    key={staff.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                        <span className="text-xs text-slate-500 block">
                          {staff.designation} • {staff.department}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.phone}</span>
                      </div>
                      {staff.email && (
                        <div className="text-[11px] text-slate-400">{staff.email}</div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500">Monthly Gross:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          ₹ {totalGross.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Statutory badges */}
                    <div className="flex items-center gap-1 flex-wrap pt-1 text-[9px] font-semibold">
                      {staff.pfApplicable && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">PF 12%</span>
                      )}
                      {staff.esiApplicable && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">ESI 0.75%</span>
                      )}
                      {staff.ptApplicable && (
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded">PT ₹200</span>
                      )}
                      {staff.gstApplicable && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">18% GST</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setStaffToEdit(staff);
                          setIsStaffModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="Edit staff details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete staff member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODALS */}
      {isStaffModalOpen && (
        <StaffModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          staffToEdit={staffToEdit}
          onSaveStaff={handleSaveStaff}
        />
      )}

      {isHolidayModalOpen && (
        <HolidayModal
          isOpen={isHolidayModalOpen}
          onClose={() => setIsHolidayModalOpen(false)}
          onAddHoliday={handleAddHoliday}
        />
      )}

      {isCustomizeModalOpen && (
        <PayrollCustomizeModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
          config={payrollConfig}
          onSaveConfig={handleSaveConfig}
        />
      )}

      {paySlipBreakup && (
        <PaySlipModal
          isOpen={!!paySlipBreakup}
          onClose={() => setPaySlipBreakup(null)}
          breakup={paySlipBreakup.breakup}
          staff={paySlipBreakup.staff}
          companySettings={companySettings}
        />
      )}
    </div>
  );
};
