import React from 'react';
import { Menu, Search, Plus, Bell, Flame, Sparkles, Home } from 'lucide-react';
import { CompanySettings } from '../../types';

interface NavbarProps {
  currentSection: string;
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenQuickAction: () => void;
  onNavigate: (section: string) => void;
  companySettings?: CompanySettings;
  upcomingAmcCount?: number;
  lowStockCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenQuickAction,
  onNavigate,
  companySettings,
  upcomingAmcCount = 0,
  lowStockCount = 0
}) => {
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Business Overview';
      case 'customers': return 'Customers & Clients';
      case 'products': return 'Products & Inventory Catalog';
      case 'quotations': return 'Quotations & Estimates';
      case 'invoices': return 'GST Tax Invoices';
      case 'payments': return 'Payments & Receipts';
      case 'purchases': return 'Vendor Purchases';
      case 'expenses': return 'Operating Expenses';
      case 'inventory': return 'Inventory & Stock Movements';
      case 'amc': return 'AMC / CMC Contracts';
      case 'equipment': return 'Equipment Registry';
      case 'service-reports': return 'Service & Pump Reports';
      case 'staff-payroll': return 'Staff Attendance, Calendar & Payroll';
      case 'reports': return 'Financial & GST Reports';
      case 'backup': return 'Laptop Data & Backup Center';
      case 'settings': return 'Company Settings';
      case 'bill-customization': return 'Bill Customization';
      case 'ai-assistant': return 'Fire Safety AI Assistant';
      default: return 'Business Console';
    }
  };

  const totalAlerts = upcomingAmcCount + lowStockCount;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-xs sticky top-0 z-20 shrink-0">
      {/* Breadcrumb / Title with Clickable Home button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer group"
            title="Click to go to Dashboard"
          >
            <Home className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
            <span>Home</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800">{getSectionTitle()}</span>
          {companySettings?.companyName && (
            <span className="hidden xl:inline-block text-slate-400 font-normal text-xs ml-2">
              • {companySettings.companyName}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Global Search button */}
        <button
          onClick={onOpenGlobalSearch}
          className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-md text-xs font-medium transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white text-slate-400 rounded border border-slate-200">⌘K</kbd>
        </button>

        {/* AI Assistant shortcut */}
        <button
          onClick={() => onNavigate('ai-assistant')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
            currentSection === 'ai-assistant'
              ? 'bg-red-700 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>AI Assistant</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => onNavigate(upcomingAmcCount > 0 ? 'amc' : 'inventory')}
          className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-md hover:bg-slate-50 transition-all relative flex items-center justify-center"
          title={`${upcomingAmcCount} AMC visits due, ${lowStockCount} items low in stock`}
        >
          <Bell className="w-4 h-4" />
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {totalAlerts}
            </span>
          )}
        </button>

        {/* Create Invoice / Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <span className="text-lg leading-none font-normal">+</span>
          <span>Create Invoice</span>
        </button>
      </div>
    </header>
  );
};

