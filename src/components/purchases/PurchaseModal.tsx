import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Trash2, Building2, Calendar, DollarSign } from 'lucide-react';
import { Purchase, PurchaseItem, ProductItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PurchaseModalProps {
  isOpen: boolean;
  products: ProductItem[];
  onClose: () => void;
  onSavePurchase: (purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  products,
  onClose,
  onSavePurchase
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [supplierName, setSupplierName] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayStr);

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: `pitem_${Date.now()}`,
      productId: '',
      name: '',
      quantity: 1,
      unit: 'Nos',
      purchaseRate: 0,
      taxableAmount: 0,
      gstRate: 18,
      gstAmount: 0,
      totalAmount: 0
    }
  ]);

  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      const qty = updated[index].quantity || 1;
      const rate = prod.purchasePrice || 0;
      const taxable = qty * rate;
      const gst = (taxable * (prod.gstRate ?? 18)) / 100;

      updated[index] = {
        ...updated[index],
        productId: prod.id,
        name: prod.name,
        unit: prod.unit || 'Nos',
        purchaseRate: rate,
        taxableAmount: taxable,
        gstRate: prod.gstRate ?? 18,
        gstAmount: gst,
        totalAmount: taxable + gst
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      const qty = Number(current.quantity) || 0;
      const rate = Number(current.purchaseRate) || 0;
      const gstRate = Number(current.gstRate) || 0;

      const taxable = qty * rate;
      const gst = (taxable * gstRate) / 100;

      current.taxableAmount = taxable;
      current.gstAmount = gst;
      current.totalAmount = taxable + gst;

      updated[index] = current;
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: `pitem_${Date.now()}_${Math.random()}`,
        productId: '',
        name: '',
        quantity: 1,
        unit: 'Nos',
        purchaseRate: 0,
        taxableAmount: 0,
        gstRate: 18,
        gstAmount: 0,
        totalAmount: 0
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Totals
  const totalTaxable = items.reduce((sum, it) => sum + it.taxableAmount, 0);
  const totalGst = items.reduce((sum, it) => sum + it.gstAmount, 0);
  const grandTotal = totalTaxable + totalGst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('Supplier Name is required');
      return;
    }
    if (!purchaseInvoiceNo.trim()) {
      setError('Supplier Bill / Invoice Number is required');
      return;
    }
    const validItems = items.filter(it => it.name.trim() && it.purchaseRate > 0 && it.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one line item with valid product, rate and quantity');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      await onSavePurchase({
        supplierName: supplierName.trim(),
        supplierGstin: supplierGstin.trim() || undefined,
        purchaseInvoiceNo: purchaseInvoiceNo.trim(),
        purchaseDate,
        items: validItems,
        taxableAmount: totalTaxable,
        gstAmount: totalGst,
        grandTotal,
        paymentStatus: 'paid',
        notes: notes.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record purchase bill');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-orange-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Record Vendor Purchase Bill</h3>
              <p className="text-xs text-slate-500">Restocks inventory stock and logs GST purchase voucher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Supplier Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier / Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Minimax Fire Equipments Ltd"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier GSTIN</label>
              <input
                type="text"
                placeholder="24AAACC1234F1Z1"
                value={supplierGstin}
                onChange={e => setSupplierGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Bill / Inv # <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MIN/2025/8842"
                value={purchaseInvoiceNo}
                onChange={e => setPurchaseInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-slate-800 text-xs">Purchased Stock Items (Auto-updates Stock Qty)</h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item from Catalog</th>
                    <th className="p-2.5 w-20 text-center">Qty</th>
                    <th className="p-2.5 w-28 text-right">Purchase Rate (₹)</th>
                    <th className="p-2.5 w-20 text-center">GST %</th>
                    <th className="p-2.5 w-28 text-right">Total (₹)</th>
                    <th className="p-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="p-2.5">
                        <select
                          value={it.productId || ''}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-hidden"
                        >
                          <option value="">Select product to restock...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Current Stock: {p.currentStock} {p.unit})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-300 text-center"
                        />
                      </td>

                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          step="any"
                          value={it.purchaseRate || ''}
                          onChange={e => handleItemChange(idx, 'purchaseRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-300 text-right"
                        />
                      </td>

                      <td className="p-2.5 text-center">
                        <select
                          value={it.gstRate}
                          onChange={e => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                          className="w-full px-1.5 py-1 text-xs rounded border border-slate-300 text-center"
                        >
                          <option value={18}>18%</option>
                          <option value={12}>12%</option>
                          <option value={28}>28%</option>
                          <option value={5}>5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </td>

                      <td className="p-2.5 text-right font-bold text-slate-800">
                        {formatCurrency(it.totalAmount)}
                      </td>

                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddItemRow}
              className="px-3.5 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Item</span>
            </button>
          </div>

          {/* Grand Total Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500">Taxable: {formatCurrency(totalTaxable)} | GST: {formatCurrency(totalGst)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Bill Total:</span>
              <span className="text-base font-bold text-orange-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Footer Submit */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Recording...' : 'Save Purchase Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
