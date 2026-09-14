import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
  Wrench,
  ShieldCheck,
  Download,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { ProductItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { exportProductsToExcel } from '../../utils/excelExporter';

interface ProductListViewProps {
  products: ProductItem[];
  onAddProduct: () => void;
  onEditProduct: (product: ProductItem) => void;
  onDeleteProduct: (product: ProductItem) => void;
  onAdjustStock?: (product: ProductItem) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'product' | 'service' | 'amc' | 'labour'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hsnSac.includes(searchTerm) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      return true;
    });
  }, [products, searchTerm, selectedType]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.type === 'product' && p.currentStock <= p.minStock).length;
  }, [products]);

  // Export to CSV
  const exportProductsCSV = () => {
    const headers = ['Name', 'Classification', 'Category', 'HSN/SAC', 'Unit', 'Selling Price', 'Purchase Price', 'GST Rate', 'Current Stock', 'Min Stock'];
    const rows = products.map(p => [
      `"${p.name}"`,
      p.type,
      `"${p.category || ''}"`,
      `"${p.hsnSac}"`,
      p.unit,
      p.sellingPrice,
      p.purchasePrice,
      `${p.gstRate}%`,
      p.currentStock,
      p.minStock
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Patel_Fire_Items_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Products & Fire Safety Services
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage extinguisher hardware, refilling services, spare parts & AMC packages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportProductsToExcel(filteredProducts, `Inventory_Products_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Export Products to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onAddProduct}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item / Service</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Items in Catalog</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{products.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Hardware / Equipment</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{products.filter(p => p.type === 'product').length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Service / Refilling</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{products.filter(p => p.type === 'service' || p.type === 'labour').length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Low Stock Warnings</span>
          <div className={`text-xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {lowStockCount}
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, HSN code or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(['all', 'product', 'service', 'amc', 'labour'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                selectedType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? `All Items (${products.length})` : t}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No items found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting the filter or add a new fire safety item</p>
            <button
              onClick={onAddProduct}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Item</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item / Service Details</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">HSN / SAC</th>
                  <th className="p-3 text-right">Selling Rate</th>
                  <th className="p-3 text-right">Purchase Rate</th>
                  <th className="p-3 text-center">GST Rate</th>
                  <th className="p-3 text-center">Stock Level</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const isLowStock = p.type === 'product' && p.currentStock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Desc */}
                      <td className="p-3">
                        <span className="font-bold text-xs text-slate-900 block">{p.name}</span>
                        {p.description && (
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.description}</span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400">Category: {p.category || 'General'}</span>
                      </td>

                      {/* Type Badge */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          p.type === 'product'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : p.type === 'service'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.type === 'amc'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {p.type}
                        </span>
                      </td>

                      {/* HSN/SAC */}
                      <td className="p-3 font-mono font-medium text-slate-600">{p.hsnSac || '-'}</td>

                      {/* Selling Price */}
                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                        <span className="text-[10px] font-normal text-slate-400 block">/ {p.unit}</span>
                      </td>

                      {/* Purchase Price */}
                      <td className="p-3 text-right text-slate-600">
                        {p.purchasePrice > 0 ? formatCurrency(p.purchasePrice) : '-'}
                      </td>

                      {/* GST Rate */}
                      <td className="p-3 text-center">
                        <span className="font-semibold text-slate-700">{p.gstRate}%</span>
                      </td>

                      {/* Stock Level */}
                      <td className="p-3 text-center">
                        {p.type === 'product' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                              isLowStock
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {p.currentStock} {p.unit}
                            </span>
                            {isLowStock && (
                              <span className="text-[9px] text-rose-600 font-bold flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A (Service)</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.type === 'product' && onAdjustStock && (
                            <button
                              onClick={() => onAdjustStock(p)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="Adjust Stock"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
