import Dexie, { type Table } from 'dexie';
import {
  CompanySettings,
  Customer,
  ProductItem,
  Quotation,
  Invoice,
  PaymentReceipt,
  Purchase,
  Expense,
  InventoryLog,
  AmcContract,
  EquipmentRecord,
  ServiceReport,
  PumpTestRecord,
  BillCustomizationSettings,
  DocumentDesignMapping,
  StaffMember,
  AttendanceRecord,
  PublicHoliday,
  PayrollConfig
} from '../types';
import { INITIAL_CUSTOM_DESIGNS, DEFAULT_DOCUMENT_MAPPING } from '../utils/defaultBillTemplates';
import { DEFAULT_PAYROLL_CONFIG, DEFAULT_PUBLIC_HOLIDAYS_2026 } from '../utils/indianPayroll';

export class PatelFireDatabase extends Dexie {
  companySettings!: Table<CompanySettings, string>;
  customers!: Table<Customer, string>;
  products!: Table<ProductItem, string>;
  quotations!: Table<Quotation, string>;
  invoices!: Table<Invoice, string>;
  payments!: Table<PaymentReceipt, string>;
  purchases!: Table<Purchase, string>;
  expenses!: Table<Expense, string>;
  inventoryLogs!: Table<InventoryLog, string>;
  amcContracts!: Table<AmcContract, string>;
  equipment!: Table<EquipmentRecord, string>;
  serviceReports!: Table<ServiceReport, string>;
  pumpTestReports!: Table<PumpTestRecord, string>;
  billCustomizations!: Table<BillCustomizationSettings, string>;
  documentDesignMapping!: Table<DocumentDesignMapping & { id: string }, string>;
  staff!: Table<StaffMember, string>;
  attendance!: Table<AttendanceRecord, string>;
  holidays!: Table<PublicHoliday, string>;
  payrollConfig!: Table<PayrollConfig & { id: string }, string>;

  constructor() {
    super('PatelFireBillingDB');
    this.version(1).stores({
      companySettings: 'id',
      customers: 'id, name, companyName, mobile, gstin, city, state',
      products: 'id, name, type, hsnSac, currentStock',
      quotations: 'id, quotationNo, customerId, date, status',
      invoices: 'id, invoiceNo, customerId, invoiceDate, status, dueDate',
      payments: 'id, receiptNo, customerId, invoiceId, paymentDate, paymentMethod',
      purchases: 'id, purchaseNo, supplierName, date',
      expenses: 'id, date, category, paymentMethod',
      inventoryLogs: 'id, productId, date, type',
      amcContracts: 'id, contractNo, customerId, status, startDate, endDate',
      equipment: 'id, customerId, equipmentType, serialNo, nextServiceDate, condition',
      serviceReports: 'id, reportNo, customerId, date, status',
      pumpTestReports: 'id, testNo, customerId, date, pumpType'
    });

    this.version(2).stores({
      companySettings: 'id',
      customers: 'id, name, companyName, mobile, gstin, city, state',
      products: 'id, name, type, hsnSac, currentStock',
      quotations: 'id, quotationNo, customerId, date, status',
      invoices: 'id, invoiceNo, customerId, invoiceDate, status, dueDate',
      payments: 'id, receiptNo, customerId, invoiceId, paymentDate, paymentMethod',
      purchases: 'id, purchaseNo, supplierName, date',
      expenses: 'id, date, category, paymentMethod',
      inventoryLogs: 'id, productId, date, type',
      amcContracts: 'id, contractNo, customerId, status, startDate, endDate',
      equipment: 'id, customerId, equipmentType, serialNo, nextServiceDate, condition',
      serviceReports: 'id, reportNo, customerId, date, status',
      pumpTestReports: 'id, testNo, customerId, date, pumpType',
      billCustomizations: 'id, name, isDefault, documentType, templateId',
      documentDesignMapping: 'id'
    });

    this.version(3).stores({
      companySettings: 'id',
      customers: 'id, name, companyName, mobile, gstin, city, state',
      products: 'id, name, type, hsnSac, currentStock',
      quotations: 'id, quotationNo, customerId, date, status',
      invoices: 'id, invoiceNo, customerId, invoiceDate, status, dueDate',
      payments: 'id, receiptNo, customerId, invoiceId, paymentDate, paymentMethod',
      purchases: 'id, purchaseNo, supplierName, date',
      expenses: 'id, date, category, paymentMethod',
      inventoryLogs: 'id, productId, date, type',
      amcContracts: 'id, contractNo, customerId, status, startDate, endDate',
      equipment: 'id, customerId, equipmentType, serialNo, nextServiceDate, condition',
      serviceReports: 'id, reportNo, customerId, date, status',
      pumpTestReports: 'id, testNo, customerId, date, pumpType',
      billCustomizations: 'id, name, isDefault, documentType, templateId',
      documentDesignMapping: 'id',
      staff: 'id, name, designation, department, phone, status',
      attendance: 'id, staffId, date, status',
      holidays: 'id, date, type',
      payrollConfig: 'id'
    });
  }
}

export const db = new PatelFireDatabase();

// Default Company Settings
export const defaultCompanySettings: CompanySettings = {
  id: 'default',
  companyName: 'FIRE CARE SAFETY SOLUTION',
  tagline: 'Complete Fire Protection, Hydrant, Sprinkler, Extinguisher & Electrical AMC Solutions',
  address: 'Plot No. 42-44, Phase II, GIDC Industrial Estate, Vatva',
  city: 'Ahmedabad',
  state: 'Gujarat',
  stateCode: '24',
  pinCode: '382445',
  phone: '+91 98765 43210',
  alternatePhone: '+91 79 2589 1122',
  email: 'info@firecaresafety.com',
  website: 'www.firecaresafety.com',
  gstin: '24AAAFP1234F1Z8',
  pan: 'AAAFP1234F',
  bankName: 'State Bank of India',
  accountNumber: '409823450912',
  ifscCode: 'SBIN0001234',
  branch: 'Vatva Industrial Estate Branch, Ahmedabad',
  upiId: 'firecaresafety@sbi',
  termsAndConditions: '1. Goods once sold will not be taken back or exchanged unless under warranty terms.\n2. Fire Extinguishers refills carry 1-year shelf life warranty under IS 2190 standards.\n3. Payment is due within 15 days of invoice date. 18% p.a. interest charged on delayed payments.\n4. All disputes subject to Ahmedabad jurisdiction only.\n5. Warranty void if equipment seal is broken or tampered by unauthorized technician.',
  allowNegativeStock: false,
  invoicePrefix: 'ag/2026',
  invoiceNextNumber: 1,
  invoicePadding: 2,
  invoiceSeparator: '/',
  autoIncrementInvoiceNo: true,
  quotationPrefix: 'ag/QTN/2026',
  quotationNextNumber: 1,
  quotationPadding: 2,
  quotationSeparator: '/',
  autoIncrementQuotationNo: true,
  receiptPrefix: 'ag/REC/2026',
  receiptNextNumber: 1,
  receiptPadding: 2,
  receiptSeparator: '/',
  autoIncrementReceiptNo: true,
  updatedAt: new Date().toISOString()
};

// Seed initial dataset if database is empty
export async function seedInitialDataIfNeeded() {
  try {
    const settingsCount = await db.companySettings.count();
    if (settingsCount === 0) {
      await db.companySettings.put(defaultCompanySettings);
    } else {
      // If the old placeholder/default name was stored, update it to FIRE CARE SAFETY SOLUTION
      const current = await db.companySettings.get('default');
      if (current) {
        const needsUpdate = (current.companyName.includes('Patel') || !current.companyName) ||
          (current.invoicePrefix && current.invoicePrefix.startsWith('PFS')) ||
          current.invoiceNextNumber === undefined;

        if (needsUpdate) {
          await db.companySettings.update('default', {
            companyName: (current.companyName && current.companyName.includes('Patel')) ? 'FIRE CARE SAFETY SOLUTION' : (current.companyName || 'FIRE CARE SAFETY SOLUTION'),
            email: (current.email && current.email.includes('patel')) ? 'info@firecaresafety.com' : (current.email || 'info@firecaresafety.com'),
            website: (current.website && current.website.includes('patel')) ? 'www.firecaresafety.com' : (current.website || 'www.firecaresafety.com'),
            upiId: (current.upiId && current.upiId.includes('patel')) ? 'firecaresafety@sbi' : (current.upiId || 'firecaresafety@sbi'),
            invoicePrefix: (!current.invoicePrefix || current.invoicePrefix.startsWith('PFS') || current.invoicePrefix.startsWith('FCSS')) ? 'ag/2026' : current.invoicePrefix,
            invoiceNextNumber: current.invoiceNextNumber ?? 1,
            invoicePadding: current.invoicePadding ?? 2,
            invoiceSeparator: current.invoiceSeparator ?? '/',
            autoIncrementInvoiceNo: current.autoIncrementInvoiceNo ?? true,
            quotationPrefix: (!current.quotationPrefix || current.quotationPrefix.startsWith('PFS')) ? 'ag/QTN/2026' : current.quotationPrefix,
            quotationNextNumber: current.quotationNextNumber ?? 1,
            quotationPadding: current.quotationPadding ?? 2,
            quotationSeparator: current.quotationSeparator ?? '/',
            autoIncrementQuotationNo: current.autoIncrementQuotationNo ?? true,
            receiptPrefix: (!current.receiptPrefix || current.receiptPrefix.startsWith('PFS')) ? 'ag/REC/2026' : current.receiptPrefix,
            receiptNextNumber: current.receiptNextNumber ?? 1,
            receiptPadding: current.receiptPadding ?? 2,
            receiptSeparator: current.receiptSeparator ?? '/',
            autoIncrementReceiptNo: current.autoIncrementReceiptNo ?? true,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    const productCount = await db.products.count();
    if (productCount === 0) {
      const now = new Date().toISOString();
      const initialProducts: ProductItem[] = [
        {
          id: 'prod_abc_4kg',
          name: 'ABC Dry Powder Fire Extinguisher (4 Kg)',
          type: 'product',
          hsnSac: '84241000',
          unit: 'Nos',
          purchasePrice: 1100,
          sellingPrice: 1750,
          gstRate: 18,
          openingStock: 25,
          currentStock: 22,
          minStock: 5,
          description: 'Stored Pressure MAP 50% powder fire extinguisher with pressure gauge and bracket. Suitable for Class A, B, C & Electrical fires. IS 15683 certified.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_abc_6kg',
          name: 'ABC Dry Powder Fire Extinguisher (6 Kg)',
          type: 'product',
          hsnSac: '84241000',
          unit: 'Nos',
          purchasePrice: 1450,
          sellingPrice: 2250,
          gstRate: 18,
          openingStock: 40,
          currentStock: 34,
          minStock: 8,
          description: 'High performance stored pressure ABC dry chemical extinguisher with discharge hose, wall clamp, and ISI mark. Capacity: 6 Kg.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_co2_45kg',
          name: 'CO2 Fire Extinguisher (4.5 Kg)',
          type: 'product',
          hsnSac: '84241000',
          unit: 'Nos',
          purchasePrice: 2800,
          sellingPrice: 4200,
          gstRate: 18,
          openingStock: 20,
          currentStock: 16,
          minStock: 4,
          description: 'Seamless steel cylinder with high pressure squeeze grip valve, discharge horn and wall bracket. Suitable for Class B, C and Sensitive Electrical Equipment / Server rooms.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_dcp_50kg',
          name: 'DCP Fire Extinguisher 50 Kg Trolley Mounted',
          type: 'product',
          hsnSac: '84241000',
          unit: 'Nos',
          purchasePrice: 11500,
          sellingPrice: 16800,
          gstRate: 18,
          openingStock: 5,
          currentStock: 4,
          minStock: 2,
          description: 'Heavy duty trolley mounted dry chemical powder extinguisher with 5 meter discharge hose & CO2 gas cartridge (2 Kg) for industrial yards and factories.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'serv_ext_refill',
          name: 'Fire Extinguisher Refill & Hydro-Testing (ABC / CO2 / Foam)',
          type: 'service',
          hsnSac: '998717',
          unit: 'Nos',
          purchasePrice: 180,
          sellingPrice: 450,
          gstRate: 18,
          openingStock: 0,
          currentStock: 999,
          minStock: 0,
          description: 'Complete internal cleaning, valve servicing, O-ring replacement, nitrogen gas pressurization, and IS 2190 hydro-test certificate.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_hose_reel',
          name: 'Fire Hose Reel Drum (30 Mtrs with Brass Shut-off Nozzle)',
          type: 'product',
          hsnSac: '84249000',
          unit: 'Set',
          purchasePrice: 2600,
          sellingPrice: 3850,
          gstRate: 18,
          openingStock: 15,
          currentStock: 12,
          minStock: 3,
          description: 'Swinging type 30-meter high-pressure thermoplastic rubber hose reel drum with wall mounting brackets and 19mm heavy brass jet/spray nozzle.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_hydrant_valve',
          name: 'Gunmetal Single Outlet Fire Hydrant Landing Valve (63mm)',
          type: 'product',
          hsnSac: '84818090',
          unit: 'Nos',
          purchasePrice: 3200,
          sellingPrice: 4950,
          gstRate: 18,
          openingStock: 12,
          currentStock: 9,
          minStock: 3,
          description: 'ISI marked 63mm gunmetal landing valve with instantaneous female outlet, cast iron handwheel, blank cap & chain. Tested to 21 kg/cm² pressure.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_smoke_detector',
          name: 'Optical Photoelectric Smoke Detector with Base',
          type: 'product',
          hsnSac: '85311010',
          unit: 'Nos',
          purchasePrice: 380,
          sellingPrice: 650,
          gstRate: 18,
          openingStock: 80,
          currentStock: 65,
          minStock: 15,
          description: 'Conventional 2-wire photoelectric smoke detector with dual LED 360-degree visibility, insect mesh screen, and surface mount base.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_alarm_panel_8z',
          name: 'Microprocessor Fire Alarm Control Panel (8 Zone)',
          type: 'product',
          hsnSac: '85311090',
          unit: 'Nos',
          purchasePrice: 6500,
          sellingPrice: 9800,
          gstRate: 18,
          openingStock: 6,
          currentStock: 4,
          minStock: 2,
          description: '8-Zone microprocessor fire alarm control panel with built-in battery charger, audio-visual fault/alarm indication, and zone isolation facility.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_sprinkler_head',
          name: 'Fire Sprinkler Head Pendant Type (68°C Red Bulb 1/2" NPT)',
          type: 'product',
          hsnSac: '84249000',
          unit: 'Nos',
          purchasePrice: 120,
          sellingPrice: 220,
          gstRate: 18,
          openingStock: 250,
          currentStock: 210,
          minStock: 30,
          description: 'UL listed brass chrome finished sprinkler head with fast response glass bulb rated at 68°C / 155°F.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_fire_pump_50hp',
          name: 'Main Electric Fire Hydrant Pump Set (50 HP - 2280 LPM)',
          type: 'product',
          hsnSac: '84137010',
          unit: 'Set',
          purchasePrice: 125000,
          sellingPrice: 165000,
          gstRate: 18,
          openingStock: 2,
          currentStock: 2,
          minStock: 1,
          description: 'Multi-stage end suction horizontal fire pump coupled to 50 HP 2900 RPM squirrel cage induction motor on MS base frame with auto-star delta starter.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'amc_hydrant_sprinkler',
          name: 'Comprehensive Annual Maintenance Contract (Hydrant & Sprinkler System)',
          type: 'amc',
          hsnSac: '998717',
          unit: 'Year',
          purchasePrice: 8000,
          sellingPrice: 28000,
          gstRate: 18,
          openingStock: 0,
          currentStock: 999,
          minStock: 0,
          description: 'Annual 4 quarterly comprehensive inspection visits, pump testing, pressure verification, valve lubrication, pipe pressure test, and emergency breakdown support.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'amc_alarm_system',
          name: 'Non-Comprehensive AMC for Addressable/Conventional Fire Alarm System',
          type: 'amc',
          hsnSac: '998717',
          unit: 'Year',
          purchasePrice: 4000,
          sellingPrice: 14500,
          gstRate: 18,
          openingStock: 0,
          currentStock: 999,
          minStock: 0,
          description: 'Quarterly detector smoke aerosol testing, hooter decibel check, MCP testing, panel battery & loop continuity check.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'serv_pump_testing',
          name: 'Fire Pump Performance Testing & Hydraulic Audit (Quarterly)',
          type: 'service',
          hsnSac: '998319',
          unit: 'Job',
          purchasePrice: 1500,
          sellingPrice: 4500,
          gstRate: 18,
          openingStock: 0,
          currentStock: 999,
          minStock: 0,
          description: 'Comprehensive pressure test (shut-off, rated 100%, peak 150% flow), diesel engine auto-cut test, battery health check, and signed technical report.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'labour_installation',
          name: 'Fire Protection Piping & Installation Labour Charges',
          type: 'labour',
          hsnSac: '995469',
          unit: 'Job',
          purchasePrice: 3000,
          sellingPrice: 6500,
          gstRate: 18,
          openingStock: 0,
          currentStock: 999,
          minStock: 0,
          description: 'Welding, fabrication, pipe threading, bracket fixing, and pressure testing services by certified fire technicians.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'prod_emergency_light',
          name: 'LED Emergency Exit Light Signage with 2-Hour Battery Backup',
          type: 'product',
          hsnSac: '94054090',
          unit: 'Nos',
          purchasePrice: 680,
          sellingPrice: 1150,
          gstRate: 18,
          openingStock: 35,
          currentStock: 30,
          minStock: 5,
          description: 'Edge-lit green acrylic fire emergency exit luminaire with automatic power failure switch and overcharge protection.',
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.products.bulkPut(initialProducts);

      // Seed Customers
      const initialCustomers: Customer[] = [
        {
          id: 'cust_shree_ram',
          name: 'Shree Ram Chemical Industries Ltd.',
          companyName: 'Shree Ram Chemical Industries Ltd.',
          contactPerson: 'Mr. Rajesh Patel (Plant Head)',
          mobile: '9825012345',
          alternateMobile: '9825012346',
          email: 'safety@shreeramchem.com',
          gstin: '24AACCS5678B1Z2',
          pan: 'AACCS5678B',
          billingAddress: 'Plot 108/A, Phase 1, GIDC Estate, Naroda',
          shippingAddress: 'Plot 108/A, Phase 1, GIDC Estate, Naroda',
          city: 'Ahmedabad',
          state: 'Gujarat',
          stateCode: '24',
          pin: '382330',
          notes: 'Chemical processing unit. High priority for quarterly pump inspection and nitrogen CO2 flooding system.',
          openingBalance: 0,
          currentOutstanding: 28500,
          totalSales: 89500,
          totalPaid: 61000,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'cust_apex_hospital',
          name: 'Apex Super Specialty Hospital',
          companyName: 'Apex Healthcare Pvt. Ltd.',
          contactPerson: 'Dr. Mehul Shah / Mr. Vivek (Admin)',
          mobile: '9712345678',
          email: 'admin@apexhospital.org',
          gstin: '24AAACA9876C1Z4',
          pan: 'AAACA9876C',
          billingAddress: 'Opp. Parimal Garden, CG Road, Ellisbridge',
          shippingAddress: 'Opp. Parimal Garden, CG Road, Ellisbridge',
          city: 'Ahmedabad',
          state: 'Gujarat',
          stateCode: '24',
          pin: '380006',
          notes: 'NABH certified hospital. Requires monthly fire extinguisher checks and smoke alarm verification.',
          openingBalance: 0,
          currentOutstanding: 0,
          totalSales: 47200,
          totalPaid: 47200,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'cust_maruti_textiles',
          name: 'Maruti Synthetic & Weaving Mills',
          companyName: 'Maruti Synthetic Mills',
          contactPerson: 'Mr. Amitbhai Patel',
          mobile: '9909011223',
          email: 'accounts@marutitex.com',
          gstin: '24AABCM3344D1ZQ',
          pan: 'AABCM3344D',
          billingAddress: 'Survey No. 45, Bareja-Navagam Road, Bareja',
          shippingAddress: 'Survey No. 45, Bareja-Navagam Road, Bareja',
          city: 'Ahmedabad',
          state: 'Gujarat',
          stateCode: '24',
          pin: '382425',
          notes: 'Large textile weaving shed. Hydrant pressure maintenance and foam monitor installation required.',
          openingBalance: 0,
          currentOutstanding: 45780,
          totalSales: 45780,
          totalPaid: 0,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'cust_shivalik_heights',
          name: 'Shivalik Heights Commercial Co-Op Society',
          companyName: 'Shivalik Heights Co-Op Service Society',
          contactPerson: 'Mr. Sanjay Joshi (Chairman)',
          mobile: '9426055443',
          email: 'society.shivalik@gmail.com',
          gstin: '',
          billingAddress: '100 Feet Anandnagar Road, Prahladnagar',
          shippingAddress: '100 Feet Anandnagar Road, Prahladnagar',
          city: 'Ahmedabad',
          state: 'Gujarat',
          stateCode: '24',
          pin: '380015',
          notes: '12-floor commercial complex. Annual AMC for Hydrant, Sprinkler and Jockey Pump in place.',
          openingBalance: 0,
          currentOutstanding: 14000,
          totalSales: 33040,
          totalPaid: 19040,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'cust_dynatech_mumbai',
          name: 'Dynatech Precision Tools Pvt. Ltd. (Interstate)',
          companyName: 'Dynatech Precision Tools Pvt. Ltd.',
          contactPerson: 'Mr. Suresh Kulkarni',
          mobile: '9820088776',
          email: 'purchase@dynatechmumbai.com',
          gstin: '27AABCD1122E1Z3', // Maharashtra GSTIN
          pan: 'AABCD1122E',
          billingAddress: 'Plot W-45, MIDC Industrial Area, Rabale',
          shippingAddress: 'Plot W-45, MIDC Industrial Area, Rabale',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          stateCode: '27',
          pin: '400701',
          notes: 'Interstate customer - IGST 18% applied on all dispatches.',
          openingBalance: 0,
          currentOutstanding: 0,
          totalSales: 54280,
          totalPaid: 54280,
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.customers.bulkPut(initialCustomers);

      // Seed Invoices
      const sampleInvoices: Invoice[] = [
        {
          id: 'inv_2026_0001',
          invoiceNo: 'PFS/INV/2026/0001',
          invoiceDate: '2026-08-01',
          dueDate: '2026-08-16',
          customerId: 'cust_apex_hospital',
          customerName: 'Apex Super Specialty Hospital',
          customerGstin: '24AAACA9876C1Z4',
          customerMobile: '9712345678',
          billingAddress: 'Opp. Parimal Garden, CG Road, Ellisbridge, Ahmedabad, Gujarat - 380006',
          customerState: 'Gujarat',
          isInterstate: false,
          items: [
            {
              id: 'item_1',
              productId: 'prod_abc_6kg',
              name: 'ABC Dry Powder Fire Extinguisher (6 Kg)',
              hsnSac: '84241000',
              quantity: 8,
              unit: 'Nos',
              rate: 2250,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 18000,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 1620,
              sgstRate: 9,
              sgstAmount: 1620,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 21240
            },
            {
              id: 'item_2',
              productId: 'prod_co2_45kg',
              name: 'CO2 Fire Extinguisher (4.5 Kg)',
              hsnSac: '84241000',
              quantity: 4,
              unit: 'Nos',
              rate: 4200,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 16800,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 1512,
              sgstRate: 9,
              sgstAmount: 1512,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 19824
            },
            {
              id: 'item_3',
              productId: 'serv_ext_refill',
              name: 'Fire Extinguisher Refill & Hydro-Testing (ABC / CO2 / Foam)',
              hsnSac: '998717',
              quantity: 12,
              unit: 'Nos',
              rate: 450,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 5400,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 486,
              sgstRate: 9,
              sgstAmount: 486,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 6372
            },
            {
              id: 'item_4',
              productId: 'labour_installation',
              name: 'Fire Protection Piping & Installation Labour Charges',
              hsnSac: '995469',
              quantity: 1,
              unit: 'Job',
              rate: 6500,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 6500,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 585,
              sgstRate: 9,
              sgstAmount: 585,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 7670
            }
          ],
          subtotal: 46700,
          totalDiscount: 0,
          taxableAmount: 46700,
          cgstTotal: 4203,
          sgstTotal: 4203,
          igstTotal: 0,
          roundOff: 0,
          grandTotal: 55106,
          amountPaid: 55106,
          balanceDue: 0,
          status: 'paid',
          terms: defaultCompanySettings.termsAndConditions,
          notes: 'Full payment received via NEFT Bank Transfer.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'inv_2026_0002',
          invoiceNo: 'PFS/INV/2026/0002',
          invoiceDate: '2026-08-10',
          dueDate: '2026-08-25',
          customerId: 'cust_maruti_textiles',
          customerName: 'Maruti Synthetic & Weaving Mills',
          customerGstin: '24AABCM3344D1ZQ',
          customerMobile: '9909011223',
          billingAddress: 'Survey No. 45, Bareja-Navagam Road, Bareja, Ahmedabad - 382425',
          customerState: 'Gujarat',
          isInterstate: false,
          items: [
            {
              id: 'item_m1',
              productId: 'prod_hose_reel',
              name: 'Fire Hose Reel Drum (30 Mtrs with Brass Shut-off Nozzle)',
              hsnSac: '84249000',
              quantity: 4,
              unit: 'Set',
              rate: 3850,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 15400,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 1386,
              sgstRate: 9,
              sgstAmount: 1386,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 18172
            },
            {
              id: 'item_m2',
              productId: 'prod_hydrant_valve',
              name: 'Gunmetal Single Outlet Fire Hydrant Landing Valve (63mm)',
              hsnSac: '84818090',
              quantity: 4,
              unit: 'Nos',
              rate: 4950,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 19800,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 1782,
              sgstRate: 9,
              sgstAmount: 1782,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 23364
            },
            {
              id: 'item_m3',
              productId: 'serv_pump_testing',
              name: 'Fire Pump Performance Testing & Hydraulic Audit (Quarterly)',
              hsnSac: '998319',
              quantity: 1,
              unit: 'Job',
              rate: 4500,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 4500,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 405,
              sgstRate: 9,
              sgstAmount: 405,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 5310
            }
          ],
          subtotal: 39700,
          totalDiscount: 0,
          taxableAmount: 39700,
          cgstTotal: 3573,
          sgstTotal: 3573,
          igstTotal: 0,
          roundOff: 0,
          grandTotal: 46846,
          amountPaid: 0,
          balanceDue: 46846,
          status: 'unpaid',
          terms: defaultCompanySettings.termsAndConditions,
          notes: 'Payment expected by 25th August 2026.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'inv_2026_0003',
          invoiceNo: 'PFS/INV/2026/0003',
          invoiceDate: '2026-08-15',
          dueDate: '2026-08-30',
          customerId: 'cust_dynatech_mumbai',
          customerName: 'Dynatech Precision Tools Pvt. Ltd. (Interstate)',
          customerGstin: '27AABCD1122E1Z3',
          customerMobile: '9820088776',
          billingAddress: 'Plot W-45, MIDC Industrial Area, Rabale, Navi Mumbai, Maharashtra - 400701',
          customerState: 'Maharashtra',
          isInterstate: true,
          items: [
            {
              id: 'item_d1',
              productId: 'prod_abc_4kg',
              name: 'ABC Dry Powder Fire Extinguisher (4 Kg)',
              hsnSac: '84241000',
              quantity: 10,
              unit: 'Nos',
              rate: 1750,
              discountPercent: 5,
              discountAmount: 875,
              taxableAmount: 16625,
              gstRate: 18,
              cgstRate: 0,
              cgstAmount: 0,
              sgstRate: 0,
              sgstAmount: 0,
              igstRate: 18,
              igstAmount: 2992.5,
              totalAmount: 19617.5
            },
            {
              id: 'item_d2',
              productId: 'prod_co2_45kg',
              name: 'CO2 Fire Extinguisher (4.5 Kg)',
              hsnSac: '84241000',
              quantity: 6,
              unit: 'Nos',
              rate: 4200,
              discountPercent: 5,
              discountAmount: 1260,
              taxableAmount: 23940,
              gstRate: 18,
              cgstRate: 0,
              cgstAmount: 0,
              sgstRate: 0,
              sgstAmount: 0,
              igstRate: 18,
              igstAmount: 4309.2,
              totalAmount: 28249.2
            },
            {
              id: 'item_d3',
              productId: 'prod_emergency_light',
              name: 'LED Emergency Exit Light Signage with 2-Hour Battery Backup',
              hsnSac: '94054090',
              quantity: 5,
              unit: 'Nos',
              rate: 1150,
              discountPercent: 0,
              discountAmount: 0,
              taxableAmount: 5750,
              gstRate: 18,
              cgstRate: 0,
              cgstAmount: 0,
              sgstRate: 0,
              sgstAmount: 0,
              igstRate: 18,
              igstAmount: 1035,
              totalAmount: 6785
            }
          ],
          subtotal: 48500,
          totalDiscount: 2135,
          taxableAmount: 46315,
          cgstTotal: 0,
          sgstTotal: 0,
          igstTotal: 8336.7,
          roundOff: 0.3,
          grandTotal: 54652,
          amountPaid: 54652,
          balanceDue: 0,
          status: 'paid',
          terms: defaultCompanySettings.termsAndConditions,
          notes: 'Interstate supply to Navi Mumbai unit. Paid via RTGS.',
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.invoices.bulkPut(sampleInvoices);

      // Seed Quotations
      const sampleQuotations: Quotation[] = [
        {
          id: 'qtn_2026_0001',
          quotationNo: 'PFS/QTN/2026/0001',
          date: '2026-08-16',
          validUntil: '2026-09-15',
          customerId: 'cust_shree_ram',
          customerName: 'Shree Ram Chemical Industries Ltd.',
          customerGstin: '24AACCS5678B1Z2',
          customerMobile: '9825012345',
          billingAddress: 'Plot 108/A, Phase 1, GIDC Estate, Naroda, Ahmedabad',
          customerState: 'Gujarat',
          isInterstate: false,
          items: [
            {
              id: 'qitem_1',
              productId: 'prod_fire_pump_50hp',
              name: 'Main Electric Fire Hydrant Pump Set (50 HP - 2280 LPM)',
              hsnSac: '84137010',
              quantity: 1,
              unit: 'Set',
              rate: 165000,
              discountPercent: 5,
              discountAmount: 8250,
              taxableAmount: 156750,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 14107.5,
              sgstRate: 9,
              sgstAmount: 14107.5,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 184965
            },
            {
              id: 'qitem_2',
              productId: 'prod_dcp_50kg',
              name: 'DCP Fire Extinguisher 50 Kg Trolley Mounted',
              hsnSac: '84241000',
              quantity: 2,
              unit: 'Nos',
              rate: 16800,
              discountPercent: 5,
              discountAmount: 1680,
              taxableAmount: 31920,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 2872.8,
              sgstRate: 9,
              sgstAmount: 2872.8,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 37665.6
            }
          ],
          subtotal: 198600,
          totalDiscount: 9930,
          taxableAmount: 188670,
          cgstTotal: 16980.3,
          sgstTotal: 16980.3,
          igstTotal: 0,
          roundOff: 0.4,
          grandTotal: 222631,
          status: 'sent',
          terms: defaultCompanySettings.termsAndConditions,
          notes: 'Quotation submitted for new plant expansion unit. Follow-up scheduled next Monday.',
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.quotations.bulkPut(sampleQuotations);

      // Seed Payments
      const samplePayments: PaymentReceipt[] = [
        {
          id: 'rec_2026_0001',
          receiptNo: 'PFS/REC/2026/0001',
          paymentDate: '2026-08-05',
          customerId: 'cust_apex_hospital',
          customerName: 'Apex Super Specialty Hospital',
          invoiceId: 'inv_2026_0001',
          invoiceNo: 'PFS/INV/2026/0001',
          amount: 55106,
          paymentMethod: 'Bank Transfer',
          referenceNo: 'NEFT/SBI/098124912',
          notes: 'Full clearance payment against invoice PFS/INV/2026/0001',
          createdAt: now
        },
        {
          id: 'rec_2026_0002',
          receiptNo: 'PFS/REC/2026/0002',
          paymentDate: '2026-08-16',
          customerId: 'cust_dynatech_mumbai',
          customerName: 'Dynatech Precision Tools Pvt. Ltd.',
          invoiceId: 'inv_2026_0003',
          invoiceNo: 'PFS/INV/2026/0003',
          amount: 54652,
          paymentMethod: 'Bank Transfer',
          referenceNo: 'RTGS/HDFC/4491028',
          notes: 'Invoice PFS/INV/2026/0003 settled via RTGS.',
          createdAt: now
        }
      ];

      await db.payments.bulkPut(samplePayments);

      // Seed AMC Contracts
      const sampleAmcs: AmcContract[] = [
        {
          id: 'amc_2026_001',
          contractNo: 'PFS/AMC/2026/001',
          title: 'Comprehensive Fire Hydrant & Sprinkler AMC (4 Quarters)',
          customerId: 'cust_shivalik_heights',
          customerName: 'Shivalik Heights Commercial Co-Op Society',
          customerMobile: '9426055443',
          siteAddress: '100 Feet Anandnagar Road, Prahladnagar, Ahmedabad',
          startDate: '2026-04-01',
          endDate: '2027-03-31',
          contractAmount: 28000,
          gstRate: 18,
          gstAmount: 5040,
          totalAmount: 33040,
          paymentSchedule: '50% Advance, 50% after 2nd Quarter',
          serviceFrequency: 'Quarterly',
          status: 'Active',
          schedules: [
            {
              id: 'sch_q1',
              periodName: 'Quarter 1 (Apr - Jun)',
              scheduledDate: '2026-05-15',
              completedDate: '2026-05-14',
              status: 'Completed',
              notes: 'Pressure test 7.2 kg/cm² verified. All landing valves greased.'
            },
            {
              id: 'sch_q2',
              periodName: 'Quarter 2 (Jul - Sep)',
              scheduledDate: '2026-08-22',
              status: 'Pending',
              notes: 'Upcoming service scheduled for this weekend. Jockey pump cut-in test to be performed.'
            },
            {
              id: 'sch_q3',
              periodName: 'Quarter 3 (Oct - Dec)',
              scheduledDate: '2026-11-15',
              status: 'Pending'
            },
            {
              id: 'sch_q4',
              periodName: 'Quarter 4 (Jan - Mar)',
              scheduledDate: '2027-02-15',
              status: 'Pending'
            }
          ],
          notes: 'Contract includes emergency breakdown visit within 4 hours.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'amc_2026_002',
          contractNo: 'PFS/AMC/2026/002',
          title: 'Fire Alarm System & Smoke Detection Annual Maintenance',
          customerId: 'cust_apex_hospital',
          customerName: 'Apex Super Specialty Hospital',
          customerMobile: '9712345678',
          siteAddress: 'Opp. Parimal Garden, CG Road, Ellisbridge, Ahmedabad',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          contractAmount: 14500,
          gstRate: 18,
          gstAmount: 2610,
          totalAmount: 17110,
          paymentSchedule: '100% Advance',
          serviceFrequency: 'Quarterly',
          status: 'Active',
          schedules: [
            {
              id: 'sch_h_q1',
              periodName: 'Quarter 1 (Jan - Mar)',
              scheduledDate: '2026-02-20',
              completedDate: '2026-02-19',
              status: 'Completed'
            },
            {
              id: 'sch_h_q2',
              periodName: 'Quarter 2 (Apr - Jun)',
              scheduledDate: '2026-05-20',
              completedDate: '2026-05-18',
              status: 'Completed'
            },
            {
              id: 'sch_h_q3',
              periodName: 'Quarter 3 (Jul - Sep)',
              scheduledDate: '2026-08-28',
              status: 'Pending',
              notes: 'Check 4th floor ICU zone smoke sensors.'
            },
            {
              id: 'sch_h_q4',
              periodName: 'Quarter 4 (Oct - Dec)',
              scheduledDate: '2026-11-20',
              status: 'Pending'
            }
          ],
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.amcContracts.bulkPut(sampleAmcs);

      // Seed Equipment Records
      const sampleEquipment: EquipmentRecord[] = [
        {
          id: 'eq_001',
          customerId: 'cust_apex_hospital',
          customerName: 'Apex Super Specialty Hospital',
          equipmentType: 'Fire Extinguisher',
          brand: 'Patel Fire Safe',
          model: 'ABC-6',
          serialNo: 'PFS-FE-2024-0891',
          capacity: '6 Kg ABC Powder',
          location: 'Ground Floor Reception & Pharmacy',
          installationDate: '2024-06-10',
          lastServiceDate: '2026-08-01',
          nextServiceDate: '2027-07-31',
          condition: 'Good',
          notes: 'Pressure gauge green zone. Seal intact.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'eq_002',
          customerId: 'cust_apex_hospital',
          customerName: 'Apex Super Specialty Hospital',
          equipmentType: 'Fire Extinguisher',
          brand: 'Patel Fire Safe',
          model: 'CO2-4.5',
          serialNo: 'PFS-FE-2024-0892',
          capacity: '4.5 Kg CO2 Gas',
          location: '1st Floor Server Room & MRI Console',
          installationDate: '2024-06-10',
          lastServiceDate: '2026-08-01',
          nextServiceDate: '2027-07-31',
          condition: 'Good',
          notes: 'Weight checked: 14.8 Kg (tare + full charge). Horn horn OK.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'eq_003',
          customerId: 'cust_shivalik_heights',
          customerName: 'Shivalik Heights Commercial Co-Op Society',
          equipmentType: 'Fire Pump',
          brand: 'Kirloskar / Crompton',
          model: '50 HP Main Hydrant',
          serialNo: 'PMP-HYD-50HP-991',
          capacity: '2280 LPM @ 7.5 kg/cm²',
          location: 'Basement Underground Pump Room',
          installationDate: '2023-11-15',
          lastServiceDate: '2026-05-14',
          nextServiceDate: '2026-08-22',
          condition: 'Good',
          notes: 'Gland packing replaced in May 2026.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'eq_004',
          customerId: 'cust_maruti_textiles',
          customerName: 'Maruti Synthetic & Weaving Mills',
          equipmentType: 'Fire Hose Reel',
          brand: 'Patel Fire Solutions',
          model: 'HRD-30M',
          serialNo: 'HRD-2025-0124',
          capacity: '30 Mtrs 19mm Thermoplastic',
          location: 'Weaving Shed Pillar #7',
          installationDate: '2025-02-18',
          lastServiceDate: '2026-08-10',
          nextServiceDate: '2027-02-10',
          condition: 'Good',
          notes: 'Tested at 10 kg/cm² pressure without leakage.',
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.equipment.bulkPut(sampleEquipment);

      // Seed Service Report
      const sampleServiceReports: ServiceReport[] = [
        {
          id: 'sr_2026_001',
          reportNo: 'PFS/SR/2026/001',
          date: '2026-08-01',
          customerId: 'cust_apex_hospital',
          customerName: 'Apex Super Specialty Hospital',
          siteAddress: 'Opp. Parimal Garden, CG Road, Ellisbridge, Ahmedabad',
          technicianName: 'Hardik Patel (Lead Fire Engineer)',
          technicianPhone: '9876543210',
          equipmentType: 'Fire Extinguishers & Alarm Panel',
          equipmentSerialNo: 'PFS-FE-2024-0891, 0892',
          inspectionDetails: 'Inspected 12 nos ABC extinguishers, 4 nos CO2 extinguishers, and 8-zone Fire Alarm control panel.',
          findings: 'All pressure gauges in green operating zone. Alarm panel batteries tested healthy (26.4V DC standby).',
          defects: 'Two ABC extinguisher discharge hoses showed minor surface hardening due to sunlight exposure.',
          recommendedAction: 'Replaced 2 nos rubber discharge hoses with heavy-duty PVC reinforced hoses. All units tagged with renewed inspection stickers valid till July 2027.',
          materialsUsed: [
            { item: 'ABC 6kg Discharge Hose & Horn', qty: 2, rate: 180, amount: 360 },
            { item: 'Inspection Warranty Stickers (IS 2190)', qty: 16, rate: 15, amount: 240 }
          ],
          labourCharge: 1500,
          totalBillable: 2100,
          customerRemarks: 'Inspection completed satisfactorily with fire safety team.',
          technicianSignatureName: 'Hardik Patel',
          customerSignatureName: 'Vivek Sharma (Admin Manager)',
          status: 'Completed',
          createdAt: now
        }
      ];

      await db.serviceReports.bulkPut(sampleServiceReports);

      // Seed Pump Test Record
      const samplePumpTests: PumpTestRecord[] = [
        {
          id: 'pt_2026_001',
          testNo: 'PFS/PT/2026/001',
          date: '2026-08-10',
          customerId: 'cust_maruti_textiles',
          customerName: 'Maruti Synthetic & Weaving Mills',
          siteAddress: 'Survey No. 45, Bareja-Navagam Road, Bareja, Ahmedabad',
          pumpType: 'Main Electric Hydrant Pump',
          pumpNumber: 'Pump #1 (50 HP Kirloskar Motor)',
          suctionPressure: '1.2 kg/cm²',
          dischargePressure: '7.8 kg/cm²',
          shutOffPressure: '8.6 kg/cm²',
          flowRateGPM: '2280 LPM (600 GPM)',
          runningCondition: 'Smooth & Normal',
          electricalCondition: 'Normal Current & Starter OK',
          dieselCondition: 'Not Applicable',
          autoStartTestResult: 'Passed (Auto-Cycled OK)',
          remarks: 'Hydrant line pressurized to 7.8 kg/cm². When hydrant valve #4 opened, pump auto-started within 3 seconds. Pressure maintained steady.',
          technicianName: 'Hardik Patel',
          createdAt: now
        }
      ];

      await db.pumpTestReports.bulkPut(samplePumpTests);

      // Seed Sample Expenses
      const sampleExpenses: Expense[] = [
        {
          id: 'exp_001',
          date: '2026-08-03',
          category: 'Fuel',
          description: 'Service Van Diesel (Vatva to Naroda & Sanand sites)',
          amount: 2400,
          paymentMethod: 'UPI',
          notes: 'Van GJ-01-XX-4920',
          createdAt: now
        },
        {
          id: 'exp_002',
          date: '2026-08-08',
          category: 'Material',
          description: 'High Pressure Nitrogen Gas Cylinder Refill & O-rings',
          amount: 3800,
          paymentMethod: 'Bank Transfer',
          notes: 'Sardar Gas Agency',
          createdAt: now
        },
        {
          id: 'exp_003',
          date: '2026-08-12',
          category: 'Tools',
          description: 'Hydraulic Pressure Gauge 0-25 kg/cm² Calibration & Testing kit',
          amount: 1950,
          paymentMethod: 'UPI',
          notes: 'Precision Gauges Pvt. Ltd.',
          createdAt: now
        }
      ];

      await db.expenses.bulkPut(sampleExpenses);
    }

    // Seed Bill Customization Designs
    const customDesignsCount = await db.billCustomizations.count();
    if (customDesignsCount === 0) {
      await db.billCustomizations.bulkPut(INITIAL_CUSTOM_DESIGNS);
    }

    // Seed Document Design Mappings
    const mappingRecord = await db.documentDesignMapping.get('default');
    if (!mappingRecord) {
      await db.documentDesignMapping.put({
        id: 'default',
        ...DEFAULT_DOCUMENT_MAPPING
      });
    }

    // Seed Indian Public Holidays
    const holidaysCount = await db.holidays.count();
    if (holidaysCount === 0) {
      await db.holidays.bulkPut(DEFAULT_PUBLIC_HOLIDAYS_2026);
    }

    // Seed Payroll Configuration
    const payrollConfigRecord = await db.payrollConfig.get('default');
    if (!payrollConfigRecord) {
      await db.payrollConfig.put({
        id: 'default',
        ...DEFAULT_PAYROLL_CONFIG
      });
    }

    // Seed Sample Staff Members
    const staffCount = await db.staff.count();
    if (staffCount === 0) {
      const now = new Date().toISOString();
      const sampleStaff: StaffMember[] = [
        {
          id: 'stf_001',
          name: 'Rajeshbhai Solanki',
          designation: 'Senior Fire Safety Engineer',
          department: 'Technical AMC',
          phone: '98251 44520',
          email: 'rajesh.fire@patel.com',
          pan: 'ABCPS1234D',
          uan: '100987654321',
          esiIpNumber: '2419876543',
          joiningDate: '2023-04-01',
          basicSalary: 24000,
          da: 4000,
          hra: 6000,
          allowances: 2000,
          pfApplicable: true,
          esiApplicable: false, // Gross > 21k
          ptApplicable: true,
          gstApplicable: true,
          bankName: 'State Bank of India',
          accountNumber: '38192039401',
          ifsc: 'SBIN0001234',
          status: 'Active',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'stf_002',
          name: 'Pravin Patel',
          designation: 'Hydrant & Pump Technician',
          department: 'Field Operations',
          phone: '94998 12345',
          email: 'pravin.p@patel.com',
          pan: 'XYZPP5678K',
          uan: '100876543210',
          esiIpNumber: '2418765432',
          joiningDate: '2024-01-15',
          basicSalary: 12000,
          da: 2000,
          hra: 3000,
          allowances: 1500,
          pfApplicable: true,
          esiApplicable: true, // Gross = 18,500 <= 21k
          ptApplicable: true,
          gstApplicable: true,
          bankName: 'HDFC Bank',
          accountNumber: '50100234567890',
          ifsc: 'HDFC0000123',
          status: 'Active',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'stf_003',
          name: 'Amit Varma',
          designation: 'Extinguisher Refilling Assistant',
          department: 'Workshop',
          phone: '97234 56789',
          pan: 'DEFPA9012M',
          uan: '100765432109',
          esiIpNumber: '2417654321',
          joiningDate: '2024-06-01',
          basicSalary: 10000,
          da: 1500,
          hra: 2500,
          allowances: 1000,
          pfApplicable: true,
          esiApplicable: true, // Gross = 15,000 <= 21k
          ptApplicable: true,
          gstApplicable: false,
          bankName: 'Bank of Baroda',
          accountNumber: '01230100045678',
          ifsc: 'BARB0VATVAA',
          status: 'Active',
          createdAt: now,
          updatedAt: now
        }
      ];

      await db.staff.bulkPut(sampleStaff);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

