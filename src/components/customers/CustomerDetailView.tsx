import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Plus,
  Download,
  Calendar,
  ShieldCheck,
  Flame,
  Clock,
  Edit2,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import {
  Customer,
  Invoice,
  PaymentReceipt,
  Quotation,
  AmcContract,
  EquipmentRecord,
  CompanySettings,
  LedgerEntry
} from '../../types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '../../utils/formatters';
import { generateCustomerLedgerPDF, generateInvoicePDF, generatePaymentReceiptPDF } from '../../utils/pdfGenerator';

interface CustomerDetailViewProps {
  customer: Customer;
  invoices: Invoice[];
  payments: PaymentReceipt[];
  quotations: Quotation[];
  amcContracts: AmcContract[];
  equipment: EquipmentRecord[];
  companySettings: CompanySettings;
  onBack: () => void;
  onEditCustomer: (customer: Customer) => void;
  onNewInvoice: (customer: Customer) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onReceivePayment: (customer: Customer) => void;
  onNewQuotation: (customer: Customer) => void;
  onEditQuotation?: (quotation: Quotation) => void;
  onConvertToInvoice?: (quotation: Quotation) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onNewAmcContract?: (customer: Customer) => void;
  onAddEquipment?: (customer: Customer) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  invoices,
  payments,
  quotations,
  amcContracts,
  equipment,
  companySettings,
  onBack,
  onEditCustomer,
  onNewInvoice,
  onEditInvoice,
  onReceivePayment,
  onNewQuotation,
  onEditQuotation,
  onConvertToInvoice,
  onViewInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'invoices' | 'quotations' | 'payments' | 'amc' | 'equipment'>('ledger');

  // Customer specific items
  const customerInvoices = useMemo(() => {
    return invoices
      .filter(i => i.customerId === customer.id)
      .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  }, [invoices, customer.id]);

  const customerPayments = useMemo(() => {
    return payments
      .filter(p => p.customerId === customer.id)
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [payments, customer.id]);

  const customerQuotations = useMemo(() => {
    return quotations
      .filter(q => q.customerId === customer.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [quotations, customer.id]);

  const customerAmc = useMemo(() => {
    return amcContracts.filter(a => a.customerId === customer.id);
  }, [amcContracts, customer.id]);

  const customerEquipment = useMemo(() => {
    return equipment.filter(e => e.customerId === customer.id);
  }, [equipment, customer.id]);

  // Compute Full Ledger with Chronological Running Balance
  const ledgerEntries: LedgerEntry[] = useMemo(() => {
    const rawEvents: Array<{ date: string; createdAt: string; type: 'Invoice' | 'Payment' | 'Opening Balance'; ref: string; desc: string; debit: number; credit: number }> = [];

    // Opening Balance
    if (customer.openingBalance && customer.openingBalance > 0) {
      rawEvents.push({
        date: customer.createdAt.slice(0, 10),
        createdAt: customer.createdAt,
        type: 'Opening Balance',
        ref: 'OB-001',
        desc: 'Opening balance brought forward',
        debit: customer.openingBalance,
        credit: 0
      });
    }

    // Invoices (Debit)
    customerInvoices.forEach(inv => {
      if (inv.status !== 'cancelled') {
        rawEvents.push({
          date: inv.invoiceDate,
          createdAt: inv.createdAt,
          type: 'Invoice',
          ref: inv.invoiceNo,
          desc: `Tax Invoice (${inv.items.length} items)`,
          debit: inv.grandTotal,
          credit: 0
        });
      }
    });

    // Payments (Credit)
    customerPayments.forEach(p => {
      rawEvents.push({
        date: p.paymentDate,
        createdAt: p.createdAt,
        type: 'Payment',
        ref: p.receiptNo,
        desc: `Received via ${p.paymentMethod}${p.referenceNo ? ` (${p.referenceNo})` : ''}`,
        debit: 0,
        credit: p.amount
      });
    });

    // Sort chronologically ascending
    rawEvents.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.createdAt.localeCompare(b.createdAt);
    });

    let runningBalance = 0;
    return rawEvents.map((ev, idx) => {
      runningBalance = runningBalance + ev.debit - ev.credit;
      return {
        id: `ledger_${idx}`,
        date: ev.date,
        type: ev.type,
        referenceNo: ev.ref,
        description: ev.desc,
        debit: ev.debit,
        credit: ev.credit,
        balance: runningBalance
      };
    });
  }, [customer, customerInvoices, customerPayments]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24 lg:pb-12">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers List</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNewInvoice(customer)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>

          <button
            onClick={() => onReceivePayment(customer)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Receive Payment</span>
          </button>

          <button
            onClick={() => onNewQuotation(customer)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Quotation</span>
          </button>

          <button
            onClick={() => onEditCustomer(customer)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs"
            title="Edit Customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{customer.name}</h1>
                {customer.gstin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-700 border border-red-200">
                    GSTIN: {customer.gstin}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                    Unregistered Client (URP)
                  </span>
                )}
              </div>

              {customer.contactPerson && (
                <p className="text-xs text-slate-600 font-medium mt-1">Contact: {customer.contactPerson}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 mt-2.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.mobile} {customer.alternateMobile ? `/ ${customer.alternateMobile}` : ''}</span>
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.email}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{customer.billingAddress}, {customer.city} - {customer.pin}, {customer.state}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Financials Metric Badges */}
          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Billed</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">{formatCurrency(customer.totalSales || 0)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Received</span>
              <span className="text-sm font-bold text-emerald-600 block mt-0.5">{formatCurrency(customer.totalPaid || 0)}</span>
            </div>

            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-left min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-orange-700 block">Outstanding Due</span>
              <span className="text-base font-bold text-orange-600 block mt-0.5">
                {formatCurrency(customer.currentOutstanding || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Statement of Account (Ledger)
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Invoices ({customerInvoices.length})
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'quotations'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quotations ({customerQuotations.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payments ({customerPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('amc')}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'amc'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AMC Contracts ({customerAmc.length})
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'equipment'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Equipment Assets ({customerEquipment.length})
        </button>
      </div>

      {/* Tab 1: Customer Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ledger Account Statement</h3>
              <p className="text-xs text-slate-500">Complete debit and credit history with running balance</p>
            </div>
            <button
              onClick={() => generateCustomerLedgerPDF(customer, ledgerEntries, companySettings)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-red-600" />
              <span>Download Ledger PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference #</th>
                  <th className="p-3">Details / Narration</th>
                  <th className="p-3 text-right">Debit (Billed)</th>
                  <th className="p-3 text-right">Credit (Paid)</th>
                  <th className="p-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No transactions recorded for this customer yet.
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-600 whitespace-nowrap">{formatDate(item.date)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          item.type === 'Invoice'
                            ? 'bg-blue-50 text-blue-700'
                            : item.type === 'Payment'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 font-mono">{item.referenceNo}</td>
                      <td className="p-3 text-slate-600">{item.description}</td>
                      <td className="p-3 text-right font-medium text-slate-800">
                        {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-medium text-emerald-600">
                        {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Tax Invoices</h3>
            <button
              onClick={() => onNewInvoice(customer)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No invoices generated for this client yet.</div>
            ) : (
              customerInvoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => onViewInvoice(inv)}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{inv.invoiceNo}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClasses(inv.status)}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: {formatDate(inv.invoiceDate)} | Due: {formatDate(inv.dueDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900 block">{formatCurrency(inv.grandTotal)}</span>
                      {inv.balanceDue > 0 && (
                        <span className="text-[10px] text-orange-600 font-medium">Due: {formatCurrency(inv.balanceDue)}</span>
                      )}
                    </div>

                    {onEditInvoice && inv.status !== 'cancelled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditInvoice(inv);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateInvoicePDF(inv, companySettings);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Quotations */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Quotations & Estimates</h3>
            <button
              onClick={() => onNewQuotation(customer)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quotation</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerQuotations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No estimates created for this party.</div>
            ) : (
              customerQuotations.map(qtn => (
                <div key={qtn.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{qtn.quotationNo}</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: {formatDate(qtn.date)} | Valid Until: {formatDate(qtn.validUntil)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900 block">{formatCurrency(qtn.grandTotal)}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{qtn.status}</span>
                    </div>

                    {onEditQuotation && (
                      <button
                        onClick={() => onEditQuotation(qtn)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Quotation"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                    )}

                    {onConvertToInvoice && qtn.status !== 'converted' && (
                      <button
                        onClick={() => onConvertToInvoice(qtn)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        title="Convert to Invoice"
                      >
                        To Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Payment Receipts</h3>
            <button
              onClick={() => onReceivePayment(customer)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No payment receipts recorded yet.</div>
            ) : (
              customerPayments.map(p => (
                <div key={p.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{p.receiptNo}</span>
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded-full">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: {formatDate(p.paymentDate)} {p.referenceNo ? `| Ref: ${p.referenceNo}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-emerald-600">{formatCurrency(p.amount)}</span>
                    <button
                      onClick={() => generatePaymentReceiptPDF(p, customer, companySettings)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Download Receipt PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: AMC Contracts */}
      {activeTab === 'amc' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">AMC / CMC Maintenance Contracts</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {customerAmc.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No active AMC contracts linked to this customer.</div>
            ) : (
              customerAmc.map(amc => (
                <div key={amc.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{amc.title} ({amc.contractNo})</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(amc.startDate)} to {formatDate(amc.endDate)} | {amc.serviceFrequency} Visits
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      {amc.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Equipment Assets */}
      {activeTab === 'equipment' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Installed Fire Safety Assets</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {customerEquipment.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No equipment records registered for this site.</div>
            ) : (
              customerEquipment.map(eq => (
                <div key={eq.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{eq.equipmentType} - S/N: {eq.serialNo}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Location: {eq.location} | Capacity: {eq.capacity || 'N/A'}</p>
                    <p className="text-[11px] text-slate-400">Next Service Due: {formatDate(eq.nextServiceDate || (eq as any).nextServiceDue)}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    eq.condition === 'Good' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {eq.condition}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
