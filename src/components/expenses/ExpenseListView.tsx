import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Search,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  CreditCard
} from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ExpenseListViewProps {
  expenses: Expense[];
  onNewExpense: () => void;
  onDeleteExpense: (expense: Expense) => void;
}

export const ExpenseListView: React.FC<ExpenseListViewProps> = ({
  expenses,
  onNewExpense,
  onDeleteExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const expTitle = (e.title || e.description || '').toLowerCase();
      const expNotes = (e.notes || '').toLowerCase();
      const expRef = (e.referenceNo || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        expTitle.includes(search) ||
        expNotes.includes(search) ||
        expRef.includes(search);

      if (!matchesSearch) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category)));
  }, [expenses]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Operating Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track business overheads, technician conveyance, refill gas and tools
          </p>
        </div>

        <button
          onClick={onNewExpense}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Recorded Expenses</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{expenses.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Expense Spend</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(totalSpent)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Categories</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{uniqueCategories.length}</div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, remark or reference..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No expense records found</p>
            <p className="text-xs text-slate-400 mt-1">Record business running expenses to maintain accurate P&L</p>
            <button
              onClick={onNewExpense}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map(exp => (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold shrink-0">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{exp.title || exp.description || 'Operating Expense'}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {exp.category}
                      </span>
                    </div>
                    {exp.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">{exp.notes}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Date: {formatDate(exp.expenseDate || exp.date || '')} • Mode: {exp.paymentMode || exp.paymentMethod || 'Cash'}
                      {exp.referenceNo && ` • Ref: ${exp.referenceNo}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left md:text-right shrink-0">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Expense Amount</span>
                    <span className="text-base font-bold text-rose-600 block">{formatCurrency(exp.amount)}</span>
                  </div>

                  <button
                    onClick={() => onDeleteExpense(exp)}
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
