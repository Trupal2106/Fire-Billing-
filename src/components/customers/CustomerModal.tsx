import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Hash, AlertCircle, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { Customer } from '../../types';
import { INDIAN_STATES } from '../../utils/gstCalculations';
import { lookupGstDetails, isValidGSTIN, GstDetails } from '../../utils/gstLookup';
import { db } from '../../db/db';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (customerData: any) => Promise<any>;
  onSaveCustomer?: (customerData: any) => Promise<any>;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveCustomer,
  customerToEdit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    gstin: '',
    pan: '',
    billingAddress: '',
    shippingAddress: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    pin: '380001',
    notes: '',
    openingBalance: 0
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingGst, setIsVerifyingGst] = useState(false);
  const [gstVerifiedInfo, setGstVerifiedInfo] = useState<GstDetails | null>(null);
  const [gstVerifyMessage, setGstVerifyMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        companyName: customerToEdit.companyName || '',
        contactPerson: customerToEdit.contactPerson || '',
        mobile: customerToEdit.mobile || '',
        alternateMobile: customerToEdit.alternateMobile || '',
        email: customerToEdit.email || '',
        gstin: customerToEdit.gstin || '',
        pan: customerToEdit.pan || '',
        billingAddress: customerToEdit.billingAddress || '',
        shippingAddress: customerToEdit.shippingAddress || '',
        city: customerToEdit.city || 'Ahmedabad',
        state: customerToEdit.state || 'Gujarat',
        stateCode: customerToEdit.stateCode || '24',
        pin: customerToEdit.pin || '',
        notes: customerToEdit.notes || '',
        openingBalance: customerToEdit.openingBalance || 0
      });
      setSameAsBilling(
        !customerToEdit.shippingAddress ||
        customerToEdit.shippingAddress === customerToEdit.billingAddress
      );
    } else {
      setFormData({
        name: '',
        companyName: '',
        contactPerson: '',
        mobile: '',
        alternateMobile: '',
        email: '',
        gstin: '',
        pan: '',
        billingAddress: '',
        shippingAddress: '',
        city: 'Ahmedabad',
        state: 'Gujarat',
        stateCode: '24',
        pin: '380001',
        notes: '',
        openingBalance: 0
      });
      setSameAsBilling(true);
    }
    setFormError('');
    setFieldErrors({});
    setTouched({});
  }, [customerToEdit, isOpen]);

  // Field validator
  const validate = (name: string, value: any, currentFormData = formData): string => {
    switch (name) {
      case 'name':
        if (!value || !value.toString().trim()) {
          return 'Customer / Business Name is required';
        }
        if (value.toString().trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        return '';

      case 'mobile':
        if (!value || !value.toString().trim()) {
          return 'Primary Mobile Number is required';
        }
        const cleanedMobile = value.toString().replace(/[^0-9]/g, '');
        if (cleanedMobile.length < 10) {
          return 'Please enter a valid 10-digit mobile number';
        }
        return '';

      case 'billingAddress':
        if (!value || !value.toString().trim()) {
          return 'Billing Address / Plant Location is required';
        }
        return '';

      case 'state':
        if (!value || !value.toString().trim()) {
          return 'State / Place of Supply is required';
        }
        return '';

      case 'email':
        if (value && value.toString().trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.toString().trim())) {
            return 'Please enter a valid email address';
          }
        }
        return '';

      case 'gstin':
        if (value && value.toString().trim()) {
          const cleanGst = value.toString().trim().toUpperCase();
          if (cleanGst.length !== 15) {
            return 'GSTIN must be exactly 15 characters (leave empty if unregistered/URP)';
          }
        }
        return '';

      case 'pan':
        if (value && value.toString().trim()) {
          const cleanPan = value.toString().trim().toUpperCase();
          if (cleanPan.length !== 10) {
            return 'PAN must be 10 characters (e.g. ABCDE1234F)';
          }
        }
        return '';

      case 'pin':
        if (value && value.toString().trim()) {
          const cleanPin = value.toString().replace(/[^0-9]/g, '');
          if (cleanPin.length !== 6) {
            return 'PIN code must be 6 digits';
          }
        }
        return '';

      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // If already touched, validate immediately
    if (touched[field]) {
      const err = validate(field, value, updated);
      setFieldErrors(prev => ({
        ...prev,
        [field]: err
      }));
    }

    if (formError) {
      setFormError('');
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validate(field, (formData as any)[field], formData);
    setFieldErrors(prev => ({
      ...prev,
      [field]: err
    }));
  };

  // If GSTIN entered, extract PAN and state code
  const handleGstinChange = (gstinVal: string) => {
    const cleanGstin = gstinVal.toUpperCase().trim();
    let panExtracted = formData.pan;
    let stateExtracted = formData.state;
    let stateCodeExtracted = formData.stateCode;

    if (cleanGstin.length >= 2) {
      const code = cleanGstin.substring(0, 2);
      const matchedState = INDIAN_STATES.find(s => s.code === code);
      if (matchedState) {
        stateExtracted = matchedState.name;
        stateCodeExtracted = matchedState.code;
      }
    }

    if (cleanGstin.length >= 12) {
      panExtracted = cleanGstin.substring(2, 12);
    }

    const updated = {
      ...formData,
      gstin: cleanGstin,
      pan: panExtracted,
      state: stateExtracted,
      stateCode: stateCodeExtracted
    };

    setFormData(updated);

    if (touched.gstin) {
      const err = validate('gstin', cleanGstin, updated);
      setFieldErrors(prev => ({ ...prev, gstin: err }));
    }

    // If complete 15-char GSTIN is entered, auto trigger verification
    if (cleanGstin.length === 15) {
      triggerGstLookup(cleanGstin);
    }
  };

  // Real-time GSTIN Lookup & Auto-fill Details
  const triggerGstLookup = async (gstinToLookup?: string) => {
    const targetGstin = (gstinToLookup || formData.gstin).toUpperCase().trim();
    if (!targetGstin || targetGstin.length < 10) {
      setGstVerifyMessage('Please enter a valid GSTIN to fetch details');
      return;
    }

    try {
      setIsVerifyingGst(true);
      setGstVerifyMessage('');
      const details = await lookupGstDetails(targetGstin);
      setGstVerifiedInfo(details);

      setFormData(prev => {
        const newBillingAddr = prev.billingAddress.trim() ? prev.billingAddress : details.address;
        return {
          ...prev,
          gstin: details.gstin,
          pan: details.pan,
          name: prev.name.trim() ? prev.name : (details.tradeName || details.legalName),
          companyName: details.legalName,
          state: details.state,
          stateCode: details.stateCode,
          billingAddress: newBillingAddr,
          city: prev.city || details.city,
          pin: prev.pin || details.pin,
          shippingAddress: sameAsBilling ? newBillingAddr : prev.shippingAddress
        };
      });

      // Clear errors on auto-populated fields
      setFieldErrors(prev => ({
        ...prev,
        gstin: '',
        pan: '',
        name: '',
        billingAddress: ''
      }));

      setGstVerifyMessage(`✓ Verified: ${details.tradeName || details.legalName} (${details.status})`);
    } catch (err: any) {
      setGstVerifyMessage(err.message || 'Could not verify GSTIN');
    } finally {
      setIsVerifyingGst(false);
    }
  };

  const handleStateChange = (stateName: string) => {
    const matched = INDIAN_STATES.find(s => s.name === stateName);
    const updated = {
      ...formData,
      state: stateName,
      stateCode: matched ? matched.code : '24'
    };
    setFormData(updated);

    if (touched.state) {
      const err = validate('state', stateName, updated);
      setFieldErrors(prev => ({ ...prev, state: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark mandatory and critical fields as touched
    const fieldsToValidate = ['name', 'mobile', 'billingAddress', 'state', 'email', 'gstin', 'pan', 'pin'];
    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};

    fieldsToValidate.forEach(f => {
      newTouched[f] = true;
      const err = validate(f, (formData as any)[f], formData);
      if (err) {
        newErrors[f] = err;
      }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorList = Object.values(newErrors);
      setFormError(`Please correct the required fields: ${errorList[0]}`);
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');

      const preparedData = {
        ...formData,
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        mobile: formData.mobile.trim(),
        billingAddress: formData.billingAddress.trim(),
        shippingAddress: (sameAsBilling ? formData.billingAddress : formData.shippingAddress).trim(),
        openingBalance: Number(formData.openingBalance) || 0
      };

      // Safely check save handlers
      let savedCust: Customer | null = null;
      const saveFunction = typeof onSaveCustomer === 'function' 
        ? onSaveCustomer 
        : (typeof onSave === 'function' ? onSave : null);

      if (saveFunction) {
        savedCust = await saveFunction(preparedData);
      } else {
        // Resilient fallback: persist directly to IndexedDB
        const now = new Date().toISOString();
        if (customerToEdit) {
          savedCust = {
            ...customerToEdit,
            ...preparedData,
            updatedAt: now
          };
          await db.customers.put(savedCust);
        } else {
          savedCust = {
            id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            ...preparedData,
            totalSales: 0,
            totalPaid: 0,
            currentOutstanding: preparedData.openingBalance || 0,
            createdAt: now,
            updatedAt: now
          };
          await db.customers.add(savedCust);
        }
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to save customer:', err);
      // Give a clear, user-friendly message rather than cryptic JS errors
      const readableError = err?.message && !err.message.includes('is not a function')
        ? err.message
        : 'Could not complete saving. Please verify all details and try again.';
      setFormError(readableError);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {customerToEdit ? 'Edit Customer / Party' : 'Add New Customer / Party'}
              </h3>
              <p className="text-xs text-slate-500">Fire safety client, society, factory, or corporate account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </div>
          )}

          {/* Primary Name & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Customer / Business Name <span className="text-red-500 font-bold">*</span>
                </label>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Apex Hospital, Shree Ram Chem, or Trupal Patel"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-3 py-2 text-xs rounded-lg border transition-all ${
                  fieldErrors.name && touched.name
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                }`}
              />
              {fieldErrors.name && touched.name && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dhruval / Safety Officer / Manager"
                value={formData.contactPerson}
                onChange={e => handleFieldChange('contactPerson', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Primary Mobile <span className="text-red-500 font-bold">*</span>
                </label>
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="98250 12345"
                  value={formData.mobile}
                  onChange={e => handleFieldChange('mobile', e.target.value)}
                  onBlur={() => handleBlur('mobile')}
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border font-mono transition-all ${
                    fieldErrors.mobile && touched.mobile
                      ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  }`}
                />
              </div>
              {fieldErrors.mobile && touched.mobile && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.mobile}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                placeholder="Landline or second mobile"
                value={formData.alternateMobile}
                onChange={e => handleFieldChange('alternateMobile', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  placeholder="safety@company.com"
                  value={formData.email}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border transition-all ${
                    fieldErrors.email && touched.email
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-300 focus:border-red-500'
                  }`}
                />
              </div>
              {fieldErrors.email && touched.email && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* GSTIN & PAN & State with Auto-find */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    GSTIN (Tax ID)
                  </label>
                  {formData.gstin && formData.gstin.length >= 8 && (
                    <button
                      type="button"
                      onClick={() => triggerGstLookup()}
                      disabled={isVerifyingGst}
                      className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingGst ? 'Searching...' : 'Find Details'}
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="24AAACC1234F1Z1 (Blank = URP)"
                    value={formData.gstin}
                    onChange={e => handleGstinChange(e.target.value)}
                    onBlur={() => handleBlur('gstin')}
                    maxLength={15}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border bg-white ${
                      fieldErrors.gstin && touched.gstin ? 'border-amber-500' : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => triggerGstLookup()}
                    disabled={isVerifyingGst || !formData.gstin}
                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Find GST Details and auto-fill address and PAN"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Find</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">Auto-identifies State, PAN & fills Address</span>
                {fieldErrors.gstin && touched.gstin && (
                  <p className="text-[11px] text-amber-600 mt-0.5">{fieldErrors.gstin}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  placeholder="AAACC1234F"
                  value={formData.pan}
                  onChange={e => handleFieldChange('pan', e.target.value.toUpperCase())}
                  onBlur={() => handleBlur('pan')}
                  maxLength={10}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border bg-white ${
                    fieldErrors.pan && touched.pan ? 'border-amber-500' : 'border-slate-300 focus:border-red-500'
                  }`}
                />
                <span className="text-[10px] text-slate-400">Auto-extracted from GSTIN</span>
                {fieldErrors.pan && touched.pan && (
                  <p className="text-[11px] text-amber-600 mt-0.5">{fieldErrors.pan}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State / Place of Supply <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500 bg-white"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st.code} value={st.name}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">State Code: {formData.stateCode}</span>
              </div>
            </div>

            {/* GST Verification Status Notification */}
            {gstVerifyMessage && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                gstVerifyMessage.startsWith('✓') 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {gstVerifyMessage.startsWith('✓') ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">{gstVerifyMessage}</span>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Billing Address / Plant Location <span className="text-red-500 font-bold">*</span>
                </label>
              </div>
              <textarea
                rows={2}
                required
                placeholder="Plot / Shed No, Industrial Estate, Road, Landmark..."
                value={formData.billingAddress}
                onChange={e => handleFieldChange('billingAddress', e.target.value)}
                onBlur={() => handleBlur('billingAddress')}
                className={`w-full px-3 py-2 text-xs rounded-lg border transition-all ${
                  fieldErrors.billingAddress && touched.billingAddress
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                }`}
              />
              {fieldErrors.billingAddress && touched.billingAddress && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.billingAddress}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Ahmedabad"
                  value={formData.city}
                  onChange={e => handleFieldChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  placeholder="380013"
                  maxLength={6}
                  value={formData.pin}
                  onChange={e => handleFieldChange('pin', e.target.value)}
                  onBlur={() => handleBlur('pin')}
                  className={`w-full px-3 py-2 text-xs rounded-lg border font-mono ${
                    fieldErrors.pin && touched.pin ? 'border-red-500' : 'border-slate-300 focus:border-red-500'
                  }`}
                />
                {fieldErrors.pin && touched.pin && (
                  <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.pin}</p>
                )}
              </div>
            </div>

            {/* Shipping Address toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={e => setSameAsBilling(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">Site / Shipping Address is same as Billing Address</span>
              </label>

              {!sameAsBilling && (
                <div className="mt-2 animate-in fade-in duration-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shipping / Site Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Physical site address for installation / extinguishers delivery..."
                    value={formData.shippingAddress}
                    onChange={e => handleFieldChange('shippingAddress', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes & Opening Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.openingBalance || ''}
                onChange={e => handleFieldChange('openingBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500"
              />
              <span className="text-[10px] text-slate-400">Previous outstanding balance before using system</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
              <input
                type="text"
                placeholder="e.g. Preferred delivery time, gate pass required"
                value={formData.notes}
                onChange={e => handleFieldChange('notes', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-red-500"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{customerToEdit ? 'Update Customer' : 'Save Customer'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
