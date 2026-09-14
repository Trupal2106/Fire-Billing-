import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  CreditCard,
  ShoppingBag,
  TrendingDown,
  Boxes,
  ShieldCheck,
  Flame,
  ClipboardList,
  BarChart3,
  Database,
  Settings,
  BotMessageSquare,
  Search,
  Plus,
  X,
  Palette,
  ChevronsUpDown,
  Building2,
  Check,
  CalendarDays
} from 'lucide-react';
import { CompanySettings } from '../../types';

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  onOpenQuickAction: () => void;
  onOpenGlobalSearch: () => void;
  onCloseMobile?: () => void;
  lowStockCount?: number;
  upcomingAmcCount?: number;
  companySettings?: CompanySettings;
  companies?: CompanySettings[];
  onOpenCompanySwitcher?: () => void;
  onOpenCreateCompany?: () => void;
  onSwitchCompany?: (companyId: string) => void;
}

interface NavGroup {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  onOpenQuickAction,
  onOpenGlobalSearch,
  onCloseMobile,
  lowStockCount = 0,
  upcomingAmcCount = 0,
  companySettings,
  companies = [],
  onOpenCompanySwitcher,
  onOpenCreateCompany,
  onSwitchCompany
}) => {
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = React.useState(false);
  const compName = companySettings?.companyName || 'FIRE CARE SAFETY SOLUTION';
  const initial = compName.charAt(0).toUpperCase() || 'F';

  const navGroups: NavGroup[] = [
    {
      title: 'Main Console',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'quotations', label: 'Quotations', icon: FileText }
      ]
    },
    {
      title: 'Maintenance',
      items: [
        { id: 'amc', label: 'AMC Contracts', icon: ShieldCheck },
        { id: 'service-reports', label: 'Service Reports', icon: ClipboardList },
        { id: 'inventory', label: 'Inventory', icon: Boxes },
        { id: 'equipment', label: 'Equipment Registry', icon: Flame }
      ]
    },
    {
      title: 'Finance & Records',
      items: [
        { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
        { id: 'purchases', label: 'Purchases (Bills)', icon: ShoppingBag },
        { id: 'expenses', label: 'Expenses', icon: TrendingDown },
        { id: 'products', label: 'Products & Services', icon: Package }
      ]
    },
    {
      title: 'Staff & Operations',
      items: [
        { id: 'staff-payroll', label: 'Staff & Calendar', icon: CalendarDays }
      ]
    },
    {
      title: 'Analytics & Tools',
      items: [
        { id: 'reports', label: 'GST & Sales Reports', icon: BarChart3 },
        { id: 'bill-customization', label: 'Bill Customization', icon: Palette },
        { id: 'ai-assistant', label: 'AI Fire Assistant', icon: BotMessageSquare },
        { id: 'backup', label: 'Laptop Data & Backup', icon: Database },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header & Company Switcher (Image 3) */}
      <div className="relative border-b border-slate-800 bg-red-700">
        <div className="p-4 flex items-center justify-between gap-2">
          <div
            onClick={() => setIsCompanyDropdownOpen(prev => !prev)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:bg-red-800/60 p-1 -m-1 rounded-xl transition-all group"
            title="Click to switch company or add a new business account"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 group-hover:bg-white/25 flex items-center justify-center shrink-0 overflow-hidden transition-colors border border-white/20">
              {companySettings?.logo ? (
                <img
                  src={companySettings.logo}
                  alt={compName}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <Flame className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h1 className="text-white font-bold text-sm tracking-tight uppercase leading-tight truncate">
                  {compName}
                </h1>
                <ChevronsUpDown className="w-3.5 h-3.5 text-red-200 group-hover:text-white shrink-0" />
              </div>
              <p className="text-red-100 text-[10px] uppercase font-semibold tracking-wider mt-0.5 truncate">
                {companySettings?.tagline || 'Safety & Protection Solutions'}
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-red-800 transition-colors ml-1 shrink-0"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Interactive Company Switcher Dropdown */}
        {isCompanyDropdownOpen && (
          <div className="absolute top-full left-0 right-0 z-40 bg-slate-800 border-b border-slate-700 shadow-2xl p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Business Accounts ({companies.length || 1})</span>
              <button
                type="button"
                onClick={() => setIsCompanyDropdownOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of companies */}
            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
              {(companies.length > 0 ? companies : companySettings ? [companySettings] : []).map(comp => {
                const isActive = comp.id === (companySettings?.id || 'default');
                const name = comp.companyName || comp.name || 'Unnamed Company';
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      setIsCompanyDropdownOpen(false);
                      if (onSwitchCompany && !isActive) {
                        onSwitchCompany(comp.id);
                      }
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
                      isActive
                        ? 'bg-red-600/30 text-white border border-red-500/50'
                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {comp.logo ? (
                          <img src={comp.logo} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{name}</p>
                        {comp.gstin && (
                          <p className="text-[10px] text-slate-400 truncate">GST: {comp.gstin}</p>
                        )}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Actions: Add New Company & Manage */}
            <div className="pt-2 border-t border-slate-700 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsCompanyDropdownOpen(false);
                  if (onOpenCreateCompany) onOpenCreateCompany();
                }}
                className="w-full py-1.5 px-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Company</span>
              </button>

              {onOpenCompanySwitcher && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCompanyDropdownOpen(false);
                    onOpenCompanySwitcher();
                  }}
                  className="w-full py-1 px-2 text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors text-center"
                >
                  Manage All Accounts & Locations
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Search & Action Bar */}
      <div className="p-3 border-b border-slate-800/80 space-y-2">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-400 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-md border border-slate-700/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search records...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded border border-slate-700">⌘K</kbd>
        </button>
      </div>

      {/* Navigation Group Links */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-5 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;

                let badgeNode: React.ReactNode = null;
                if (item.id === 'inventory' && lowStockCount > 0) {
                  badgeNode = (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {lowStockCount}
                    </span>
                  );
                } else if (item.id === 'amc' && upcomingAmcCount > 0) {
                  badgeNode = (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {upcomingAmcCount}
                    </span>
                  );
                } else if (item.id === 'ai-assistant') {
                  badgeNode = (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      AI
                    </span>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-5 py-2.5 text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-slate-800 text-white border-l-4 border-red-500 shadow-inner font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {badgeNode}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 bg-slate-950 flex items-center gap-3 border-t border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border border-red-500/40 shrink-0">
          {initial}
        </div>
        <div className="flex-1 overflow-hidden min-w-0">
          <p className="text-xs text-white font-medium truncate">Admin Portal</p>
          <p className="text-[10px] text-slate-400 truncate">{compName}</p>
        </div>
      </div>
    </aside>
  );
};

