import React, { useMemo } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Users,
  Receipt,
  FileText,
  ShieldCheck,
  Package,
  Calendar,
  Plus,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Customer,
  Invoice,
  Quotation,
  PaymentReceipt,
  ProductItem,
  AmcContract,
  Expense,
  CompanySettings
} from '../../types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

interface DashboardViewProps {
  customers: Customer[];
  invoices: Invoice[];
  quotations: Quotation[];
  payments: PaymentReceipt[];
  products: ProductItem[];
  amcContracts: AmcContract[];
  expenses: Expense[];
  companySettings: CompanySettings;
  onNavigate: (section: string) => void;
  onSelectAction: (action: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  invoices,
  quotations,
  payments,
  products,
  amcContracts,
  expenses,
  companySettings,
  onNavigate,
  onSelectAction,
  onViewInvoice
}) => {
  // 1. Calculate Summary Metrics
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthPrefix = now.toISOString().slice(0, 7); // "YYYY-MM"

  // Today Sales
  const todaySales = useMemo(() => {
    return invoices
      .filter(inv => inv.invoiceDate === todayStr && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices, todayStr]);

  // This Month Sales
  const thisMonthSales = useMemo(() => {
    return invoices
      .filter(inv => inv.invoiceDate.startsWith(currentMonthPrefix) && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices, currentMonthPrefix]);

  // Total Outstanding
  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0);
  }, [customers]);

  // Total Received
  const totalReceived = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  // Pending Quotations
  const pendingQuotationsCount = useMemo(() => {
    return quotations.filter(q => q.status === 'draft' || q.status === 'sent').length;
  }, [quotations]);

  // Active AMC
  const activeAmcCount = useMemo(() => {
    return amcContracts.filter(a => a.status === 'Active').length;
  }, [amcContracts]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return products.filter(p => p.type === 'product' && p.currentStock <= p.minStock);
  }, [products]);

  // Upcoming AMC Services in next 30 days
  const upcomingAmcSchedules = useMemo(() => {
    const list: Array<{ amc: AmcContract; schedule: any }> = [];
    amcContracts.forEach(amc => {
      if (amc.status === 'Active') {
        amc.schedules?.forEach(sch => {
          if (sch.status === 'Pending') {
            list.push({ amc, schedule: sch });
          }
        });
      }
    });
    // Sort by scheduledDate ascending
    return list.sort((a, b) => (a.schedule?.scheduledDate || a.schedule?.targetDate || '').localeCompare(b.schedule?.scheduledDate || b.schedule?.targetDate || '')).slice(0, 5);
  }, [amcContracts]);

  // Recent Invoices (latest 5)
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [invoices]);

  // Recent Payments (latest 5)
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [payments]);

  // Monthly Sales Chart Data (Last 6 Months)
  const monthlyChartData = useMemo(() => {
    const months: Record<string, { month: string; sales: number; collected: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      months[key] = { month: label, sales: 0, collected: 0 };
    }

    invoices.forEach(inv => {
      if (inv.status !== 'cancelled') {
        const key = inv.invoiceDate.slice(0, 7);
        if (months[key]) {
          months[key].sales += inv.grandTotal;
        }
      }
    });

    payments.forEach(p => {
      const key = p.paymentDate.slice(0, 7);
      if (months[key]) {
        months[key].collected += p.amount;
      }
    });

    return Object.values(months);
  }, [invoices, payments]);

  // Expense Categories Chart
  const expensePieData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(exp => {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });

    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [expenses]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24 lg:pb-12">
      {/* Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/30">
                Fire Safety & Electrical ERP
              </span>
              <span className="text-xs text-slate-400">Patel Electricals & Fire System Solutions</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Business Control Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Real-time monitoring of GST invoices, receivables, periodic fire pump tests, AMC schedules, and inventory.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectAction('new-invoice')}
              className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Invoice</span>
            </button>

            <button
              onClick={() => onSelectAction('receive-payment')}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>

            <button
              onClick={() => onSelectAction('new-quotation')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Quotation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Top 4 Core Financial & AI Metric Cards (12 Column Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 content-start">
        {/* Card 1: Today's Sales */}
        <div className="lg:col-span-3 bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Sales</span>
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {invoices.filter(inv => inv.invoiceDate === todayStr && inv.status !== 'cancelled').length > 0 ? '+Active' : 'Today'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(todaySales)}</p>
          </div>
          <div className="mt-3">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${Math.min(100, (todaySales / (thisMonthSales || 1)) * 100 * 5)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">This month total: {formatCurrency(thisMonthSales)}</p>
          </div>
        </div>

        {/* Card 2: Total Outstanding */}
        <div
          onClick={() => onNavigate('customers')}
          className="lg:col-span-3 bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                totalOutstanding > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {totalOutstanding > 0 ? 'Critical' : 'Clear'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalOutstanding)}</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            From {invoices.filter(i => i.balanceDue > 0 && i.status !== 'cancelled').length} pending invoices
          </p>
        </div>

        {/* Card 3: Active AMCs */}
        <div
          onClick={() => onNavigate('amc')}
          className="lg:col-span-3 bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active AMCs</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {amcContracts.length} Total
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{activeAmcCount} Contracts</p>
          </div>
          <p className="text-[10px] text-blue-600 font-medium mt-2">
            {upcomingAmcSchedules.length} Visits scheduled ahead
          </p>
        </div>

        {/* Card 4: AI Fire Assistant Card */}
        <div className="lg:col-span-3 bg-red-700 p-5 rounded-xl shadow-md flex flex-col justify-between text-white">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">AI Assistant</p>
            <p className="text-xs mt-1.5 leading-snug italic text-red-100">
              "Your service revenue is steady. Maintain periodic NBC/IS 2190 inspections and track refilling schedules."
            </p>
          </div>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="mt-3 text-[11px] font-bold underline text-left hover:text-red-200 transition-colors flex items-center gap-1"
          >
            <span>Open AI Chat</span>
            <span>&rarr;</span>
          </button>
        </div>
      </section>

      {/* 2. Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Sales vs Collection Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Revenue & Collections Trend</h3>
              <p className="text-xs text-slate-500">Monthly comparison of GST Billing vs Received Cashflow</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-600"></span> Sales (₹)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Received (₹)
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" name="Sales" fill="#dc2626" radius={[3, 3, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-sm">Expense Breakdown</h3>
              <button onClick={() => onNavigate('expenses')} className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">Operating costs by category</p>
          </div>

          {expensePieData.length > 0 ? (
            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded yet
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-100">
            {expensePieData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bottom 12-Column Section: Recent Invoices (8 cols) + Upcoming Service Visits & Stock Alerts (4 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Invoices Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-sm">Recent Invoices</h2>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-blue-600 text-xs font-semibold hover:underline"
            >
              View All Invoices
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-4 py-3">Inv #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No invoices recorded yet
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => {
                    let statusBadge = (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {inv.status}
                      </span>
                    );
                    if (inv.status === 'paid') {
                      statusBadge = (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Paid
                        </span>
                      );
                    } else if (inv.status === 'partially_paid' || (inv.status as any) === 'partial') {
                      statusBadge = (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Partial
                        </span>
                      );
                    } else if (inv.status === 'unpaid') {
                      statusBadge = (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Unpaid
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => onViewInvoice(inv)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">{inv.invoiceNo}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{inv.customerName}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(inv.invoiceDate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{statusBadge}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800 whitespace-nowrap">
                          {formatCurrency(inv.grandTotal)}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => generateInvoicePDF(inv, companySettings)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Upcoming Service Visits & Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Upcoming Service Visits */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-sm">Upcoming Service Visits</h2>
              <button
                onClick={() => onNavigate('amc')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              {upcomingAmcSchedules.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming visits in next 30 days</p>
              ) : (
                upcomingAmcSchedules.map(({ amc, schedule }, idx) => {
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div
                      key={`${amc.id}_${idx}`}
                      onClick={() => onNavigate('amc')}
                      className="flex gap-3 items-start cursor-pointer group"
                    >
                      <div className={`w-1 h-9 ${barColor} rounded-full shrink-0 mt-0.5`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 group-hover:text-red-600 transition-colors truncate">
                          {amc.customerName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {amc.title} • {formatDate(schedule.scheduledDate)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 text-sm">Stock Alerts</h2>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Manage Stock
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">All inventory stock levels optimal</p>
              ) : (
                lowStockItems.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-600 truncate max-w-[160px]">{p.name}</span>
                    <span className="text-xs font-bold text-red-600 underline">
                      {p.currentStock} {p.unit} Left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
