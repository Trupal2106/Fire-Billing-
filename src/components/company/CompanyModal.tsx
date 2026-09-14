import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Landmark,
  FileText,
  Search,
  Trash2,
  Plus
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { INDIAN_STATES } from '../../utils/taxCalculations';
import { lookupGstDetails, isValidGSTIN } from '../../utils/gstLookup';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCompany: (company: CompanySettings) => Promise<void>;
  companyToEdit?: CompanySettings | null;
  isCreatingNew?: boolean;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSaveCompany,
  companyToEdit,
  isCreatingNew = false
}) => {
  const [formData, setFormData] = useState<CompanySettings>({
    id: `comp_${Date.now()}`,
    companyName: '',
    tagline: 'Fire Protection & Safety Equipment AMC Solutions',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    pinCode: '',
    phone: '',
    alternatePhone: '',
    email: '',
    website: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    termsAndConditions: '1. Goods once sold will not be taken back without valid inspection.\n2. Fire safety refill carries 1-year shelf life under IS 2190 standards.\n3. Payment due within 15 days of invoice date.\n4. All disputes subject to local jurisdiction.',
    allowNegativeStock: false,
    invoicePrefix: 'INV/2026',
    invoiceNextNumber: 1,
    invoicePadding: 2,
    invoiceSeparator: '/',
    autoIncrementInvoiceNo: true,
    quotationPrefix: 'QTN/2026',
    quotationNextNumber: 1,
    quotationPadding: 2,
    quotationSeparator: '/',
    autoIncrementQuotationNo: true,
    receiptPrefix: 'REC/2026',
    receiptNextNumber: 1,
    receiptPadding: 2,
    receiptSeparator: '/',
    autoIncrementReceiptNo: true,
    updatedAt: new Date().toISOString()
  });

  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'bank' | 'series' | 'terms'>('general');
  const [isVerifyingGst, setIsVerifyingGst] = useState(false);
  const [gstMessage, setGstMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (companyToEdit && !isCreatingNew) {
      setFormData({ ...companyToEdit });
    } else {
      // Default blank company for new creation
      setFormData({
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        companyName: '',
        tagline: 'Fire Protection & Electrical Solutions',
        address: '',
        city: 'Ahmedabad',
        state: 'Gujarat',
        stateCode: '24',
        pinCode: '',
        phone: '',
        alternatePhone: '',
        email: '',
        website: '',
        gstin: '',
        pan: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        upiId: '',
        termsAndConditions: '1. Goods once sold will not be taken back or exchanged without authorization.\n2. Payment terms: 15 days from bill date.\n3. Fire protection refills guaranteed as per IS standards.\n4. All disputes subject to local jurisdiction.',
        allowNegativeStock: false,
        invoicePrefix: 'FC/2026',
        invoiceNextNumber: 1,
        invoicePadding: 2,
        invoiceSeparator: '/',
        autoIncrementInvoiceNo: true,
        quotationPrefix: 'FC/QTN/2026',
        quotationNextNumber: 1,
        quotationPadding: 2,
        quotationSeparator: '/',
        autoIncrementQuotationNo: true,
        receiptPrefix: 'FC/REC/2026',
        receiptNextNumber: 1,
        receiptPadding: 2,
        receiptSeparator: '/',
        autoIncrementReceiptNo: true,
        updatedAt: new Date().toISOString()
      });
    }
    setErrors({});
    setGstMessage('');
    setActiveTab('general');
  }, [companyToEdit, isCreatingNew, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof CompanySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // GST auto lookup & extraction
  const handleGstChange = (val: string) => {
    const cleanGst = val.toUpperCase().trim();
    let panExtracted = formData.pan;
    let stateExtracted = formData.state;
    let stateCodeExtracted = formData.stateCode;

    if (cleanGst.length >= 2) {
      const code = cleanGst.substring(0, 2);
      const matchedState = INDIAN_STATES.find(s => s.code === code);
      if (matchedState) {
        stateExtracted = matchedState.name;
        stateCodeExtracted = matchedState.code;
      }
    }

    if (cleanGst.length >= 12) {
      panExtracted = cleanGst.substring(2, 12);
    }

    setFormData(prev => ({
      ...prev,
      gstin: cleanGst,
      pan: panExtracted,
      state: stateExtracted,
      stateCode: stateCodeExtracted
    }));
  };

  const handleLookupGst = async () => {
    const gstin = formData.gstin.trim();
    if (!gstin) {
      setGstMessage('Please enter a GSTIN first');
      return;
    }

    if (!isValidGSTIN(gstin)) {
      setGstMessage('❌ Invalid GSTIN format. Removed wrong GST.');
      setFormData(prev => ({ ...prev, gstin: '', pan: '' }));
      return;
    }

    try {
      setIsVerifyingGst(true);
      setGstMessage('');
      const details = await lookupGstDetails(gstin);

      setFormData(prev => ({
        ...prev,
        companyName: prev.companyName || details.legalName || details.tradeName,
        address: prev.address || details.address,
        city: prev.city || details.city,
        state: details.state,
        stateCode: details.stateCode,
        pinCode: prev.pinCode || details.pin,
        pan: details.pan
      }));

      setGstMessage(`✓ Verified: ${details.tradeName || details.legalName} (${details.status})`);
    } catch (e: any) {
      setGstMessage(`❌ Verification failed: ${e.message || 'Wrong GST'}. Wrong details removed.`);
      setFormData(prev => ({ ...prev, gstin: '', pan: '' }));
    } finally {
      setIsVerifyingGst(false);
    }
  };

  const handleClearGst = () => {
    setFormData(prev => ({ ...prev, gstin: '', pan: '' }));
    setGstMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      setActiveTab('general');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile or phone number is required';
      if (!newErrors.companyName) setActiveTab('contact');
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Company registered address is required';
      if (!newErrors.companyName && !newErrors.phone) setActiveTab('contact');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const toSave: CompanySettings = {
        ...formData,
        companyName: formData.companyName.trim().toUpperCase(),
        name: formData.companyName.trim().toUpperCase(),
        accountName: formData.accountName || formData.companyName.trim().toUpperCase(),
        updatedAt: new Date().toISOString()
      };
      await onSaveCompany(toSave);
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save company profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {isCreatingNew ? 'Create New Company' : 'Edit Company Details'}
              </h2>
              <p className="text-xs text-slate-500">
                {isCreatingNew
                  ? 'Setup a fresh, completely separate company profile & database'
                  : 'Manage business identity, GST registration, bank details & invoice series'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-white overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'general', label: 'Company & Tax' },
            { id: 'contact', label: 'Address & Contact' },
            { id: 'bank', label: 'Bank & UPI' },
            { id: 'series', label: 'Prefix & Numbering' },
            { id: 'terms', label: 'Terms & Notes' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* TAB 1: General & Tax */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Firm Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FIRE CARE SAFETY SOLUTION"
                  value={formData.companyName}
                  onChange={e => handleFieldChange('companyName', e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border uppercase font-bold ${
                    errors.companyName ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-red-600'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline / Business Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Fire Protection, Hydrant & Electrical AMC Solutions"
                  value={formData.tagline || ''}
                  onChange={e => handleFieldChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                />
              </div>

              {/* GSTIN & PAN Auto-lookup */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">GST Registration & Tax Identity</span>
                  {formData.gstin && (
                    <button
                      type="button"
                      onClick={handleClearGst}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove GST
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GSTIN (15 Digits)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="24AAAFP1234F1Z8"
                        value={formData.gstin}
                        onChange={e => handleGstChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleLookupGst}
                        disabled={isVerifyingGst || !formData.gstin}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                        title="Verify GST and auto-fill details"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Find</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PAN Number (10 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="AAAFP1234F"
                      value={formData.pan}
                      onChange={e => handleFieldChange('pan', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                    />
                  </div>
                </div>

                {gstMessage && (
                  <p className={`text-[11px] font-medium ${gstMessage.includes('✓') ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {gstMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Address & Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Business Address <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Plot No., Industrial Area, Street, Landmark"
                  value={formData.address}
                  onChange={e => handleFieldChange('address', e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.address ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-red-600'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmedabad"
                    value={formData.city}
                    onChange={e => handleFieldChange('city', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={e => {
                      const selectedState = e.target.value;
                      const matched = INDIAN_STATES.find(s => s.name === selectedState);
                      setFormData(prev => ({
                        ...prev,
                        state: selectedState,
                        stateCode: matched ? matched.code : prev.stateCode
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="382445"
                    value={formData.pinCode}
                    onChange={e => handleFieldChange('pinCode', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone / Mobile <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-red-600'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alternate Phone / Landline
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 79 2589 1122"
                    value={formData.alternatePhone || ''}
                    onChange={e => handleFieldChange('alternatePhone', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    placeholder="www.company.com"
                    value={formData.website || ''}
                    onChange={e => handleFieldChange('website', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Bank & UPI */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-800">
                Bank account details and UPI QR code appear on Invoices and Quotations for client payments.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="State Bank of India / Central Bank"
                    value={formData.bankName}
                    onChange={e => handleFieldChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. FIRE CARE SAFETY SOLUTION"
                    value={formData.accountName || formData.companyName}
                    onChange={e => handleFieldChange('accountName', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="409823450912"
                    value={formData.accountNumber}
                    onChange={e => handleFieldChange('accountNumber', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="SBIN0001234"
                    value={formData.ifscCode}
                    onChange={e => handleFieldChange('ifscCode', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:border-red-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="Vatva GIDC Branch, Ahmedabad"
                    value={formData.branch}
                    onChange={e => handleFieldChange('branch', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID (For QR Code)</label>
                  <input
                    type="text"
                    placeholder="company@sbi"
                    value={formData.upiId}
                    onChange={e => handleFieldChange('upiId', e.target.value.toLowerCase())}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-red-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Prefix & Series */}
          {activeTab === 'series' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Customize invoice, quotation, and receipt prefixes and numbering series for this specific company.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={e => handleFieldChange('invoicePrefix', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">e.g. FC/2026</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Number</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.invoiceNextNumber ?? 1}
                    onChange={e => handleFieldChange('invoiceNextNumber', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Padding</label>
                  <select
                    value={formData.invoicePadding ?? 2}
                    onChange={e => handleFieldChange('invoicePadding', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  >
                    <option value={1}>1 (e.g. 1)</option>
                    <option value={2}>2 (e.g. 01)</option>
                    <option value={3}>3 (e.g. 001)</option>
                    <option value={4}>4 (e.g. 0001)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quotation Prefix</label>
                  <input
                    type="text"
                    value={formData.quotationPrefix}
                    onChange={e => handleFieldChange('quotationPrefix', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">e.g. FC/QTN/2026</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Number</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quotationNextNumber ?? 1}
                    onChange={e => handleFieldChange('quotationNextNumber', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Padding</label>
                  <select
                    value={formData.quotationPadding ?? 2}
                    onChange={e => handleFieldChange('quotationPadding', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600 bg-white"
                  >
                    <option value={1}>1 (e.g. 1)</option>
                    <option value={2}>2 (e.g. 01)</option>
                    <option value={3}>3 (e.g. 001)</option>
                    <option value={4}>4 (e.g. 0001)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Terms */}
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Default Terms & Conditions
              </label>
              <textarea
                rows={7}
                value={formData.termsAndConditions}
                onChange={e => handleFieldChange('termsAndConditions', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-600 font-sans"
              />
              <span className="text-[11px] text-slate-400">
                These terms will automatically be printed on tax invoices and quotations for this company.
              </span>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 disabled:bg-slate-300 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isCreatingNew ? 'Create & Switch Company' : 'Save Company Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
