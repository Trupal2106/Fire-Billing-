import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  FileText,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Hash
} from 'lucide-react';
import { CompanySettings } from '../../types';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCompany: (company: CompanySettings) => Promise<void>;
  companyToEdit?: CompanySettings | null;
}

// Indian State Codes mapping
const INDIAN_STATES = [
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '08', name: 'Rajasthan' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '06', name: 'Haryana' },
  { code: '32', name: 'Kerala' },
  { code: '21', name: 'Odisha' },
  { code: '10', name: 'Bihar' },
  { code: '30', name: 'Goa' },
  { code: '05', name: 'Uttarakhand' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '20', name: 'Jharkhand' },
  { code: '18', name: 'Assam' }
];

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onSaveCompany,
  companyToEdit
}) => {
  const isEditing = Boolean(companyToEdit);

  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [stateCode, setStateCode] = useState('24');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Goods once sold will not be taken back or exchanged.\n2. Interest @18% p.a. will be charged if bill is not paid within due date.\n3. Subject to jurisdiction of local courts only.'
  );
  const [invoicePrefix, setInvoicePrefix] = useState('INV/2026/');
  const [invoiceNextNumber, setInvoiceNextNumber] = useState(1);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize on open or edit
  useEffect(() => {
    if (companyToEdit) {
      setCompanyName(companyToEdit.companyName || companyToEdit.name || '');
      setTagline(companyToEdit.tagline || '');
      setLogo(companyToEdit.logo || '');
      setAddress(companyToEdit.address || '');
      setCity(companyToEdit.city || '');
      setState(companyToEdit.state || 'Gujarat');
      setStateCode(companyToEdit.stateCode || '24');
      setPinCode(companyToEdit.pinCode || companyToEdit.pincode || '');
      setPhone(companyToEdit.phone || companyToEdit.mobile || '');
      setAlternatePhone(companyToEdit.alternatePhone || '');
      setEmail(companyToEdit.email || '');
      setWebsite(companyToEdit.website || '');
      setGstin(companyToEdit.gstin || '');
      setPan(companyToEdit.pan || '');
      setBankName(companyToEdit.bankName || '');
      setAccountName(companyToEdit.accountName || companyToEdit.companyName || '');
      setAccountNumber(companyToEdit.accountNumber || '');
      setIfscCode(companyToEdit.ifscCode || '');
      setBranch(companyToEdit.branch || '');
      setUpiId(companyToEdit.upiId || '');
      setTermsAndConditions(companyToEdit.termsAndConditions || '');
      setInvoicePrefix(companyToEdit.invoicePrefix || 'INV/2026/');
      setInvoiceNextNumber(companyToEdit.invoiceNextNumber || 1);
    } else {
      // Reset form
      setCompanyName('');
      setTagline('Fire Protection, Extinguishers, Hydrant & Safety Solutions');
      setLogo('');
      setAddress('');
      setCity('Ahmedabad');
      setState('Gujarat');
      setStateCode('24');
      setPinCode('');
      setPhone('');
      setAlternatePhone('');
      setEmail('');
      setWebsite('');
      setGstin('');
      setPan('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setIfscCode('');
      setBranch('');
      setUpiId('');
      setTermsAndConditions(
        '1. Goods once sold will not be taken back or exchanged.\n2. Interest @18% p.a. will be charged if bill is not paid within due date.\n3. Subject to jurisdiction of local courts only.'
      );
      setInvoicePrefix('INV/2026/');
      setInvoiceNextNumber(1);
    }
    setErrors({});
  }, [companyToEdit, isOpen]);

  // Handle GSTIN change with auto state & PAN extraction
  const handleGstinChange = (val: string) => {
    const upper = val.toUpperCase().trim();
    setGstin(upper);

    if (upper.length >= 2) {
      const code = upper.substring(0, 2);
      const matchedState = INDIAN_STATES.find(s => s.code === code);
      if (matchedState) {
        setStateCode(code);
        setState(matchedState.name);
      }
    }

    if (upper.length >= 12) {
      const extractedPan = upper.substring(2, 12);
      setPan(extractedPan);
    }
  };

  // Handle State dropdown change
  const handleStateChange = (stName: string) => {
    setState(stName);
    const matched = INDIAN_STATES.find(s => s.name === stName);
    if (matched) {
      setStateCode(matched.code);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is mandatory';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Primary phone/mobile number is mandatory';
    }

    if (!address.trim()) {
      newErrors.address = 'Company billing address is mandatory';
    }

    if (!city.trim()) {
      newErrors.city = 'City is mandatory';
    }

    if (gstin && gstin.length !== 15) {
      newErrors.gstin = 'Indian GSTIN must be exactly 15 alphanumeric characters';
    }

    if (pan && pan.length !== 10) {
      newErrors.pan = 'Indian PAN must be exactly 10 alphanumeric characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSaving(true);
      const id = companyToEdit?.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const newCompany: CompanySettings = {
        id,
        companyName: companyName.trim(),
        name: companyName.trim(),
        tagline: tagline.trim(),
        logo: logo || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        stateCode: stateCode.trim(),
        pinCode: pinCode.trim(),
        pincode: pinCode.trim(),
        phone: phone.trim(),
        mobile: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        email: email.trim(),
        website: website.trim() || undefined,
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        bankName: bankName.trim(),
        accountName: accountName.trim() || companyName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        branch: branch.trim(),
        upiId: upiId.trim(),
        termsAndConditions: termsAndConditions.trim(),
        allowNegativeStock: companyToEdit?.allowNegativeStock ?? true,
        invoicePrefix: invoicePrefix.trim() || 'INV/2026/',
        invoiceNextNumber: Number(invoiceNextNumber) || 1,
        invoicePadding: companyToEdit?.invoicePadding || 4,
        invoiceSeparator: companyToEdit?.invoiceSeparator || '/',
        autoIncrementInvoiceNo: companyToEdit?.autoIncrementInvoiceNo ?? true,
        quotationPrefix: companyToEdit?.quotationPrefix || 'QTN/2026/',
        quotationNextNumber: companyToEdit?.quotationNextNumber || 1,
        quotationPadding: companyToEdit?.quotationPadding || 4,
        quotationSeparator: companyToEdit?.quotationSeparator || '/',
        autoIncrementQuotationNo: companyToEdit?.autoIncrementQuotationNo ?? true,
        receiptPrefix: companyToEdit?.receiptPrefix || 'RCPT/2026/',
        receiptNextNumber: companyToEdit?.receiptNextNumber || 1,
        receiptPadding: companyToEdit?.receiptPadding || 4,
        receiptSeparator: companyToEdit?.receiptSeparator || '/',
        autoIncrementReceiptNo: companyToEdit?.autoIncrementReceiptNo ?? true,
        updatedAt: now
      };

      await onSaveCompany(newCompany);
      onClose();
    } catch (err: any) {
      alert('Failed to save company account: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-700 to-red-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">
                {isEditing ? 'Edit Company Account' : 'Add New Company Account'}
              </h2>
              <p className="text-red-100 text-[11px]">
                {isEditing
                  ? 'Update business details, tax IDs, and banking information'
                  : 'Register a separate business profile or sister firm for billing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-red-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Business Identity & Logo */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>Business Identity & Branding</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Legal Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors(prev => ({ ...prev, companyName: '' }));
                  }}
                  placeholder="e.g. PATEL FIRE SAFETY & SECURITY PVT LTD"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden focus:ring-2 ${
                    errors.companyName ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400' : 'border-slate-200 focus:ring-red-500'
                  }`}
                />
                {errors.companyName && <p className="text-rose-600 text-[11px] mt-1">{errors.companyName}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Business Nature</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Complete Fire Protection, Hydrant & Extinguisher AMC Solutions"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Logo Upload Box */}
              <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0">
                      <img src={logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-800 block">Company Logo</span>
                    <span className="text-[11px] text-slate-500">Displays on Invoices, Quotations & Receipts</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-red-600" />
                    <span>{logo ? 'Change' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo('')}
                      className="px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tax Registration & Legal */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Tax Registration & GST</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={e => handleGstinChange(e.target.value)}
                  placeholder="e.g. 24AAAPL1234C1Z5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
                {errors.gstin && <p className="text-rose-600 text-[11px] mt-1">{errors.gstin}</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">Auto-fills State Code and PAN</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  PAN Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  placeholder="e.g. AAAPL1234C"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
                {errors.pan && <p className="text-rose-600 text-[11px] mt-1">{errors.pan}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Contact Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <Phone className="w-4 h-4 text-red-600" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Mobile / Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden focus:ring-2 ${
                    errors.phone ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400' : 'border-slate-200 focus:ring-red-500'
                  }`}
                />
                {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alternate Phone / Landline</label>
                <input
                  type="text"
                  value={alternatePhone}
                  onChange={e => setAlternatePhone(e.target.value)}
                  placeholder="+91 79 2589 1122"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="www.company.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Premises & Billing Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Street / Area Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                  }}
                  placeholder="Plot No. 42-44, Phase II, GIDC Industrial Estate..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden focus:ring-2 ${
                    errors.address ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400' : 'border-slate-200 focus:ring-red-500'
                  }`}
                />
                {errors.address && <p className="text-rose-600 text-[11px] mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => {
                    setCity(e.target.value);
                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                  }}
                  placeholder="Ahmedabad"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden focus:ring-2 ${
                    errors.city ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400' : 'border-slate-200 focus:ring-red-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  placeholder="382445"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State Code</label>
                <input
                  type="text"
                  value={stateCode}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Bank & UPI QR */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <CreditCard className="w-4 h-4 text-red-600" />
              <span>Bank Account & Payment QR</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. PATEL FIRE SAFETY"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="e.g. 50200012345678"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="e.g. Vatva GIDC Branch"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UPI ID (For Dynamic Bill QR)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. firecare@okaxis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Invoice Numbering */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <Hash className="w-4 h-4 text-red-600" />
              <span>Invoice Prefix & Sequencing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={e => setInvoicePrefix(e.target.value)}
                  placeholder="e.g. INV/2026/ or PFS/2026/"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Starting Sequence Number</label>
                <input
                  type="number"
                  min={1}
                  value={invoiceNextNumber}
                  onChange={e => setInvoiceNextNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Company'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
