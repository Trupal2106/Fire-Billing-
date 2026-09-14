import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Building2,
  Trash2,
  Edit2,
  ChevronRight,
  Download,
  AlertCircle,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import { Customer, Invoice, PaymentReceipt, Quotation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportCustomersToExcel } from '../../utils/excelExporter';
import { formatWhatsAppNumber } from '../../utils/whatsappHelper';

interface CustomerListViewProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: PaymentReceipt[];
  quotations: Quotation[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onSelectCustomer: (customer: Customer) => void;
  onNewInvoiceForCustomer: (customer: Customer) => void;
  onReceivePaymentForCustomer: (customer: Customer) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  invoices,
  payments,
  quotations,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onSelectCustomer,
  onNewInvoiceForCustomer,
  onReceivePaymentForCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'outstanding' | 'settled'>('all');

  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.mobile.includes(searchTerm) ||
        (cust.gstin && cust.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cust.city && cust.city.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'outstanding') return (cust.currentOutstanding || 0) > 0;
      if (filterType === 'settled') return (cust.currentOutstanding || 0) <= 0;
      return true;
    });
  }, [customers, searchTerm, filterType]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0);
  }, [customers]);

  const totalSales = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalSales || 0), 0);
  }, [customers]);

  // Export Customers to CSV
  const exportCustomersCSV = () => {
    const headers = ['Name', 'Contact Person', 'Mobile', 'Email', 'GSTIN', 'City', 'State', 'Total Sales', 'Total Paid', 'Outstanding'];
    const rows = customers.map(c => [
      `"${c.name}"`,
      `"${c.contactPerson || ''}"`,
      `"${c.mobile}"`,
      `"${c.email || ''}"`,
      `"${c.gstin || 'URP'}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      c.totalSales || 0,
      c.totalPaid || 0,
      c.currentOutstanding || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Patel_Fire_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Customer & Client Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage commercial facilities, residential complexes, and factory accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCustomersToExcel(filteredCustomers, `Customers_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Export Customers to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onAddCustomer}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Registered Parties</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{customers.length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Billed Revenue</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalSales)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Receivables (Outstanding)</span>
          <div className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(totalOutstanding)}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by party name, phone, GSTIN or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilterType('outstanding')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'outstanding'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60'
            }`}
          >
            With Due ({customers.filter(c => (c.currentOutstanding || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterType('settled')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'settled'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            Settled (0 Balance)
          </button>
        </div>
      </div>

      {/* Customer Cards / List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No customer accounts found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting search query or register a new customer</p>
            <button
              onClick={onAddCustomer}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Customer</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map(cust => {
              const custInvoices = invoices.filter(i => i.customerId === cust.id);
              const custPayments = payments.filter(p => p.customerId === cust.id);

              return (
                <div
                  key={cust.id}
                  onClick={() => onSelectCustomer(cust)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  {/* Left: Customer Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-50 text-slate-700 group-hover:text-red-600 flex items-center justify-center font-bold text-sm shrink-0 transition-colors">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-red-600 transition-colors truncate">
                          {cust.name}
                        </h3>
                        {cust.gstin ? (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-slate-100 text-slate-600">
                            GST: {cust.gstin}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-400">
                            Unregistered (URP)
                          </span>
                        )}
                      </div>

                      {cust.contactPerson && (
                        <p className="text-xs text-slate-600 mt-0.5">{cust.contactPerson}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cust.mobile}</span>
                        </span>
                        {cust.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{cust.city}, {cust.state}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Financials */}
                  <div className="flex items-center gap-4 text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Sales</span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {formatCurrency(cust.totalSales || 0)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {custInvoices.length} invoices
                      </span>
                    </div>

                    <div className="pl-4 border-l border-slate-200">
                      <span className="text-[11px] text-slate-400 block">Balance Due</span>
                      <span className={`text-sm font-bold block ${
                        (cust.currentOutstanding || 0) > 0 ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {formatCurrency(cust.currentOutstanding || 0)}
                      </span>
                      {(cust.currentOutstanding || 0) > 0 ? (
                        <span className="text-[10px] text-orange-600 font-medium block">Overdue</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-medium block">All Cleared</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onNewInvoiceForCustomer(cust)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Create Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Bill</span>
                    </button>

                    <button
                      onClick={() => onReceivePaymentForCustomer(cust)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Receive Payment"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Receive</span>
                    </button>

                    <button
                      onClick={() => onEditCustomer(cust)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteCustomer(cust)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectCustomer(cust)}
                      className="p-1.5 text-slate-400 group-hover:text-red-600 hover:bg-slate-100 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
