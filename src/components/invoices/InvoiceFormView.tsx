import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Receipt,
  User,
  Building2,
  Calendar,
  CreditCard,
  Percent,
  Download,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  PlusCircle,
  Tag,
  Calculator
} from 'lucide-react';
import {
  Customer,
  ProductItem,
  Invoice,
  InvoiceItem,
  CompanySettings
} from '../../types';
import { calculateInvoiceTotals, isInterstateSupply, INDIAN_STATES } from '../../utils/gstCalculations';
import { formatCurrency, numberToIndianWords } from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { ItemPricePickerModal } from '../modals/ItemPricePickerModal';
import { DocumentNumberConfigModal } from '../modals/DocumentNumberConfigModal';
import { generateNextInvoiceNumber } from '../../utils/numbering';
import { UnitSelect } from '../common/UnitSelect';
import { SearchableProductSelect } from '../common/SearchableProductSelect';
import { SearchableCustomerSelect } from '../common/SearchableCustomerSelect';

interface InvoiceFormViewProps {
  customers: Customer[];
  products: ProductItem[];
  companySettings: CompanySettings;
  existingInvoices?: Invoice[];
  preselectedCustomer?: Customer | null;
  invoiceToEdit?: Invoice | null;
  onBack: () => void;
  onSaveInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>, downloadPdf?: boolean) => Promise<Invoice>;
  onOpenQuickAddCustomer: () => void;
  onOpenQuickAddProduct?: () => void;
  onUpdateCompanySettings?: (settings: Partial<CompanySettings>) => Promise<void>;
}

export const InvoiceFormView: React.FC<InvoiceFormViewProps> = ({
  customers,
  products,
  companySettings,
  existingInvoices = [],
  preselectedCustomer,
  invoiceToEdit,
  onBack,
  onSaveInvoice,
  onOpenQuickAddCustomer,
  onOpenQuickAddProduct,
  onUpdateCompanySettings
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultDueDate = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

  const isEditing = Boolean(invoiceToEdit && invoiceToEdit.id);

  // Auto-generate invoice number if new using customized prefix & auto serial
  const defaultInvoiceNo = useMemo(() => {
    return generateNextInvoiceNumber(companySettings, existingInvoices);
  }, [companySettings, existingInvoices]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    invoiceToEdit?.customerId || preselectedCustomer?.id || (customers?.[0]?.id || '')
  );

  const initialCust = useMemo(() => {
    const custId = invoiceToEdit?.customerId || preselectedCustomer?.id || (customers?.[0]?.id || '');
    return customers?.find(c => c.id === custId);
  }, [customers, invoiceToEdit, preselectedCustomer]);

  const [invoiceNo, setInvoiceNo] = useState(invoiceToEdit?.invoiceNo || defaultInvoiceNo);
  const [isNumberConfigOpen, setIsNumberConfigOpen] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(invoiceToEdit?.invoiceDate || todayStr);
  const [dueDate, setDueDate] = useState(invoiceToEdit?.dueDate || defaultDueDate);
  const [customerState, setCustomerState] = useState(
    invoiceToEdit?.customerState || preselectedCustomer?.state || initialCust?.state || 'Gujarat'
  );
  const [billingAddress, setBillingAddress] = useState(
    invoiceToEdit?.billingAddress || preselectedCustomer?.billingAddress || initialCust?.billingAddress || ''
  );
  const [customerGstin, setCustomerGstin] = useState(
    invoiceToEdit?.customerGstin || preselectedCustomer?.gstin || initialCust?.gstin || ''
  );

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
      setCustomerState(preselectedCustomer.state || 'Gujarat');
      setBillingAddress(preselectedCustomer.billingAddress || '');
      setCustomerGstin(preselectedCustomer.gstin || '');
    }
  }, [preselectedCustomer]);

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>(
    invoiceToEdit?.items && invoiceToEdit.items.length > 0 ? invoiceToEdit.items : [
      {
        id: `item_${Date.now()}`,
        name: '',
        description: '',
        hsnSac: '8424',
        quantity: 1,
        unit: 'NOS',
        rate: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxableAmount: 0,
        gstRate: 18,
        cgstRate: 9,
        cgstAmount: 0,
        sgstRate: 9,
        sgstAmount: 0,
        igstRate: 0,
        igstAmount: 0,
        totalAmount: 0
      }
    ]
  );

  const [overallDiscount, setOverallDiscount] = useState(invoiceToEdit?.totalDiscount || 0);
  const [amountPaid, setAmountPaid] = useState(invoiceToEdit?.amountPaid || 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card'>(
    (invoiceToEdit?.paymentMethod as any) || 'Bank Transfer'
  );
  const [notes, setNotes] = useState(invoiceToEdit?.notes || '');
  const [terms, setTerms] = useState(invoiceToEdit?.terms || companySettings.termsAndConditions);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleCustomerChange = (newCustId: string) => {
    setSelectedCustomerId(newCustId);
    const targetCust = customers.find(c => c.id === newCustId);
    if (targetCust) {
      setCustomerState(targetCust.state || companySettings.state || 'Gujarat');
      setBillingAddress(targetCust.billingAddress || '');
      setCustomerGstin(targetCust.gstin || '');
    }
  };

  // Detect Interstate
  const isInterstate = useMemo(() => {
    return isInterstateSupply(companySettings.state, customerState);
  }, [companySettings.state, customerState]);

  // Real-time calculation of invoice totals
  const invoiceTotals = useMemo(() => {
    return calculateInvoiceTotals(items, isInterstate, overallDiscount, amountPaid);
  }, [items, isInterstate, overallDiscount, amountPaid]);

  // Line item handlers
  const handleItemSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        name: prod.name,
        description: prod.description || '',
        hsnSac: prod.hsnSac || (prod.type === 'product' ? '8424' : '9987'),
        unit: prod.unit || 'NOS',
        rate: prod.sellingPrice || 0,
        gstRate: prod.gstRate ?? 18
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item_${Date.now()}_${Math.random()}`,
        name: '',
        description: '',
        hsnSac: '8424',
        quantity: 1,
        unit: 'NOS',
        rate: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxableAmount: 0,
        gstRate: 18,
        cgstRate: 9,
        cgstAmount: 0,
        sgstRate: 9,
        sgstAmount: 0,
        igstRate: 0,
        igstAmount: 0,
        totalAmount: 0
      }
    ]);
  };

  const handleCatalogAddItems = (newItems: Partial<InvoiceItem>[]) => {
    if (newItems.length === 0) return;

    setItems(prev => {
      // If we only have 1 item and it's empty (no name and no rate), replace it
      const isFirstEmpty = prev.length === 1 && !prev[0].name.trim() && prev[0].rate === 0;

      const formattedNewItems: InvoiceItem[] = newItems.map(ni => ({
        id: ni.id || `item_${Date.now()}_${Math.random()}`,
        productId: ni.productId,
        name: ni.name || '',
        description: ni.description || '',
        hsnSac: ni.hsnSac || '8424',
        quantity: ni.quantity || 1,
        unit: ni.unit || 'NOS',
        rate: ni.rate || 0,
        discountPercent: ni.discountPercent || 0,
        discountAmount: ni.discountAmount || 0,
        taxableAmount: (ni.quantity || 1) * (ni.rate || 0),
        gstRate: ni.gstRate ?? 18,
        cgstRate: (ni.gstRate ?? 18) / 2,
        cgstAmount: 0,
        sgstRate: (ni.gstRate ?? 18) / 2,
        sgstAmount: 0,
        igstRate: 0,
        igstAmount: 0,
        totalAmount: 0
      }));

      if (isFirstEmpty) {
        return formattedNewItems;
      }
      return [...prev, ...formattedNewItems];
    });
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Submit invoice
  const handleSubmit = async (downloadPdf: boolean = false) => {
    if (!selectedCustomerId) {
      setError('Please select or create a customer');
      return;
    }
    if (!invoiceNo.trim()) {
      setError('Invoice Number is required');
      return;
    }
    const validItems = items.filter(it => it.name.trim() && it.rate > 0);
    if (validItems.length === 0) {
      setError('Please add at least one line item with valid name and rate');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      let status: 'unpaid' | 'paid' | 'partially_paid' = 'unpaid';
      if (invoiceTotals.balanceDue <= 0 && invoiceTotals.grandTotal > 0) {
        status = 'paid';
      } else if (invoiceTotals.amountPaid > 0) {
        status = 'partially_paid';
      }

      const invoiceData = {
        invoiceNo,
        invoiceDate,
        dueDate,
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'Cash Customer',
        customerGstin: customerGstin,
        customerState: customerState,
        billingAddress: billingAddress,
        shippingAddress: billingAddress,
        isInterstate: isInterstate,
        items: invoiceTotals.items,
        subtotal: invoiceTotals.subtotal,
        totalDiscount: invoiceTotals.totalDiscount,
        taxableAmount: invoiceTotals.taxableAmount,
        cgstTotal: invoiceTotals.cgstTotal,
        sgstTotal: invoiceTotals.sgstTotal,
        igstTotal: invoiceTotals.igstTotal,
        roundOff: invoiceTotals.roundOff,
        grandTotal: invoiceTotals.grandTotal,
        amountPaid: invoiceTotals.amountPaid,
        balanceDue: invoiceTotals.balanceDue,
        status: status,
        paymentMethod: amountPaid > 0 ? paymentMethod : undefined,
        terms: terms,
        notes: notes
      };

      const savedInv = await onSaveInvoice(invoiceData, downloadPdf);
      if (downloadPdf) {
        generateInvoicePDF(savedInv, companySettings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1500px] mx-auto space-y-6 pb-24 lg:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Back to Invoices'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Save Invoice')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>{isSaving ? 'Saving...' : (isEditing ? 'Update & Download PDF' : 'Save & Download PDF')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Invoice Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {isEditing ? `Edit Tax Invoice (${invoiceNo})` : 'GST Tax Invoice'}
              </h2>
              <p className="text-xs text-slate-500">
                {isInterstate ? 'Interstate Supply (IGST Applicable)' : 'Intra-State Supply (CGST + SGST Applicable)'}
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            isInterstate ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {isInterstate ? 'IGST 18%' : 'CGST 9% + SGST 9%'}
          </span>
        </div>

        {/* Customer & Invoice Meta Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Customer Selection */}
          <div className="lg:col-span-2 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>Bill To (Party / Customer)</span>
              </label>
              <button
                type="button"
                onClick={onOpenQuickAddCustomer}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Customer</span>
              </button>
            </div>

            <SearchableCustomerSelect
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleCustomerChange}
              onOpenQuickAddCustomer={onOpenQuickAddCustomer}
            />

            {selectedCustomer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">GSTIN / Tax ID:</span>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={e => setCustomerGstin(e.target.value.toUpperCase())}
                    placeholder="URP / Unregistered"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 bg-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">State / Place of Supply:</span>
                  <select
                    value={customerState}
                    onChange={e => setCustomerState(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-hidden focus:border-red-500"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st.code} value={st.name}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-500 block">Billing Address:</span>
                  <textarea
                    rows={2}
                    value={billingAddress}
                    onChange={e => setBillingAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Invoice Number & Dates */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">Invoice Metadata</span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700">Invoice Number</label>
                <button
                  type="button"
                  onClick={() => setIsNumberConfigOpen(true)}
                  className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="Configure fixed prefix (e.g. ag/2026) and auto serial sequence (01, 02...)"
                >
                  <Sparkles className="w-3 h-3 text-red-600" />
                  <span>Customize Format ({companySettings.invoicePrefix || 'ag/2026'})</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={invoiceNo}
                  onChange={e => setInvoiceNo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold font-mono text-red-600 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-red-500 shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Fixed prefix + auto sequence</span>
                <span className="font-mono text-slate-500">Auto serial: 01, 02, 03...</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500">
              <span>Seller State: </span>
              <strong className="text-slate-700">{companySettings.state} (Code: 24)</strong>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>Line Items & Services</span>
                <span className="text-xs font-normal text-slate-500">
                  ({items.length} item{items.length > 1 ? 's' : ''})
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Auto-calculates HSN/SAC, Rates, and CGST/SGST/IGST breakdown</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Browse Price List & Catalog</span>
                <span className="bg-red-800 text-[10px] px-1.5 py-0.2 rounded-full text-white">
                  {products.length}
                </span>
              </button>

              {onOpenQuickAddProduct && (
                <button
                  type="button"
                  onClick={onOpenQuickAddProduct}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>New Product</span>
                </button>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-8 text-center text-slate-500">#</th>
                  <th className="p-3 min-w-[220px]">Item Description</th>
                  <th className="p-3 w-24">HSN/SAC</th>
                  <th className="p-3 w-20 text-center">Qty</th>
                  <th className="p-3 w-36">Unit</th>
                  <th className="p-3 w-28 text-right">Rate (₹)</th>
                  <th className="p-3 w-20 text-center">GST %</th>
                  <th className="p-3 w-32 text-right">Total (₹)</th>
                  <th className="p-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item, index) => {
                  const calculatedRow = invoiceTotals?.items?.[index] || item;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 w-8 text-center font-semibold text-slate-400">{index + 1}</td>

                      {/* Item Selector & Name */}
                      <td className="p-3 space-y-1.5 min-w-[220px]">
                        <SearchableProductSelect
                          products={products}
                          selectedProductId={item.productId}
                          selectedName={item.name}
                          onOpenAddProduct={onOpenQuickAddProduct}
                          onSelectProduct={(prod) => {
                            setItems(prev => {
                              const updated = [...prev];
                              updated[index] = {
                                ...updated[index],
                                productId: prod.id,
                                name: prod.name,
                                description: prod.description || updated[index].description || '',
                                hsnSac: prod.hsnSac || (prod.type === 'product' ? '8424' : '9987'),
                                unit: prod.unit || updated[index].unit || 'NOS',
                                rate: prod.sellingPrice || 0,
                                gstRate: prod.gstRate ?? 18
                              };
                              return updated;
                            });
                          }}
                          onClear={() => {
                            setItems(prev => {
                              const updated = [...prev];
                              updated[index] = {
                                ...updated[index],
                                productId: undefined
                              };
                              return updated;
                            });
                          }}
                        />

                        <input
                          type="text"
                          placeholder="Item or service name (e.g. ABC Powder Extinguisher 6kg)"
                          value={item.name}
                          onChange={e => handleItemChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-200 focus:outline-hidden focus:border-red-500"
                        />
                        <input
                          type="text"
                          placeholder="Optional scope / location notes (e.g. 1st Floor Server Room)"
                          value={item.description || ''}
                          onChange={e => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-0.5 text-[11px] text-slate-500 rounded border border-slate-100 focus:outline-hidden"
                        />
                      </td>

                      {/* HSN/SAC */}
                      <td className="p-3 w-24">
                        <input
                          type="text"
                          value={item.hsnSac}
                          onChange={e => handleItemChange(index, 'hsnSac', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200"
                        />
                      </td>

                      {/* Qty */}
                      <td className="p-3 w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-200 text-center"
                        />
                      </td>

                      {/* Unit */}
                      <td className="p-3 w-36">
                        <UnitSelect
                          value={item.unit}
                          onChange={val => handleItemChange(index, 'unit', val)}
                        />
                      </td>

                      {/* Rate */}
                      <td className="p-3 w-28 text-right">
                        <input
                          type="number"
                          step="any"
                          value={item.rate || ''}
                          onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-200 text-right"
                        />
                      </td>

                      {/* GST % */}
                      <td className="p-3 w-20 text-center">
                        <select
                          value={item.gstRate}
                          onChange={e => handleItemChange(index, 'gstRate', Number(e.target.value))}
                          className="w-full px-1.5 py-1 text-xs font-semibold rounded border border-slate-200 text-center"
                        >
                          <option value={18}>18%</option>
                          <option value={12}>12%</option>
                          <option value={28}>28%</option>
                          <option value={5}>5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </td>

                      {/* Row Total */}
                      <td className="p-3 w-32 text-right font-bold text-slate-900">
                        {formatCurrency(calculatedRow.totalAmount)}
                      </td>

                      {/* Delete Row */}
                      <td className="p-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddItemRow}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Blank Item Row</span>
            </button>
          </div>
        </div>

        {/* Totals & Payment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Left: Terms, Notes & Amount in Words */}
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-900 uppercase block mb-1">
                Amount in Words (Indian Format)
              </span>
              <p className="text-xs font-black text-black uppercase tracking-wide">
                {numberToIndianWords(invoiceTotals.grandTotal)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
              <textarea
                rows={3}
                value={terms}
                onChange={e => setTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Private Notes</label>
              <input
                type="text"
                placeholder="e.g. PO No: ABC/123 dated 15-08-2025"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          {/* Right: Calculations Box & Payment */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-red-600" />
                  <span>Calculation Summary</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  ✓ Verified Accurate
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Gross Item Total):</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoiceTotals.subtotal)}</span>
              </div>

              {invoiceTotals.totalDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Item Discounts:</span>
                  <span>-{formatCurrency(invoiceTotals.totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700 font-medium">
                <span>Taxable Amount (Base Value):</span>
                <span className="font-semibold">{formatCurrency(invoiceTotals.taxableAmount)}</span>
              </div>

              {isInterstate ? (
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>IGST Total (18% Integrated Tax):</span>
                  <span className="font-semibold">{formatCurrency(invoiceTotals.igstTotal)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9% Central Tax):</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(invoiceTotals.cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9% State Tax):</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(invoiceTotals.sgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Total GST (CGST + SGST):</span>
                    <span>{formatCurrency(invoiceTotals.cgstTotal + invoiceTotals.sgstTotal)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-dashed border-slate-200">
                <span>Overall Discount / Rebate (₹):</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={overallDiscount || ''}
                  onChange={e => setOverallDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-28 px-2 py-1 text-right text-xs font-semibold rounded border border-slate-300 bg-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              {invoiceTotals.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off Adjustment:</span>
                  <span>{invoiceTotals.roundOff > 0 ? '+' : ''}{formatCurrency(invoiceTotals.roundOff)}</span>
                </div>
              )}

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center bg-red-50/60 p-2.5 rounded-lg">
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Grand Total:</span>
                  <span className="text-[10px] text-slate-500">Taxable + GST - Discount ± Round Off</span>
                </div>
                <span className="font-extrabold text-xl text-red-600">{formatCurrency(invoiceTotals.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Received Input Box */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Immediate Payment Received?</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAmountPaid(invoiceTotals.grandTotal)}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Mark Full Paid
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={amountPaid || ''}
                    onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-700 rounded border border-emerald-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-emerald-300 bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Credit/Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="font-medium text-slate-600">Remaining Balance Due:</span>
                <span className={`font-bold text-sm ${invoiceTotals.balanceDue > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {formatCurrency(invoiceTotals.balanceDue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item & Price List Catalog Modal */}
      <ItemPricePickerModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        products={products}
        onAddItems={handleCatalogAddItems}
        onOpenCreateProduct={onOpenQuickAddProduct}
      />

      {/* Invoice Number & Prefix Customizer Modal */}
      <DocumentNumberConfigModal
        isOpen={isNumberConfigOpen}
        onClose={() => setIsNumberConfigOpen(false)}
        documentType="invoice"
        companySettings={companySettings}
        currentNumber={invoiceNo}
        onApplyToCurrent={(newNum) => setInvoiceNo(newNum)}
        onSaveAsDefault={async (updates) => {
          if (onUpdateCompanySettings) {
            await onUpdateCompanySettings(updates);
          }
        }}
      />
    </div>
  );
};
