import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  RefreshCw,
  FileJson,
  ShieldCheck,
  Receipt,
  Users,
  Package,
  FileText,
  CreditCard,
  ShoppingBag,
  TrendingDown,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  Customer,
  Invoice,
  Quotation,
  ProductItem,
  PaymentReceipt,
  AmcContract,
  Purchase,
  Expense,
  CompanySettings
} from '../../types';
import {
  exportInvoicesToExcel,
  exportQuotationsToExcel,
  exportCustomersToExcel,
  exportProductsToExcel,
  exportPaymentsToExcel,
  exportAmcToExcel,
  exportPurchasesToExcel,
  exportExpensesToExcel,
  exportGstSummaryToExcel,
  exportMasterWorkbookToExcel
} from '../../utils/excelExporter';
import { formatCurrency } from '../../utils/formatters';

interface BackupRestoreViewProps {
  customers: Customer[];
  invoices: Invoice[];
  quotations: Quotation[];
  products: ProductItem[];
  payments: PaymentReceipt[];
  amcContracts: AmcContract[];
  purchases: Purchase[];
  expenses: Expense[];
  companySettings: CompanySettings;
  onExportBackup: () => Promise<void>;
  onImportBackup: (file: File) => Promise<void>;
  onResetToSampleData: () => Promise<void>;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  customers,
  invoices,
  quotations,
  products,
  payments,
  amcContracts,
  purchases,
  expenses,
  companySettings,
  onExportBackup,
  onImportBackup,
  onResetToSampleData
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalReceivedAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalStockItems = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

  const handleDownloadFullBackup = async () => {
    setIsExporting(true);
    try {
      await onExportBackup();
      showSuccessNotice('Complete JSON Backup File downloaded to your Laptop Downloads folder!');
    } catch (err: any) {
      alert('Error downloading backup: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadMasterExcel = () => {
    try {
      const fileName = `FIRE_CARE_SAFETY_MASTER_LEDGER_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportMasterWorkbookToExcel(
        {
          invoices,
          quotations,
          customers,
          products,
          payments,
          amcContracts,
          purchases,
          expenses
        },
        fileName
      );
      showSuccessNotice(`Master Excel Workbook (${fileName}) downloaded to your laptop!`);
    } catch (err: any) {
      alert('Error generating Excel file: ' + err.message);
    }
  };

  const showSuccessNotice = (msg: string) => {
    setDownloadSuccessMsg(msg);
    setTimeout(() => setDownloadSuccessMsg(null), 5000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setRestoreError('Please select a valid .json backup file exported from this application.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to restore data from "${file.name}"?\nThis will replace the current local database with records from this backup file.`
      )
    ) {
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    setRestoreError(null);
    setRestoreSuccess(null);

    try {
      await onImportBackup(file);
      setRestoreSuccess(`Successfully restored all records from ${file.name}!`);
    } catch (err: any) {
      setRestoreError(err.message || 'Failed to parse and restore the backup file.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      {downloadSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{downloadSuccessMsg}</p>
        </div>
      )}

      {restoreSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{restoreSuccess}</p>
        </div>
      )}

      {restoreError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-center gap-3 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{restoreError}</p>
        </div>
      )}

      {/* Header & Local Laptop Storage Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                Saved Locally in Laptop Storage (IndexedDB Active)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Laptop Data Storage & Backup Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every invoice, quotation, fire equipment item, customer ledger, and payment you enter is
              <strong> saved permanently in your laptop browser's local hard-drive database (Dexie IndexedDB)</strong>.
              You can work offline anytime and download backup files for your records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadFullBackup}
              disabled={isExporting}
              className="bg-red-600 hover:bg-red-500 active:scale-98 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting File...' : 'Download JSON Backup'}</span>
            </button>
            <button
              onClick={handleDownloadMasterExcel}
              className="bg-slate-700 hover:bg-slate-600 active:scale-98 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-600 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Download Master Excel</span>
            </button>
          </div>
        </div>

        {/* Live Laptop Database Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/80 text-xs">
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[11px] block">Tax Invoices Saved</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{invoices.length} Invoices</span>
            <span className="text-[10px] text-slate-400 font-mono">{formatCurrency(totalInvoicedAmount)}</span>
          </div>

          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[11px] block">Customers & Clients</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{customers.length} Clients</span>
            <span className="text-[10px] text-slate-400 font-mono">{quotations.length} Quotations</span>
          </div>

          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[11px] block">Inventory & Equipment</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{products.length} Products</span>
            <span className="text-[10px] text-slate-400 font-mono">{totalStockItems} Units in Stock</span>
          </div>

          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[11px] block">Payments & AMC</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{payments.length} Receipts</span>
            <span className="text-[10px] text-slate-400 font-mono">{amcContracts.length} AMC Contracts</span>
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Individual Data File Downloads */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                  Download Entry Spreadsheets to Laptop (Excel & CSV)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                MS Excel & Google Sheets Compatible
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Click any dataset below to instantly export and download clean, formatted spreadsheets directly to your laptop disk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* 1. Tax Invoices Excel */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50 hover:bg-red-50/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-red-600" />
                      <span>GST Tax Invoices</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {invoices.length} records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Invoice numbers, line items, HSN, CGST/SGST/IGST, customer details, and balance due.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportInvoicesToExcel(invoices, `FIRE_CARE_INVOICES_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showSuccessNotice('Invoices Excel sheet downloaded to laptop!');
                  }}
                  className="w-full py-2 bg-white hover:bg-red-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-red-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Invoices (.xlsx)</span>
                </button>
              </div>

              {/* 2. Quotations Excel */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Quotations & Estimates</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {quotations.length} records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    All formal quotations, item breakdowns, rates, valid dates, and approval statuses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportQuotationsToExcel(quotations, `FIRE_CARE_QUOTATIONS_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showSuccessNotice('Quotations Excel sheet downloaded to laptop!');
                  }}
                  className="w-full py-2 bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Quotations (.xlsx)</span>
                </button>
              </div>

              {/* 3. Customers Ledger Excel */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Customers & Ledgers</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {customers.length} clients
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Customer directory, phone numbers, GSTIN, total sales, amount received, and balances.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportCustomersToExcel(customers, `FIRE_CARE_CUSTOMERS_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showSuccessNotice('Customer Directory downloaded to laptop!');
                  }}
                  className="w-full py-2 bg-white hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-emerald-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Customers (.xlsx)</span>
                </button>
              </div>

              {/* 4. Products & Fire Equipment Stock */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-amber-50/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>Products & Fire Inventory</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {products.length} items
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Extinguisher types, refill services, HSN codes, current stock, selling rates & GST.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportProductsToExcel(products, `FIRE_CARE_INVENTORY_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showSuccessNotice('Inventory Catalog downloaded to laptop!');
                  }}
                  className="w-full py-2 bg-white hover:bg-amber-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-amber-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Inventory (.xlsx)</span>
                </button>
              </div>

              {/* 5. Payments & Receipts */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Payments & Receipts</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {payments.length} receipts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Receipt serial numbers, dates, payment modes (UPI/Cash/NEFT), customer references.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportPaymentsToExcel(payments, `FIRE_CARE_PAYMENTS_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showSuccessNotice('Payments report downloaded to laptop!');
                  }}
                  className="w-full py-2 bg-white hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Payments (.xlsx)</span>
                </button>
              </div>

              {/* 6. AMC Contracts */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>AMC Contracts & Schedules</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {amcContracts.length} contracts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Annual maintenance contracts, site locations, quarterly visit schedules, expiry dates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportAmcToExcel(amcContracts, `FIRE_CARE_AMC_CONTRACTS_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showSuccessNotice('AMC Contracts report downloaded to laptop!');
                  }}
                  className="w-full py-2 bg-white hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-purple-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download AMC List (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>

          {/* GSTR-1 & Purchases Spreadsheets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <span>GST & Tax Compliance Exports for Chartered Accountant (CA)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  exportGstSummaryToExcel(invoices, purchases, `GSTR_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
                  showSuccessNotice('GSTR-1 & GSTR-2 summary downloaded to laptop!');
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block">GSTR-1 & GSTR-2 Export</span>
                  <span className="text-[11px] text-slate-500">Sales & Purchase GST tables for CA filing</span>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  exportPurchasesToExcel(purchases, `FIRE_CARE_PURCHASES_${new Date().toISOString().slice(0, 10)}.xlsx`);
                  showSuccessNotice('Purchases spreadsheet downloaded to laptop!');
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Vendor Purchases & Bills</span>
                  <span className="text-[11px] text-slate-500">Supplier bills and stock inward logs</span>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Full JSON Backup, Restore from Laptop & Guidance */}
        <div className="space-y-6">
          {/* Master JSON Backup Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileJson className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-800 text-sm">Full System Backup (.JSON)</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Downloads a single, complete backup file containing all your settings, auto-number counters, invoices, customers, stock, and AMC contracts.
            </p>

            <button
              type="button"
              onClick={handleDownloadFullBackup}
              disabled={isExporting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Preparing File...' : 'Download JSON Backup File'}</span>
            </button>

            <span className="text-[10px] text-slate-400 block text-center">
              Suggested: Download a backup once every week to keep safe on your laptop disk or pendrive.
            </span>
          </div>

          {/* Restore from File */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Upload className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-800 text-sm">Restore from Laptop File</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select a previously downloaded <code className="text-red-600 font-mono font-bold">.json</code> backup file to restore all records to this laptop.
            </p>

            <label className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>{isImporting ? 'Restoring Records...' : 'Select Backup File (.json)'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {/* How Laptop Storage Works Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-700" />
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                How Laptop Data Saving Works
              </h4>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Instant Auto-Save:</strong> The moment you click Save on any invoice, customer, or product, it is saved directly inside your laptop's browser database.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Works Offline:</strong> You do not need continuous internet. Your bills, printouts, and data entries work completely locally.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Portability:</strong> You can download the backup file and restore it onto any other computer or laptop in 5 seconds.
                </span>
              </li>
            </ul>
          </div>

          {/* Reset Demo Data Button */}
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Sample Fire Safety Data</span>
              <span className="text-[11px] text-slate-400">Load sample fire extinguisher entries</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Load sample fire safety items, clients, invoices, and AMC contracts?')) {
                  onResetToSampleData();
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 bg-white border border-red-200 hover:border-red-300 rounded-lg shadow-2xs"
            >
              Load Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
