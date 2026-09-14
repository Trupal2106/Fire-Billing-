import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Package
} from 'lucide-react';
import { Purchase } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PurchaseListViewProps {
  purchases: Purchase[];
  onNewPurchase: () => void;
  onDeletePurchase: (purchase: Purchase) => void;
}

export const PurchaseListView: React.FC<PurchaseListViewProps> = ({
  purchases,
  onNewPurchase,
  onDeletePurchase
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      return (
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.purchaseInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [purchases, searchTerm]);

  const totalPurchases = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  }, [purchases]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Purchases & Supplier Bills
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log vendor invoices for cylinders, valves, hoses & refilling gas supplies
          </p>
        </div>

        <button
          onClick={onNewPurchase}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Purchase Bill</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Purchase Invoices</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{purchases.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Purchase Spend</span>
          <div className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(totalPurchases)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Inventory Status</span>
          <div className="text-sm font-bold text-emerald-600 mt-2">Auto-Synced with Stock</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by supplier name or bill number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Purchases List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No purchase records found</p>
            <p className="text-xs text-slate-400 mt-1">Log supplier purchase bills to restock fire safety equipment</p>
            <button
              onClick={onNewPurchase}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Purchase</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPurchases.map(p => (
              <div
                key={p.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{p.supplierName}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-slate-100 text-slate-700">
                        Bill: {p.purchaseInvoiceNo}
                      </span>
                    </div>
                    {p.supplierGstin && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">GSTIN: {p.supplierGstin}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Date: {formatDate(p.purchaseDate)} • Items: {p.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left md:text-right shrink-0">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Amount</span>
                    <span className="text-base font-bold text-slate-900 block">{formatCurrency(p.grandTotal)}</span>
                    <span className="text-[10px] text-slate-400 block">
                      Taxable: {formatCurrency(p.taxableAmount)} | GST: {formatCurrency(p.gstAmount)}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeletePurchase(p)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
