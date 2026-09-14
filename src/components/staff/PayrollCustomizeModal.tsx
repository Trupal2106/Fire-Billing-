import React, { useState } from 'react';
import { X, Sliders, Check, RotateCcw, ShieldAlert, Percent, HelpCircle } from 'lucide-react';
import { PayrollConfig } from '../../types';
import { DEFAULT_PAYROLL_CONFIG } from '../../utils/indianPayroll';

interface PayrollCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PayrollConfig;
  onSaveConfig: (updatedConfig: PayrollConfig) => Promise<void>;
}

export const PayrollCustomizeModal: React.FC<PayrollCustomizeModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [formData, setFormData] = useState<PayrollConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    if (window.confirm('Reset all PF, ESI, PT and GST rules to standard statutory Indian government rates?')) {
      setFormData({ ...DEFAULT_PAYROLL_CONFIG });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSaveConfig(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save rules');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Customize Indian Payroll, PF, ESI & GST Rules</h3>
              <p className="text-[11px] text-slate-500">Configure statutory percentages, ceilings & tax limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* 1. Provident Fund (EPFO Rules) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Provident Fund (PF / EPFO) Rules
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                EPF Act 1952
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee Contribution Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.pfEmployeeRate}
                    onChange={e => setFormData(p => ({ ...p, pfEmployeeRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Default standard: 12%</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employer Contribution Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.pfEmployerRate}
                    onChange={e => setFormData(p => ({ ...p, pfEmployerRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Default standard: 12% (EPS + EPF)</span>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-1">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.usePfCeiling}
                      onChange={e => setFormData(p => ({ ...p, usePfCeiling: e.target.checked }))}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800">Apply Statutory Wage Ceiling Cap</span>
                  </label>
                  <span className="text-[10px] text-slate-400 ml-6 block">
                    Caps PF base to ₹15,000 max (even if Basic + DA is higher)
                  </span>
                </div>

                {formData.usePfCeiling && (
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={formData.pfWageCeiling}
                        onChange={e => setFormData(p => ({ ...p, pfWageCeiling: parseInt(e.target.value, 10) || 15000 }))}
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Employee State Insurance (ESIC) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Employee State Insurance (ESIC) Rules
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                ESI Act 1948
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee ESI Share (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.esiEmployeeRate}
                    onChange={e => setFormData(p => ({ ...p, esiEmployeeRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Default standard: 0.75% of Gross</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employer ESI Share (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.esiEmployerRate}
                    onChange={e => setFormData(p => ({ ...p, esiEmployerRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Default standard: 3.25% of Gross</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ESI Eligibility Gross Salary Limit (Per Month)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.esiGrossLimit}
                    onChange={e => setFormData(p => ({ ...p, esiGrossLimit: parseInt(e.target.value, 10) || 21000 }))}
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Staff earning gross above ₹21,000/month are exempt from ESI.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Professional Tax (PT) & GST on Staff Services */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Professional Tax (PT) & Manpower GST
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  State Professional Tax (PT) / Month
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.ptAmount}
                    onChange={e => setFormData(p => ({ ...p, ptAmount: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Gujarat / Indian slab: ₹200/mo</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GST Rate on Manpower Supply / Staffing (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="28"
                    value={formData.gstRate}
                    onChange={e => setFormData(p => ({ ...p, gstRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-purple-700"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Indian SAC 9985: Standard 18%</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Statutory Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Apply Calculation Rules'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
