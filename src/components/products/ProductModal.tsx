import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Hash, Percent, DollarSign, Layers } from 'lucide-react';
import { ProductItem } from '../../types';
import { UnitSelect } from '../common/UnitSelect';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (productData: any) => Promise<any>;
  onSaveProduct?: (productData: any) => Promise<any>;
  productToEdit?: ProductItem | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveProduct,
  productToEdit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Extinguisher',
    type: 'product' as 'product' | 'service' | 'amc' | 'labour',
    hsnSac: '8424',
    unit: 'Nos',
    purchasePrice: 0,
    sellingPrice: 0,
    gstRate: 18,
    isTaxInclusive: false,
    currentStock: 0,
    minStock: 5,
    description: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'Extinguisher',
        type: productToEdit.type || 'product',
        hsnSac: productToEdit.hsnSac || '8424',
        unit: productToEdit.unit || 'Nos',
        purchasePrice: productToEdit.purchasePrice || 0,
        sellingPrice: productToEdit.sellingPrice || 0,
        gstRate: productToEdit.gstRate ?? 18,
        isTaxInclusive: productToEdit.isTaxInclusive || false,
        currentStock: productToEdit.currentStock || 0,
        minStock: productToEdit.minStock ?? 5,
        description: productToEdit.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Extinguisher',
        type: 'product',
        hsnSac: '8424',
        unit: 'Nos',
        purchasePrice: 0,
        sellingPrice: 0,
        gstRate: 18,
        isTaxInclusive: false,
        currentStock: 0,
        minStock: 5,
        description: ''
      });
    }
    setError('');
  }, [productToEdit, isOpen]);

  const handleTypeChange = (newType: 'product' | 'service' | 'amc' | 'labour') => {
    let defaultHsn = '8424';
    let defaultCategory = 'Extinguisher';
    let defaultUnit = 'Nos';

    if (newType === 'service' || newType === 'labour') {
      defaultHsn = '9987';
      defaultCategory = 'Refilling & Maintenance';
      defaultUnit = 'Job';
    } else if (newType === 'amc') {
      defaultHsn = '9987';
      defaultCategory = 'Annual Maintenance';
      defaultUnit = 'Year';
    }

    setFormData(prev => ({
      ...prev,
      type: newType,
      hsnSac: defaultHsn,
      category: defaultCategory,
      unit: defaultUnit
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Item Name is required');
      return;
    }
    if (formData.sellingPrice < 0) {
      setError('Selling Price cannot be negative');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const saveFn = onSaveProduct || onSave;
      if (saveFn) {
        await saveFn({
          ...formData,
          unit: formData.unit ? formData.unit.toUpperCase() : 'NOS',
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          gstRate: Number(formData.gstRate),
          currentStock: Number(formData.currentStock),
          minStock: Number(formData.minStock)
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {productToEdit ? 'Edit Product / Service' : 'Add New Item or Service'}
              </h3>
              <p className="text-xs text-slate-500">Fire safety equipment, refilling service, or spare parts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Type Selector (Product vs Service vs AMC vs Labour) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Item Classification</label>
            <div className="grid grid-cols-4 gap-2">
              {(['product', 'service', 'amc', 'labour'] as const).map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                    formData.type === t
                      ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item / Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ABC Powder Fire Extinguisher 4kg"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="Extinguisher, Hydrant, Alarm, Refilling"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          {/* HSN / SAC Code & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HSN / SAC Code
              </label>
              <input
                type="text"
                placeholder="8424 (Goods) / 9987 (Services)"
                value={formData.hsnSac}
                onChange={e => setFormData({ ...formData, hsnSac: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measurement (UOM)</label>
              <UnitSelect
                value={formData.unit}
                onChange={val => setFormData({ ...formData, unit: val })}
                className="py-2"
              />
            </div>
          </div>

          {/* Pricing & GST Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={formData.sellingPrice || ''}
                onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Price (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.purchasePrice || ''}
                onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Tax Rate</label>
              <select
                value={formData.gstRate}
                onChange={e => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
              >
                <option value={18}>18% (Standard GST)</option>
                <option value={12}>12%</option>
                <option value={28}>28%</option>
                <option value={5}>5%</option>
                <option value={0}>0% (Exempt / Nil)</option>
              </select>
            </div>
          </div>

          {/* Stock Tracking (for physical goods) */}
          {formData.type === 'product' && (
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening / Current Stock
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={e => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Low Stock Alert Level
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description / Technical Specs</label>
            <textarea
              rows={2}
              placeholder="e.g. ISI marked IS 15683, with wall bracket, pressure gauge, discharging hose..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
            />
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
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : productToEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
