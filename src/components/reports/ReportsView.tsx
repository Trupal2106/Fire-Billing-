import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Building2,
  PieChart,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  Invoice,
  Purchase,
  Expense,
  Customer,
  CompanySettings
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportGstSummaryToExcel, exportInvoicesToExcel } from '../../utils/excelExporter';

interface ReportsViewProps {
  invoices: Invoice[];
  purchases: Purchase[];
  expenses: Expense[];
  customers: Customer[];
  companySettings: CompanySettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  purchases,
  expenses,
  customers,
  companySettings
}) => {
  const [reportTab, setReportTab] = useState<'pnl' | 'gst' | 'sales_by_customer'>('pnl');

  // Active non-cancelled invoices
  const validInvoices = useMemo(() => {
    return invoices.filter(i => i.status !== 'cancelled');
  }, [invoices]);

  // Revenue & Income
  const totalSalesRevenue = useMemo(() => {
    return validInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  }, [validInvoices]);

  const totalTaxableSales = useMemo(() => {
    return validInvoices.reduce((sum, i) => sum + i.taxableAmount, 0);
  }, [validInvoices]);

  // Tax collected (Output GST)
  const outputCgst = useMemo(() => validInvoices.reduce((sum, i) => sum + i.cgstTotal, 0), [validInvoices]);
  const outputSgst = useMemo(() => validInvoices.reduce((sum, i) => sum + i.sgstTotal, 0), [validInvoices]);
  const outputIgst = useMemo(() => validInvoices.reduce((sum, i) => sum + i.igstTotal, 0), [validInvoices]);
  const totalOutputGst = outputCgst + outputSgst + outputIgst;

  // Purchases & Input Tax Credit (ITC)
  const totalPurchaseSpend = useMemo(() => purchases.reduce((sum, p) => sum + p.grandTotal, 0), [purchases]);
  const totalTaxablePurchases = useMemo(() => purchases.reduce((sum, p) => sum + p.taxableAmount, 0), [purchases]);
  const totalInputGstItc = useMemo(() => purchases.reduce((sum, p) => sum + p.gstAmount, 0), [purchases]);

  // Expenses
  const totalOperatingExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  // Net Profit Calculation (Revenue - Tax - Purchases - Expenses)
  const grossProfit = totalTaxableSales - totalTaxablePurchases;
  const netProfit = grossProfit - totalOperatingExpenses;
  const netGstPayable = Math.max(0, totalOutputGst - totalInputGstItc);

  // Customer sales aggregate
  const customerSales = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number; due: number }>();

    for (const inv of validInvoices) {
      const existing = map.get(inv.customerId) || {
        name: inv.customerName,
        count: 0,
        total: 0,
        due: 0
      };
      existing.count += 1;
      existing.total += inv.grandTotal;
      existing.due += inv.balanceDue || 0;
      map.set(inv.customerId, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [validInvoices]);

  // Export GSTR-1 CSV
  const exportGSTR1CSV = () => {
    const headers = [
      'Invoice No',
      'Invoice Date',
      'Customer Name',
      'Customer GSTIN',
      'Place of Supply',
      'Supply Type',
      'Taxable Value',
      'CGST (9%)',
      'SGST (9%)',
      'IGST (18%)',
      'Invoice Total'
    ];

    const rows = validInvoices.map(inv => [
      `"${inv.invoiceNo}"`,
      inv.invoiceDate,
      `"${inv.customerName}"`,
      `"${inv.customerGstin || 'URP'}"`,
      `"${inv.customerState}"`,
      inv.isInterstate ? 'Inter-State' : 'Intra-State',
      inv.taxableAmount,
      inv.cgstTotal,
      inv.sgstTotal,
      inv.igstTotal,
      inv.grandTotal
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Patel_Fire_GSTR1_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Financial & GST Tax Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profit & Loss statements, GSTR-1 sales tax summary, and ITC reconciliation
          </p>
        </div>

        <button
          onClick={() => exportGstSummaryToExcel(validInvoices, purchases, `Patel_Fire_GSTR_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`)}
          className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export GSTR Summary (.xlsx)</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Gross Sales Turnover</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalSalesRevenue)}</div>
          <span className="text-[10px] text-slate-400">Total Billed Invoices</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Purchases & Cost</span>
          <div className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(totalPurchaseSpend)}</div>
          <span className="text-[10px] text-slate-400">Hardware & Spares Restock</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Operating Expenses</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(totalOperatingExpenses)}</div>
          <span className="text-[10px] text-slate-400">Fuel, Wages, Overheads</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Net Estimated Profit</span>
          <div className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(netProfit)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">After Direct Costs & Exp.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex gap-2">
        <button
          onClick={() => setReportTab('pnl')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            reportTab === 'pnl' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Profit & Loss Statement
        </button>

        <button
          onClick={() => setReportTab('gst')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            reportTab === 'gst' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          GST Summary (GSTR-1 & ITC)
        </button>

        <button
          onClick={() => setReportTab('sales_by_customer')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            reportTab === 'sales_by_customer' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Party-Wise Sales Volume
        </button>
      </div>

      {/* Tab 1: P&L Statement */}
      {reportTab === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Business Profit & Loss Overview</h3>
              <p className="text-xs text-slate-500">Statement of Revenue, Cost of Goods Sold and Operating Overheads</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">FY 2025-26</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex justify-between font-bold text-emerald-900 text-sm">
                <span>1. Operating Income / Revenue (Net of GST)</span>
                <span>{formatCurrency(totalTaxableSales)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px] pl-4">
                <span>• Fire Safety Equipment Sales & Installation</span>
                <span>{formatCurrency(totalTaxableSales * 0.7)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px] pl-4">
                <span>• Extinguisher Refilling & AMC Contracts</span>
                <span>{formatCurrency(totalTaxableSales * 0.3)}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-2">
              <div className="flex justify-between font-bold text-orange-900 text-sm">
                <span>2. Cost of Goods Sold (Purchases & Supplies)</span>
                <span>{formatCurrency(totalTaxablePurchases)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px] pl-4">
                <span>• Cylinders, Valves, Hoses & Powder Purchases</span>
                <span>{formatCurrency(totalTaxablePurchases)}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center px-4 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-800 text-sm">
              <span>Gross Profit (1 - 2):</span>
              <span className="text-slate-900">{formatCurrency(grossProfit)}</span>
            </div>

            {/* Operating Expenses */}
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
              <div className="flex justify-between font-bold text-rose-900 text-sm">
                <span>3. Operating Overheads & Expenses</span>
                <span>{formatCurrency(totalOperatingExpenses)}</span>
              </div>
              {expenses.map((e, idx) => (
                <div key={idx} className="flex justify-between text-slate-600 text-[11px] pl-4">
                  <span>• {e.title} ({e.category})</span>
                  <span>{formatCurrency(e.amount)}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-slate-400 text-[11px] pl-4">No overhead expenses recorded yet</p>
              )}
            </div>

            {/* Final Net Profit */}
            <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-xl font-bold text-base">
              <span>Net Business Profit / (Loss):</span>
              <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GST Summary */}
      {reportTab === 'gst' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">GST Tax Liability & Input Tax Credit (ITC)</h3>
              <p className="text-xs text-slate-500">
                Registered GSTIN: <strong className="text-slate-800">{companySettings.gstin}</strong> (State: {companySettings.state})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Output Tax Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-sm block">Outward Supply Tax (Output GST)</span>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>CGST (Central Tax 9%):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(outputCgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (State Tax 9%):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(outputSgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IGST (Integrated Tax 18%):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(outputIgst)}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Output GST:</span>
                  <span className="text-red-600">{formatCurrency(totalOutputGst)}</span>
                </div>
              </div>
            </div>

            {/* Input Tax Credit Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-sm block">Input Tax Credit (ITC from Purchases)</span>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Total Eligible Purchase ITC:</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(totalInputGstItc)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ITC Utilization Against Output:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(Math.min(totalOutputGst, totalInputGstItc))}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                  <span>Net GST Payable in Cash:</span>
                  <span className="text-orange-600">{formatCurrency(netGstPayable)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sales by Customer */}
      {reportTab === 'sales_by_customer' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
            Top Clients by Revenue Contribution
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Party / Client Name</th>
                  <th className="p-3 text-center">Invoices Count</th>
                  <th className="p-3 text-right">Total Billed Volume</th>
                  <th className="p-3 text-right">Current Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerSales.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{c.name}</td>
                    <td className="p-3 text-center text-slate-600">{c.count}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(c.total)}</td>
                    <td className={`p-3 text-right font-bold ${c.due > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {formatCurrency(c.due)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
