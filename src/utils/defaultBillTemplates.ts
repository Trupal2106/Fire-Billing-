import {
  BillCustomizationSettings,
  TemplateId,
  InvoiceColumnConfig,
  BillColors,
  DocumentDesignMapping
} from '../types/billCustomization';
import { Invoice, CompanySettings, Customer } from '../types';

export const DEFAULT_COLUMNS: InvoiceColumnConfig[] = [
  { id: 'item', label: 'Item & Description', visible: true, widthPercent: 32, align: 'left' },
  { id: 'hsnSac', label: 'HSN / SAC', visible: true, widthPercent: 12, align: 'center' },
  { id: 'quantity', label: 'Qty', visible: true, widthPercent: 8, align: 'center' },
  { id: 'unit', label: 'Unit', visible: true, widthPercent: 8, align: 'center' },
  { id: 'rate', label: 'Rate (₹)', visible: true, widthPercent: 12, align: 'right' },
  { id: 'discount', label: 'Disc %', visible: false, widthPercent: 8, align: 'right' },
  { id: 'taxableAmount', label: 'Taxable Val', visible: false, widthPercent: 12, align: 'right' },
  { id: 'gstRate', label: 'GST %', visible: true, widthPercent: 8, align: 'center' },
  { id: 'cgst', label: 'CGST', visible: false, widthPercent: 10, align: 'right' },
  { id: 'sgst', label: 'SGST', visible: false, widthPercent: 10, align: 'right' },
  { id: 'igst', label: 'IGST', visible: false, widthPercent: 10, align: 'right' },
  { id: 'taxAmount', label: 'Total Tax', visible: false, widthPercent: 10, align: 'right' },
  { id: 'totalAmount', label: 'Amount (₹)', visible: true, widthPercent: 15, align: 'right' }
];

export const PRESET_COLOR_PALETTES: { name: string; colors: BillColors }[] = [
  {
    name: 'Fire Red (Default)',
    colors: {
      primary: '#b91c1c',
      secondary: '#1e293b',
      headerBg: '#fef2f2',
      headerText: '#991b1b',
      tableHeaderBg: '#f8fafc',
      tableHeaderText: '#0f172a',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      accentColor: '#dc2626',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Professional Blue',
    colors: {
      primary: '#1d4ed8',
      secondary: '#0f172a',
      headerBg: '#eff6ff',
      headerText: '#1e40af',
      tableHeaderBg: '#f1f5f9',
      tableHeaderText: '#0f172a',
      textColor: '#0f172a',
      borderColor: '#cbd5e1',
      accentColor: '#2563eb',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Corporate Navy',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      headerBg: '#0f172a',
      headerText: '#ffffff',
      tableHeaderBg: '#1e293b',
      tableHeaderText: '#ffffff',
      textColor: '#0f172a',
      borderColor: '#cbd5e1',
      accentColor: '#38bdf8',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Safety Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#1c1917',
      headerBg: '#fff7ed',
      headerText: '#c2410c',
      tableHeaderBg: '#f5f5f4',
      tableHeaderText: '#1c1917',
      textColor: '#1c1917',
      borderColor: '#e7e5e4',
      accentColor: '#f97316',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Emerald Green',
    colors: {
      primary: '#047857',
      secondary: '#064e3b',
      headerBg: '#ecfdf5',
      headerText: '#065f46',
      tableHeaderBg: '#f0fdf4',
      tableHeaderText: '#0f172a',
      textColor: '#0f172a',
      borderColor: '#d1fae5',
      accentColor: '#059669',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Dark Slate / Grey',
    colors: {
      primary: '#334155',
      secondary: '#0f172a',
      headerBg: '#f8fafc',
      headerText: '#1e293b',
      tableHeaderBg: '#f1f5f9',
      tableHeaderText: '#0f172a',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      accentColor: '#475569',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Monochrome (Black & White)',
    colors: {
      primary: '#000000',
      secondary: '#27272a',
      headerBg: '#ffffff',
      headerText: '#000000',
      tableHeaderBg: '#f4f4f5',
      tableHeaderText: '#000000',
      textColor: '#000000',
      borderColor: '#d4d4d8',
      accentColor: '#000000',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Royal Maroon',
    colors: {
      primary: '#881337',
      secondary: '#4c0519',
      headerBg: '#fff1f2',
      headerText: '#881337',
      tableHeaderBg: '#ffe4e6',
      tableHeaderText: '#4c0519',
      textColor: '#0f172a',
      borderColor: '#fecdd3',
      accentColor: '#be123c',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Royal Blue',
    colors: {
      primary: '#2563eb',
      secondary: '#1e3a8a',
      headerBg: '#1e40af',
      headerText: '#ffffff',
      tableHeaderBg: '#3b82f6',
      tableHeaderText: '#ffffff',
      textColor: '#0f172a',
      borderColor: '#bfdbfe',
      accentColor: '#60a5fa',
      pageBackground: '#ffffff'
    }
  },
  {
    name: 'Modern Violet',
    colors: {
      primary: '#7c3aed',
      secondary: '#4c1d95',
      headerBg: '#f5f3ff',
      headerText: '#6d28d9',
      tableHeaderBg: '#ede9fe',
      tableHeaderText: '#0f172a',
      textColor: '#0f172a',
      borderColor: '#ddd6fe',
      accentColor: '#8b5cf6',
      pageBackground: '#ffffff'
    }
  }
];

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  themeColor: string;
}

export const TEMPLATE_METADATA_LIST: TemplateMetadata[] = [
  {
    id: 'classic_gst_ref',
    name: 'Classic GST — Reference Style',
    badge: 'Official Reference',
    description: 'Exact match to standard Indian GST Tax Invoices with double borders, official metadata bar, and side-by-side Bill To / Ship To.',
    features: ['Original For Recipient Badge', 'Side-by-side Billing & Shipping', 'Full HSN/SAC table', 'Dynamic UPI QR in Bank block', 'Authorized Signatory Stamp'],
    themeColor: '#b91c1c'
  },
  {
    id: 'modern_clean',
    name: 'Modern Clean',
    badge: 'Popular',
    description: 'A contemporary aesthetic with smooth pill tags, colored ribbon borders, rounded stat boxes, and modern typography.',
    features: ['Modern Pill Badges', 'Minimalist Line Dividers', 'Rounded Stat Badges', 'Card-style Bank & QR', 'Subtle Row Hover Effects'],
    themeColor: '#2563eb'
  },
  {
    id: 'corporate_navy',
    name: 'Corporate Navy',
    badge: 'Enterprise',
    description: 'High-contrast corporate design with prominent dark top banner, structured company info, and clear payment summary grids.',
    features: ['Solid Navy Banner Header', 'Inverted Header Typography', 'High Contrast Data Grid', 'Highlighted Balance Due Box'],
    themeColor: '#0f172a'
  },
  {
    id: 'minimal_slate',
    name: 'Minimal Slate',
    badge: 'Ink Saver',
    description: 'Crisp, ultra-clean layout with refined hairline rules and maximum white space. Highly ink-efficient for standard laser printing.',
    features: ['Ink-efficient Monochrome/Slate', 'Hairline Clean Dividers', 'Uncluttered Item List', 'Compact Footer'],
    themeColor: '#475569'
  },
  {
    id: 'professional_blue',
    name: 'Professional Blue',
    badge: 'High Impact',
    description: 'Distinctive royal blue header and accents with structured tax breakdown and verified security stamps.',
    features: ['Blue Accent Headers', 'Boxed Totals Callout', 'Prominent Bank Wire Section', 'Quick Scan UPI Frame'],
    themeColor: '#1d4ed8'
  },
  {
    id: 'bold_header',
    name: 'Bold Header',
    badge: 'Modern',
    description: 'Strong, solid primary color header banner across the entire invoice top with high-contrast text and crisp layout.',
    features: ['Full Width Colored Hero Header', 'Clean White Body Card', 'High-Contrast Tax Cells', 'Bold Totals Callout'],
    themeColor: '#dc2626'
  },
  {
    id: 'compact_billing',
    name: 'Compact Billing',
    badge: 'Dense Items',
    description: 'Optimized high-density grid engineered for long itemized invoices, service lists, and material bills without multi-page spillovers.',
    features: ['Space-optimized Row Heights', 'Condensed Font Scale', 'Multi-item single page fit', 'Streamlined Tax Footer'],
    themeColor: '#0284c7'
  },
  {
    id: 'elegant_luxury',
    name: 'Elegant Luxury',
    badge: 'Prestige',
    description: 'Refined serif display accents, double-line decorative framing, and balanced proportions for high-value client presentations.',
    features: ['Double-line Classic Borders', 'Serif Display Accents', 'Centered Crest / Logo', 'Refined Signature Space'],
    themeColor: '#78350f'
  },
  {
    id: 'business_plus',
    name: 'Business Plus',
    badge: 'Detailed',
    description: 'Enterprise billing template featuring dedicated purchase order, vehicle dispatch, place of supply, and detailed tax breakdown boxes.',
    features: ['Dispatch & PO Details Box', 'Detailed CGST/SGST/IGST Grid', 'Split Bank & UPI Blocks', 'Computer Generated Seal'],
    themeColor: '#4338ca'
  },
  {
    id: 'fire_safety_pro',
    name: 'Fire Safety Professional',
    badge: 'Fire Industry',
    description: 'Tailor-made for fire protection engineers, hydrant contractors, extinguisher refilling services, and AMC providers.',
    features: ['Fire Safety Shield Motif', 'IS 2190 Standard Warranty Terms', 'Hydrant & Extinguisher Tag Notice', 'Emergency Inspection Ready'],
    themeColor: '#991b1b'
  }
];

export function createDefaultBillSettings(templateId: TemplateId = 'classic_gst_ref', name: string = 'Standard Invoice Design'): BillCustomizationSettings {
  const palette = PRESET_COLOR_PALETTES.find(p => {
    if (templateId === 'corporate_navy') return p.name.includes('Corporate Navy');
    if (templateId === 'professional_blue') return p.name.includes('Professional Blue');
    if (templateId === 'minimal_slate') return p.name.includes('Slate');
    if (templateId === 'safety_orange' as any) return p.name.includes('Orange');
    return p.name.includes('Fire Red');
  }) || PRESET_COLOR_PALETTES[0];

  return {
    id: `design_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    description: 'Default GST compliant tax invoice design',
    isDefault: true,
    documentType: 'all',
    templateId,
    colors: { ...palette.colors },
    columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
    header: {
      titleText: 'TAX INVOICE',
      showTitle: true,
      showRecipientBadge: true,
      recipientBadgeText: 'ORIGINAL FOR RECIPIENT',
      showInvoiceNo: true,
      showInvoiceDate: true,
      showDueDate: true,
      showGstin: true,
      showPan: true,
      showMsme: true,
      msmeNumber: 'UDYAM-GJ-01-0609442',
      showEmail: true,
      showPhone: true,
      showWebsite: true,
      alignment: 'left'
    },
    logo: {
      showLogo: true,
      size: 'medium',
      position: 'top_left',
      showOnSecondPage: true
    },
    customer: {
      showBillTo: true,
      showShipTo: true,
      layout: 'side_by_side',
      showCustomerGstin: true,
      showCustomerPan: true,
      showCustomerMobile: true,
      showCustomerEmail: true,
      showBillingAddress: true,
      showShippingAddress: true,
      showPlaceOfSupply: true
    },
    bank: {
      showBankDetails: true,
      position: 'bottom_left',
      showBankName: true,
      showAccountName: true,
      showAccountNumber: true,
      showIfsc: true,
      showBranch: true,
      showAccountType: true,
      customAccountType: 'Current Account'
    },
    qr: {
      showQr: true,
      amountType: 'outstanding_balance',
      size: 'medium',
      position: 'bottom_left',
      showUpiId: true,
      showInstructions: true,
      customLabel: 'Scan & Pay with any UPI App'
    },
    signature: {
      showSignature: true,
      size: 'medium',
      position: 'bottom_right',
      signatoryText: 'AUTHORISED SIGNATORY FOR',
      showStampSeal: true
    },
    gst: {
      showTaxableAmount: true,
      showCgst: true,
      showSgst: true,
      showIgst: true,
      showGstTotal: true,
      showRoundOff: true,
      showGrandTotal: true,
      compactTaxSummary: false
    },
    payment: {
      showPaymentSummary: true,
      showReceivedAmount: true,
      showBalanceDue: true,
      showPaymentStatus: true,
      showPaymentMethod: true,
      showPaymentDate: true,
      showTransactionId: true
    },
    terms: {
      showTerms: true,
      heading: 'Terms & Conditions:',
      termsList: [
        '1. Goods once sold will not be taken back or exchanged unless under warranty terms.',
        '2. Fire Extinguishers refills carry 1-year shelf life warranty under IS 2190 standards.',
        '3. Payment is due within 15 days of invoice date. 18% p.a. interest charged on delayed payments.',
        '4. All disputes subject to Ahmedabad jurisdiction only.',
        '5. Warranty void if equipment seal is broken or tampered by unauthorized technician.'
      ]
    },
    amountInWords: {
      showAmountInWords: true,
      position: 'below_total'
    },
    footer: {
      showFooter: true,
      showCompanyName: true,
      showPhone: true,
      showEmail: true,
      showGstin: true,
      showWebsite: true,
      showComputerGeneratedNote: true,
      customFooterText: 'Thank you for choosing Patel Electricals & Fire System Solutions! For 24x7 Emergency Assistance, Call +91 98765 43210'
    },
    page: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: 'normal',
      fontFamily: 'sans',
      fontSize: 'regular',
      tableStyle: 'classic_lines',
      rowSpacing: 'normal'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export const INITIAL_CUSTOM_DESIGNS: BillCustomizationSettings[] = [
  {
    ...createDefaultBillSettings('classic_gst_ref', 'Classic GST — Reference Style'),
    id: 'design_classic_ref',
    isDefault: true,
    documentType: 'all'
  },
  {
    ...createDefaultBillSettings('modern_clean', 'Modern Clean Style'),
    id: 'design_modern_clean',
    isDefault: false,
    documentType: 'quotation',
    colors: { ...PRESET_COLOR_PALETTES[1].colors }
  },
  {
    ...createDefaultBillSettings('corporate_navy', 'Corporate Navy'),
    id: 'design_corp_navy',
    isDefault: false,
    documentType: 'amc',
    colors: { ...PRESET_COLOR_PALETTES[2].colors }
  },
  {
    ...createDefaultBillSettings('fire_safety_pro', 'Fire Safety Professional'),
    id: 'design_fire_pro',
    isDefault: false,
    documentType: 'service_report',
    colors: { ...PRESET_COLOR_PALETTES[0].colors }
  }
];

export const DEFAULT_DOCUMENT_MAPPING: DocumentDesignMapping = {
  id: 'default_mapping',
  invoiceDesignId: 'design_classic_ref',
  quotationDesignId: 'design_classic_ref',
  receiptDesignId: 'design_classic_ref',
  paymentReceiptDesignId: 'design_classic_ref',
  amcDesignId: 'design_classic_ref',
  serviceReportDesignId: 'design_classic_ref',
  updatedAt: new Date().toISOString()
};

// Sample Invoice for Live Preview in Customization Studio
export const SAMPLE_PREVIEW_INVOICE: Invoice = {
  id: 'inv_sample_live_preview',
  invoiceNo: 'PFS/INV/2026/00142',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  customerId: 'cust_sample_reliance',
  customerName: 'RELIANCE INDUSTRIES LIMITED (NARODA COMPLEX)',
  customerGstin: '24AAACR1234F1Z5',
  customerMobile: '9825012345',
  billingAddress: 'Admin Block, Gate No. 2, Naroda Industrial Area, Ahmedabad, Gujarat - 382330',
  shippingAddress: 'Plant No. 4 Fire & Safety Division, Naroda Complex, Ahmedabad, Gujarat - 382330',
  customerState: 'Gujarat',
  isInterstate: false,
  items: [
    {
      id: 'item_1',
      name: 'ABC Stored Pressure Fire Extinguisher (6 Kg)',
      description: 'IS:15683 certified with initial gas cartridge, wall bracket & inspection tag',
      hsnSac: '84241000',
      quantity: 12,
      unit: 'Nos',
      rate: 2450,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 29400,
      gstRate: 18,
      cgstRate: 9,
      cgstAmount: 2646,
      sgstRate: 9,
      sgstAmount: 2646,
      igstRate: 0,
      igstAmount: 0,
      totalAmount: 34692
    },
    {
      id: 'item_2',
      name: 'CO2 Type Fire Extinguisher (4.5 Kg)',
      description: 'Seamless carbon steel cylinder with high-pressure discharge horn (IS:15683)',
      hsnSac: '84241000',
      quantity: 4,
      unit: 'Nos',
      rate: 4200,
      discountPercent: 5,
      discountAmount: 840,
      taxableAmount: 15960,
      gstRate: 18,
      cgstRate: 9,
      cgstAmount: 1436.4,
      sgstRate: 9,
      sgstAmount: 1436.4,
      igstRate: 0,
      igstAmount: 0,
      totalAmount: 18832.8
    },
    {
      id: 'item_3',
      name: 'Fire Hose Reel Drum (30 Mtr Thermoplastic Hose)',
      description: 'Swinging type with SS shut-off nozzle (IS:884 compliance)',
      hsnSac: '84249000',
      quantity: 2,
      unit: 'Set',
      rate: 6800,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 13600,
      gstRate: 18,
      cgstRate: 9,
      cgstAmount: 1224,
      sgstRate: 9,
      sgstAmount: 1224,
      igstRate: 0,
      igstAmount: 0,
      totalAmount: 16048
    },
    {
      id: 'item_4',
      name: 'Annual Fire Safety Hydraulic Testing & Refilling Service',
      description: 'Complete discharge, nitrogen pressure test and anti-corrosion coating',
      hsnSac: '998719',
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
  subtotal: 64300,
  totalDiscount: 840,
  taxableAmount: 63460,
  cgstTotal: 5711.4,
  sgstTotal: 5711.4,
  igstTotal: 0,
  roundOff: 0.2,
  grandTotal: 74883,
  amountPaid: 25000,
  balanceDue: 49883,
  status: 'partially_paid',
  terms: 'Payment due within 15 days.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const SAMPLE_PREVIEW_CUSTOMER: Customer = {
  id: 'cust_sample_reliance',
  name: 'Reliance Industries Limited (Naroda Complex)',
  companyName: 'Reliance Industries Limited',
  contactPerson: 'Mr. Arvind Sharma (Safety Head)',
  mobile: '9825012345',
  email: 'safety.naroda@ril.com',
  gstin: '24AAACR1234F1Z5',
  pan: 'AAACR1234F',
  billingAddress: 'Admin Block, Gate No. 2, Naroda Industrial Area, Ahmedabad',
  shippingAddress: 'Plant No. 4 Fire & Safety Division, Naroda Complex, Ahmedabad',
  city: 'Ahmedabad',
  state: 'Gujarat',
  stateCode: '24',
  pin: '382330',
  openingBalance: 0,
  currentOutstanding: 49883,
  totalSales: 74883,
  totalPaid: 25000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
