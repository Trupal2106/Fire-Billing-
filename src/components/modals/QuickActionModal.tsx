import React from 'react';
import {
  X,
  Receipt,
  FileText,
  CreditCard,
  ShoppingBag,
  TrendingDown,
  ShieldCheck,
  Wrench,
  UserPlus,
  PackagePlus,
  Boxes
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      key: 'new-invoice',
      title: 'Tax Invoice',
      desc: 'Bill clients for fire safety goods & installation',
      icon: Receipt,
      color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
    },
    {
      key: 'new-quotation',
      title: 'Estimate / Quotation',
      desc: 'Send formal quote with 1-click convert to invoice',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
    },
    {
      key: 'new-payment',
      title: 'Receive Payment',
      desc: 'Record customer receipt with ledger update',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
    },
    {
      key: 'new-purchase',
      title: 'Purchase Bill',
      desc: 'Record vendor bill and update raw inventory',
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
    },
    {
      key: 'new-expense',
      title: 'Record Expense',
      desc: 'Track fuel, site travel, technician allowance',
      icon: TrendingDown,
      color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
    },
    {
      key: 'new-amc',
      title: 'AMC / Maintenance',
      desc: 'Create annual contract with visit schedules',
      icon: ShieldCheck,
      color: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
    },
    {
      key: 'new-service-report',
      title: 'Service Inspection Sheet',
      desc: 'Conduct on-site extinguisher inspection report',
      icon: Wrench,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
    },
    {
      key: 'new-customer',
      title: 'Add Client / Party',
      desc: 'Register business client with GSTIN & site location',
      icon: UserPlus,
      color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200'
    },
    {
      key: 'new-product',
      title: 'Add Product / Service',
      desc: 'Add fire extinguisher or refilling item to catalogue',
      icon: PackagePlus,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
    },
    {
      key: 'stock-adjustment',
      title: 'Stock Adjustment',
      desc: 'Adjust inventory quantities with reason audit',
      icon: Boxes,
      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Quick Action Launcher</h3>
            <p className="text-xs text-slate-500">Select what you would like to create</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto p-1">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={() => {
                  onClose();
                  onSelectAction(act.key);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all active:scale-98 ${act.color}`}
              >
                <div className="p-2 rounded-lg bg-white/80 shrink-0 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs leading-tight">{act.title}</h4>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
