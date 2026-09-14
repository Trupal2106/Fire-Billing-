import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  CreditCard,
  FileText,
  Palette,
  Sparkles,
  ArrowRight,
  Hash,
  Sliders,
  Receipt,
  Layers,
  Info
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { INDIAN_STATES } from '../../utils/gstCalculations';
import { formatDocumentNumber } from '../../utils/numbering';

interface SettingsViewProps {
  companySettings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => Promise<void>;
  onExportBackup: () => Promise<void>;
  onImportBackup: (file: File) => Promise<void>;
  onResetToSampleData: () => Promise<void>;
  onNavigateToCustomization?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companySettings,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onResetToSampleData,
  onNavigateToCustomization
}) => {
  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Restoring from backup will merge and update existing records. Proceed?')) {
      try {
        setImporting(true);
        setError('');
        await onImportBackup(file);
        alert('Data successfully restored from backup file!');
      } catch (err: any) {
        setError(err.message || 'Failed to restore backup file');
      } finally {
        setImporting(false);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Company Profile & Business Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure GSTIN, bank details for invoices, terms & conditions, and full offline backup
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onNavigateToCustomization && (
            <button
              type="button"
              onClick={onNavigateToCustomization}
              className="px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Palette className="w-4 h-4 text-red-600" />
              <span>Bill Customization Studio</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Bill Customization Feature Banner */}
      {onNavigateToCustomization && (
        <div className="bg-linear-to-r from-red-600 via-red-700 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight">
                  Invoice & Bill Customization Studio
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full uppercase">
                  New Feature
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Customize 10+ professional GST invoice design templates, reorder columns, dynamic UPI QR, & seals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToCustomization}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-red-50 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span>Open Bill Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Company settings and billing templates updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-slate-800 text-sm">Business Identity & GST Registration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Card Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={e => handleChange('pan', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Address & Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
            Registered Address & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Shop / Office Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State (Place of Origin)</label>
              <select
                value={formData.state}
                onChange={e => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
              >
                {INDIAN_STATES.map(st => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone / Mobile</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={e => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Bank & Payment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Bank Details (Printed on Invoices for NEFT/UPI)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={e => handleChange('bankName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={e => handleChange('accountName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={e => handleChange('accountNumber', e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={e => handleChange('ifscCode', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI ID (e.g. 9825012345@icici)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={e => handleChange('upiId', e.target.value)}
                className="w-full px-3 py-2 font-semibold text-emerald-700 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Document Numbering & Auto-Serial Customization */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Document Numbering & Auto-Serial Customizer
                </h3>
                <p className="text-xs text-slate-500">
                  Configure fixed number prefix (e.g. ag/2026) and auto serial incrementing after every save (01, 02, 03)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Auto-Increment Active
            </span>
          </div>

          {/* 1. Tax Invoices Numbering */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-red-600" />
                <span>Tax Invoice Numbering Series</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('invoicePrefix', 'ag/2026');
                    handleChange('invoicePadding', 2);
                    handleChange('invoiceSeparator', '/');
                  }}
                  className="text-[10px] font-mono text-red-600 hover:text-red-700 bg-white border border-slate-200 hover:border-red-300 px-2 py-0.5 rounded shadow-2xs transition-colors"
                >
                  Set ag/2026/01
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('invoicePrefix', 'FCSS/2026');
                    handleChange('invoicePadding', 2);
                    handleChange('invoiceSeparator', '/');
                  }}
                  className="text-[10px] font-mono text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-2 py-0.5 rounded shadow-2xs transition-colors"
                >
                  Set FCSS/2026/01
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Fixed Number / Prefix
                </label>
                <input
                  type="text"
                  required
                  value={formData.invoicePrefix || 'ag/2026'}
                  onChange={e => handleChange('invoicePrefix', e.target.value)}
                  placeholder="e.g. ag/2026"
                  className="w-full px-3 py-2 font-mono font-bold text-red-600 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Fixed text before serial number</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Separator
                </label>
                <select
                  value={formData.invoiceSeparator !== undefined ? formData.invoiceSeparator : '/'}
                  onChange={e => handleChange('invoiceSeparator', e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                >
                  <option value="/">Slash (/)</option>
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value="">None</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Serial Padding
                </label>
                <select
                  value={formData.invoicePadding ?? 2}
                  onChange={e => handleChange('invoicePadding', Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                >
                  <option value={2}>2 Digits (01, 02...)</option>
                  <option value={3}>3 Digits (001, 002...)</option>
                  <option value={4}>4 Digits (0001, 0002...)</option>
                  <option value={1}>1 Digit (1, 2...)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Next Starting Serial
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.invoiceNextNumber ?? 1}
                  onChange={e => handleChange('invoiceNextNumber', Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 font-mono font-bold text-slate-800 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoIncInv"
                  checked={formData.autoIncrementInvoiceNo !== false}
                  onChange={e => handleChange('autoIncrementInvoiceNo', e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <label htmlFor="autoIncInv" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                  Automatically change/increment serial number after every saved invoice (e.g. 01 → 02 → 03)
                </label>
              </div>
            </div>

            {/* Live Invoice Sequence Preview */}
            <div className="p-3 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">Live Sequence Preview:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <span className="bg-red-950/80 border border-red-500/50 text-red-300 font-bold px-2.5 py-1 rounded">
                  #1: {formatDocumentNumber(formData.invoicePrefix || 'ag/2026', formData.invoiceNextNumber ?? 1, formData.invoicePadding ?? 2, formData.invoiceSeparator ?? '/')}
                </span>
                <span className="text-slate-500">→</span>
                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                  #2: {formatDocumentNumber(formData.invoicePrefix || 'ag/2026', (formData.invoiceNextNumber ?? 1) + 1, formData.invoicePadding ?? 2, formData.invoiceSeparator ?? '/')}
                </span>
                <span className="text-slate-500">→</span>
                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                  #3: {formatDocumentNumber(formData.invoicePrefix || 'ag/2026', (formData.invoiceNextNumber ?? 1) + 2, formData.invoicePadding ?? 2, formData.invoiceSeparator ?? '/')}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Quotations & Estimates Numbering */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Quotation & Estimate Numbering Series</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Fixed Quotation Prefix
                </label>
                <input
                  type="text"
                  value={formData.quotationPrefix || 'ag/QTN/2026'}
                  onChange={e => handleChange('quotationPrefix', e.target.value)}
                  placeholder="e.g. ag/QTN/2026"
                  className="w-full px-3 py-2 font-mono font-bold text-blue-600 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Padding
                </label>
                <select
                  value={formData.quotationPadding ?? 2}
                  onChange={e => handleChange('quotationPadding', Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                >
                  <option value={2}>2 Digits (01, 02...)</option>
                  <option value={3}>3 Digits (001, 002...)</option>
                  <option value={4}>4 Digits (0001...)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Next Starting Serial
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.quotationNextNumber ?? 1}
                  onChange={e => handleChange('quotationNextNumber', Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 font-mono font-bold text-slate-800 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 text-white rounded-lg flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Next Quotation:</span>
              <span className="text-blue-300 font-bold">
                {formatDocumentNumber(formData.quotationPrefix || 'ag/QTN/2026', formData.quotationNextNumber ?? 1, formData.quotationPadding ?? 2, formData.quotationSeparator ?? '/')}
              </span>
            </div>
          </div>

          {/* 3. Payment Receipts Numbering */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment Receipt Numbering Series</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Fixed Receipt Prefix
                </label>
                <input
                  type="text"
                  value={formData.receiptPrefix || 'ag/REC/2026'}
                  onChange={e => handleChange('receiptPrefix', e.target.value)}
                  placeholder="e.g. ag/REC/2026"
                  className="w-full px-3 py-2 font-mono font-bold text-emerald-700 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Padding
                </label>
                <select
                  value={formData.receiptPadding ?? 2}
                  onChange={e => handleChange('receiptPadding', Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                >
                  <option value={2}>2 Digits (01, 02...)</option>
                  <option value={3}>3 Digits (001, 002...)</option>
                  <option value={4}>4 Digits (0001...)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Next Starting Serial
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.receiptNextNumber ?? 1}
                  onChange={e => handleChange('receiptNextNumber', Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 font-mono font-bold text-slate-800 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 text-white rounded-lg flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Next Receipt:</span>
              <span className="text-emerald-300 font-bold">
                {formatDocumentNumber(formData.receiptPrefix || 'ag/REC/2026', formData.receiptNextNumber ?? 1, formData.receiptPadding ?? 2, formData.receiptSeparator ?? '/')}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
            Default Invoicing Terms & Disclaimers
          </h3>

          <div className="text-xs">
            <textarea
              rows={4}
              value={formData.termsAndConditions}
              onChange={e => handleChange('termsAndConditions', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
            />
          </div>
        </div>
      </form>

      {/* Data Backup, Restore & Sample Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
          Data Management, Backup & Offline Sync
        </h3>

        <p className="text-xs text-slate-500">
          All data is saved securely in your browser's local Dexie IndexedDB. You can download a complete JSON backup or restore it anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Download Backup */}
          <button
            type="button"
            onClick={onExportBackup}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left flex flex-col justify-between"
          >
            <Download className="w-5 h-5 text-slate-700 mb-2" />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Download Full JSON Backup</span>
              <span className="text-[11px] text-slate-500">Save invoices, customers, stock & reports to a file</span>
            </div>
          </button>

          {/* Restore Backup */}
          <label className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left flex flex-col justify-between cursor-pointer">
            <Upload className="w-5 h-5 text-slate-700 mb-2" />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Restore from Backup File</span>
              <span className="text-[11px] text-slate-500">Upload a previously exported JSON backup</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              disabled={importing}
              className="hidden"
            />
          </label>

          {/* Reset Sample Data */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Load sample fire safety items, clients, invoices, and AMC contracts?')) {
                onResetToSampleData();
              }
            }}
            className="p-4 rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 transition-colors text-left flex flex-col justify-between"
          >
            <RefreshCw className="w-5 h-5 text-red-600 mb-2" />
            <div>
              <span className="font-bold text-xs text-red-900 block">Load Demo / Sample Data</span>
              <span className="text-[11px] text-red-600">Populate realistic fire-safety business records</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
