import { StaffMember, AttendanceRecord, PublicHoliday, PayrollConfig } from '../types';

export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  pfEmployeeRate: 12, // 12%
  pfEmployerRate: 12, // 12%
  pfWageCeiling: 15000, // Rs. 15,000 cap
  usePfCeiling: true,
  esiEmployeeRate: 0.75, // 0.75%
  esiEmployerRate: 3.25, // 3.25%
  esiGrossLimit: 21000, // Rs. 21,000 gross limit
  ptAmount: 200, // Rs. 200/month PT
  gstRate: 18 // 18% GST on manpower/staffing services
};

export const DEFAULT_PUBLIC_HOLIDAYS_2026: PublicHoliday[] = [
  { id: 'hol_1', date: '2026-01-14', name: 'Makar Sankranti / Uttarayan', type: 'Gazetted', description: 'Kite Festival & Harvest' },
  { id: 'hol_2', date: '2026-01-26', name: 'Republic Day', type: 'National', description: 'National Holiday' },
  { id: 'hol_3', date: '2026-03-04', name: 'Holi (Dhuleti)', type: 'Gazetted', description: 'Festival of Colors' },
  { id: 'hol_4', date: '2026-03-21', name: 'Eid-ul-Fitr (Ramzan Id)', type: 'Gazetted', description: 'Islamic Festival' },
  { id: 'hol_5', date: '2026-04-03', name: 'Good Friday', type: 'Gazetted', description: 'Christian Observance' },
  { id: 'hol_6', date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti', type: 'Gazetted', description: 'National Leader Birthday' },
  { id: 'hol_7', date: '2026-05-01', name: 'Gujarat Gaurav Din / Labour Day', type: 'Gazetted', description: 'Statehood & May Day' },
  { id: 'hol_8', date: '2026-08-15', name: 'Independence Day', type: 'National', description: '79th Independence Day' },
  { id: 'hol_9', date: '2026-08-27', name: 'Raksha Bandhan', type: 'Restricted', description: 'Brother-Sister Festival' },
  { id: 'hol_10', date: '2026-09-04', name: 'Janmashtami (Krishna Jayanti)', type: 'Gazetted', description: 'Birth of Lord Krishna' },
  { id: 'hol_11', date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', type: 'National', description: 'Father of the Nation Birthday' },
  { id: 'hol_12', date: '2026-10-20', name: 'Dussehra (Vijayadashami)', type: 'Gazetted', description: 'Victory of Good over Evil' },
  { id: 'hol_13', date: '2026-11-08', name: 'Diwali (Deepawali)', type: 'Gazetted', description: 'Festival of Lights' },
  { id: 'hol_14', date: '2026-11-10', name: 'Bestu Varas (Gujarati New Year)', type: 'Company', description: 'Vikram Samvat New Year' },
  { id: 'hol_15', date: '2026-12-25', name: 'Christmas Day', type: 'Gazetted', description: 'Christmas Celebration' }
];

export interface SalaryBreakup {
  staffId: string;
  staffName: string;
  designation: string;
  department: string;
  month: string; // YYYY-MM
  totalDaysInMonth: number;
  presentDays: number;
  paidLeaveDays: number;
  holidaysCount: number;
  weeklyOffCount: number;
  absentDays: number;
  payableDays: number;

  // Earnings
  basicSalary: number;
  da: number;
  hra: number;
  allowances: number;
  grossSalaryMonthly: number;
  earnedGrossSalary: number;
  overtimePay: number;
  totalEarnings: number;

  // Statutory Deductions (Employee)
  pfWageBase: number;
  pfEmployee: number;
  esiWageBase: number;
  esiEmployee: number;
  pt: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net Take-Home
  netSalary: number;

  // Employer Contributions (CTC)
  pfEmployer: number;
  esiEmployer: number;
  totalEmployerContribution: number;
  totalCtc: number;

  // Manpower Invoicing with GST
  isGstApplicable: boolean;
  gstRate: number;
  gstAmount: number;
  clientInvoiceTotal: number;
}

export function calculateStaffSalary(
  staff: StaffMember,
  attendanceRecords: AttendanceRecord[],
  monthStr: string, // YYYY-MM
  config: PayrollConfig = DEFAULT_PAYROLL_CONFIG,
  publicHolidays: PublicHoliday[] = DEFAULT_PUBLIC_HOLIDAYS_2026
): SalaryBreakup {
  const [yearStr, mStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10) || 2026;
  const month = parseInt(mStr, 10) || 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  // Filter attendance for this staff and this month
  const monthPrefix = `${yearStr}-${mStr.padStart(2, '0')}`;
  const staffAttendance = attendanceRecords.filter(
    r => r.staffId === staff.id && r.date.startsWith(monthPrefix)
  );

  let presentCount = 0;
  let halfDayCount = 0;
  let paidLeaveCount = 0;
  let absentCount = 0;
  let overtimeHours = 0;

  staffAttendance.forEach(att => {
    if (att.status === 'Present') presentCount += 1;
    else if (att.status === 'Half Day') {
      presentCount += 0.5;
      halfDayCount += 1;
    } else if (att.status === 'Paid Leave') {
      paidLeaveCount += 1;
    } else if (att.status === 'Absent') {
      absentCount += 1;
    }
    overtimeHours += att.overtimeHours || 0;
  });

  // Calculate Sundays / Weekly Offs in month
  let weeklyOffCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() === 0) weeklyOffCount++; // Sunday
  }

  // Count holidays in this month
  const holidaysInMonth = publicHolidays.filter(h => h.date.startsWith(monthPrefix)).length;

  // If no attendance records logged at all, default to full month presence
  const hasAttendanceLogs = staffAttendance.length > 0;
  const payableDays = hasAttendanceLogs
    ? Math.min(daysInMonth, presentCount + paidLeaveCount + weeklyOffCount + holidaysInMonth)
    : daysInMonth;

  const attendanceRatio = daysInMonth > 0 ? payableDays / daysInMonth : 1;

  // Monthly Rates
  const monthlyBasic = staff.basicSalary || 0;
  const monthlyDa = staff.da || 0;
  const monthlyHra = staff.hra || 0;
  const monthlyAllowances = staff.allowances || 0;
  const grossSalaryMonthly = monthlyBasic + monthlyDa + monthlyHra + monthlyAllowances;

  // Earned amounts based on attendance
  const earnedBasic = Math.round(monthlyBasic * attendanceRatio);
  const earnedDa = Math.round(monthlyDa * attendanceRatio);
  const earnedHra = Math.round(monthlyHra * attendanceRatio);
  const earnedAllowances = Math.round(monthlyAllowances * attendanceRatio);
  const earnedGrossSalary = earnedBasic + earnedDa + earnedHra + earnedAllowances;

  // Overtime: hourly rate = (Basic + DA) / (26 days * 8 hours)
  const hourlyRate = (monthlyBasic + monthlyDa) / (26 * 8 || 208);
  const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5); // 1.5x OT

  const totalEarnings = earnedGrossSalary + overtimePay;

  // 1. PF Calculation (Indian EPFO Rules)
  // PF calculated on Basic + DA (Wage Base)
  let pfWageBase = earnedBasic + earnedDa;
  if (config.usePfCeiling && pfWageBase > config.pfWageCeiling) {
    pfWageBase = config.pfWageCeiling;
  }

  const pfEmployee = staff.pfApplicable
    ? Math.round((pfWageBase * config.pfEmployeeRate) / 100)
    : 0;

  const pfEmployer = staff.pfApplicable
    ? Math.round((pfWageBase * config.pfEmployerRate) / 100)
    : 0;

  // 2. ESI Calculation (Indian ESIC Rules)
  // Applicable only if Gross Salary <= config.esiGrossLimit (Rs. 21,000)
  let esiEmployee = 0;
  let esiEmployer = 0;
  const isEsiEligible = staff.esiApplicable && grossSalaryMonthly <= config.esiGrossLimit;

  if (isEsiEligible) {
    esiEmployee = Math.round((totalEarnings * config.esiEmployeeRate) / 100);
    esiEmployer = Math.round((totalEarnings * config.esiEmployerRate) / 100);
  }

  // 3. Professional Tax (PT)
  const pt = staff.ptApplicable && earnedGrossSalary >= 12000 ? config.ptAmount : 0;

  // Total Deductions
  const totalDeductions = pfEmployee + esiEmployee + pt;

  // Net Salary
  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  // Employer Contribution & CTC
  const totalEmployerContribution = pfEmployer + esiEmployer;
  const totalCtc = totalEarnings + totalEmployerContribution;

  // GST on Manpower/Staff Invoicing (e.g. billing client for Fire Technician / Officer)
  const gstRate = staff.gstApplicable ? config.gstRate : 0;
  const gstAmount = Math.round((totalCtc * gstRate) / 100);
  const clientInvoiceTotal = totalCtc + gstAmount;

  return {
    staffId: staff.id,
    staffName: staff.name,
    designation: staff.designation,
    department: staff.department,
    month: monthStr,
    totalDaysInMonth: daysInMonth,
    presentDays: hasAttendanceLogs ? presentCount : daysInMonth - weeklyOffCount - holidaysInMonth,
    paidLeaveDays: paidLeaveCount,
    holidaysCount: holidaysInMonth,
    weeklyOffCount,
    absentDays: hasAttendanceLogs ? absentCount : 0,
    payableDays,

    basicSalary: earnedBasic,
    da: earnedDa,
    hra: earnedHra,
    allowances: earnedAllowances,
    grossSalaryMonthly,
    earnedGrossSalary,
    overtimePay,
    totalEarnings,

    pfWageBase,
    pfEmployee,
    esiWageBase: isEsiEligible ? totalEarnings : 0,
    esiEmployee,
    pt,
    otherDeductions: 0,
    totalDeductions,

    netSalary,
    pfEmployer,
    esiEmployer,
    totalEmployerContribution,
    totalCtc,

    isGstApplicable: staff.gstApplicable,
    gstRate,
    gstAmount,
    clientInvoiceTotal
  };
}
