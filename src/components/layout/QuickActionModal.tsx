import React from 'react';
import {
  X,
  Receipt,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  ClipboardList,
  Package,
  Gauge,
  TrendingDown,
  ShoppingBag
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-invoice',
      label: 'New GST Invoice',
      desc: 'Create tax invoice for sales or services',
      icon: Receipt,
      color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100/70',
      badge: 'Sales'
    },
    {
      id: 'receive-payment',
      label: 'Receive Payment',
      desc: 'Record customer payment & generate receipt',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/70',
      badge: 'Receipt'
    },
    {
      id: 'new-quotation',
      label: 'New Quotation',
      desc: 'Generate estimate for fire safety project',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100/70',
      badge: 'Estimate'
    },
    {
      id: 'new-customer',
      label: 'Add Customer',
      desc: 'Register new client, party or society',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100/70',
      badge: 'Party'
    },
    {
      id: 'new-amc',
      label: 'New AMC / CMC',
      desc: 'Register annual maintenance contract',
      icon: ShieldCheck,
      color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/70',
      badge: 'Contract'
    },
    {
      id: 'new-service-report',
      label: 'Service Inspection Report',
      desc: 'Record extinguisher/alarm inspection',
      icon: ClipboardList,
      color: 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100/70',
      badge: 'Technical'
    },
    {
      id: 'new-pump-test',
      label: 'Fire Pump Test Record',
      desc: 'Log hydraulic pressure & cut-in test',
      icon: Gauge,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100/70',
      badge: 'Hydraulic'
    },
    {
      id: 'new-product',
      label: 'Add Item / Service',
      desc: 'Create fire equipment item or service',
      icon: Package,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100/70',
      badge: 'Inventory'
    },
    {
      id: 'new-expense',
      label: 'Record Expense',
      desc: 'Log fuel, labour or office expense',
      icon: TrendingDown,
      color: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/70',
      badge: 'Expense'
    },
    {
      id: 'new-purchase',
      label: 'Vendor Purchase',
      desc: 'Add purchase bill to restock inventory',
      icon: ShoppingBag,
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100/70',
      badge: 'Purchase'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Quick Action</h3>
            <p className="text-xs text-slate-500">What would you like to create right now?</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[70vh] overflow-y-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all active:scale-98 ${act.color}`}
              >
                <div className="p-2 rounded-lg bg-white/80 shrink-0 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-slate-800 truncate">{act.label}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-slate-600 shrink-0 border border-black/5">
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Shortcuts ready for mobile one-hand operation</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
