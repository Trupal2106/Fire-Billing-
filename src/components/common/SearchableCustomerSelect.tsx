import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, User, Plus, X } from 'lucide-react';
import { Customer } from '../../types';

interface SearchableCustomerSelectProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  onOpenQuickAddCustomer?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchableCustomerSelect: React.FC<SearchableCustomerSelectProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenQuickAddCustomer,
  placeholder = '🔍 Search customer by name, GSTIN, phone, or city...',
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

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement: 'bottom' | 'top' = 'bottom';
    let maxHeight = Math.min(320, Math.max(160, spaceBelow - 16));
    let top = rect.bottom + 4;

    if (spaceBelow < 260 && spaceAbove > spaceBelow) {
      placement = 'top';
      maxHeight = Math.min(320, Math.max(160, spaceAbove - 16));
      top = Math.max(12, rect.top - maxHeight - 4);
    }

    const width = Math.min(window.innerWidth - 24, Math.max(rect.width, 360));
    let left = rect.left;
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12);
    }

    setDropdownPosition({
      top,
      left,
      width,
      maxHeight,
      placement
    });
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

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
      if (isOpen) {
        updatePosition();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.state && c.state.toLowerCase().includes(q))
    );
  });

  const renderDropdown = () => {
    if (!isOpen || !dropdownPosition) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          maxHeight: `${dropdownPosition.maxHeight}px`,
          zIndex: 99999
        }}
        className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
      >
        <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by customer name, GSTIN, mobile..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-red-500 font-medium placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 min-h-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              <p>No customer found matching "{searchQuery}"</p>
              {onOpenQuickAddCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenQuickAddCustomer();
                  }}
                  className="mt-2 block mx-auto px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer transition-colors"
                >
                  + Add New Customer
                </button>
              )}
            </div>
          ) : (
            filteredCustomers.map(c => {
              const isSelected = c.id === selectedCustomerId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCustomer(c.id);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 text-xs hover:bg-red-50/60 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-red-50/90 font-semibold' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate text-xs">{c.name}</span>
                      {c.gstin ? (
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono rounded">
                          {c.gstin}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-700 font-semibold rounded">
                          URP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {c.city ? `${c.city}, ` : ''}{c.state || ''} {c.mobile ? `• 📞 ${c.mobile}` : ''}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {onOpenQuickAddCustomer && (
          <div className="p-2 bg-slate-50 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenQuickAddCustomer();
              }}
              className="w-full py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-dashed border-red-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create New Customer</span>
            </button>
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 hover:border-slate-400 bg-white cursor-pointer select-none text-left transition-colors shadow-2xs"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {selectedCustomer ? (
            <div className="truncate text-slate-800">
              <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
              {selectedCustomer.gstin ? (
                <span className="text-slate-500 font-mono ml-1.5 text-[11px]">(GST: {selectedCustomer.gstin})</span>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-1 py-0.2 rounded text-[10px] ml-1.5 font-semibold">URP</span>
              )}
              {selectedCustomer.city && (
                <span className="text-slate-400 ml-1.5">• {selectedCustomer.city}</span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedCustomerId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCustomer('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm cursor-pointer"
              title="Clear party"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
        </div>
      </div>

      {renderDropdown()}
    </div>
  );
};
