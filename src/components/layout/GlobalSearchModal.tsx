import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Users,
  Receipt,
  FileText,
  CreditCard,
  Package,
  ShieldCheck,
  Flame,
  ClipboardList,
  ArrowRight
} from 'lucide-react';
import {
  Customer,
  Invoice,
  Quotation,
  PaymentReceipt,
  ProductItem,
  AmcContract,
  EquipmentRecord,
  ServiceReport
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  invoices: Invoice[];
  quotations: Quotation[];
  payments: PaymentReceipt[];
  products: ProductItem[];
  amcContracts: AmcContract[];
  equipment: EquipmentRecord[];
  serviceReports: ServiceReport[];
  onSelectResult: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  customers,
  invoices,
  quotations,
  payments,
  products,
  amcContracts,
  equipment,
  serviceReports,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const matchedCustomers = customers
      .filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q) || (c.gstin && c.gstin.toLowerCase().includes(q)))
      .slice(0, 4)
      .map(c => ({
        id: c.id,
        type: 'customer',
        title: c.name,
        subtitle: `Ph: ${c.mobile} | Outstanding: ${formatCurrency(c.currentOutstanding)}`,
        icon: Users,
        badge: 'Customer'
      }));

    const matchedInvoices = invoices
      .filter(inv => inv.invoiceNo.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q))
      .slice(0, 4)
      .map(inv => ({
        id: inv.id,
        type: 'invoice',
        title: `${inv.invoiceNo} - ${inv.customerName}`,
        subtitle: `Date: ${formatDate(inv.invoiceDate)} | Total: ${formatCurrency(inv.grandTotal)} | Status: ${inv.status}`,
        icon: Receipt,
        badge: 'Invoice'
      }));

    const matchedQuotations = quotations
      .filter(qtn => qtn.quotationNo.toLowerCase().includes(q) || qtn.customerName.toLowerCase().includes(q))
      .slice(0, 3)
      .map(qtn => ({
        id: qtn.id,
        type: 'quotation',
        title: `${qtn.quotationNo} - ${qtn.customerName}`,
        subtitle: `Valid: ${formatDate(qtn.validUntil)} | Total: ${formatCurrency(qtn.grandTotal)}`,
        icon: FileText,
        badge: 'Quotation'
      }));

    const matchedProducts = products
      .filter(p => p.name.toLowerCase().includes(q) || p.hsnSac.includes(q))
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        type: 'product',
        title: p.name,
        subtitle: `HSN/SAC: ${p.hsnSac} | Rate: ${formatCurrency(p.sellingPrice)} | Stock: ${p.currentStock} ${p.unit}`,
        icon: Package,
        badge: 'Product'
      }));

    const matchedAmc = amcContracts
      .filter(a => a.contractNo.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q) || a.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        type: 'amc',
        title: `${a.contractNo} - ${a.customerName}`,
        subtitle: `${a.title} | ${formatDate(a.startDate)} to ${formatDate(a.endDate)}`,
        icon: ShieldCheck,
        badge: 'AMC'
      }));

    const matchedEquipment = equipment
      .filter(e => e.serialNo.toLowerCase().includes(q) || e.customerName.toLowerCase().includes(q) || e.equipmentType.toLowerCase().includes(q))
      .slice(0, 3)
      .map(e => ({
        id: e.id,
        type: 'equipment',
        title: `${e.equipmentType} (${e.serialNo})`,
        subtitle: `${e.customerName} | Loc: ${e.location} | Cond: ${e.condition}`,
        icon: Flame,
        badge: 'Equipment'
      }));

    const matchedReports = serviceReports
      .filter(sr => sr.reportNo.toLowerCase().includes(q) || sr.customerName.toLowerCase().includes(q))
      .slice(0, 3)
      .map(sr => ({
        id: sr.id,
        type: 'service-report',
        title: `${sr.reportNo} - ${sr.customerName}`,
        subtitle: `Date: ${formatDate(sr.date)} | Tech: ${sr.technicianName}`,
        icon: ClipboardList,
        badge: 'Service Report'
      }));

    return [
      ...matchedCustomers,
      ...matchedInvoices,
      ...matchedQuotations,
      ...matchedProducts,
      ...matchedAmc,
      ...matchedEquipment,
      ...matchedReports
    ];
  }, [query, customers, invoices, quotations, products, amcContracts, equipment, serviceReports]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-red-600 shrink-0" />
          <input
            type="text"
            placeholder="Search party name, invoice #, quotation #, product, equipment serial, AMC..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="text-sm font-medium text-slate-600">Type to search across all business records</p>
              <p className="text-xs text-slate-400 mt-1">Customers, Invoices, Estimates, Stock Items, AMC, Reports</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">No records found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by GSTIN, Serial No, or Contact Name</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {results.map((res, idx) => {
                const Icon = res.icon;
                return (
                  <button
                    key={`${res.type}_${res.id}_${idx}`}
                    onClick={() => {
                      onSelectResult(res.type, res.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between gap-3 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-red-50 text-slate-600 group-hover:text-red-600 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-800 truncate">{res.title}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {res.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{res.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Total matches: {results.length}</span>
          <span className="hidden sm:inline">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
