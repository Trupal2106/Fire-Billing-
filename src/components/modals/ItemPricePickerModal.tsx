import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Check,
  Package,
  Layers,
  Sparkles,
  Flame,
  ShieldCheck,
  Wrench,
  FileCheck2,
  Tag,
  Hash,
  PlusCircle,
  Save,
  ArrowLeft
} from 'lucide-react';
import { ProductItem, InvoiceItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { db } from '../../db/db';
import { UnitSelect } from '../common/UnitSelect';

interface ItemPricePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onAddItems: (newItems: Partial<InvoiceItem>[]) => void;
  onOpenCreateProduct?: () => void;
}

export const ItemPricePickerModal: React.FC<ItemPricePickerModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddItems,
  onOpenCreateProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemQuantities, setSelectedItemQuantities] = useState<Record<string, { qty: number; customRate?: number }>>({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'product' | 'service' | 'amc' | 'labour'>('product');
  const [newHsn, setNewHsn] = useState('8424');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newGst, setNewGst] = useState<number>(18);
  const [newUnit, setNewUnit] = useState('Nos');
  const [newStock, setNewStock] = useState<number>(10);
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Categories list
  const categories = [
    { id: 'all', label: 'All Items & Services', icon: Layers },
    { id: 'extinguisher', label: 'Extinguishers & Cylinders', icon: Flame },
    { id: 'refill', label: 'Refilling & Testing', icon: Wrench },
    { id: 'alarm', label: 'Fire Alarm & Detectors', icon: Sparkles },
    { id: 'hydrant', label: 'Hydrant & Sprinklers', icon: ShieldCheck },
    { id: 'signage', label: 'Signages & Accessories', icon: Tag },
    { id: 'amc', label: 'AMC & Compliance', icon: FileCheck2 }
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.hsnSac && p.hsnSac.includes(searchTerm)) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedCategory === 'all') return true;

      const pName = p.name.toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pType = p.type || 'product';

      if (selectedCategory === 'extinguisher') {
        return pName.includes('extinguisher') || pCat.includes('extinguisher') || pName.includes('abc') || pName.includes('co2');
      }
      if (selectedCategory === 'refill') {
        return pName.includes('refill') || pName.includes('hydro') || pCat.includes('refill') || pType === 'service';
      }
      if (selectedCategory === 'alarm') {
        return pName.includes('alarm') || pName.includes('smoke') || pName.includes('detector') || pName.includes('panel') || pCat.includes('alarm');
      }
      if (selectedCategory === 'hydrant') {
        return pName.includes('hydrant') || pName.includes('sprinkler') || pName.includes('hose') || pName.includes('valve') || pName.includes('pump');
      }
      if (selectedCategory === 'signage') {
        return pName.includes('sign') || pName.includes('exit') || pName.includes('light') || pName.includes('blanket') || pName.includes('bucket');
      }
      if (selectedCategory === 'amc') {
        return pType === 'amc' || pName.includes('amc') || pName.includes('contract') || pName.includes('audit');
      }

      return true;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleToggleSelect = (product: ProductItem) => {
    setSelectedItemQuantities(prev => {
      const copy = { ...prev };
      if (copy[product.id]) {
        delete copy[product.id];
      } else {
        copy[product.id] = { qty: 1, customRate: product.sellingPrice };
      }
      return copy;
    });
  };

  const handleQtyChange = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setSelectedItemQuantities(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      return;
    }
    setSelectedItemQuantities(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        qty: newQty
      }
    }));
  };

  const handleSingleAdd = (product: ProductItem) => {
    const itemToAdd: Partial<InvoiceItem> = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      name: product.name,
      description: product.description || '',
      hsnSac: product.hsnSac || (product.type === 'product' ? '8424' : '9987'),
      quantity: 1,
      unit: product.unit || 'Nos',
      rate: product.sellingPrice || 0,
      gstRate: product.gstRate ?? 18,
      discountPercent: 0,
      discountAmount: 0
    };
    onAddItems([itemToAdd]);
    onClose();
  };

  const handleAddAllSelected = () => {
    const itemsToAdd: Partial<InvoiceItem>[] = [];

    Object.entries(selectedItemQuantities).forEach(([prodId, info]: [string, { qty: number; customRate?: number }]) => {
      const prod = products.find(p => p.id === prodId);
      if (!prod) return;

      itemsToAdd.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: prod.id,
        name: prod.name,
        description: prod.description || '',
        hsnSac: prod.hsnSac || (prod.type === 'product' ? '8424' : '9987'),
        quantity: info.qty || 1,
        unit: prod.unit || 'Nos',
        rate: info.customRate !== undefined ? info.customRate : (prod.sellingPrice || 0),
        gstRate: prod.gstRate ?? 18,
        discountPercent: 0,
        discountAmount: 0
      });
    });

    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
      setSelectedItemQuantities({});
      onClose();
    }
  };

  const handleSaveAndAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setCreateError('Item name is required');
      return;
    }
    const priceNum = typeof newPrice === 'number' ? newPrice : parseFloat(newPrice) || 0;
    if (priceNum <= 0) {
      setCreateError('Please enter a valid rate/price greater than 0');
      return;
    }

    try {
      setIsSavingNew(true);
      setCreateError('');
      const now = new Date().toISOString();
      const newProduct: ProductItem = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: newName.trim(),
        type: newType,
        hsnSac: newHsn.trim() || (newType === 'product' ? '8424' : '9987'),
        unit: newUnit,
        purchasePrice: Math.round(priceNum * 0.7),
        sellingPrice: priceNum,
        gstRate: newGst,
        openingStock: newType === 'product' ? newStock : 0,
        currentStock: newType === 'product' ? newStock : 999,
        minStock: 5,
        description: newDesc.trim(),
        createdAt: now,
        updatedAt: now
      };

      await db.products.put(newProduct);

      // Instantly add to the bill
      const itemToAdd: Partial<InvoiceItem> = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: newProduct.id,
        name: newProduct.name,
        description: newProduct.description || '',
        hsnSac: newProduct.hsnSac,
        quantity: 1,
        unit: newProduct.unit,
        rate: newProduct.sellingPrice,
        gstRate: newProduct.gstRate,
        discountPercent: 0,
        discountAmount: 0
      };

      onAddItems([itemToAdd]);
      setIsCreatingNew(false);
      onClose();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to save new product');
    } finally {
      setIsSavingNew(false);
    }
  };

  const selectedCount = Object.keys(selectedItemQuantities).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-200">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                {isCreatingNew ? 'Create New Item & Add to Bill' : 'Item & Price List Catalog'}
                {!isCreatingNew && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {products.length} Items Available
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {isCreatingNew
                  ? 'Add a new product or service with standard pricing to your catalog and bill.'
                  : 'Select items from your fire safety price list to instantly add them to the bill.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingNew ? (
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setNewName(searchTerm);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create New Item</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Price List</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isCreatingNew ? (
          /* Create New Item Form */
          <form onSubmit={handleSaveAndAddProduct} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {createError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item / Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Stored Pressure Fire Extinguisher 4kg"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Type</label>
                <select
                  value={newType}
                  onChange={e => {
                    const t = e.target.value as any;
                    setNewType(t);
                    if (t === 'product') {
                      setNewHsn('8424');
                      setNewUnit('Nos');
                    } else if (t === 'service') {
                      setNewHsn('9987');
                      setNewUnit('Job');
                    } else if (t === 'amc') {
                      setNewHsn('9987');
                      setNewUnit('Year');
                    } else {
                      setNewHsn('9954');
                      setNewUnit('Job');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="product">Equipment / Product (Goods)</option>
                  <option value="service">Refilling / Testing Service</option>
                  <option value="amc">AMC Maintenance Contract</option>
                  <option value="labour">Installation & Labour Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HSN / SAC Code</label>
                <input
                  type="text"
                  value={newHsn}
                  onChange={e => setNewHsn(e.target.value)}
                  placeholder="e.g. 84241000 or 998717"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Price / Rate (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={newPrice}
                  onChange={e => setNewPrice(parseFloat(e.target.value) || '')}
                  className="w-full px-3 py-2 text-xs font-bold text-red-600 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GST Rate (%)</label>
                <select
                  value={newGst}
                  onChange={e => setNewGst(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value={18}>18% (Standard GST)</option>
                  <option value={12}>12%</option>
                  <option value={28}>28%</option>
                  <option value={5}>5%</option>
                  <option value={0}>0% (Tax Exempt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measurement (UOM)</label>
                <UnitSelect
                  value={newUnit}
                  onChange={val => setNewUnit(val)}
                  className="py-2 rounded-xl"
                />
              </div>

              {newType === 'product' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Count</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Technical Specification</label>
                <textarea
                  rows={2}
                  placeholder="e.g. IS 15683 certified, complete with wall clamp and discharge nozzle."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingNew}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingNew ? 'Saving...' : 'Save to Catalog & Insert into Bill'}</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Search & Category Filter */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Item name, HSN code (e.g. 8424, 9987), or description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
              {filteredProducts.length === 0 ? (
                <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-600">No matching items found in catalog</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search term or create this item on the spot.</p>
                  <button
                    onClick={() => {
                      setIsCreatingNew(true);
                      setNewName(searchTerm);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Create "{searchTerm || 'New Item'}" & Set Price
                  </button>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const isSelected = Boolean(selectedItemQuantities[product.id]);
                  const currentQty = selectedItemQuantities[product.id]?.qty || 1;

                  return (
                    <div
                      key={product.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-red-50/40 border-red-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Product Info */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(product)}
                          className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'border-slate-300 bg-white hover:border-red-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              HSN: {product.hsnSac || '8424'}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              GST: {product.gstRate ?? 18}%
                            </span>
                            {product.type === 'product' && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                (product.currentStock || 0) > (product.minStock || 5)
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                Stock: {product.currentStock ?? 0} {product.unit || 'Nos'}
                              </span>
                            )}
                          </div>

                          {product.description && (
                            <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Pricing & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Rate / {product.unit || 'Nos'}</div>
                          <div className="text-sm font-bold text-red-600">
                            {formatCurrency(product.sellingPrice)}
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-red-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(product.id, currentQty - 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={currentQty}
                              onChange={e => handleQtyChange(product.id, parseInt(e.target.value) || 1)}
                              className="w-10 text-center text-xs font-bold focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(product.id, currentQty + 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSingleAdd(product)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Multi-Select Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                {selectedCount > 0 ? (
                  <span className="font-medium">
                    <strong className="text-red-600">{selectedCount}</strong> item{selectedCount > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span>Click items or checkboxes to select multiple items at once.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleAddAllSelected}
                    className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Selected ({selectedCount}) to Bill
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

