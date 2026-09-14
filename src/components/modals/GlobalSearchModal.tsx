import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Users,
  Receipt,
  FileText,
  Package,
  ShieldCheck,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { Customer, Invoice, Quotation, Product, AmcContract, Purchase } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  invoices: Invoice[];
  quotations: Quotation[];
  products: Product[];
  amcContracts: AmcContract[];
  purchases: Purchase[];
  onSelectResult: (type: string, item: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  customers,
  invoices,
  quotations,
  products,
  amcContracts,
  purchases,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const list: Array<{
      category: 'Customer' | 'Invoice' | 'Quotation' | 'Product' | 'AMC' | 'Purchase';
      id: string;
      title: string;
      subtitle: string;
      extra?: string;
      raw: any;
    }> = [];

    // Search Customers
    customers.forEach(c => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q)
      ) {
        list.push({
          category: 'Customer',
          id: c.id,
          title: c.name,
          subtitle: `${c.city} • Ph: ${c.mobile} ${c.gstin ? `• GST: ${c.gstin}` : ''}`,
          extra: c.currentOutstanding ? `Due: ${formatCurrency(c.currentOutstanding)}` : undefined,
          raw: c
        });
      }
    });

    // Search Invoices
    invoices.forEach(inv => {
      if (
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q)
      ) {
        list.push({
          category: 'Invoice',
          id: inv.id,
          title: `${inv.invoiceNo} - ${inv.customerName}`,
          subtitle: `Date: ${formatDate(inv.invoiceDate)} • Status: ${inv.status}`,
          extra: formatCurrency(inv.grandTotal),
          raw: inv
        });
      }
    });

    // Search Quotations
    quotations.forEach(qtn => {
      if (
        qtn.quotationNo.toLowerCase().includes(q) ||
        qtn.customerName.toLowerCase().includes(q)
      ) {
        list.push({
          category: 'Quotation',
          id: qtn.id,
          title: `${qtn.quotationNo} - ${qtn.customerName}`,
          subtitle: `Date: ${formatDate(qtn.date)} • Status: ${qtn.status}`,
          extra: formatCurrency(qtn.grandTotal),
          raw: qtn
        });
      }
    });

    // Search Products
    products.forEach(p => {
      if (
        p.name.toLowerCase().includes(q) ||
        (p.hsnSac && p.hsnSac.includes(q)) ||
        p.category.toLowerCase().includes(q)
      ) {
        list.push({
          category: 'Product',
          id: p.id,
          title: p.name,
          subtitle: `HSN: ${p.hsnSac} • Stock: ${p.currentStock} ${p.unit}`,
          extra: `Sale: ${formatCurrency(p.sellingPrice)}`,
          raw: p
        });
      }
    });

    // Search AMC
    amcContracts.forEach(a => {
      if (
        a.contractNo.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
      ) {
        list.push({
          category: 'AMC',
          id: a.id,
          title: `${a.contractNo} - ${a.customerName}`,
          subtitle: `${a.title} • Expires: ${formatDate(a.endDate)}`,
          extra: formatCurrency(a.totalAmount),
          raw: a
        });
      }
    });

    return list.slice(0, 15);
  }, [query, customers, invoices, quotations, products, amcContracts, purchases]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type customer name, invoice #, quote #, product HSN or mobile..."
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Search across clients, invoices, estimates, fire equipment inventory & AMC contracts
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res) => (
                <button
                  key={`${res.category}_${res.id}`}
                  onClick={() => {
                    onClose();
                    onSelectResult(res.category, res.raw);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
                      res.category === 'Customer'
                        ? 'bg-red-50 text-red-700'
                        : res.category === 'Invoice'
                        ? 'bg-blue-50 text-blue-700'
                        : res.category === 'Quotation'
                        ? 'bg-purple-50 text-purple-700'
                        : res.category === 'Product'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {res.category}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 truncate transition-colors">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{res.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {res.extra && (
                      <span className="text-xs font-bold text-slate-900">{res.extra}</span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Press ESC to close</span>
          <span>Patel Fire Universal Index</span>
        </div>
      </div>
    </div>
  );
};
