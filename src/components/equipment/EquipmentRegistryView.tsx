import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Building2,
  QrCode
} from 'lucide-react';
import { EquipmentRecord, Customer } from '../../types';
import { formatDate } from '../../utils/formatters';

interface EquipmentRegistryViewProps {
  equipment: EquipmentRecord[];
  customers: Customer[];
  onAddEquipment: (eq: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeleteEquipment: (id: string) => Promise<void>;
}

export const EquipmentRegistryView: React.FC<EquipmentRegistryViewProps> = ({
  equipment,
  customers,
  onAddEquipment,
  onDeleteEquipment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(customers?.[0]?.id || '');
  const [equipmentType, setEquipmentType] = useState('ABC Dry Powder Extinguisher');
  const [capacity, setCapacity] = useState('6 kg');
  const [serialNo, setSerialNo] = useState('');
  const [location, setLocation] = useState('Ground Floor Main Lobby');
  const [lastRefillDate, setLastRefillDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextServiceDue, setNextServiceDue] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
  );
  const [condition, setCondition] = useState<'Good' | 'Needs Attention' | 'Condemned'>('Good');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(e => {
      const cust = customers.find(c => c.id === e.customerId);
      const custName = cust?.name || '';
      const matchesSearch =
        e.equipmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        custName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (typeFilter !== 'all' && !e.equipmentType.toLowerCase().includes(typeFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [equipment, customers, searchTerm, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !serialNo.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddEquipment({
        customerId,
        equipmentType,
        capacity,
        serialNo: serialNo.trim(),
        location: location.trim(),
        lastRefillDate,
        nextServiceDue,
        condition,
        notes: `Registered in Patel Fire Safety Asset Ledger.`
      });
      setIsModalOpen(false);
      setSerialNo('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDue = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().setHours(0,0,0,0);
    return Math.ceil((due - now) / 86400000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Fire Safety Equipment & Asset Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer on-site fire extinguishers, hydrants, refilling dates & hydro-test schedules
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Equipment</span>
        </button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Registered Equipment</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{equipment.length} Units</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Service Due in 30 Days</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {equipment.filter(e => {
              const d = getDaysUntilDue(e.nextServiceDue);
              return d >= 0 && d <= 30;
            }).length} Units
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Overdue for Refilling / Inspection</span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {equipment.filter(e => getDaysUntilDue(e.nextServiceDue) < 0).length} Units
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search serial #, extinguisher type, client or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'ABC', 'CO2', 'Foam', 'Hydrant'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Flame className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No equipment recorded</p>
            <p className="text-xs text-slate-400 mt-1">Register fire extinguishers and assets installed at client facilities</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Unit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Serial # / QR</th>
                  <th className="p-3">Equipment Type</th>
                  <th className="p-3">Customer / Facility</th>
                  <th className="p-3">Exact Site Location</th>
                  <th className="p-3">Last Refill</th>
                  <th className="p-3">Next Service Due</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.map(eq => {
                  const cust = customers.find(c => c.id === eq.customerId);
                  const daysLeft = getDaysUntilDue(eq.nextServiceDue);
                  const isOverdue = daysLeft < 0;
                  const isDueSoon = daysLeft >= 0 && daysLeft <= 30;

                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900">{eq.serialNo}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{eq.equipmentType}</div>
                        <div className="text-[11px] text-slate-400">Capacity: {eq.capacity}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{cust?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400">{cust?.city}</div>
                      </td>
                      <td className="p-3 text-slate-600">{eq.location}</td>
                      <td className="p-3 text-slate-600">{formatDate(eq.lastRefillDate)}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{formatDate(eq.nextServiceDue)}</div>
                        <span className={`text-[10px] font-bold ${
                          isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {isOverdue ? `Overdue by ${Math.abs(daysLeft)}d` : `${daysLeft} days left`}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          eq.condition === 'Good'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {eq.condition}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteEquipment(eq.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Register On-Site Fire Safety Equipment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Facility</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipment Type</label>
                  <select
                    value={equipmentType}
                    onChange={e => setEquipmentType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="ABC Dry Powder Extinguisher">ABC Dry Powder</option>
                    <option value="CO2 Fire Extinguisher">CO2 Gas Extinguisher</option>
                    <option value="Mechanical Foam (AFFF)">Mechanical Foam (AFFF)</option>
                    <option value="Clean Agent Extinguisher (HFC-236fa)">Clean Agent HFC-236</option>
                    <option value="Fire Hose Reel Drum & Nozzle">Fire Hose Reel Drum</option>
                    <option value="Fire Landing Valve / Hydrant">Fire Landing Valve</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity / Size</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    placeholder="e.g. 6 kg / 4.5 kg / 9 Litres"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number / Tag #</label>
                  <input
                    type="text"
                    required
                    value={serialNo}
                    onChange={e => setSerialNo(e.target.value)}
                    placeholder="e.g. PFS-EXT-8891"
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Good">Good (Operating)</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Condemned">Condemned / Scrap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Installed Exact Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. 2nd Floor Server Room, Near Lift Shaft"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Refill / Install Date</label>
                  <input
                    type="date"
                    value={lastRefillDate}
                    onChange={e => setLastRefillDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Service / Hydro-test Due</label>
                  <input
                    type="date"
                    value={nextServiceDue}
                    onChange={e => setNextServiceDue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Register Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
