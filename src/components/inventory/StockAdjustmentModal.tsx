import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertCircle, Package } from 'lucide-react';
import { ProductItem } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  products?: ProductItem[];
  onClose: () => void;
  onSaveAdjustment: (productId: string, adjustmentType: 'in' | 'out' | 'set', quantity: number, reason: string) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  product,
  products = [],
  onClose,
  onSaveAdjustment
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || products?.[0]?.id || '');
  const [type, setType] = useState<'in' | 'out' | 'set'>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState('Manual Stock Correction');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Update selected product when prop changes
  React.useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
    } else if (products && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [product, products]);

  if (!isOpen) return null;

  const currentProduct = product || products?.find(p => p.id === selectedProductId) || products?.[0];
  if (!currentProduct) return null;

  const currentStock = currentProduct.currentStock;
  let newCalculatedStock = currentStock;
  if (type === 'in') newCalculatedStock = currentStock + (quantity || 0);
  else if (type === 'out') newCalculatedStock = Math.max(0, currentStock - (quantity || 0));
  else if (type === 'set') newCalculatedStock = quantity || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      await onSaveAdjustment(currentProduct.id, type, Number(quantity), reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Adjust Stock Level</h3>
              <p className="text-xs text-slate-500">{currentProduct.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {!product && products.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Item to Adjust</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden bg-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currentStock} {p.unit} in stock)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current vs New preview */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Current Stock</span>
              <span className="text-base font-bold text-slate-800">{currentStock} {currentProduct.unit}</span>
            </div>
            <div className="border-l border-slate-200">
              <span className="text-[11px] text-slate-400 block">New Adjusted Stock</span>
              <span className="text-base font-bold text-red-600">{newCalculatedStock} {currentProduct.unit}</span>
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('in')}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  type === 'in'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                + Add (IN)
              </button>
              <button
                type="button"
                onClick={() => setType('out')}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  type === 'out'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                - Reduce (OUT)
              </button>
              <button
                type="button"
                onClick={() => setType('set')}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  type === 'set'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                = Set Exact
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity ({product.unit}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={quantity || ''}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden bg-white"
            >
              <option value="Manual Stock Correction">Manual Stock Correction</option>
              <option value="Direct Purchase / Restocking">Direct Purchase / Restocking</option>
              <option value="Consumed in Refilling Job">Consumed in Refilling Job</option>
              <option value="Damaged / Scrap / Condemned">Damaged / Scrap / Condemned</option>
              <option value="Stock Audit Physical Count">Stock Audit Physical Count</option>
              <option value="Initial Opening Stock">Initial Opening Stock</option>
            </select>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
