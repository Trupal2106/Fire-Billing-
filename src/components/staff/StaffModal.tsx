import React, { useState, useEffect } from 'react';
import { X, UserCheck, Phone, Mail, CreditCard, Building, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { StaffMember } from '../../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: StaffMember | null;
  onSaveStaff: (staff: StaffMember) => Promise<void>;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffToEdit,
  onSaveStaff
}) => {
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    designation: 'Fire Safety Technician',
    department: 'Technical AMC',
    phone: '',
    email: '',
    pan: '',
    uan: '',
    esiIpNumber: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 15000,
    da: 2000,
    hra: 3000,
    allowances: 1000,
    pfApplicable: true,
    esiApplicable: true,
    ptApplicable: true,
    gstApplicable: true,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    status: 'Active'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staffToEdit) {
      setFormData(staffToEdit);
    } else {
      setFormData({
        name: '',
        designation: 'Fire Safety Technician',
        department: 'Technical AMC',
        phone: '',
        email: '',
        pan: '',
        uan: '',
        esiIpNumber: '',
        joiningDate: new Date().toISOString().split('T')[0],
        basicSalary: 15000,
        da: 2000,
        hra: 3000,
        allowances: 1000,
        pfApplicable: true,
        esiApplicable: true,
        ptApplicable: true,
        gstApplicable: true,
        bankName: '',
        accountNumber: '',
        ifsc: '',
        status: 'Active'
      });
    }
    setError('');
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const totalMonthlyGross = (Number(formData.basicSalary) || 0) +
    (Number(formData.da) || 0) +
    (Number(formData.hra) || 0) +
    (Number(formData.allowances) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Staff member name is mandatory');
      return;
    }
    if (!formData.phone?.trim()) {
      setError('Phone number is mandatory');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const now = new Date().toISOString();
      const staffRecord: StaffMember = {
        id: formData.id || `stf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: formData.name.trim(),
        designation: formData.designation || 'Staff',
        department: formData.department || 'Operations',
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        pan: formData.pan?.trim().toUpperCase() || undefined,
        uan: formData.uan?.trim() || undefined,
        esiIpNumber: formData.esiIpNumber?.trim() || undefined,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        basicSalary: Number(formData.basicSalary) || 0,
        da: Number(formData.da) || 0,
        hra: Number(formData.hra) || 0,
        allowances: Number(formData.allowances) || 0,
        pfApplicable: formData.pfApplicable ?? true,
        esiApplicable: formData.esiApplicable ?? true,
        ptApplicable: formData.ptApplicable ?? true,
        gstApplicable: formData.gstApplicable ?? false,
        bankName: formData.bankName?.trim() || undefined,
        accountNumber: formData.accountNumber?.trim() || undefined,
        ifsc: formData.ifsc?.trim().toUpperCase() || undefined,
        status: (formData.status as 'Active' | 'Inactive') || 'Active',
        createdAt: formData.createdAt || now,
        updatedAt: now
      };

      await onSaveStaff(staffRecord);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save staff');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {staffToEdit ? `Edit Staff Member - ${staffToEdit.name}` : 'Add New Staff Member'}
              </h3>
              <p className="text-[11px] text-slate-500">Define salary structure, PF, ESI, and statutory details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Personal & Job Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel"
                value={formData.name || ''}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status || 'Active'}
                onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
              >
                <option value="Active">Active Employee</option>
                <option value="Inactive">Inactive / Left</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="Fire Technician"
                value={formData.designation || ''}
                onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department || 'Technical AMC'}
                onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden bg-white"
              >
                <option value="Technical AMC">Technical AMC</option>
                <option value="Field Operations">Field Operations</option>
                <option value="Workshop & Refilling">Workshop & Refilling</option>
                <option value="Installation & Hydrant">Installation & Hydrant</option>
                <option value="Administration & Sales">Administration & Sales</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate || ''}
                onChange={e => setFormData(p => ({ ...p, joiningDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                placeholder="98250 12345"
                value={formData.phone || ''}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="staff@company.com"
                value={formData.email || ''}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Statutory Identifiers */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-2">Indian Statutory Identifiers</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={formData.pan || ''}
                  onChange={e => setFormData(p => ({ ...p, pan: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">EPFO UAN (Universal Acc No)</label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="100123456789"
                  value={formData.uan || ''}
                  onChange={e => setFormData(p => ({ ...p, uan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ESIC IP Number</label>
                <input
                  type="text"
                  maxLength={17}
                  placeholder="2412345678"
                  value={formData.esiIpNumber || ''}
                  onChange={e => setFormData(p => ({ ...p, esiIpNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Salary Structure (Indian Rules) */}
          <div className="p-4 bg-red-50/40 rounded-xl border border-red-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Monthly Salary Components (INR)</span>
              <span className="font-extrabold text-red-700 text-sm">
                Gross: ₹ {totalMonthlyGross.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Basic Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.basicSalary ?? 0}
                  onChange={e => setFormData(p => ({ ...p, basicSalary: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">DA (Dearness) (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.da ?? 0}
                  onChange={e => setFormData(p => ({ ...p, da: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HRA (Rent) (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.hra ?? 0}
                  onChange={e => setFormData(p => ({ ...p, hra: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Other Allowances (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.allowances ?? 0}
                  onChange={e => setFormData(p => ({ ...p, allowances: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>
            </div>

            {/* Applicable statutory rules */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-red-200/60">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.pfApplicable ?? true}
                  onChange={e => setFormData(p => ({ ...p, pfApplicable: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Deduct PF (12%)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.esiApplicable ?? true}
                  onChange={e => setFormData(p => ({ ...p, esiApplicable: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Deduct ESI (0.75%)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ptApplicable ?? true}
                  onChange={e => setFormData(p => ({ ...p, ptApplicable: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Deduct PT (₹200)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.gstApplicable ?? false}
                  onChange={e => setFormData(p => ({ ...p, gstApplicable: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-semibold text-purple-700">Client Manpower GST (18%)</span>
              </label>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-2">Salary Bank Account Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={formData.bankName || ''}
                  onChange={e => setFormData(p => ({ ...p, bankName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  placeholder="30192837465"
                  value={formData.accountNumber || ''}
                  onChange={e => setFormData(p => ({ ...p, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  placeholder="SBIN0001234"
                  value={formData.ifsc || ''}
                  onChange={e => setFormData(p => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : (staffToEdit ? 'Update Staff Member' : 'Save Staff Member')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
