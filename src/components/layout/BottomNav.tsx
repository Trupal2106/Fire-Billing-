import React from 'react';
import { Home, Users, Receipt, ShieldCheck, Menu, Plus } from 'lucide-react';

interface BottomNavProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  onOpenQuickAction: () => void;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentSection,
  onNavigate,
  onOpenQuickAction,
  onOpenMobileMenu
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
          currentSection === 'dashboard' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate('customers')}
        className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
          currentSection === 'customers' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>Customers</span>
      </button>

      {/* Floating Center Action Button */}
      <button
        onClick={onOpenQuickAction}
        className="w-11 h-11 -mt-4 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 border-2 border-white active:scale-95 transition-transform"
        aria-label="Create New"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={() => onNavigate('invoices')}
        className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
          currentSection === 'invoices' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Receipt className="w-5 h-5 mb-0.5" />
        <span>Invoices</span>
      </button>

      <button
        onClick={() => onNavigate('amc')}
        className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
          currentSection === 'amc' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <ShieldCheck className="w-5 h-5 mb-0.5" />
        <span>AMC</span>
      </button>
    </div>
  );
};

