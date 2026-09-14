export type Product = ProductItem;
export type InvoiceItem = LineItem;
export type StockMovement = InventoryLog;

export type ItemType = 'product' | 'service' | 'amc' | 'labour';

export type InvoiceStatus = 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card' | 'Other';
export type AmcFrequency = 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly' | 'Custom';
export type AmcStatus = 'Active' | 'Expired' | 'Terminated';
export type EquipmentType = 
  | 'Fire Extinguisher' 
  | 'Fire Hose Reel' 
  | 'Fire Hydrant' 
  | 'Fire Sprinkler' 
  | 'Fire Alarm' 
  | 'Fire Pump' 
  | 'Fire Door' 
  | 'Emergency Light' 
  | 'Other'
  | string;

export type EquipmentCondition = 'Good' | 'Needs Repair' | 'Needs Replacement' | 'Serviced' | 'Pending' | 'Needs Attention' | 'Condemned' | string;

export interface CompanySettings {
  id: string; // 'default'
  companyName: string;
  name?: string; // alias for companyName
  tagline?: string;
  logo?: string; // base64 or url
  signature?: string; // base64 or url for invoice signature
  businessType?: string; // e.g. "Services", "Manufacturing"
  industryType?: string; // e.g. "Fire Safety & Protection"
  registrationType?: string; // e.g. "Sole Proprietorship", "Private Limited"
  msmeNumber?: string;
  isGstRegistered?: boolean;
  enableEInvoicing?: boolean;
  enableTds?: boolean;
  enableTcs?: boolean;
  address: string;
  city: string;
  state: string;
  stateCode: string; // '24' for Gujarat
  pinCode: string;
  pincode?: string; // alias for pinCode
  phone: string;
  mobile?: string; // alias for phone
  alternatePhone?: string;
  email: string;
  website?: string;
  gstin: string;
  pan: string;
  bankName: string;
  accountName?: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  termsAndConditions: string;
  allowNegativeStock: boolean;
  invoicePrefix: string;
  invoiceNextNumber?: number;
  invoicePadding?: number; // e.g. 2 for 01, 3 for 001, 4 for 0001
  invoiceSeparator?: string; // e.g. '/' or '-' or ''
  autoIncrementInvoiceNo?: boolean;
  quotationPrefix: string;
  quotationNextNumber?: number;
  quotationPadding?: number;
  quotationSeparator?: string;
  autoIncrementQuotationNo?: boolean;
  receiptPrefix: string;
  receiptNextNumber?: number;
  receiptPadding?: number;
  receiptSeparator?: string;
  autoIncrementReceiptNo?: boolean;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: string;
  shippingAddress?: string;
  city: string;
  state: string;
  stateCode?: string;
  pin: string;
  notes?: string;
  openingBalance: number;
  currentOutstanding: number;
  totalSales: number;
  totalPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  type: ItemType;
  category?: string;
  trackInventory?: boolean;
  hsnSac: string;
  unit: string; // 'Nos', 'Set', 'Mtr', 'Kg', 'Ltr', 'Lot', 'Job', 'Year'
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number; // 0, 5, 12, 18, 28
  isTaxInclusive?: boolean;
  openingStock: number;
  currentStock: number;
  minStock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerMobile?: string;
  billingAddress: string;
  shippingAddress?: string;
  customerState: string;
  isInterstate: boolean;
  items: LineItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  terms?: string;
  notes?: string;
  quotationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerMobile?: string;
  billingAddress: string;
  shippingAddress?: string;
  customerState: string;
  isInterstate: boolean;
  items: LineItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  roundOff: number;
  grandTotal: number;
  status: QuotationStatus;
  terms?: string;
  notes?: string;
  convertedInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  paymentDate: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  invoiceNo?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string; // Cheque No / UPI Ref / Bank UTR
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  productId?: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unit: string;
  rate?: number;
  purchaseRate?: number;
  taxableAmount?: number;
  gstRate: number;
  gstAmount: number;
  total?: number;
  totalAmount?: number;
}

export interface Purchase {
  id: string;
  purchaseNo?: string;
  purchaseInvoiceNo?: string;
  supplierName: string;
  supplierGstin?: string;
  date?: string;
  purchaseDate?: string;
  items: PurchaseItem[];
  subtotal?: number;
  taxableAmount?: number;
  gstAmount: number;
  grandTotal: number;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partial' | 'paid' | 'unpaid';
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  date?: string;
  expenseDate?: string;
  category: string;
  title?: string;
  description?: string;
  amount: number;
  paymentMethod?: PaymentMethod | string;
  paymentMode?: PaymentMethod | string;
  referenceNo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'cancellation' | 'in' | 'out';
  quantityChange: number;
  quantity?: number;
  previousStock: number;
  newStock: number;
  stockAfter?: number;
  referenceId?: string;
  referenceNo?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface AmcServiceSchedule {
  id: string;
  periodName: string; // e.g. "Q1 (Apr - Jun)", "Visit #1"
  scheduledDate: string;
  completedDate?: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  notes?: string;
  serviceReportId?: string;
}

export interface AmcContract {
  id: string;
  contractNo: string;
  title: string;
  customerId: string;
  customerName: string;
  customerMobile?: string;
  siteAddress: string;
  startDate: string;
  endDate: string;
  contractAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  paymentSchedule: string; // "100% Advance", "50% Advance + 50% Mid-term", "Quarterly"
  serviceFrequency: AmcFrequency;
  schedules: AmcServiceSchedule[];
  status: AmcStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentRecord {
  id: string;
  customerId: string;
  customerName?: string;
  equipmentType: EquipmentType;
  brand?: string;
  model?: string;
  serialNo: string;
  capacity?: string; // e.g. "6 Kg ABC", "4.5 Kg CO2", "30 Mtr Hose"
  location: string; // e.g. "Ground Floor Server Room", "Building A Staircase"
  installationDate?: string;
  lastServiceDate?: string;
  lastRefillDate?: string;
  nextServiceDate?: string;
  nextServiceDue?: string;
  condition: EquipmentCondition;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceMaterialUsed {
  item: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface ServiceReport {
  id: string;
  reportNo: string;
  date: string;
  customerId: string;
  customerName: string;
  siteAddress: string;
  technicianName: string;
  technicianPhone?: string;
  equipmentType: string;
  equipmentSerialNo?: string;
  inspectionDetails: string;
  findings: string;
  defects: string;
  recommendedAction: string;
  materialsUsed: ServiceMaterialUsed[];
  labourCharge: number;
  totalBillable: number;
  customerRemarks?: string;
  technicianSignatureName: string;
  customerSignatureName: string;
  amcContractId?: string;
  status: 'Draft' | 'Completed';
  createdAt: string;
}

export interface PumpTestRecord {
  id: string;
  testNo: string;
  date: string;
  customerId: string;
  customerName: string;
  siteAddress: string;
  pumpType: 'Main Electric Hydrant Pump' | 'Diesel Engine Pump' | 'Jockey Pump' | 'Sprinkler Electric Pump' | 'Booster Pump';
  pumpNumber: string;
  suctionPressure: string; // e.g. "1.5 kg/cm²"
  dischargePressure: string; // e.g. "7.5 kg/cm²"
  shutOffPressure?: string; // e.g. "8.5 kg/cm²"
  flowRateGPM?: string; // e.g. "2280 LPM (600 GPM)"
  runningCondition: 'Smooth & Normal' | 'Vibrations Observed' | 'Overheating' | 'Abnormal Noise';
  electricalCondition: 'Normal Current & Starter OK' | 'Trips on Load' | 'Phase Imbalance' | 'Cable Fault';
  dieselCondition: 'Battery & Auto-Start OK' | 'Fuel System Needs Service' | 'Coolant Low' | 'Not Applicable';
  autoStartTestResult: 'Passed (Auto-Cycled OK)' | 'Failed to Start Automatically' | 'Manual Operation Only';
  remarks: string;
  technicianName: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'Invoice' | 'Payment' | 'Opening Balance' | 'Adjustment';
  referenceNo: string;
  referenceId?: string;
  description: string;
  debit: number; // Increases customer balance (Invoice)
  credit: number; // Decreases customer balance (Payment)
  balance: number; // Running balance
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Paid Leave' | 'Holiday' | 'Weekly Off';

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email?: string;
  pan?: string;
  uan?: string; // EPFO UAN
  esiIpNumber?: string; // ESIC IP Number
  joiningDate: string;
  basicSalary: number; // Monthly Basic
  da: number; // Dearness Allowance
  hra: number; // House Rent Allowance
  allowances: number; // Special/Other Allowances
  pfApplicable: boolean;
  esiApplicable: boolean;
  ptApplicable: boolean;
  gstApplicable: boolean; // Applicable if invoicing client for this staff's services
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number;
  notes?: string;
}

export interface PublicHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'National' | 'Gazetted' | 'Restricted' | 'Company';
  description?: string;
}

export interface PayrollConfig {
  pfEmployeeRate: number; // 12% default
  pfEmployerRate: number; // 12% default
  pfWageCeiling: number; // 15000 ceiling
  usePfCeiling: boolean;
  esiEmployeeRate: number; // 0.75% default
  esiEmployerRate: number; // 3.25% default
  esiGrossLimit: number; // 21000 limit
  ptAmount: number; // 200 default
  gstRate: number; // 18% default for manpower supply
}

export * from './billCustomization';


