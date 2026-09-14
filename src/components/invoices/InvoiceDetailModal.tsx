import React, { useState } from 'react';
import {
  X,
  Receipt,
  Download,
  CreditCard,
  Building2,
  Calendar,
  User,
  AlertTriangle,
  Ban,
  CheckCircle2,
  QrCode,
  Share2,
  MessageSquare,
  Printer,
  FileText,
  Edit2,
  Palette,
  Trash2
} from 'lucide-react';
import { Invoice, CompanySettings, Customer, BillCustomizationSettings } from '../../types';
import { formatCurrency, formatDate, getStatusBadgeClasses } from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { sendInvoiceOnWhatsApp } from '../../utils/whatsappHelper';
import { UpiQrModal } from '../modals/UpiQrModal';
import { BillPreviewCard } from './BillPreviewCard';
import { LiveBillPreview } from '../customization/LiveBillPreview';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  companySettings: CompanySettings;
  customer?: Customer;
  customizationSettings?: BillCustomizationSettings;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onCancelInvoice: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onCustomizeInvoice?: () => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  companySettings,
  customer,
  customizationSettings,
  isOpen,
  onClose,
  onRecordPayment,
  onCancelInvoice,
  onEditInvoice,
  onCustomizeInvoice,
  onDeleteInvoice
}) => {
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'bill' | 'summary'>('bill');

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh]">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{invoice.invoiceNo}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClasses(invoice.status)}`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Tax Invoice • {formatDate(invoice.invoiceDate)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => sendInvoiceOnWhatsApp(invoice, companySettings, customer?.mobile)}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                title="Send on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={() => setShowUpiModal(true)}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                title="Scan UPI QR"
              >
                <QrCode className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">UPI QR</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                title="Print Bill"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {onEditInvoice && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    onClose();
                    onEditInvoice(invoice);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                  title="Edit Invoice"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}

              {onCustomizeInvoice && (
                <button
                  onClick={() => {
                    onClose();
                    onCustomizeInvoice();
                  }}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                  title="Customize Invoice Layout & Colors"
                >
                  <Palette className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Customize</span>
                </button>
              )}

              {onDeleteInvoice && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNo}? This cannot be undone.`)) {
                      onClose();
                      onDeleteInvoice(invoice);
                    }
                  }}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                  title="Delete Invoice"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              <button
                onClick={() => generateInvoicePDF(invoice, companySettings, customer, customizationSettings)}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-2xs flex items-center gap-1.5"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="overflow-y-auto p-3 sm:p-6 flex-1 bg-slate-200/60">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 text-xs font-medium">
                <button
                  onClick={() => setViewMode('bill')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === 'bill'
                      ? 'bg-red-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Authentic Bill View
                </button>
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === 'summary'
                      ? 'bg-red-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quick Summary
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                A4 Document Format
              </span>
            </div>

            {viewMode === 'bill' ? (
              customizationSettings ? (
                <LiveBillPreview
                  settings={customizationSettings}
                  invoice={invoice}
                  companySettings={companySettings}
                  customer={customer}
                  className="shadow-md"
                />
              ) : (
                <BillPreviewCard
                  invoice={invoice}
                  companySettings={companySettings}
                  customer={customer}
                />
              )
            ) : (
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5 text-xs shadow-sm">
                {/* Customer & Supply Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Billed To:</span>
                    <span className="font-bold text-sm text-slate-800 block mt-0.5">{invoice.customerName}</span>
                    <p className="text-slate-600 mt-1">{invoice.billingAddress}</p>
                    <p className="text-slate-500 mt-1">
                      <strong>GSTIN:</strong> {invoice.customerGstin || 'URP (Unregistered)'} | <strong>State:</strong> {invoice.customerState}
                    </p>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Invoice Information:</span>
                    <p className="text-slate-600"><strong>Invoice Date:</strong> {formatDate(invoice.invoiceDate)}</p>
                    <p className="text-slate-600"><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
                    <p className="text-slate-600">
                      <strong>Taxation:</strong> {invoice.isInterstate ? 'Interstate (IGST 18%)' : 'Intra-State (CGST 9% + SGST 9%)'}
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">HSN/SAC</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                        <th className="p-2.5 text-right">Taxable (₹)</th>
                        <th className="p-2.5 text-right">GST (₹)</th>
                        <th className="p-2.5 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-400">{idx + 1}</td>
                          <td className="p-2.5">
                            <span className="font-semibold text-slate-800 block">{item.name}</span>
                            {item.description && <span className="text-[11px] text-slate-500">{item.description}</span>}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{item.hsnSac || '-'}</td>
                          <td className="p-2.5 text-center font-medium">{item.quantity} {item.unit}</td>
                          <td className="p-2.5 text-right">{item.rate.toFixed(2)}</td>
                          <td className="p-2.5 text-right">{item.taxableAmount.toFixed(2)}</td>
                          <td className="p-2.5 text-right">
                            {invoice.isInterstate ? item.igstAmount.toFixed(2) : (item.cgstAmount + item.sgstAmount).toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{item.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex-1 w-full">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Bank Details for Payment:</span>
                    <p className="text-slate-700 mt-1">
                      <strong>Bank:</strong> {companySettings.bankName} | <strong>A/C:</strong> {companySettings.accountNumber}
                    </p>
                    <p className="text-slate-700">
                      <strong>IFSC:</strong> {companySettings.ifscCode} | <strong>UPI:</strong> {companySettings.upiId}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 w-full sm:w-64 space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span>- {formatCurrency(invoice.totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Amount:</span>
                      <span>{formatCurrency(invoice.taxableAmount)}</span>
                    </div>
                    {invoice.isInterstate ? (
                      <div className="flex justify-between text-purple-700 font-medium">
                        <span>IGST Total:</span>
                        <span>{formatCurrency(invoice.igstTotal)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>CGST Total:</span>
                          <span>{formatCurrency(invoice.cgstTotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>SGST Total:</span>
                          <span>{formatCurrency(invoice.sgstTotal)}</span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                      <span>Grand Total:</span>
                      <span className="text-red-600">{formatCurrency(invoice.grandTotal)}</span>
                    </div>

                    <div className="pt-1 flex justify-between text-slate-700">
                      <span>Amount Paid:</span>
                      <span className="text-emerald-600 font-bold">{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs">
                      <span>Balance Due:</span>
                      <span className={invoice.balanceDue > 0 ? 'text-orange-600' : 'text-emerald-600'}>
                        {formatCurrency(invoice.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div>
              {invoice.status !== 'cancelled' && (
                <button
                  onClick={() => onCancelInvoice(invoice)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Invoice</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onEditInvoice && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    onClose();
                    onEditInvoice(invoice);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Invoice</span>
                </button>
              )}

              {invoice.balanceDue > 0 && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    onClose();
                    onRecordPayment(invoice);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Payment ({formatCurrency(invoice.balanceDue)})</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic UPI QR Modal */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        invoice={invoice}
        companySettings={companySettings}
        onRecordPayment={(inv) => {
          setShowUpiModal(false);
          onRecordPayment(inv);
        }}
      />
    </>
  );
};


