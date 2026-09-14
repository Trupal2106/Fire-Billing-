import React from 'react';
import {
  X,
  Building2,
  Check,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { CompanySettings } from '../../types';

interface CompanySwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanySettings[];
  activeCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  onOpenCreateCompany: () => void;
  onEditCompany: (company: CompanySettings) => void;
  onDeleteCompany?: (companyId: string) => void;
}

export const CompanySwitcherModal: React.FC<CompanySwitcherModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompanyId,
  onSelectCompany,
  onOpenCreateCompany,
  onEditCompany,
  onDeleteCompany
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-700 to-red-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Company Accounts</h2>
              <p className="text-red-100 text-[11px]">
                Switch between business profiles or create a new company
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-red-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-800">{companies.length}</span> Company Account{companies.length !== 1 ? 's' : ''} Configured
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateCompany();
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Company</span>
          </button>
        </div>

        {/* Companies List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {companies.map((company) => {
            const isActive = company.id === activeCompanyId;
            const cName = company.companyName || company.name || 'Unnamed Company';

            return (
              <div
                key={company.id}
                onClick={() => {
                  if (!isActive) {
                    onSelectCompany(company.id);
                    onClose();
                  }
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isActive
                    ? 'border-red-600 bg-red-50/20 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Logo / Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 p-1">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={cName}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Building2 className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                      )}
                    </div>

                    {/* Information */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                          {cName}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {company.tagline && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {company.tagline}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                        {company.gstin && (
                          <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            GSTIN: {company.gstin}
                          </span>
                        )}
                        {(company.city || company.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {[company.city, company.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {(company.phone || company.mobile) && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {company.phone || company.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditCompany(company);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Company Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {companies.length > 1 && onDeleteCompany && !isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete company profile "${cName}"?`)) {
                            onDeleteCompany(company.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Company Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCompany(company.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors ml-1 flex items-center gap-1"
                      >
                        <span>Switch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateCompany();
            }}
            className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>Add Another Company</span>
          </button>
        </div>
      </div>
    </div>
  );
};
