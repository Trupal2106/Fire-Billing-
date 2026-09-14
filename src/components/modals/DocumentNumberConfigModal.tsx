import React, { useState, useEffect } from 'react';
import {
  X,
  Hash,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  ArrowRight,
  Info,
  Layers
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { formatDocumentNumber } from '../../utils/numbering';

interface DocumentNumberConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'invoice' | 'quotation' | 'receipt';
  companySettings: CompanySettings;
  currentNumber: string;
  onApplyToCurrent: (newNumber: string) => void;
  onSaveAsDefault: (updatedSettings: Partial<CompanySettings>) => Promise<void>;
}

export const DocumentNumberConfigModal: React.FC<DocumentNumberConfigModalProps> = ({
  isOpen,
  onClose,
  documentType,
  companySettings,
  currentNumber,
  onApplyToCurrent,
  onSaveAsDefault
}) => {
  const isInvoice = documentType === 'invoice';
  const isQuotation = documentType === 'quotation';

  const defaultPrefix = isInvoice
    ? (companySettings.invoicePrefix || 'ag/2026')
    : isQuotation
    ? (companySettings.quotationPrefix || 'ag/QTN/2026')
    : (companySettings.receiptPrefix || 'ag/REC/2026');

  const defaultNextNum = isInvoice
    ? (companySettings.invoiceNextNumber ?? 1)
    : isQuotation
    ? (companySettings.quotationNextNumber ?? 1)
    : (companySettings.receiptNextNumber ?? 1);

  const defaultPadding = isInvoice
    ? (companySettings.invoicePadding ?? 2)
    : isQuotation
    ? (companySettings.quotationPadding ?? 2)
    : (companySettings.receiptPadding ?? 2);

  const defaultSeparator = isInvoice
    ? (companySettings.invoiceSeparator ?? '/')
    : isQuotation
    ? (companySettings.quotationSeparator ?? '/')
    : (companySettings.receiptSeparator ?? '/');

  const [prefix, setPrefix] = useState(defaultPrefix);
  const [nextNum, setNextNum] = useState(defaultNextNum);
  const [padding, setPadding] = useState(defaultPadding);
  const [separator, setSeparator] = useState(defaultSeparator);
  const [autoIncrement, setAutoIncrement] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrefix(defaultPrefix);
      setNextNum(defaultNextNum);
      setPadding(defaultPadding);
      setSeparator(defaultSeparator);
      setSavedSuccess(false);
    }
  }, [isOpen, defaultPrefix, defaultNextNum, defaultPadding, defaultSeparator]);

  if (!isOpen) return null;

  const currentFormatted = formatDocumentNumber(prefix, nextNum, padding, separator);
  const preview1 = formatDocumentNumber(prefix, nextNum, padding, separator);
  const preview2 = formatDocumentNumber(prefix, nextNum + 1, padding, separator);
  const preview3 = formatDocumentNumber(prefix, nextNum + 2, padding, separator);

  const applyPreset = (presetPrefix: string, presetPad: number, presetSep: string) => {
    setPrefix(presetPrefix);
    setPadding(presetPad);
    setSeparator(presetSep);
  };

  const handleSaveDefault = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<CompanySettings> = {};
      if (isInvoice) {
        updates.invoicePrefix = prefix;
        updates.invoiceNextNumber = nextNum;
        updates.invoicePadding = padding;
        updates.invoiceSeparator = separator;
        updates.autoIncrementInvoiceNo = autoIncrement;
      } else if (isQuotation) {
        updates.quotationPrefix = prefix;
        updates.quotationNextNumber = nextNum;
        updates.quotationPadding = padding;
        updates.quotationSeparator = separator;
        updates.autoIncrementQuotationNo = autoIncrement;
      } else {
        updates.receiptPrefix = prefix;
        updates.receiptNextNumber = nextNum;
        updates.receiptPadding = padding;
        updates.receiptSeparator = separator;
        updates.autoIncrementReceiptNo = autoIncrement;
      }

      await onSaveAsDefault(updates);
      setSavedSuccess(true);
      onApplyToCurrent(currentFormatted);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to save default numbering settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyOnly = () => {
    onApplyToCurrent(currentFormatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Customize {isInvoice ? 'Invoice' : isQuotation ? 'Quotation' : 'Receipt'} Numbering
              </h3>
              <p className="text-[11px] text-slate-400">
                Fix prefix format (e.g. ag/2026) and auto-incrementing serial (01, 02, 03)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Popular Presets (Click to Apply)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('ag/2026', 2, '/')}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border text-left transition-all ${
                  prefix === 'ag/2026' && padding === 2 && separator === '/'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                ag/2026/01
              </button>

              <button
                type="button"
                onClick={() => applyPreset('FCSS/2026', 2, '/')}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border text-left transition-all ${
                  prefix === 'FCSS/2026' && padding === 2 && separator === '/'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                FCSS/2026/01
              </button>

              <button
                type="button"
                onClick={() => applyPreset('ag/INV/2026', 2, '/')}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border text-left transition-all ${
                  prefix === 'ag/INV/2026' && padding === 2 && separator === '/'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                ag/INV/2026/01
              </button>

              <button
                type="button"
                onClick={() => applyPreset('INV-2026', 3, '-')}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border text-left transition-all ${
                  prefix === 'INV-2026' && padding === 3 && separator === '-'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                INV-2026-001
              </button>

              <button
                type="button"
                onClick={() => applyPreset('FCSS', 2, '/')}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border text-left transition-all ${
                  prefix === 'FCSS' && padding === 2 && separator === '/'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                FCSS/01
              </button>

              <button
                type="button"
                onClick={() => applyPreset('ag', 2, '-')}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border text-left transition-all ${
                  prefix === 'ag' && padding === 2 && separator === '-'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                ag-01
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fixed Prefix */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Fixed Number / Prefix Text
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  placeholder="e.g. ag/2026"
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 rounded-xl border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                This fixed text stays consistent for all bills in this series (e.g. <span className="font-mono font-semibold text-slate-700">ag/2026</span>)
              </span>
            </div>

            {/* Separator */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Separator Symbol
              </label>
              <select
                value={separator}
                onChange={e => setSeparator(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
              >
                <option value="/">Slash (/)</option>
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value="">None (No separator)</option>
              </select>
            </div>

            {/* Zero Padding Format */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Serial Number Format
              </label>
              <select
                value={padding}
                onChange={e => setPadding(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
              >
                <option value={2}>2 Digits (01, 02, 03... 99)</option>
                <option value={3}>3 Digits (001, 002, 003...)</option>
                <option value={4}>4 Digits (0001, 0002...)</option>
                <option value={1}>1 Digit (1, 2, 3...)</option>
              </select>
            </div>

            {/* Next Starting Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Next Serial Counter
              </label>
              <input
                type="number"
                min={1}
                value={nextNum}
                onChange={e => setNextNum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 rounded-xl border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Starting number for next bill
              </span>
            </div>

            {/* Auto Increment Toggle */}
            <div className="flex items-center gap-2 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoIncrement}
                  onChange={e => setAutoIncrement(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-700 select-none">
                  Auto-increment on Save
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Live Auto-Serial Preview</span>
              </div>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Active Format
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/90 border border-red-500/40">
                <span className="text-[10px] text-slate-400 block">Next Invoice (#1):</span>
                <span className="font-mono font-bold text-red-400 text-sm">{preview1}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Following (#2):</span>
                <span className="font-mono font-semibold text-slate-300 text-sm">{preview2}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Following (#3):</span>
                <span className="font-mono font-semibold text-slate-300 text-sm">{preview3}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                When you save an invoice, the system automatically advances the sequence from <strong className="text-slate-200">{preview1}</strong> to <strong className="text-slate-200">{preview2}</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleApplyOnly}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-2xs"
          >
            Apply to This Invoice ({currentFormatted})
          </button>

          <button
            type="button"
            onClick={handleSaveDefault}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved & Applied!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Set as Default & Apply'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
