import * as XLSX from 'xlsx';
import {
  Invoice,
  Customer,
  PaymentReceipt,
  ProductItem,
  AmcContract,
  Expense,
  Purchase,
  Quotation,
  ServiceReport
} from '../types';
import { formatDate } from './formatters';

export function exportInvoicesToExcel(invoices: Invoice[], fileName: string = 'Invoices_Report.xlsx') {
  // Flatten invoice line items so each item has a detailed row with invoice header meta
  const rows: any[] = [];

  invoices.forEach((inv) => {
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach((item, idx) => {
        rows.push({
          'Invoice Number': inv.invoiceNo,
          'Invoice Date': formatDate(inv.invoiceDate),
          'Due Date': formatDate(inv.dueDate),
          'Customer Name': inv.customerName,
          'Customer GSTIN': inv.customerGstin || 'Unregistered',
          'Customer Phone': inv.customerMobile || '-',
          'Billing Address': inv.billingAddress,
          'State': inv.customerState,
          'Supply Type': inv.isInterstate ? 'Inter-state (IGST)' : 'Intra-state (CGST+SGST)',
          'Item / Service': item.name,
          'HSN/SAC': item.hsnSac || '-',
          'Quantity': item.quantity,
          'Unit': item.unit,
          'Rate (₹)': item.rate,
          'Discount (%)': item.discountPercent || 0,
          'Discount (₹)': item.discountAmount || 0,
          'Taxable Amount (₹)': item.taxableAmount,
          'CGST Rate (%)': item.cgstRate || 0,
          'CGST (₹)': item.cgstAmount || 0,
          'SGST Rate (%)': item.sgstRate || 0,
          'SGST (₹)': item.sgstAmount || 0,
          'IGST Rate (%)': item.igstRate || 0,
          'IGST (₹)': item.igstAmount || 0,
          'Item Total (₹)': item.totalAmount,
          'Invoice Total (₹)': idx === 0 ? inv.grandTotal : '',
          'Paid Amount (₹)': idx === 0 ? inv.amountPaid : '',
          'Balance Due (₹)': idx === 0 ? inv.balanceDue : '',
          'Payment Status': idx === 0 ? inv.status.toUpperCase() : '',
          'Terms / Notes': inv.notes || ''
        });
      });
    } else {
      rows.push({
        'Invoice Number': inv.invoiceNo,
        'Invoice Date': formatDate(inv.invoiceDate),
        'Due Date': formatDate(inv.dueDate),
        'Customer Name': inv.customerName,
        'Customer GSTIN': inv.customerGstin || 'Unregistered',
        'Customer Phone': inv.customerMobile || '-',
        'Billing Address': inv.billingAddress,
        'State': inv.customerState,
        'Supply Type': inv.isInterstate ? 'Inter-state (IGST)' : 'Intra-state (CGST+SGST)',
        'Item / Service': 'N/A',
        'HSN/SAC': '-',
        'Quantity': 0,
        'Unit': '-',
        'Rate (₹)': 0,
        'Discount (%)': 0,
        'Discount (₹)': 0,
        'Taxable Amount (₹)': inv.taxableAmount,
        'CGST Rate (%)': 0,
        'CGST (₹)': inv.cgstTotal,
        'SGST Rate (%)': 0,
        'SGST (₹)': inv.sgstTotal,
        'IGST Rate (%)': 0,
        'IGST (₹)': inv.igstTotal,
        'Item Total (₹)': inv.grandTotal,
        'Invoice Total (₹)': inv.grandTotal,
        'Paid Amount (₹)': inv.amountPaid,
        'Balance Due (₹)': inv.balanceDue,
        'Payment Status': inv.status.toUpperCase(),
        'Terms / Notes': inv.notes || ''
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
  XLSX.writeFile(workbook, fileName);
}

export function exportQuotationsToExcel(quotations: Quotation[], fileName: string = 'Quotations_List.xlsx') {
  const rows: any[] = [];

  quotations.forEach((quot) => {
    if (quot.items && quot.items.length > 0) {
      quot.items.forEach((item, idx) => {
        rows.push({
          'Quotation Number': quot.quotationNo,
          'Quotation Date': formatDate(quot.date),
          'Valid Until': formatDate(quot.validUntil),
          'Customer Name': quot.customerName,
          'Customer GSTIN': quot.customerGstin || 'Unregistered',
          'Customer Phone': quot.customerMobile || '-',
          'Item / Service': item.name,
          'HSN/SAC': item.hsnSac || '-',
          'Quantity': item.quantity,
          'Unit': item.unit,
          'Rate (₹)': item.rate,
          'Discount (%)': item.discountPercent || 0,
          'Taxable Amount (₹)': item.taxableAmount,
          'GST Rate (%)': (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0),
          'Item Total (₹)': item.totalAmount,
          'Grand Total (₹)': idx === 0 ? quot.grandTotal : '',
          'Status': idx === 0 ? quot.status.toUpperCase() : '',
          'Notes': quot.notes || ''
        });
      });
    } else {
      rows.push({
        'Quotation Number': quot.quotationNo,
        'Quotation Date': formatDate(quot.date),
        'Valid Until': formatDate(quot.validUntil),
        'Customer Name': quot.customerName,
        'Customer GSTIN': quot.customerGstin || 'Unregistered',
        'Customer Phone': quot.customerMobile || '-',
        'Item / Service': '-',
        'HSN/SAC': '-',
        'Quantity': 0,
        'Unit': '-',
        'Rate (₹)': 0,
        'Discount (%)': 0,
        'Taxable Amount (₹)': quot.taxableAmount,
        'GST Rate (%)': 0,
        'Item Total (₹)': quot.grandTotal,
        'Grand Total (₹)': quot.grandTotal,
        'Status': quot.status.toUpperCase(),
        'Notes': quot.notes || ''
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotations');
  XLSX.writeFile(workbook, fileName);
}

export function exportCustomersToExcel(customers: Customer[], fileName: string = 'Customers_List.xlsx') {
  const rows = customers.map((c) => ({
    'Customer / Company Name': c.name,
    'Contact Person': c.contactPerson || '-',
    'Mobile Number': c.mobile,
    'Alternate Mobile': c.alternateMobile || '-',
    'Email Address': c.email || '-',
    'GSTIN': c.gstin || 'URP',
    'PAN': c.pan || '-',
    'Billing Address': c.billingAddress,
    'City': c.city,
    'State': c.state,
    'PIN Code': c.pin,
    'Opening Balance (₹)': c.openingBalance || 0,
    'Current Outstanding (₹)': c.currentOutstanding || 0,
    'Total Sales (₹)': c.totalSales || 0,
    'Total Paid (₹)': c.totalPaid || 0,
    'Notes': c.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  XLSX.writeFile(workbook, fileName);
}

export function exportPaymentsToExcel(payments: PaymentReceipt[], fileName: string = 'Payments_Receipts.xlsx') {
  const rows = payments.map((p) => ({
    'Receipt No': p.receiptNo,
    'Payment Date': formatDate(p.paymentDate),
    'Customer Name': p.customerName,
    'Invoice No Reference': p.invoiceNo || 'On Account / Advance',
    'Amount (₹)': p.amount,
    'Payment Mode': p.paymentMethod,
    'Reference / UTR / Cheque No': p.referenceNo || '-',
    'Notes': p.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
  XLSX.writeFile(workbook, fileName);
}

export function exportProductsToExcel(products: ProductItem[], fileName: string = 'Products_Inventory.xlsx') {
  const rows = products.map((p) => ({
    'Item Name': p.name,
    'Type': p.type.toUpperCase(),
    'Category': p.category || '-',
    'HSN / SAC Code': p.hsnSac || '-',
    'Unit of Measure': p.unit,
    'Selling Price (₹)': p.sellingPrice,
    'Purchase Price (₹)': p.purchasePrice,
    'GST Rate (%)': p.gstRate,
    'Opening Stock': p.openingStock,
    'Current Stock': p.currentStock,
    'Min Reorder Stock': p.minStock,
    'Stock Status': p.currentStock <= p.minStock ? 'LOW STOCK' : 'IN STOCK',
    'Description': p.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Catalog');
  XLSX.writeFile(workbook, fileName);
}

export function exportAmcToExcel(amcs: AmcContract[], fileName: string = 'AMC_Contracts.xlsx') {
  const rows = amcs.map((a) => ({
    'Contract No': a.contractNo,
    'Contract Title': a.title,
    'Customer Name': a.customerName,
    'Customer Phone': a.customerMobile || '-',
    'Site Location': a.siteAddress,
    'Start Date': formatDate(a.startDate),
    'End Date': formatDate(a.endDate),
    'Contract Value (₹)': a.contractAmount,
    'GST Amount (₹)': a.gstAmount,
    'Total Value (₹)': a.totalAmount,
    'Service Frequency': a.serviceFrequency,
    'Total Visits': a.schedules.length,
    'Completed Visits': a.schedules.filter((s) => s.status === 'Completed').length,
    'Pending Visits': a.schedules.filter((s) => s.status !== 'Completed').length,
    'Status': a.status.toUpperCase(),
    'Notes': a.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'AMC_Contracts');
  XLSX.writeFile(workbook, fileName);
}

export function exportExpensesToExcel(expenses: Expense[], fileName: string = 'Expenses_Log.xlsx') {
  const rows = expenses.map((e) => ({
    'Date': formatDate(e.date || e.expenseDate || ''),
    'Category': e.category,
    'Title / Description': e.title || e.description || '-',
    'Amount (₹)': e.amount,
    'Payment Method': e.paymentMethod || e.paymentMode || 'Cash',
    'Reference / Bill No': e.referenceNo || '-',
    'Notes': e.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  XLSX.writeFile(workbook, fileName);
}

export function exportPurchasesToExcel(purchases: Purchase[], fileName: string = 'Purchases_Bills.xlsx') {
  const rows = purchases.map((p) => ({
    'Purchase No / ID': p.purchaseNo || p.id,
    'Invoice No': p.purchaseInvoiceNo || '-',
    'Date': formatDate(p.purchaseDate || p.date || ''),
    'Supplier Name': p.supplierName,
    'Supplier GSTIN': p.supplierGstin || 'URP',
    'Taxable Amount (₹)': p.taxableAmount || 0,
    'GST Amount (₹)': p.gstAmount || 0,
    'Total Amount (₹)': p.grandTotal,
    'Notes': ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases');
  XLSX.writeFile(workbook, fileName);
}

export function exportGstSummaryToExcel(
  invoices: Invoice[],
  purchases: Purchase[],
  fileName: string = 'GSTR_Summary.xlsx'
) {
  // GSTR-1 Outward Supplies Summary
  const gstr1Rows = invoices.map((inv) => ({
    'Invoice No': inv.invoiceNo,
    'Invoice Date': formatDate(inv.invoiceDate),
    'Customer Name': inv.customerName,
    'Customer GSTIN': inv.customerGstin || 'URP',
    'Place of Supply': inv.customerState,
    'Supply Type': inv.isInterstate ? 'Inter-state' : 'Intra-state',
    'Taxable Value (₹)': inv.taxableAmount,
    'CGST (₹)': inv.cgstTotal,
    'SGST (₹)': inv.sgstTotal,
    'IGST (₹)': inv.igstTotal,
    'Total GST (₹)': inv.cgstTotal + inv.sgstTotal + inv.igstTotal,
    'Invoice Value (₹)': inv.grandTotal
  }));

  // GSTR-2 Inward Supplies (Purchases) Summary
  const gstr2Rows = purchases.map((pur) => ({
    'Bill / Purchase No': pur.purchaseInvoiceNo || pur.purchaseNo || '-',
    'Date': formatDate(pur.purchaseDate || pur.date || ''),
    'Supplier Name': pur.supplierName,
    'Supplier GSTIN': pur.supplierGstin || 'URP',
    'Taxable Value (₹)': pur.taxableAmount || 0,
    'GST Total (₹)': pur.gstAmount || 0,
    'Total Bill Value (₹)': pur.grandTotal
  }));

  const workbook = XLSX.utils.book_new();
  const gstr1Sheet = XLSX.utils.json_to_sheet(gstr1Rows);
  const gstr2Sheet = XLSX.utils.json_to_sheet(gstr2Rows);

  XLSX.utils.book_append_sheet(workbook, gstr1Sheet, 'GSTR-1 Outward');
  XLSX.utils.book_append_sheet(workbook, gstr2Sheet, 'GSTR-2 Inward');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Master Multi-Sheet Excel export packaging all business tables into a single .xlsx file on user's laptop.
 */
export function exportMasterWorkbookToExcel(data: {
  invoices: Invoice[];
  quotations: Quotation[];
  customers: Customer[];
  products: ProductItem[];
  payments: PaymentReceipt[];
  amcContracts: AmcContract[];
  purchases: Purchase[];
  expenses: Expense[];
}, fileName: string = `FIRE_CARE_SAFETY_MASTER_LEDGER_${new Date().toISOString().slice(0, 10)}.xlsx`) {
  const workbook = XLSX.utils.book_new();

  // 1. Invoices
  const invRows = data.invoices.map((inv) => ({
    'Invoice No': inv.invoiceNo,
    'Date': formatDate(inv.invoiceDate),
    'Due Date': formatDate(inv.dueDate),
    'Customer': inv.customerName,
    'GSTIN': inv.customerGstin || 'URP',
    'Mobile': inv.customerMobile || '-',
    'Taxable Total': inv.taxableAmount,
    'CGST': inv.cgstTotal,
    'SGST': inv.sgstTotal,
    'IGST': inv.igstTotal,
    'Grand Total': inv.grandTotal,
    'Paid': inv.amountPaid,
    'Balance Due': inv.balanceDue,
    'Status': inv.status.toUpperCase()
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(invRows), 'Invoices');

  // 2. Quotations
  const quotRows = data.quotations.map((q) => ({
    'Quotation No': q.quotationNo,
    'Date': formatDate(q.date),
    'Customer': q.customerName,
    'Grand Total': q.grandTotal,
    'Status': q.status.toUpperCase()
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(quotRows), 'Quotations');

  // 3. Customers
  const custRows = data.customers.map((c) => ({
    'Customer Name': c.name,
    'Contact Person': c.contactPerson || '-',
    'Mobile': c.mobile,
    'GSTIN': c.gstin || 'URP',
    'City': c.city,
    'Total Sales (₹)': c.totalSales || 0,
    'Total Paid (₹)': c.totalPaid || 0,
    'Current Outstanding (₹)': c.currentOutstanding || 0
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(custRows), 'Customers');

  // 4. Products & Stock
  const prodRows = data.products.map((p) => ({
    'Item Name': p.name,
    'Type': p.type.toUpperCase(),
    'Category': p.category || '-',
    'HSN': p.hsnSac || '-',
    'Current Stock': p.currentStock,
    'Selling Rate (₹)': p.sellingPrice,
    'Purchase Rate (₹)': p.purchasePrice,
    'GST %': p.gstRate
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(prodRows), 'Stock & Inventory');

  // 5. Payments
  const payRows = data.payments.map((p) => ({
    'Receipt No': p.receiptNo,
    'Date': formatDate(p.paymentDate),
    'Customer': p.customerName,
    'Invoice Ref': p.invoiceNo || 'On Account',
    'Amount (₹)': p.amount,
    'Mode': p.paymentMethod,
    'Ref / UTR': p.referenceNo || '-'
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(payRows), 'Payments');

  // 6. AMC
  const amcRows = data.amcContracts.map((a) => ({
    'Contract No': a.contractNo,
    'Customer': a.customerName,
    'Start Date': formatDate(a.startDate),
    'End Date': formatDate(a.endDate),
    'Total Value (₹)': a.totalAmount,
    'Status': a.status.toUpperCase()
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(amcRows), 'AMC Contracts');

  // 7. Purchases
  const purRows = data.purchases.map((p) => ({
    'Bill No': p.purchaseInvoiceNo || p.purchaseNo || '-',
    'Supplier': p.supplierName,
    'Date': formatDate(p.purchaseDate || p.date || ''),
    'Total (₹)': p.grandTotal
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(purRows), 'Purchases');

  // 8. Expenses
  const expRows = data.expenses.map((e) => ({
    'Date': formatDate(e.date || e.expenseDate || ''),
    'Category': e.category,
    'Title': e.title || e.description || '-',
    'Amount (₹)': e.amount,
    'Mode': e.paymentMethod || 'Cash'
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expRows), 'Expenses');

  XLSX.writeFile(workbook, fileName);
}

