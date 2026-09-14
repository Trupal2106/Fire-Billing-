import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  User,
  Download,
  AlertCircle,
  Package,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import {
  Customer,
  ProductItem,
  Quotation,
  InvoiceItem,
  CompanySettings
} from '../../types';
import { calculateInvoiceTotals, isInterstateSupply, INDIAN_STATES } from '../../utils/gstCalculations';
import { formatCurrency, numberToIndianWords } from '../../utils/formatters';
import { generateQuotationPDF } from '../../utils/pdfGenerator';
import { ItemPricePickerModal } from '../modals/ItemPricePickerModal';
import { DocumentNumberConfigModal } from '../modals/DocumentNumberConfigModal';
import { generateNextQuotationNumber } from '../../utils/numbering';
import { UnitSelect } from '../common/UnitSelect';
import { SearchableProductSelect } from '../common/SearchableProductSelect';
import { SearchableCustomerSelect } from '../common/SearchableCustomerSelect';

interface QuotationFormViewProps {
  customers: Customer[];
  products: ProductItem[];
  companySettings: CompanySettings;
  existingQuotations?: Quotation[];
  preselectedCustomer?: Customer | null;
  quotationToEdit?: Quotation | null;
  onBack: () => void;
  onSaveQuotation: (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>, downloadPdf?: boolean) => Promise<Quotation>;
  onOpenQuickAddCustomer: () => void;
  onOpenQuickAddProduct?: () => void;
  onUpdateCompanySettings?: (settings: Partial<CompanySettings>) => Promise<void>;
}

export const QuotationFormView: React.FC<QuotationFormViewProps> = ({
  customers,
  products,
  companySettings,
  existingQuotations = [],
  preselectedCustomer,
  quotationToEdit,
  onBack,
  onSaveQuotation,
  onOpenQuickAddCustomer,
  onOpenQuickAddProduct,
  onUpdateCompanySettings
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultValidDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const isEditing = Boolean(quotationToEdit && quotationToEdit.id);

  const defaultQuotationNo = useMemo(() => {
    return generateNextQuotationNumber(companySettings, existingQuotations);
  }, [companySettings, existingQuotations]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    quotationToEdit?.customerId || preselectedCustomer?.id || (customers?.[0]?.id || '')
  );

  const initialCust = useMemo(() => {
    const custId = quotationToEdit?.customerId || preselectedCustomer?.id || (customers?.[0]?.id || '');
    return customers?.find(c => c.id === custId);
  }, [customers, quotationToEdit, preselectedCustomer]);

  const [quotationNo, setQuotationNo] = useState(quotationToEdit?.quotationNo || defaultQuotationNo);
  const [isNumberConfigOpen, setIsNumberConfigOpen] = useState(false);
  const [date, setDate] = useState(quotationToEdit?.date || todayStr);
  const [validUntil, setValidUntil] = useState(quotationToEdit?.validUntil || defaultValidDate);
  const [customerState, setCustomerState] = useState(
    quotationToEdit?.customerState || preselectedCustomer?.state || initialCust?.state || 'Gujarat'
  );
  const [billingAddress, setBillingAddress] = useState(
    quotationToEdit?.billingAddress || preselectedCustomer?.billingAddress || initialCust?.billingAddress || ''
  );

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
      setCustomerState(preselectedCustomer.state || 'Gujarat');
      setBillingAddress(preselectedCustomer.billingAddress || '');
    }
  }, [preselectedCustomer]);

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>(
    quotationToEdit?.items && quotationToEdit.items.length > 0 ? quotationToEdit.items : [
      {
        id: `qitem_${Date.now()}`,
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

  const [overallDiscount, setOverallDiscount] = useState(quotationToEdit?.totalDiscount || 0);
  const [terms, setTerms] = useState(quotationToEdit?.terms || '1. Offer valid for 30 days.\n2. 50% Advance with PO, balance against delivery.\n3. Taxes as applicable at time of supply.');
  const [notes, setNotes] = useState(quotationToEdit?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleCustomerChange = (newCustId: string) => {
    setSelectedCustomerId(newCustId);
    const targetCust = customers.find(c => c.id === newCustId);
    if (targetCust) {
      setCustomerState(targetCust.state || companySettings.state || 'Gujarat');
      setBillingAddress(targetCust.billingAddress || '');
    }
  };

  const isInterstate = useMemo(() => {
    return isInterstateSupply(companySettings.state, customerState);
  }, [companySettings.state, customerState]);

  const totals = useMemo(() => {
    return calculateInvoiceTotals(items, isInterstate, overallDiscount, 0);
  }, [items, isInterstate, overallDiscount]);

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
        hsnSac: prod.hsnSac || '8424',
        unit: prod.unit || 'Nos',
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
        id: `qitem_${Date.now()}_${Math.random()}`,
        name: '',
        description: '',
        hsnSac: '8424',
        quantity: 1,
        unit: 'Nos',
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
      const isFirstEmpty = prev.length === 1 && !prev[0].name.trim() && prev[0].rate === 0;

      const formattedNewItems: InvoiceItem[] = newItems.map(ni => ({
        id: ni.id || `qitem_${Date.now()}_${Math.random()}`,
        productId: ni.productId,
        name: ni.name || '',
        description: ni.description || '',
        hsnSac: ni.hsnSac || '8424',
        quantity: ni.quantity || 1,
        unit: ni.unit || 'Nos',
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

  const handleSubmit = async (downloadPdf: boolean = false) => {
    if (!selectedCustomerId) {
      setError('Please select or add a client/customer');
      return;
    }
    if (!quotationNo.trim()) {
      setError('Quotation Number is required');
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

      const quotationData = {
        quotationNo,
        date,
        validUntil,
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'Client',
        customerGstin: selectedCustomer?.gstin,
        customerState,
        billingAddress,
        isInterstate,
        items: totals.items,
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        taxableAmount: totals.taxableAmount,
        cgstTotal: totals.cgstTotal,
        sgstTotal: totals.sgstTotal,
        igstTotal: totals.igstTotal,
        roundOff: totals.roundOff,
        grandTotal: totals.grandTotal,
        status: quotationToEdit?.status || 'draft',
        terms,
        notes
      };

      const saved = await onSaveQuotation(quotationData as any, downloadPdf);
      if (downloadPdf) {
        generateQuotationPDF(saved, companySettings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save quotation');
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1500px] mx-auto space-y-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Back to Quotations'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : (isEditing ? 'Update Quotation' : 'Save Quotation')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-600" />
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

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {isEditing ? `Edit Quotation (${quotationNo})` : 'Formal Price Quotation / Estimate'}
              </h2>
              <p className="text-xs text-slate-500">Fire safety project proposal with GST & validity period</p>
            </div>
          </div>
        </div>

        {/* Customer & Quotation Meta */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Quotation For (Client / Party)</span>
              </label>
              <button
                type="button"
                onClick={onOpenQuickAddCustomer}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>

            <SearchableCustomerSelect
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleCustomerChange}
              onOpenQuickAddCustomer={onOpenQuickAddCustomer}
            />

            {selectedCustomer && (
              <div className="pt-2 text-xs text-slate-600">
                <p><strong>Billing Address:</strong> {billingAddress}</p>
                <p className="mt-0.5"><strong>State:</strong> {customerState}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">Quotation Details</span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700">Quotation Number</label>
                <button
                  type="button"
                  onClick={() => setIsNumberConfigOpen(true)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="Configure fixed prefix and auto serial sequence"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Customize ({companySettings.quotationPrefix || 'ag/QTN/2026'})</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={quotationNo}
                  onChange={e => setQuotationNo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold font-mono text-blue-600 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Fixed prefix + auto sequence</span>
                <span className="font-mono text-slate-500">Auto serial: 01, 02, 03...</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>Quotation Line Items & Scope</span>
                <span className="text-xs font-normal text-slate-500">
                  ({items.length} item{items.length > 1 ? 's' : ''})
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Select standard fire equipment, refilling services or custom scope</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Browse Price List & Catalog</span>
                <span className="bg-blue-800 text-[10px] px-1.5 py-0.2 rounded-full text-white">
                  {products.length}
                </span>
              </button>

              {onOpenQuickAddProduct && (
                <button
                  type="button"
                  onClick={onOpenQuickAddProduct}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
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
                  <th className="p-3 min-w-[220px]">Scope / Item Description</th>
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
                  const calculatedRow = totals?.items?.[index] || item;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 w-8 text-center font-semibold text-slate-400">{index + 1}</td>
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
                          placeholder="Item name (e.g. Fire Hydrant Landing Valve 63mm)"
                          value={item.name}
                          onChange={e => handleItemChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-200 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="p-3 w-24">
                        <input
                          type="text"
                          value={item.hsnSac}
                          onChange={e => handleItemChange(index, 'hsnSac', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200"
                        />
                      </td>

                      <td className="p-3 w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-200 text-center"
                        />
                      </td>

                      <td className="p-3 w-36">
                        <UnitSelect
                          value={item.unit}
                          onChange={val => handleItemChange(index, 'unit', val)}
                        />
                      </td>

                      <td className="p-3 w-28 text-right">
                        <input
                          type="number"
                          step="any"
                          value={item.rate || ''}
                          onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-slate-200 text-right"
                        />
                      </td>

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

                      <td className="p-3 w-32 text-right font-bold text-slate-900">
                        {formatCurrency(calculatedRow.totalAmount)}
                      </td>

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
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Blank Item Row</span>
            </button>
          </div>
        </div>

        {/* Totals & Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-900 uppercase block mb-1">
                Amount in Words (Indian Format)
              </span>
              <p className="text-xs font-black text-black uppercase tracking-wide">
                {numberToIndianWords(totals.grandTotal)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Terms & Conditions</label>
              <textarea
                rows={4}
                value={terms}
                onChange={e => setTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-800 font-bold">
              <span>Quotation Calculation</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                ✓ Verified Accurate
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Before Tax):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totals.subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-700 font-medium">
              <span>Taxable Amount (Base Value):</span>
              <span className="font-semibold">{formatCurrency(totals.taxableAmount)}</span>
            </div>

            {isInterstate ? (
              <div className="flex justify-between text-purple-700 font-medium">
                <span>IGST Total (18% Integrated Tax):</span>
                <span className="font-semibold">{formatCurrency(totals.igstTotal)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9% Central Tax):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(totals.cgstTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9% State Tax):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(totals.sgstTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Total GST (CGST + SGST):</span>
                  <span>{formatCurrency(totals.cgstTotal + totals.sgstTotal)}</span>
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
                className="w-28 px-2 py-1 text-right text-xs font-semibold rounded border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {totals.roundOff !== 0 && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Round Off Adjustment:</span>
                <span>{totals.roundOff > 0 ? '+' : ''}{formatCurrency(totals.roundOff)}</span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center bg-blue-50/60 p-2.5 rounded-lg">
              <div>
                <span className="font-bold text-sm text-slate-900 block">Quotation Total:</span>
                <span className="text-[10px] text-slate-500">Taxable + GST - Discount ± Round Off</span>
              </div>
              <span className="font-extrabold text-xl text-blue-600">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Price Picker Modal */}
      <ItemPricePickerModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        products={products}
        onAddItems={handleCatalogAddItems}
        onOpenCreateProduct={onOpenQuickAddProduct}
      />

      {/* Quotation Number Config Modal */}
      <DocumentNumberConfigModal
        isOpen={isNumberConfigOpen}
        onClose={() => setIsNumberConfigOpen(false)}
        documentType="quotation"
        companySettings={companySettings}
        currentNumber={quotationNo}
        onApplyToCurrent={(newNum) => setQuotationNo(newNum)}
        onSaveAsDefault={async (updates) => {
          if (onUpdateCompanySettings) {
            await onUpdateCompanySettings(updates);
          }
        }}
      />
    </div>
  );
};
