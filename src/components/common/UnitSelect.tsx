import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, Plus } from 'lucide-react';
import { ALL_BILLING_UNITS, POPULAR_UNITS, normalizeUnit } from '../../constants/units';

interface UnitSelectProps {
  value: string;
  onChange: (unit: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  allowCustom?: boolean;
}

export const UnitSelect: React.FC<UnitSelectProps> = ({
  value,
  onChange,
  className = '',
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
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

  // Normalize current value to its bracket code
  const currentBracketCode = normalizeUnit(value || 'NOS');

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 340;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement: 'bottom' | 'top' = 'bottom';
    let maxHeight = Math.min(340, Math.max(160, spaceBelow - 16));
    let top = rect.bottom + 4;

    if (spaceBelow < 280 && spaceAbove > spaceBelow) {
      placement = 'top';
      maxHeight = Math.min(340, Math.max(160, spaceAbove - 16));
      top = Math.max(12, rect.top - maxHeight - 4);
    }

    const width = Math.min(window.innerWidth - 24, Math.max(rect.width, 320));
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

  // Focus search on open
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setIsCustomMode(false);
    }
  }, [isOpen]);

  // Filter units by search query (name or code)
  const filteredUnits = ALL_BILLING_UNITS.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.code.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q)
    );
  });

  const handleSelect = (bracketCode: string) => {
    onChange(bracketCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim().toUpperCase());
      setIsOpen(false);
      setIsCustomMode(false);
      setCustomValue('');
    }
  };

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
        {/* Search Header */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search unit (e.g. NOS, PCS, KGS, MTR)..."
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

        {/* Quick Picks for Popular Units */}
        {!searchQuery && (
          <div className="p-2.5 bg-slate-50/80 border-b border-slate-100 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Frequent Billing Units
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_UNITS.map(uCode => (
                <button
                  key={uCode}
                  type="button"
                  onClick={() => handleSelect(uCode)}
                  className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                    currentBracketCode.toUpperCase() === uCode.toUpperCase()
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/60'
                  }`}
                >
                  {uCode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unit List */}
        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 min-h-0">
          {filteredUnits.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              <p className="font-medium text-slate-700">No unit found for "{searchQuery}"</p>
              {allowCustom && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(searchQuery.trim().toUpperCase());
                    setIsOpen(false);
                  }}
                  className="mt-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer transition-colors"
                >
                  + Use "{searchQuery.toUpperCase()}" as Custom Unit
                </button>
              )}
            </div>
          ) : (
            filteredUnits.map(u => {
              const isSelected = currentBracketCode.toUpperCase() === u.code.toUpperCase();
              return (
                <div
                  key={`${u.code}-${u.name}`}
                  onClick={() => handleSelect(u.code)}
                  className={`px-3 py-2 text-xs hover:bg-red-50/60 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                    isSelected ? 'bg-red-50 font-bold text-red-900' : 'text-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 bg-slate-100 rounded border border-slate-200 shrink-0">
                      {u.code}
                    </span>
                    <span className="text-slate-600 truncate text-[11px]">
                      {u.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Custom Unit fallback */}
        {allowCustom && (
          <div className="p-2 bg-slate-50 border-t border-slate-100 shrink-0">
            {isCustomMode ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter unit code (e.g. NOS)..."
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCustomSubmit();
                    if (e.key === 'Escape') setIsCustomMode(false);
                  }}
                  className="w-full px-2.5 py-1 text-xs rounded border border-red-400 bg-white focus:outline-hidden uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 shrink-0 cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 hover:bg-white rounded transition-colors text-center cursor-pointer border border-dashed border-slate-200"
              >
                + Add Custom Unit
              </button>
            )}
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button showing the Bracket Unit Value */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer text-slate-800 text-left shadow-2xs"
      >
        <span className="truncate font-mono tracking-wide">{currentBracketCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
      </button>

      {renderDropdown()}
    </div>
  );
};
