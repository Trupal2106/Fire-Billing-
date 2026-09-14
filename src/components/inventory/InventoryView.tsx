import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  TrendingUp,
  Download
} from 'lucide-react';
import { ProductItem, InventoryLog } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InventoryViewProps {
  products: ProductItem[];
  inventoryLogs: InventoryLog[];
  onOpenAddProduct: () => void;
  onOpenAdjustStock: (product: ProductItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  inventoryLogs,
  onOpenAddProduct,
  onOpenAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'logs'>('items');

  const hardwareProducts = useMemo(() => {
    return products.filter(p => p.type === 'product');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return hardwareProducts.filter(p => {
      return (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hsnSac.includes(searchTerm) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [hardwareProducts, searchTerm]);

  const lowStockItems = useMemo(() => {
    return hardwareProducts.filter(p => p.currentStock <= p.minStock);
  }, [hardwareProducts]);

  // Valuations
  const totalPurchaseValuation = useMemo(() => {
    return hardwareProducts.reduce((sum, p) => sum + p.currentStock * (p.purchasePrice || 0), 0);
  }, [hardwareProducts]);

  const totalSellingValuation = useMemo(() => {
    return hardwareProducts.reduce((sum, p) => sum + p.currentStock * (p.sellingPrice || 0), 0);
  }, [hardwareProducts]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Inventory & Cylinder Stock
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor fire extinguisher hardware, powder stock, valves and refilling spares
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Stock Item</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tracked Stock Items</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{hardwareProducts.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Purchase Valuation</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalPurchaseValuation)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Estimated Retail Value</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalSellingValuation)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Low Stock Reorders</span>
          <div className={`text-xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {lowStockItems.length}
          </div>
        </div>
      </div>

      {/* Low Stock Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900 text-xs">Low Stock Alert on {lowStockItems.length} Products</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">
              The following items have reached or breached their minimum safety stock threshold:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.map(p => (
                <span
                  key={p.id}
                  onClick={() => onOpenAdjustStock(p)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-rose-300 text-rose-800 shadow-2xs cursor-pointer hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
                >
                  <span>{p.name}:</span>
                  <strong className="text-rose-600">{p.currentStock} {p.unit}</strong>
                  <span className="text-[10px] text-slate-400">(Min: {p.minStock})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'items'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Current Stock Levels ({hardwareProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Movement Audit History ({inventoryLogs.length})
          </button>
        </div>

        {activeTab === 'items' && (
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search stock..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-red-500"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'items' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3 text-right">Purchase Cost</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-center">Available Stock</th>
                  <th className="p-3 text-right">Stock Valuation</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const isLow = p.currentStock <= p.minStock;
                  const itemValuation = p.currentStock * (p.purchasePrice || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        {p.description && <span className="text-[11px] text-slate-400 line-clamp-1">{p.description}</span>}
                      </td>

                      <td className="p-3 text-slate-600">{p.category || 'General'}</td>
                      <td className="p-3 font-mono text-slate-600">{p.hsnSac}</td>

                      <td className="p-3 text-right text-slate-700">
                        {p.purchasePrice > 0 ? formatCurrency(p.purchasePrice) : '-'}
                      </td>

                      <td className="p-3 text-right font-semibold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {p.currentStock} {p.unit}
                          </span>
                          {isLow && (
                            <span className="text-[9px] text-rose-600 font-bold mt-0.5">
                              Min: {p.minStock}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatCurrency(itemValuation)}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenAdjustStock(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Adjust stock quantity"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Movement Logs */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {inventoryLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No stock movements logged yet</p>
              <p className="text-xs text-slate-400 mt-1">Stock movements are automatically recorded when purchases or adjustments are made</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inventoryLogs.map(log => {
                const isIn = log.type === 'purchase' || (log.type as any) === 'in';
                const isOut = log.type === 'sale' || (log.type as any) === 'out';
                const qty = log.quantity ?? Math.abs(log.quantityChange ?? 0);
                const stock = log.stockAfter ?? log.newStock ?? 0;
                const reasonText = log.reason || log.notes || log.referenceNo || (isIn ? 'Stock Addition' : isOut ? 'Stock Out' : 'Adjustment');

                return (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        isIn
                          ? 'bg-emerald-50 text-emerald-600'
                          : isOut
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 block">{log.productName}</span>
                        <span className="text-[11px] text-slate-500">{reasonText} • {formatDate(log.date)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-bold text-sm block ${
                        isIn ? 'text-emerald-600' : isOut ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {isIn ? '+' : isOut ? '-' : ''}{qty}
                      </span>
                      <span className="text-[10px] text-slate-400">Stock: {stock}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
