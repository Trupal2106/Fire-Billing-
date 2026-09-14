import React, { useState, useMemo } from 'react';
import {
  X,
  Wrench,
  User,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { ServiceReport, Customer, ServiceMaterialUsed } from '../../types';

interface ServiceReportModalProps {
  isOpen: boolean;
  customers: Customer[];
  onClose: () => void;
  onSaveReport: (reportData: Omit<ServiceReport, 'id' | 'createdAt'>) => Promise<void>;
}

export const ServiceReportModal: React.FC<ServiceReportModalProps> = ({
  isOpen,
  customers,
  onClose,
  onSaveReport
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const defaultReportNo = useMemo(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `PFS/SR/${year}/${rand}`;
  }, []);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers?.[0]?.id || ''
  );
  const [reportNo, setReportNo] = useState(defaultReportNo);
  const [date, setDate] = useState(todayStr);
  const [siteAddress, setSiteAddress] = useState('');
  const [technicianName, setTechnicianName] = useState('Hardik Patel (Lead Fire Engineer)');
  const [technicianPhone, setTechnicianPhone] = useState('9876543210');
  const [equipmentType, setEquipmentType] = useState('Fire Extinguishers & Alarm Panel');
  const [equipmentSerialNo, setEquipmentSerialNo] = useState('');
  const [inspectionDetails, setInspectionDetails] = useState('Quarterly routine inspection of portable fire extinguishers, pressure gauge verification, nozzle inspection, safety pin & tamper seal check.');
  const [findings, setFindings] = useState('All units pressure gauge in normal operating green zone. Extinguisher bodies free of dent or corrosion.');
  const [defects, setDefects] = useState('Two discharge hoses found stiff and aged due to atmospheric exposure.');
  const [recommendedAction, setRecommendedAction] = useState('Replaced aged hoses. Re-pressurized nitrogen in 1 unit. Affixed updated inspection service tags valid for 12 months.');
  const [materialsUsed, setMaterialsUsed] = useState<ServiceMaterialUsed[]>([
    { item: 'ABC 6kg Discharge Hose & Horn', qty: 2, rate: 180, amount: 360 },
    { item: 'Inspection Warranty Stickers (IS 2190)', qty: 12, rate: 15, amount: 180 }
  ]);
  const [labourCharge, setLabourCharge] = useState(1500);
  const [customerRemarks, setCustomerRemarks] = useState('Job completed satisfactorily.');
  const [technicianSignatureName, setTechnicianSignatureName] = useState('Hardik Patel');
  const [customerSignatureName, setCustomerSignatureName] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const materialsTotal = useMemo(() => {
    return materialsUsed.reduce((sum, m) => sum + m.amount, 0);
  }, [materialsUsed]);

  const totalBillable = materialsTotal + (labourCharge || 0);

  const handleAddMaterial = () => {
    setMaterialsUsed(prev => [
      ...prev,
      { item: '', qty: 1, rate: 0, amount: 0 }
    ]);
  };

  const handleMaterialChange = (index: number, field: keyof ServiceMaterialUsed, val: any) => {
    setMaterialsUsed(prev => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: val };
      if (field === 'qty' || field === 'rate') {
        current.amount = Number(current.qty || 0) * Number(current.rate || 0);
      }
      updated[index] = current;
      return updated;
    });
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterialsUsed(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (!reportNo.trim()) {
      setError('Report Number is required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      await onSaveReport({
        reportNo: reportNo.trim(),
        date,
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'Customer',
        siteAddress: siteAddress.trim() || `${selectedCustomer?.billingAddress || ''}, ${selectedCustomer?.city || ''}`,
        technicianName: technicianName.trim(),
        technicianPhone: technicianPhone.trim(),
        equipmentType: equipmentType.trim(),
        equipmentSerialNo: equipmentSerialNo.trim() || undefined,
        inspectionDetails: inspectionDetails.trim(),
        findings: findings.trim(),
        defects: defects.trim(),
        recommendedAction: recommendedAction.trim(),
        materialsUsed,
        labourCharge: Number(labourCharge) || 0,
        totalBillable,
        customerRemarks: customerRemarks.trim() || undefined,
        technicianSignatureName: technicianSignatureName.trim(),
        customerSignatureName: customerSignatureName.trim() || selectedCustomer?.contactPerson || 'Authorized Representative',
        status: 'Completed'
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save service report');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Fire Safety Technical Inspection & Service Report</h3>
              <p className="text-xs text-slate-500">IS 2190 compliance inspection, defect observation & replacement report</p>
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

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client / Facility <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
              >
                <option value="">Select client...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report # <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reportNo}
                onChange={e => setReportNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-purple-700 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-600 mb-1">Site / Facility Address</label>
              <input
                type="text"
                placeholder="e.g. Unit 3, Shapar Industrial Area, Rajkot"
                value={siteAddress}
                onChange={e => setSiteAddress(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Lead Technician</label>
              <input
                type="text"
                value={technicianName}
                onChange={e => setTechnicianName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-600 mb-1">Equipment Inspected</label>
              <input
                type="text"
                value={equipmentType}
                onChange={e => setEquipmentType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Equipment Serial Numbers</label>
              <input
                type="text"
                placeholder="e.g. PFS-FE-102 to 114"
                value={equipmentSerialNo}
                onChange={e => setEquipmentSerialNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Observations and Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scope & Inspection Details</label>
              <textarea
                rows={2}
                value={inspectionDetails}
                onChange={e => setInspectionDetails(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observations & Findings</label>
              <textarea
                rows={2}
                value={findings}
                onChange={e => setFindings(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Defects / Non-Compliance Noticed</label>
              <textarea
                rows={2}
                value={defects}
                onChange={e => setDefects(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corrective Actions Taken / Recommendations</label>
              <textarea
                rows={2}
                value={recommendedAction}
                onChange={e => setRecommendedAction(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Spares / Materials Replaced */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs">Spares / Materials Used on Site</h4>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="text-purple-600 hover:text-purple-700 font-semibold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>

            {materialsUsed.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Item Name (e.g. Pressure Gauge, Seal, Hose)"
                  value={m.item}
                  onChange={e => handleMaterialChange(idx, 'item', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={m.qty}
                  onChange={e => handleMaterialChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-center"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={m.rate}
                  onChange={e => handleMaterialChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-right"
                />
                <span className="w-20 text-right font-bold text-slate-800 text-xs">₹{m.amount}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(idx)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Charges and Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Labour Charges (₹)</label>
              <input
                type="number"
                value={labourCharge}
                onChange={e => setLabourCharge(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Signatory Name</label>
              <input
                type="text"
                placeholder="e.g. Mr. Rajesh Patel"
                value={customerSignatureName}
                onChange={e => setCustomerSignatureName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col justify-center text-right">
              <span className="text-[11px] text-purple-600 font-medium">Total Billable Amount</span>
              <span className="text-base font-bold text-purple-900">₹{totalBillable.toLocaleString('en-IN')}</span>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Inspection Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
