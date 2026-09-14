export type TemplateId =
  | 'classic_gst_ref'
  | 'modern_clean'
  | 'corporate_navy'
  | 'minimal_slate'
  | 'professional_blue'
  | 'bold_header'
  | 'compact_billing'
  | 'elegant_luxury'
  | 'business_plus'
  | 'fire_safety_pro';

export type InvoiceColumnKey =
  | 'item'
  | 'description'
  | 'hsnSac'
  | 'quantity'
  | 'unit'
  | 'rate'
  | 'discount'
  | 'taxableAmount'
  | 'gstRate'
  | 'cgst'
  | 'sgst'
  | 'igst'
  | 'taxAmount'
  | 'totalAmount';

export interface InvoiceColumnConfig {
  id: InvoiceColumnKey;
  label: string;
  visible: boolean;
  widthPercent?: number;
  align?: 'left' | 'center' | 'right';
}

export interface BillColors {
  primary: string; // Main brand color (e.g. #b91c1c)
  secondary: string; // Secondary accents (e.g. #1e293b)
  headerBg: string; // Header background
  headerText: string; // Header text color
  tableHeaderBg: string; // Table header background
  tableHeaderText: string; // Table header text
  textColor: string; // General text color (#0f172a)
  borderColor: string; // Border color (#cbd5e1)
  accentColor: string; // Highlights & badge color
  pageBackground: string; // Background canvas (#ffffff)
}

export interface HeaderCustomization {
  titleText: string;
  showTitle: boolean;
  showRecipientBadge: boolean;
  recipientBadgeText: string;
  showInvoiceNo: boolean;
  showInvoiceDate: boolean;
  showDueDate: boolean;
  showGstin: boolean;
  showPan: boolean;
  showMsme: boolean;
  msmeNumber: string;
  showEmail: boolean;
  showPhone: boolean;
  showWebsite: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface LogoCustomization {
  showLogo: boolean;
  logoUrl?: string;
  size: 'small' | 'medium' | 'large';
  position: 'top_left' | 'top_center' | 'top_right';
  showOnSecondPage?: boolean;
}

export interface CustomerSectionCustomization {
  showBillTo: boolean;
  showShipTo: boolean;
  layout: 'side_by_side' | 'stacked';
  showCustomerGstin: boolean;
  showCustomerPan: boolean;
  showCustomerMobile: boolean;
  showCustomerEmail: boolean;
  showBillingAddress: boolean;
  showShippingAddress: boolean;
  showPlaceOfSupply: boolean;
}

export interface BankDetailsCustomization {
  showBankDetails: boolean;
  position: 'bottom_left' | 'bottom_right' | 'full_width';
  showBankName: boolean;
  showAccountName: boolean;
  showAccountNumber: boolean;
  showIfsc: boolean;
  showBranch: boolean;
  showAccountType: boolean;
  customAccountType?: string;
}

export interface QrCodeCustomization {
  showQr: boolean;
  amountType: 'outstanding_balance' | 'full_amount' | 'custom';
  customAmount?: number;
  size: 'small' | 'medium' | 'large';
  position: 'bottom_left' | 'bottom_center' | 'bottom_right' | 'payment_section';
  showUpiId: boolean;
  showInstructions: boolean;
  customLabel?: string;
}

export interface SignatureCustomization {
  showSignature: boolean;
  signatureImage?: string; // base64 or url
  size: 'small' | 'medium' | 'large';
  position: 'bottom_right' | 'bottom_center' | 'bottom_left';
  signatoryText: string; // e.g. "AUTHORISED SIGNATORY FOR"
  companyName?: string;
  showStampSeal: boolean;
}

export interface GstSectionCustomization {
  showTaxableAmount: boolean;
  showCgst: boolean;
  showSgst: boolean;
  showIgst: boolean;
  showGstTotal: boolean;
  showRoundOff: boolean;
  showGrandTotal: boolean;
  compactTaxSummary: boolean;
}

export interface PaymentSectionCustomization {
  showPaymentSummary: boolean;
  showReceivedAmount: boolean;
  showBalanceDue: boolean;
  showPaymentStatus: boolean;
  showPaymentMethod: boolean;
  showPaymentDate: boolean;
  showTransactionId: boolean;
}

export interface TermsCustomization {
  showTerms: boolean;
  termsList: string[];
  heading: string;
}

export interface AmountInWordsCustomization {
  showAmountInWords: boolean;
  position: 'below_total' | 'bottom_section';
}

export interface FooterCustomization {
  showFooter: boolean;
  showCompanyName: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showGstin: boolean;
  showWebsite: boolean;
  showComputerGeneratedNote: boolean;
  customFooterText: string;
}

export interface PageSettingsCustomization {
  pageSize: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: 'small' | 'normal' | 'large';
  fontFamily: 'sans' | 'serif' | 'mono' | 'helvetica' | 'roboto' | 'times';
  fontSize: 'compact' | 'regular' | 'large';
  tableStyle: 'classic_lines' | 'minimal_lines' | 'grey_header' | 'colored_header' | 'boxed' | 'no_borders';
  rowSpacing: 'compact' | 'normal' | 'spacious';
}

export interface BillCustomizationSettings {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  documentType: 'all' | 'invoice' | 'quotation' | 'amc' | 'receipt' | 'service_report';
  templateId: TemplateId;
  colors: BillColors;
  columns: InvoiceColumnConfig[];
  header: HeaderCustomization;
  logo: LogoCustomization;
  customer: CustomerSectionCustomization;
  bank: BankDetailsCustomization;
  qr: QrCodeCustomization;
  signature: SignatureCustomization;
  gst: GstSectionCustomization;
  payment: PaymentSectionCustomization;
  terms: TermsCustomization;
  amountInWords: AmountInWordsCustomization;
  footer: FooterCustomization;
  page: PageSettingsCustomization;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDesignMapping {
  id: string;
  invoiceDesignId: string;
  quotationDesignId: string;
  receiptDesignId?: string;
  paymentReceiptDesignId?: string;
  amcDesignId: string;
  serviceReportDesignId: string;
  updatedAt?: string;
}
