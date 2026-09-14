import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, Package, Sparkles, X, Tag, PlusCircle, Plus } from 'lucide-react';
import { ProductItem } from '../../types';

interface SearchableProductSelectProps {
  products: ProductItem[];
  selectedProductId?: string;
  selectedName?: string;
  onSelectProduct: (product: ProductItem) => void;
  onClear?: () => void;
  onOpenAddProduct?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchableProductSelect: React.FC<SearchableProductSelectProps> = ({
  products,
  selectedProductId,
  selectedName = '',
  onSelectProduct,
  onClear,
  onOpenAddProduct,
  placeholder = '🔍 Search item by name, HSN, or price...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    placement: 'bottom' | 'top';
  } | null>(null);

  // Find currently selected product
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement: 'bottom' | 'top' = 'bottom';
    let maxHeight = Math.min(320, spaceBelow - 16);
    let top = rect.bottom + 4;

    if (spaceBelow < 260 && spaceAbove > spaceBelow) {
      placement = 'top';
      maxHeight = Math.min(320, spaceAbove - 16);
      top = Math.max(12, rect.top - maxHeight - 4);
    }

    const width = Math.min(window.innerWidth - 32, Math.max(rect.width, 420));
    let left = rect.left;
    if (left + width > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - width - 16);
    }

    setDropdownPosition({
      top,
      left,
      width,
      maxHeight,
      placement
    });
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(prev => !prev);
  };

  // Close dropdown on click outside and reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter products by query
  const filteredProducts = (products || []).filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.hsnSac && p.hsnSac.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      p.sellingPrice.toString().includes(q)
    );
  });

  const handleSelect = (product: ProductItem) => {
    onSelectProduct(product);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button - Native title removed to prevent blocking browser tooltip */}
      <div
        onClick={handleOpen}
        className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 transition-all cursor-pointer select-none text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {selectedProduct ? (
            <span className="truncate font-semibold text-slate-800 text-[11px]">
              <span className="text-red-700 font-bold mr-1">₹{selectedProduct.sellingPrice}</span>
              {selectedProduct.name}
              <span className="text-slate-400 font-normal ml-1">({selectedProduct.hsnSac || '8424'})</span>
            </span>
          ) : (
            <span className="truncate text-slate-500 font-medium text-[11px]">
              {selectedName ? `Selected: ${selectedName}` : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {(selectedProductId || selectedName) && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm hover:bg-slate-200"
              aria-label="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
        </div>
      </div>

      {/* Floating Portal Dropdown - Never clipped by table container overflow */}
      {isOpen && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 999999
          }}
          className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 text-left"
        >
          {/* Search Header & Add Product Action */}
          <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, HSN/SAC code, or price..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:border-red-500 font-medium shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-1 font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
            {onOpenAddProduct && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddProduct();
                }}
                className="px-2.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shrink-0 flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                title="Add New Product to Catalog"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Product</span>
              </button>
            )}
          </div>

          {/* Results List */}
          <div
            style={{ maxHeight: `${dropdownPosition.maxHeight || 280}px` }}
            className="overflow-y-auto divide-y divide-slate-100"
          >
            {filteredProducts.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500 space-y-3">
                <Package className="w-7 h-7 mx-auto text-slate-300" />
                <div>
                  <p className="font-semibold text-slate-700">No matching items found for "{searchQuery}"</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Create a new product or type directly into the table row.
                  </p>
                </div>
                {onOpenAddProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAddProduct();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-red-600" />
                    <span>Add "{searchQuery || 'New Item'}" as New Product</span>
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map(p => {
                const isSelected = p.id === selectedProductId;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className={`p-3 text-xs hover:bg-red-50/70 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-red-50/90 font-semibold' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">
                          {p.name}
                        </span>
                        {p.category && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium shrink-0">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                        <span>HSN: <strong className="text-slate-700 font-mono">{p.hsnSac || '8424'}</strong></span>
                        <span>•</span>
                        <span>GST: <strong className="text-slate-700">{p.gstRate ?? 18}%</strong></span>
                        <span>•</span>
                        <span>Unit: <strong className="text-slate-700">{p.unit || 'NOS'}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 text-xs">
                        ₹{p.sellingPrice.toLocaleString('en-IN')}
                      </div>
                      {isSelected && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="font-medium text-slate-600">{filteredProducts.length} items available</span>
            <span className="text-slate-400">Click item to select • Press Esc to close</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
