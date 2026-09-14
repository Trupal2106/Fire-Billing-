import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  DollarSign,
  User,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { AmcContract, Customer, AmcServiceSchedule, AmcFrequency } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AMCModalProps {
  isOpen: boolean;
  customers: Customer[];
  contractToEdit?: AmcContract | null;
  onClose: () => void;
  onSaveContract: (contractData: Omit<AmcContract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const AMCModal: React.FC<AMCModalProps> = ({
  isOpen,
  customers,
  contractToEdit,
  onClose,
  onSaveContract
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const oneYearLaterStr = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  const defaultContractNo = useMemo(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `PFS/AMC/${year}/${rand}`;
  }, []);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    contractToEdit?.customerId || (customers?.[0]?.id || '')
  );
  const [contractNo, setContractNo] = useState(contractToEdit?.contractNo || defaultContractNo);
  const [title, setTitle] = useState(contractToEdit?.title || 'Comprehensive Fire Hydrant, Extinguisher & Sprinkler AMC');
  const [siteAddress, setSiteAddress] = useState(contractToEdit?.siteAddress || '');
  const [startDate, setStartDate] = useState(contractToEdit?.startDate || todayStr);
  const [endDate, setEndDate] = useState(contractToEdit?.endDate || oneYearLaterStr);
  const [contractAmount, setContractAmount] = useState<number>(contractToEdit?.contractAmount || 25000);
  const [gstRate, setGstRate] = useState<number>(contractToEdit?.gstRate || 18);
  const [paymentSchedule, setPaymentSchedule] = useState(contractToEdit?.paymentSchedule || '50% Advance, 50% Mid-term');
  const [serviceFrequency, setServiceFrequency] = useState<AmcFrequency>(contractToEdit?.serviceFrequency || 'Quarterly');
  const [notes, setNotes] = useState(contractToEdit?.notes || 'Comprehensive quarterly fire-safety maintenance and mock drill');

  const [schedules, setSchedules] = useState<AmcServiceSchedule[]>(
    contractToEdit?.schedules || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (selectedCustomer && !siteAddress) {
      setSiteAddress(`${selectedCustomer.billingAddress || ''}, ${selectedCustomer.city}`);
    }
  }, [selectedCustomer]);

  // Auto-generate quarterly/monthly visits if not present
  useEffect(() => {
    if (!contractToEdit && schedules.length === 0 && startDate) {
      const start = new Date(startDate);
      const visits = serviceFrequency === 'Monthly' ? 12 : serviceFrequency === 'Quarterly' ? 4 : serviceFrequency === 'Half-yearly' ? 2 : 1;
      const intervalDays = Math.floor(365 / visits);
      const generated: AmcServiceSchedule[] = [];

      for (let i = 1; i <= visits; i++) {
        const visitDate = new Date(start.getTime() + i * intervalDays * 86400000);
        generated.push({
          id: `sch_${Date.now()}_${i}`,
          periodName: `Quarter ${i} (${serviceFrequency} Visit #${i})`,
          scheduledDate: visitDate.toISOString().slice(0, 10),
          status: 'Pending',
          notes: `Routine inspection #${i}`
        });
      }
      setSchedules(generated);
    }
  }, [startDate, serviceFrequency, contractToEdit]);

  const handleVisitStatusChange = (index: number, status: 'Pending' | 'Completed' | 'Overdue') => {
    setSchedules(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status,
        completedDate: status === 'Completed' ? todayStr : undefined
      };
      return updated;
    });
  };

  const gstAmount = useMemo(() => {
    return (contractAmount * (gstRate || 0)) / 100;
  }, [contractAmount, gstRate]);

  const totalAmount = contractAmount + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a client/customer');
      return;
    }
    if (!contractNo.trim()) {
      setError('Contract Number is required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const now = new Date().toISOString().slice(0, 10);
      const status = endDate < now ? 'Expired' : 'Active';

      await onSaveContract({
        contractNo: contractNo.trim(),
        title: title.trim(),
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'Client',
        customerMobile: selectedCustomer?.mobile,
        siteAddress: siteAddress.trim(),
        startDate,
        endDate,
        contractAmount: Number(contractAmount),
        gstRate: Number(gstRate),
        gstAmount,
        totalAmount,
        paymentSchedule: paymentSchedule.trim(),
        serviceFrequency,
        schedules,
        status,
        notes: notes.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save AMC contract');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {contractToEdit ? 'Edit AMC / Maintenance Agreement' : 'Create Fire Safety AMC Contract'}
              </h3>
              <p className="text-xs text-slate-500">Annual maintenance agreement with scheduled site visits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client / Facility <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:border-amber-500 bg-white"
              >
                <option value="">Select client...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AMC Contract # <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contractNo}
                onChange={e => setContractNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-amber-700 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Title / Scope</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Premises / Site Address</label>
            <input
              type="text"
              value={siteAddress}
              onChange={e => setSiteAddress(e.target.value)}
              placeholder="e.g. Plot No 45, GIDC Industrial Estate, Metoda, Rajkot"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Dates & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End / Expiry Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Frequency</label>
              <select
                value={serviceFrequency}
                onChange={e => setServiceFrequency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Quarterly">Quarterly (4 visits)</option>
                <option value="Monthly">Monthly (12 visits)</option>
                <option value="Half-yearly">Half-Yearly (2 visits)</option>
                <option value="Yearly">Yearly (1 visit)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Contract Amount (Excl GST)</label>
              <input
                type="number"
                step="any"
                required
                value={contractAmount || ''}
                onChange={e => setContractAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 rounded border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">GST Rate (%)</label>
              <select
                value={gstRate}
                onChange={e => setGstRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
              >
                <option value={18}>18% GST (Standard)</option>
                <option value={12}>12% GST</option>
                <option value={5}>5% GST</option>
                <option value={0}>0% (Exempt)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Total Amount (Incl GST)</label>
              <div className="px-3 py-1.5 text-sm font-bold text-amber-900 bg-amber-100 rounded border border-amber-300">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          {/* Scheduled Visits Tracker */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Scheduled Maintenance Visits ({schedules.length})</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Period / Visit</th>
                    <th className="p-2.5">Target Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {schedules.map((v, idx) => (
                    <tr key={v.id || idx}>
                      <td className="p-2.5 font-bold text-slate-600">{v.periodName}</td>
                      <td className="p-2.5">
                        <input
                          type="date"
                          value={v.scheduledDate}
                          onChange={e => {
                            const val = e.target.value;
                            setSchedules(prev => {
                              const u = [...prev];
                              u[idx].scheduledDate = val;
                              return u;
                            });
                          }}
                          className="px-2 py-1 text-xs rounded border border-slate-200"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={v.status}
                          onChange={e => handleVisitStatusChange(idx, e.target.value as any)}
                          className="px-2 py-1 text-xs rounded border border-slate-200 font-medium"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={v.notes || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setSchedules(prev => {
                              const u = [...prev];
                              u[idx].notes = val;
                              return u;
                            });
                          }}
                          placeholder="Notes"
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save AMC Contract'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
