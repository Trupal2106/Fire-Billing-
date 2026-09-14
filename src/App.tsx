import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, seedInitialDataIfNeeded, defaultCompanySettings } from './db/db';
import {
  Customer,
  ProductItem,
  Invoice,
  Quotation,
  PaymentReceipt,
  Purchase,
  Expense,
  AmcContract,
  EquipmentRecord,
  ServiceReport,
  PumpTestRecord,
  InventoryLog,
  CompanySettings,
  BillCustomizationSettings,
  DocumentDesignMapping
} from './types';
import {
  generateNextInvoiceNumber,
  generateNextQuotationNumber,
  generateNextReceiptNumber,
  parseDocumentNumber
} from './utils/numbering';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

// View Components
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerListView } from './components/customers/CustomerListView';
import { CustomerModal } from './components/customers/CustomerModal';
import { CustomerDetailView } from './components/customers/CustomerDetailView';
import { ProductListView } from './components/products/ProductListView';
import { ProductModal } from './components/products/ProductModal';
import { InvoiceListView } from './components/invoices/InvoiceListView';
import { InvoiceFormView } from './components/invoices/InvoiceFormView';
import { InvoiceDetailModal } from './components/invoices/InvoiceDetailModal';
import { QuotationListView } from './components/quotations/QuotationListView';
import { QuotationFormView } from './components/quotations/QuotationFormView';
import { PaymentListView } from './components/payments/PaymentListView';
import { PaymentModal } from './components/payments/PaymentModal';
import { PurchaseListView } from './components/purchases/PurchaseListView';
import { PurchaseModal } from './components/purchases/PurchaseModal';
import { ExpenseListView } from './components/expenses/ExpenseListView';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { AMCListView } from './components/amc/AMCListView';
import { AMCModal } from './components/amc/AMCModal';
import { EquipmentRegistryView } from './components/equipment/EquipmentRegistryView';
import { ServiceReportListView } from './components/service/ServiceReportListView';
import { ServiceReportModal } from './components/service/ServiceReportModal';
import { InventoryView } from './components/inventory/InventoryView';
import { StockAdjustmentModal } from './components/inventory/StockAdjustmentModal';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { BillCustomizationView } from './components/customization/BillCustomizationView';
import { StaffPayrollView } from './components/staff/StaffPayrollView';

// Modals
import { QuickActionModal } from './components/modals/QuickActionModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

export default function App() {
  // Navigation State
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // App Data Collections from Dexie
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amcContracts, setAmcContracts] = useState<AmcContract[]>([]);
  const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([]);
  const [pumpTests, setPumpTests] = useState<PumpTestRecord[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [billDesigns, setBillDesigns] = useState<BillCustomizationSettings[]>([]);
  const [docMapping, setDocMapping] = useState<DocumentDesignMapping>({
    id: 'default_mapping',
    invoiceDesignId: 'design_classic_ref',
    quotationDesignId: 'design_classic_ref',
    amcDesignId: 'design_classic_ref',
    paymentReceiptDesignId: 'design_classic_ref',
    serviceReportDesignId: 'design_classic_ref',
    updatedAt: new Date().toISOString()
  });

  const [isLoading, setIsLoading] = useState(true);

  // Drilldown & Selection States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);

  // Form View & Modal States
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(true);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [preselectedCustomerForInvoice, setPreselectedCustomerForInvoice] = useState<Customer | null>(null);

  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState<Quotation | null>(null);
  const [preselectedCustomerForQuotation, setPreselectedCustomerForQuotation] = useState<Customer | null>(null);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [prefilledCustomerForPayment, setPrefilledCustomerForPayment] = useState<Customer | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [editingAmc, setEditingAmc] = useState<AmcContract | null>(null);
  const [isAmcModalOpen, setIsAmcModalOpen] = useState(false);

  const [isServiceReportModalOpen, setIsServiceReportModalOpen] = useState(false);

  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<ProductItem | null>(null);

  // 1. Initial Load & Synchronization from Dexie IndexedDB
  const loadAllData = useCallback(async () => {
    try {
      await seedInitialDataIfNeeded();

      const [
        custs,
        prods,
        invs,
        quots,
        pays,
        purs,
        exps,
        amcs,
        eqs,
        sreps,
        ptests,
        invLogs,
        settings,
        bDesigns,
        dMapping
      ] = await Promise.all([
        db.customers.toArray(),
        db.products.toArray(),
        db.invoices.toArray(),
        db.quotations.toArray(),
        db.payments.toArray(),
        db.purchases.toArray(),
        db.expenses.toArray(),
        db.amcContracts.toArray(),
        db.equipment.toArray(),
        db.serviceReports.toArray(),
        db.pumpTestReports.toArray(),
        db.inventoryLogs.toArray(),
        db.companySettings.get('default'),
        db.billCustomizations.toArray(),
        db.documentDesignMapping.get('default_mapping')
      ]);

      setCustomers(custs);
      setProducts(prods);
      setInvoices(invs);
      setQuotations(quots);
      setPayments(pays);
      setPurchases(purs);
      setExpenses(exps);
      setAmcContracts(amcs);
      setEquipment(eqs);
      setServiceReports(sreps);
      setPumpTests(ptests);
      setInventoryLogs(invLogs);
      if (settings) {
        setCompanySettings(settings);
      }
      if (bDesigns && bDesigns.length > 0) {
        setBillDesigns(bDesigns);
      }
      if (dMapping) {
        setDocMapping(dMapping);
      }
    } catch (err) {
      console.error('Error loading database tables:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Global Search keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Alerts & Badges
  const lowStockCount = useMemo(() => {
    return products.filter(p => p.type === 'product' && p.currentStock <= p.minStock).length;
  }, [products]);

  const upcomingAmcCount = useMemo(() => {
    const now = new Date();
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 86400000);
    return amcContracts.filter(c => {
      const end = new Date(c.endDate);
      return c.status === 'Active' && end >= now && end <= thirtyDaysAhead;
    }).length;
  }, [amcContracts]);

  // --- CRUD Handlers ---

  // Customers
  const handleSaveCustomer = async (custData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const now = new Date().toISOString();
    let saved: Customer;
    if (editingCustomer) {
      saved = {
        ...editingCustomer,
        ...custData,
        updatedAt: now
      };
      await db.customers.put(saved);
      if (selectedCustomer?.id === saved.id) {
        setSelectedCustomer(saved);
      }
    } else {
      saved = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...custData,
        totalSales: 0,
        totalPaid: 0,
        currentOutstanding: custData.openingBalance || 0,
        createdAt: now,
        updatedAt: now
      };
      await db.customers.add(saved);
    }
    await loadAllData();
    return saved;
  };

  const handleDeleteCustomer = async (cust: Customer) => {
    if (confirm(`Are you sure you want to delete client "${cust.name}"?`)) {
      await db.customers.delete(cust.id);
      if (selectedCustomer?.id === cust.id) {
        setSelectedCustomer(null);
      }
      await loadAllData();
    }
  };

  // Products
  const handleSaveProduct = async (prodData: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    if (editingProduct) {
      const updated: ProductItem = {
        ...editingProduct,
        ...prodData,
        updatedAt: now
      };
      await db.products.put(updated);
    } else {
      const newProd: ProductItem = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...prodData,
        createdAt: now,
        updatedAt: now
      };
      await db.products.add(newProd);
    }
    await loadAllData();
  };

  const handleDeleteProduct = async (prod: ProductItem) => {
    if (confirm(`Delete product "${prod.name}"?`)) {
      await db.products.delete(prod.id);
      await loadAllData();
    }
  };

  // Update Company Settings (Full or Partial)
  const handleUpdateCompanySettingsPartial = async (updates: Partial<CompanySettings>) => {
    const now = new Date().toISOString();
    const updated: CompanySettings = {
      ...companySettings,
      ...updates,
      updatedAt: now
    };
    await db.companySettings.put(updated);
    setCompanySettings(updated);
  };

  // Invoices (Stock deduction, ledger balance update, numbering auto-increment, and logging)
  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const isExistingInvoice = Boolean(invoiceToEdit && invoiceToEdit.id);
    const invoiceId = isExistingInvoice ? invoiceToEdit!.id : `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const inv: Invoice = {
      id: invoiceId,
      ...invoiceData,
      createdAt: isExistingInvoice ? invoiceToEdit!.createdAt : now,
      updatedAt: now
    };

    await db.invoices.put(inv);

    // If new invoice, deduct product stock & update customer balances & auto-increment invoice counter
    if (!isExistingInvoice) {
      for (const item of invoiceData.items) {
        if (item.productId) {
          const p = await db.products.get(item.productId);
          if (p && p.type === 'product') {
            const newStock = Math.max(0, (p.currentStock || 0) - item.quantity);
            await db.products.update(p.id, { currentStock: newStock, updatedAt: now });

            await db.inventoryLogs.add({
              id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              date: invoiceData.invoiceDate,
              productId: p.id,
              productName: p.name,
              type: 'sale',
              quantityChange: -item.quantity,
              previousStock: p.currentStock,
              newStock: newStock,
              referenceNo: invoiceData.invoiceNo,
              notes: `Billed to ${invoiceData.customerName}`,
              createdAt: now
            });
          }
        }
      }

      // Update Customer balances
      const cust = await db.customers.get(invoiceData.customerId);
      if (cust) {
        const totalSales = (cust.totalSales || 0) + invoiceData.grandTotal;
        const totalPaid = (cust.totalPaid || 0) + (invoiceData.amountPaid || 0);
        const currentOutstanding = (cust.currentOutstanding || 0) + invoiceData.balanceDue;
        await db.customers.update(cust.id, {
          totalSales,
          totalPaid,
          currentOutstanding,
          updatedAt: now
        });
      }

      // Auto-increment Next Invoice Serial Number in Settings
      if (companySettings.autoIncrementInvoiceNo !== false) {
        const parsed = parseDocumentNumber(invoiceData.invoiceNo);
        const savedSeq = parsed?.num ?? (companySettings.invoiceNextNumber ?? 1);
        const nextInvoiceNum = Math.max(companySettings.invoiceNextNumber ?? 1, savedSeq) + 1;

        const updatedSettings: CompanySettings = {
          ...companySettings,
          invoiceNextNumber: nextInvoiceNum,
          updatedAt: now
        };
        await db.companySettings.put(updatedSettings);
        setCompanySettings(updatedSettings);
      }

      // If initial payment was made during invoice creation, create PaymentReceipt record
      if (invoiceData.amountPaid && invoiceData.amountPaid > 0) {
        const receiptNo = generateNextReceiptNumber(companySettings, payments);
        await db.payments.add({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          receiptNo,
          paymentDate: invoiceData.invoiceDate,
          customerId: invoiceData.customerId,
          customerName: invoiceData.customerName,
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          amount: invoiceData.amountPaid,
          paymentMethod: 'Cash',
          notes: 'Received on invoice generation',
          createdAt: now
        });

        // Auto-increment receipt number
        if (companySettings.autoIncrementReceiptNo !== false) {
          const nextRecNum = (companySettings.receiptNextNumber ?? 1) + 1;
          await db.companySettings.update('default', { receiptNextNumber: nextRecNum, updatedAt: now });
          setCompanySettings(prev => ({ ...prev, receiptNextNumber: nextRecNum }));
        }
      }
    } else {
      // Existing invoice edit - adjust customer ledger balances by difference
      const cust = await db.customers.get(invoiceData.customerId);
      if (cust && invoiceToEdit) {
        const diffSales = invoiceData.grandTotal - (invoiceToEdit.grandTotal || 0);
        const diffPaid = (invoiceData.amountPaid || 0) - (invoiceToEdit.amountPaid || 0);
        const diffOutstanding = invoiceData.balanceDue - (invoiceToEdit.balanceDue || 0);

        await db.customers.update(cust.id, {
          totalSales: Math.max(0, (cust.totalSales || 0) + diffSales),
          totalPaid: Math.max(0, (cust.totalPaid || 0) + diffPaid),
          currentOutstanding: Math.max(0, (cust.currentOutstanding || 0) + diffOutstanding),
          updatedAt: now
        });
      }

      if (viewingInvoice && viewingInvoice.id === inv.id) {
        setViewingInvoice(inv);
      }
    }

    await loadAllData();
    setIsInvoiceFormOpen(false);
    setInvoiceToEdit(null);
    setPreselectedCustomerForInvoice(null);
    return inv;
  };

  const handleCancelInvoice = async (inv: Invoice) => {
    if (confirm(`Cancel invoice "${inv.invoiceNo}"? This will mark it as cancelled.`)) {
      const now = new Date().toISOString();
      await db.invoices.update(inv.id, { status: 'cancelled', updatedAt: now });

      // Revert customer outstanding
      const cust = await db.customers.get(inv.customerId);
      if (cust) {
        const totalSales = Math.max(0, (cust.totalSales || 0) - inv.grandTotal);
        const currentOutstanding = Math.max(0, (cust.currentOutstanding || 0) - inv.balanceDue);
        await db.customers.update(cust.id, {
          totalSales,
          currentOutstanding,
          updatedAt: now
        });
      }
      setIsInvoiceDetailOpen(false);
      await loadAllData();
    }
  };

  // Quotations
  const handleSaveQuotation = async (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const isNew = !quotationToEdit;
    const quotId = quotationToEdit ? quotationToEdit.id : `qtn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const quot: Quotation = {
      id: quotId,
      ...quotationData,
      createdAt: quotationToEdit ? quotationToEdit.createdAt : now,
      updatedAt: now
    };

    await db.quotations.put(quot);

    if (isNew && companySettings.autoIncrementQuotationNo !== false) {
      const parsed = parseDocumentNumber(quotationData.quotationNo);
      const savedSeq = parsed?.num ?? (companySettings.quotationNextNumber ?? 1);
      const nextQuotNum = Math.max(companySettings.quotationNextNumber ?? 1, savedSeq) + 1;

      const updatedSettings: CompanySettings = {
        ...companySettings,
        quotationNextNumber: nextQuotNum,
        updatedAt: now
      };
      await db.companySettings.put(updatedSettings);
      setCompanySettings(updatedSettings);
    }

    await loadAllData();
    setIsQuotationFormOpen(false);
    setQuotationToEdit(null);
    setPreselectedCustomerForQuotation(null);
    return quot;
  };

  const handleConvertQuotationToInvoice = (quot: Quotation) => {
    const cust = customers.find(c => c.id === quot.customerId) || null;
    setPreselectedCustomerForInvoice(cust);
    setInvoiceToEdit({
      id: '',
      invoiceNo: generateNextInvoiceNumber(companySettings, invoices),
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      customerId: quot.customerId,
      customerName: quot.customerName,
      customerGstin: quot.customerGstin,
      customerMobile: quot.customerMobile,
      billingAddress: quot.billingAddress,
      shippingAddress: quot.shippingAddress,
      customerState: quot.customerState,
      isInterstate: quot.isInterstate,
      items: quot.items,
      subtotal: quot.subtotal,
      totalDiscount: quot.totalDiscount,
      taxableAmount: quot.taxableAmount,
      cgstTotal: quot.cgstTotal,
      sgstTotal: quot.sgstTotal,
      igstTotal: quot.igstTotal,
      roundOff: quot.roundOff,
      grandTotal: quot.grandTotal,
      amountPaid: 0,
      balanceDue: quot.grandTotal,
      status: 'unpaid',
      terms: quot.terms || companySettings.termsAndConditions,
      notes: `Converted from Quotation ${quot.quotationNo}`,
      quotationId: quot.id,
      createdAt: '',
      updatedAt: ''
    });
    setIsInvoiceFormOpen(true);
  };

  // Payments (Updates invoice balance, customer outstanding, and logs receipt)
  const handleSavePayment = async (payData: Omit<PaymentReceipt, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const receiptId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const payment: PaymentReceipt = {
      id: receiptId,
      ...payData,
      createdAt: now
    };

    await db.payments.add(payment);

    // Auto increment receipt number if applicable
    if (companySettings.autoIncrementReceiptNo !== false) {
      const parsed = parseDocumentNumber(payData.receiptNo);
      const savedSeq = parsed?.num ?? (companySettings.receiptNextNumber ?? 1);
      const nextRecNum = Math.max(companySettings.receiptNextNumber ?? 1, savedSeq) + 1;

      const updatedSettings: CompanySettings = {
        ...companySettings,
        receiptNextNumber: nextRecNum,
        updatedAt: now
      };
      await db.companySettings.put(updatedSettings);
      setCompanySettings(updatedSettings);
    }

    // If linked to an invoice, adjust invoice balance and status
    if (payData.invoiceId) {
      const inv = await db.invoices.get(payData.invoiceId);
      if (inv) {
        const newPaid = (inv.amountPaid || 0) + payData.amount;
        const newBalance = Math.max(0, inv.grandTotal - newPaid);
        const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

        await db.invoices.update(inv.id, {
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newStatus,
          updatedAt: now
        });
      }
    }

    // Adjust customer ledger balance
    const cust = await db.customers.get(payData.customerId);
    if (cust) {
      const totalPaid = (cust.totalPaid || 0) + payData.amount;
      const currentOutstanding = Math.max(0, (cust.currentOutstanding || 0) - payData.amount);

      await db.customers.update(cust.id, {
        totalPaid,
        currentOutstanding,
        updatedAt: now
      });
    }

    await loadAllData();
    setIsPaymentModalOpen(false);
    setPrefilledCustomerForPayment(null);
  };

  const handleDeletePayment = async (pay: PaymentReceipt) => {
    if (confirm(`Delete payment receipt "${pay.receiptNo}" of ₹${pay.amount}?`)) {
      await db.payments.delete(pay.id);
      await loadAllData();
    }
  };

  // Purchases (Auto restocks product inventory and records stock log)
  const handleSavePurchase = async (purData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const purchase: Purchase = {
      id: purchaseId,
      ...purData,
      createdAt: now,
      updatedAt: now
    };

    await db.purchases.add(purchase);

    // Restock items
    for (const item of purData.items) {
      if (item.productId) {
        const p = await db.products.get(item.productId);
        if (p) {
          const newStock = (p.currentStock || 0) + item.quantity;
          await db.products.update(p.id, {
            currentStock: newStock,
            purchasePrice: item.purchaseRate || item.rate || p.purchasePrice,
            updatedAt: now
          });

          await db.inventoryLogs.add({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            date: purData.purchaseDate || purData.date || now.slice(0, 10),
            productId: p.id,
            productName: p.name,
            type: 'purchase',
            quantityChange: item.quantity,
            previousStock: p.currentStock,
            newStock: newStock,
            referenceNo: purData.purchaseInvoiceNo || purData.purchaseNo,
            notes: `Purchased from ${purData.supplierName}`,
            createdAt: now
          });
        }
      }
    }

    await loadAllData();
    setIsPurchaseModalOpen(false);
  };

  const handleDeletePurchase = async (pur: Purchase) => {
    if (confirm(`Delete purchase bill "${pur.purchaseInvoiceNo || pur.purchaseNo}"?`)) {
      await db.purchases.delete(pur.id);
      await loadAllData();
    }
  };

  // Expenses
  const handleSaveExpense = async (expData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const exp: Expense = {
      id: expenseId,
      ...expData,
      createdAt: now,
      updatedAt: now
    };

    await db.expenses.add(exp);
    await loadAllData();
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = async (exp: Expense) => {
    if (confirm(`Delete expense "${exp.title || exp.description}"?`)) {
      await db.expenses.delete(exp.id);
      await loadAllData();
    }
  };

  // AMC Contracts
  const handleSaveAMC = async (amcData: Omit<AmcContract, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    if (editingAmc) {
      const updated: AmcContract = {
        ...editingAmc,
        ...amcData,
        updatedAt: now
      };
      await db.amcContracts.put(updated);
    } else {
      const newAmc: AmcContract = {
        id: `amc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...amcData,
        createdAt: now,
        updatedAt: now
      };
      await db.amcContracts.add(newAmc);
    }
    await loadAllData();
    setIsAmcModalOpen(false);
    setEditingAmc(null);
  };

  const handleDeleteAMC = async (amc: AmcContract) => {
    if (confirm(`Delete AMC Contract "${amc.contractNo}"?`)) {
      await db.amcContracts.delete(amc.id);
      await loadAllData();
    }
  };

  // Equipment Registry
  const handleAddEquipment = async (eqData: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const eqId = `eq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newEq: EquipmentRecord = {
      id: eqId,
      ...eqData,
      createdAt: now,
      updatedAt: now
    };
    await db.equipment.add(newEq);
    await loadAllData();
  };

  const handleDeleteEquipment = async (eqOrId: string | EquipmentRecord) => {
    const eqId = typeof eqOrId === 'string' ? eqOrId : eqOrId.id;
    const target = typeof eqOrId === 'object' ? eqOrId : equipment.find(e => e.id === eqId);
    if (confirm(`Delete equipment "${target ? `${target.equipmentType} - ${target.serialNo}` : 'this item'}"?`)) {
      await db.equipment.delete(eqId);
      await loadAllData();
    }
  };

  // Service Reports
  const handleSaveServiceReport = async (repData: Omit<ServiceReport, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const repId = `sr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newRep: ServiceReport = {
      id: repId,
      ...repData,
      createdAt: now
    };
    await db.serviceReports.add(newRep);
    await loadAllData();
    setIsServiceReportModalOpen(false);
  };

  const handleDeleteServiceReport = async (rep: ServiceReport) => {
    if (confirm(`Delete service report "${rep.reportNo}"?`)) {
      await db.serviceReports.delete(rep.id);
      await loadAllData();
    }
  };

  // Stock Adjustment
  const handleSaveStockAdjustment = async (
    productId: string,
    adjustmentType: 'in' | 'out' | 'set',
    quantity: number,
    reason: string
  ) => {
    const now = new Date().toISOString();
    const prod = await db.products.get(productId);
    if (!prod) return;

    let newStock = prod.currentStock;
    let changeQty = 0;

    if (adjustmentType === 'in') {
      newStock = prod.currentStock + quantity;
      changeQty = quantity;
    } else if (adjustmentType === 'out') {
      newStock = Math.max(0, prod.currentStock - quantity);
      changeQty = -quantity;
    } else if (adjustmentType === 'set') {
      changeQty = quantity - prod.currentStock;
      newStock = quantity;
    }

    await db.products.update(prod.id, { currentStock: newStock, updatedAt: now });

    await db.inventoryLogs.add({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: now.slice(0, 10),
      productId: prod.id,
      productName: prod.name,
      type: 'adjustment',
      quantityChange: changeQty,
      previousStock: prod.currentStock,
      newStock: newStock,
      notes: reason,
      createdAt: now
    });

    await loadAllData();
    setIsStockAdjustmentModalOpen(false);
    setSelectedProductForAdjustment(null);
  };

  // Settings & Backup/Restore
  const handleSaveSettings = async (settings: CompanySettings) => {
    await db.companySettings.put(settings);
    setCompanySettings(settings);
    await loadAllData();
  };

  const handleExportBackup = async () => {
    try {
      const backupData = {
        version: '1.0',
        appName: 'FIRE CARE SAFETY SOLUTION',
        exportedAt: new Date().toISOString(),
        companySettings: await db.companySettings.toArray(),
        customers: await db.customers.toArray(),
        products: await db.products.toArray(),
        invoices: await db.invoices.toArray(),
        quotations: await db.quotations.toArray(),
        payments: await db.payments.toArray(),
        purchases: await db.purchases.toArray(),
        expenses: await db.expenses.toArray(),
        inventoryLogs: await db.inventoryLogs.toArray(),
        amcContracts: await db.amcContracts.toArray(),
        equipment: await db.equipment.toArray(),
        serviceReports: await db.serviceReports.toArray(),
        pumpTestReports: await db.pumpTestReports.toArray(),
        billCustomizations: await db.billCustomizations.toArray(),
        documentDesignMapping: await db.documentDesignMapping.toArray()
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIRE_CARE_SAFETY_SOLUTION_FULL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export backup: ' + err);
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup || !backup.companySettings) {
        throw new Error('Invalid backup file format');
      }

      await Promise.all([
        db.companySettings.clear(),
        db.customers.clear(),
        db.products.clear(),
        db.invoices.clear(),
        db.quotations.clear(),
        db.payments.clear(),
        db.purchases.clear(),
        db.expenses.clear(),
        db.inventoryLogs.clear(),
        db.amcContracts.clear(),
        db.equipment.clear(),
        db.serviceReports.clear(),
        db.pumpTestReports.clear()
      ]);

      if (backup.companySettings?.length) await db.companySettings.bulkPut(backup.companySettings);
      if (backup.customers?.length) await db.customers.bulkPut(backup.customers);
      if (backup.products?.length) await db.products.bulkPut(backup.products);
      if (backup.invoices?.length) await db.invoices.bulkPut(backup.invoices);
      if (backup.quotations?.length) await db.quotations.bulkPut(backup.quotations);
      if (backup.payments?.length) await db.payments.bulkPut(backup.payments);
      if (backup.purchases?.length) await db.purchases.bulkPut(backup.purchases);
      if (backup.expenses?.length) await db.expenses.bulkPut(backup.expenses);
      if (backup.inventoryLogs?.length) await db.inventoryLogs.bulkPut(backup.inventoryLogs);
      if (backup.amcContracts?.length) await db.amcContracts.bulkPut(backup.amcContracts);
      if (backup.equipment?.length) await db.equipment.bulkPut(backup.equipment);
      if (backup.serviceReports?.length) await db.serviceReports.bulkPut(backup.serviceReports);
      if (backup.pumpTestReports?.length) await db.pumpTestReports.bulkPut(backup.pumpTestReports);
      if (backup.billCustomizations?.length) await db.billCustomizations.bulkPut(backup.billCustomizations);
      if (backup.documentDesignMapping?.length) await db.documentDesignMapping.bulkPut(backup.documentDesignMapping);

      await loadAllData();
      alert('Backup restored successfully!');
    } catch (err: any) {
      alert('Failed to restore backup: ' + err.message);
    }
  };

  // Bill Customization Handlers
  const handleSaveBillDesign = async (design: BillCustomizationSettings) => {
    await db.billCustomizations.put(design);
    await loadAllData();
  };

  const handleDeleteBillDesign = async (id: string) => {
    if (confirm('Are you sure you want to delete this custom invoice design?')) {
      await db.billCustomizations.delete(id);
      await loadAllData();
    }
  };

  const handleUpdateDocMapping = async (mapping: DocumentDesignMapping) => {
    const fullMapping: DocumentDesignMapping = {
      ...mapping,
      id: mapping.id || 'default_mapping'
    };
    await db.documentDesignMapping.put(fullMapping);
    setDocMapping(fullMapping);
  };

  const activeInvoiceDesign = useMemo(() => {
    if (billDesigns.length === 0) return undefined;
    const mappedId = docMapping?.invoiceDesignId;
    return billDesigns.find(d => d.id === mappedId) || billDesigns.find(d => d.isDefault) || billDesigns[0];
  }, [billDesigns, docMapping]);

  const handleResetToSampleData = async () => {
    if (confirm('Reset all records and reload sample Patel Fire business demo dataset?')) {
      await db.delete();
      window.location.reload();
    }
  };

  // Quick Action Dispatcher
  const handleSelectQuickAction = (actionId: string) => {
    setIsQuickActionOpen(false);
    const normalizedKey = actionId.replace(/-/g, '_');
    switch (normalizedKey) {
      case 'new_invoice':
        setInvoiceToEdit(null);
        setPreselectedCustomerForInvoice(null);
        setIsInvoiceFormOpen(true);
        break;
      case 'new_quotation':
        setQuotationToEdit(null);
        setPreselectedCustomerForQuotation(null);
        setIsQuotationFormOpen(true);
        break;
      case 'new_customer':
        setEditingCustomer(null);
        setIsCustomerModalOpen(true);
        break;
      case 'new_product':
        setEditingProduct(null);
        setIsProductModalOpen(true);
        break;
      case 'new_payment':
      case 'receive_payment':
        setPrefilledCustomerForPayment(null);
        setIsPaymentModalOpen(true);
        break;
      case 'new_purchase':
        setIsPurchaseModalOpen(true);
        break;
      case 'new_expense':
        setIsExpenseModalOpen(true);
        break;
      case 'new_amc':
        setEditingAmc(null);
        setIsAmcModalOpen(true);
        break;
      case 'new_service_report':
        setIsServiceReportModalOpen(true);
        break;
      case 'stock_adjustment':
        setSelectedProductForAdjustment(products?.[0] || null);
        setIsStockAdjustmentModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Global Search Dispatcher
  const handleSelectSearchResult = (type: string, id: string) => {
    setIsGlobalSearchOpen(false);
    if (type === 'customer') {
      const cust = customers.find(c => c.id === id);
      if (cust) {
        setSelectedCustomer(cust);
        setCurrentSection('customers');
      }
    } else if (type === 'invoice') {
      const inv = invoices.find(i => i.id === id);
      if (inv) {
        setViewingInvoice(inv);
        setIsInvoiceDetailOpen(true);
      }
    } else if (type === 'quotation') {
      setCurrentSection('quotations');
    } else if (type === 'product') {
      setCurrentSection('products');
    } else if (type === 'amc') {
      setCurrentSection('amc');
    } else if (type === 'purchase') {
      setCurrentSection('purchases');
    }
  };

  // Full screen Invoice Form View
  if (isInvoiceFormOpen) {
    return (
      <div className="min-h-screen bg-slate-100/70 w-full">
        <InvoiceFormView
          customers={customers}
          products={products}
          companySettings={companySettings}
          existingInvoices={invoices}
          preselectedCustomer={preselectedCustomerForInvoice}
          invoiceToEdit={invoiceToEdit}
          onBack={() => {
            setIsInvoiceFormOpen(false);
            setInvoiceToEdit(null);
          }}
          onSaveInvoice={handleSaveInvoice}
          onOpenQuickAddCustomer={() => {
            setEditingCustomer(null);
            setIsCustomerModalOpen(true);
          }}
          onOpenQuickAddProduct={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          onUpdateCompanySettings={handleUpdateCompanySettingsPartial}
        />

        {/* Customer Modal accessible directly inside Invoice Form */}
        <CustomerModal
          isOpen={isCustomerModalOpen}
          customerToEdit={editingCustomer}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setEditingCustomer(null);
          }}
          onSaveCustomer={async (custData) => {
            const saved = await handleSaveCustomer(custData);
            if (saved) {
              setPreselectedCustomerForInvoice(saved);
            }
          }}
        />

        {/* Product Modal accessible directly inside Invoice Form */}
        <ProductModal
          isOpen={isProductModalOpen}
          productToEdit={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaveProduct={handleSaveProduct}
        />
      </div>
    );
  }

  // Full screen Quotation Form View
  if (isQuotationFormOpen) {
    return (
      <div className="min-h-screen bg-slate-100/70 w-full">
        <QuotationFormView
          customers={customers}
          products={products}
          companySettings={companySettings}
          existingQuotations={quotations}
          preselectedCustomer={preselectedCustomerForQuotation}
          quotationToEdit={quotationToEdit}
          onBack={() => {
            setIsQuotationFormOpen(false);
            setQuotationToEdit(null);
          }}
          onSaveQuotation={handleSaveQuotation}
          onOpenQuickAddCustomer={() => {
            setEditingCustomer(null);
            setIsCustomerModalOpen(true);
          }}
          onOpenQuickAddProduct={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          onUpdateCompanySettings={handleUpdateCompanySettingsPartial}
        />

        {/* Customer Modal accessible directly inside Quotation Form */}
        <CustomerModal
          isOpen={isCustomerModalOpen}
          customerToEdit={editingCustomer}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setEditingCustomer(null);
          }}
          onSaveCustomer={async (custData) => {
            const saved = await handleSaveCustomer(custData);
            if (saved) {
              setPreselectedCustomerForQuotation(saved);
            }
          }}
        />

        {/* Product Modal accessible directly inside Quotation Form */}
        <ProductModal
          isOpen={isProductModalOpen}
          productToEdit={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaveProduct={handleSaveProduct}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-red-500 selection:text-white">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          currentSection={currentSection}
          onNavigate={(sec) => {
            if (sec === 'customers') setSelectedCustomer(null);
            setCurrentSection(sec);
          }}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          lowStockCount={lowStockCount}
          upcomingAmcCount={upcomingAmcCount}
          companySettings={companySettings}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              currentSection={currentSection}
              onNavigate={(sec) => {
                if (sec === 'customers') setSelectedCustomer(null);
                setCurrentSection(sec);
                setIsMobileMenuOpen(false);
              }}
              onOpenQuickAction={() => {
                setIsMobileMenuOpen(false);
                setIsQuickActionOpen(true);
              }}
              onOpenGlobalSearch={() => {
                setIsMobileMenuOpen(false);
                setIsGlobalSearchOpen(true);
              }}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
              lowStockCount={lowStockCount}
              upcomingAmcCount={upcomingAmcCount}
              companySettings={companySettings}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <Navbar
          currentSection={currentSection}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onNavigate={(sec) => {
            if (sec === 'customers') setSelectedCustomer(null);
            setCurrentSection(sec);
          }}
          companySettings={companySettings}
          upcomingAmcCount={upcomingAmcCount}
          lowStockCount={lowStockCount}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center p-8 text-slate-400">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Loading Patel Fire Billing...</p>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Dashboard View */}
              {currentSection === 'dashboard' && (
                <DashboardView
                  customers={customers}
                  invoices={invoices}
                  quotations={quotations}
                  payments={payments}
                  products={products}
                  amcContracts={amcContracts}
                  expenses={expenses}
                  companySettings={companySettings}
                  onNavigate={(sec) => {
                    if (sec === 'customers') setSelectedCustomer(null);
                    setCurrentSection(sec);
                  }}
                  onSelectAction={handleSelectQuickAction}
                  onViewInvoice={(inv) => {
                    setViewingInvoice(inv);
                    setIsInvoiceDetailOpen(true);
                  }}
                />
              )}

              {/* 2. Customers & Client Ledger View */}
              {currentSection === 'customers' && (
                <>
                  {selectedCustomer ? (
                    <CustomerDetailView
                      customer={selectedCustomer}
                      invoices={invoices.filter(i => i.customerId === selectedCustomer.id)}
                      payments={payments.filter(p => p.customerId === selectedCustomer.id)}
                      quotations={quotations.filter(q => q.customerId === selectedCustomer.id)}
                      amcContracts={amcContracts.filter(a => a.customerId === selectedCustomer.id)}
                      equipment={equipment.filter(e => e.customerId === selectedCustomer.id)}
                      companySettings={companySettings}
                      onBack={() => setSelectedCustomer(null)}
                      onEditCustomer={(cust) => {
                        setEditingCustomer(cust);
                        setIsCustomerModalOpen(true);
                      }}
                      onNewInvoice={(cust) => {
                        setPreselectedCustomerForInvoice(cust);
                        setInvoiceToEdit(null);
                        setIsInvoiceFormOpen(true);
                      }}
                      onReceivePayment={(cust) => {
                        setPrefilledCustomerForPayment(cust);
                        setIsPaymentModalOpen(true);
                      }}
                      onNewQuotation={(cust) => {
                        setPreselectedCustomerForQuotation(cust);
                        setQuotationToEdit(null);
                        setIsQuotationFormOpen(true);
                      }}
                      onEditInvoice={(inv) => {
                        setInvoiceToEdit(inv);
                        setIsInvoiceFormOpen(true);
                      }}
                      onEditQuotation={(quot) => {
                        setQuotationToEdit(quot);
                        setIsQuotationFormOpen(true);
                      }}
                      onConvertToInvoice={handleConvertQuotationToInvoice}
                      onNewAmcContract={(cust) => {
                        setEditingAmc(null);
                        setIsAmcModalOpen(true);
                      }}
                      onAddEquipment={(cust) => {
                        setCurrentSection('equipment');
                      }}
                    />
                  ) : (
                    <CustomerListView
                      customers={customers}
                      invoices={invoices}
                      payments={payments}
                      quotations={quotations}
                      onAddCustomer={() => {
                        setEditingCustomer(null);
                        setIsCustomerModalOpen(true);
                      }}
                      onEditCustomer={(cust) => {
                        setEditingCustomer(cust);
                        setIsCustomerModalOpen(true);
                      }}
                      onDeleteCustomer={handleDeleteCustomer}
                      onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                      onNewInvoiceForCustomer={(cust) => {
                        setPreselectedCustomerForInvoice(cust);
                        setInvoiceToEdit(null);
                        setIsInvoiceFormOpen(true);
                      }}
                      onReceivePaymentForCustomer={(cust) => {
                        setPrefilledCustomerForPayment(cust);
                        setIsPaymentModalOpen(true);
                      }}
                    />
                  )}
                </>
              )}

              {/* 3. Products & Services Catalog View */}
              {currentSection === 'products' && (
                <ProductListView
                  products={products}
                  onAddProduct={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  onEditProduct={(prod) => {
                    setEditingProduct(prod);
                    setIsProductModalOpen(true);
                  }}
                  onDeleteProduct={handleDeleteProduct}
                  onAdjustStock={(prod) => {
                    setSelectedProductForAdjustment(prod);
                    setIsStockAdjustmentModalOpen(true);
                  }}
                />
              )}

              {/* 4. GST Tax Invoices View */}
              {currentSection === 'invoices' && (
                <InvoiceListView
                  invoices={invoices}
                  companySettings={companySettings}
                  onNewInvoice={() => {
                    setInvoiceToEdit(null);
                    setPreselectedCustomerForInvoice(null);
                    setIsInvoiceFormOpen(true);
                  }}
                  onEditInvoice={(inv) => {
                    setInvoiceToEdit(inv);
                    setIsInvoiceFormOpen(true);
                  }}
                  onViewInvoice={(inv) => {
                    setViewingInvoice(inv);
                    setIsInvoiceDetailOpen(true);
                  }}
                  onRecordPaymentForInvoice={(inv) => {
                    const cust = customers.find(c => c.id === inv.customerId) || null;
                    setPrefilledCustomerForPayment(cust);
                    setIsPaymentModalOpen(true);
                  }}
                  onCustomizeInvoice={() => setCurrentSection('bill-customization')}
                />
              )}

              {/* 5. Quotations & Estimates View */}
              {currentSection === 'quotations' && (
                <QuotationListView
                  quotations={quotations}
                  companySettings={companySettings}
                  onNewQuotation={() => {
                    setQuotationToEdit(null);
                    setPreselectedCustomerForQuotation(null);
                    setIsQuotationFormOpen(true);
                  }}
                  onEditQuotation={(quot) => {
                    setQuotationToEdit(quot);
                    setIsQuotationFormOpen(true);
                  }}
                  onConvertToInvoice={handleConvertQuotationToInvoice}
                />
              )}

              {/* 6. Payments & Receipts View */}
              {currentSection === 'payments' && (
                <PaymentListView
                  payments={payments}
                  customers={customers}
                  companySettings={companySettings}
                  onNewPayment={() => {
                    setPrefilledCustomerForPayment(null);
                    setIsPaymentModalOpen(true);
                  }}
                  onDeletePayment={handleDeletePayment}
                />
              )}

              {/* 7. Purchases & Vendor Bills View */}
              {currentSection === 'purchases' && (
                <PurchaseListView
                  purchases={purchases}
                  onNewPurchase={() => setIsPurchaseModalOpen(true)}
                  onDeletePurchase={handleDeletePurchase}
                />
              )}

              {/* 8. Expenses View */}
              {currentSection === 'expenses' && (
                <ExpenseListView
                  expenses={expenses}
                  onNewExpense={() => setIsExpenseModalOpen(true)}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {/* 9. Inventory Stock & Log View */}
              {currentSection === 'inventory' && (
                <InventoryView
                  products={products}
                  inventoryLogs={inventoryLogs}
                  onOpenAddProduct={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  onOpenAdjustStock={(prod) => {
                    setSelectedProductForAdjustment(prod);
                    setIsStockAdjustmentModalOpen(true);
                  }}
                />
              )}

              {/* 10. AMC Contracts View */}
              {currentSection === 'amc' && (
                <AMCListView
                  contracts={amcContracts}
                  customers={customers}
                  companySettings={companySettings}
                  onNewContract={() => {
                    setEditingAmc(null);
                    setIsAmcModalOpen(true);
                  }}
                  onEditContract={(amc) => {
                    setEditingAmc(amc);
                    setIsAmcModalOpen(true);
                  }}
                  onDeleteContract={handleDeleteAMC}
                />
              )}

              {/* 11. Equipment Registry View */}
              {currentSection === 'equipment' && (
                <EquipmentRegistryView
                  equipment={equipment}
                  customers={customers}
                  onAddEquipment={handleAddEquipment}
                  onDeleteEquipment={handleDeleteEquipment}
                />
              )}

              {/* 12. Service & Inspection Reports View */}
              {currentSection === 'service-reports' && (
                <ServiceReportListView
                  reports={serviceReports}
                  customers={customers}
                  companySettings={companySettings}
                  onNewReport={() => setIsServiceReportModalOpen(true)}
                  onDeleteReport={handleDeleteServiceReport}
                />
              )}

              {/* Staff Attendance, Calendar & Indian Payroll */}
              {currentSection === 'staff-payroll' && (
                <StaffPayrollView
                  companySettings={companySettings}
                />
              )}

              {/* 13. Reports & GST Analytics View */}
              {currentSection === 'reports' && (
                <ReportsView
                  invoices={invoices}
                  purchases={purchases}
                  expenses={expenses}
                  customers={customers}
                  companySettings={companySettings}
                />
              )}

              {/* 14. Data Backup, Export & Laptop Storage Center */}
              {currentSection === 'backup' && (
                <BackupRestoreView
                  customers={customers}
                  invoices={invoices}
                  quotations={quotations}
                  products={products}
                  payments={payments}
                  amcContracts={amcContracts}
                  purchases={purchases}
                  expenses={expenses}
                  companySettings={companySettings}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onResetToSampleData={handleResetToSampleData}
                />
              )}

              {/* 15. Company Settings View */}
              {currentSection === 'settings' && (
                <SettingsView
                  companySettings={companySettings}
                  onSaveSettings={handleSaveSettings}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onResetToSampleData={handleResetToSampleData}
                  onNavigateToCustomization={() => setCurrentSection('bill-customization')}
                />
              )}

              {/* 15. Bill & Invoice Customization View */}
              {currentSection === 'bill-customization' && (
                <BillCustomizationView
                  companySettings={companySettings}
                  designs={billDesigns}
                  documentMapping={docMapping}
                  recentInvoices={invoices}
                  customers={customers}
                  onSaveDesign={handleSaveBillDesign}
                  onDeleteDesign={handleDeleteBillDesign}
                  onUpdateMapping={handleUpdateDocMapping}
                  onBackToInvoices={() => setCurrentSection('invoices')}
                />
              )}

              {/* 16. AI Fire Safety Assistant View */}
              {currentSection === 'ai-assistant' && (
                <AIAssistantView
                  companySettings={companySettings}
                  customers={customers}
                  invoices={invoices}
                  amcContracts={amcContracts}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentSection={currentSection}
        onNavigate={(sec) => {
          if (sec === 'customers') setSelectedCustomer(null);
          setCurrentSection(sec);
        }}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* --- Modals --- */}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        customerToEdit={editingCustomer}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSaveCustomer={handleSaveCustomer}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        productToEdit={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={handleSaveProduct}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isInvoiceDetailOpen}
        invoice={viewingInvoice}
        companySettings={companySettings}
        customer={customers.find(c => c.id === viewingInvoice?.customerId)}
        customizationSettings={activeInvoiceDesign}
        onClose={() => {
          setIsInvoiceDetailOpen(false);
          setViewingInvoice(null);
        }}
        onEditInvoice={(inv) => {
          setIsInvoiceDetailOpen(false);
          setInvoiceToEdit(inv);
          setIsInvoiceFormOpen(true);
        }}
        onRecordPayment={(inv) => {
          const cust = customers.find(c => c.id === inv.customerId) || null;
          setPrefilledCustomerForPayment(cust);
          setIsPaymentModalOpen(true);
        }}
        onCancelInvoice={handleCancelInvoice}
        onCustomizeInvoice={() => {
          setIsInvoiceDetailOpen(false);
          setCurrentSection('bill-customization');
        }}
      />

      {/* Payment Receipt Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        customers={customers}
        invoices={invoices}
        payments={payments}
        companySettings={companySettings}
        preselectedCustomer={prefilledCustomerForPayment}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPrefilledCustomerForPayment(null);
        }}
        onSavePayment={handleSavePayment}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        products={products}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSavePurchase={handleSavePurchase}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSaveExpense={handleSaveExpense}
      />

      {/* AMC Contract Modal */}
      <AMCModal
        isOpen={isAmcModalOpen}
        customers={customers}
        contractToEdit={editingAmc}
        onClose={() => {
          setIsAmcModalOpen(false);
          setEditingAmc(null);
        }}
        onSaveContract={handleSaveAMC}
      />

      {/* Service Report Modal */}
      <ServiceReportModal
        isOpen={isServiceReportModalOpen}
        customers={customers}
        onClose={() => setIsServiceReportModalOpen(false)}
        onSaveReport={handleSaveServiceReport}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isStockAdjustmentModalOpen}
        product={selectedProductForAdjustment}
        products={products}
        onClose={() => {
          setIsStockAdjustmentModalOpen(false);
          setSelectedProductForAdjustment(null);
        }}
        onSaveAdjustment={handleSaveStockAdjustment}
      />

      {/* Quick Action Launcher Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        customers={customers}
        invoices={invoices}
        quotations={quotations}
        products={products}
        amcContracts={amcContracts}
        purchases={purchases}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
}
