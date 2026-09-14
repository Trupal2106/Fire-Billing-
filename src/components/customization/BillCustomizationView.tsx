import React, { useState, useMemo } from 'react';
import {
  Palette,
  Layout,
  Columns3,
  Sliders,
  Building2,
  Image as ImageIcon,
  Users,
  CreditCard,
  QrCode,
  FileSignature,
  Percent,
  FileText,
  Printer,
  Download,
  Save,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import {
  BillCustomizationSettings,
  TemplateId,
  InvoiceColumnConfig,
  BillColors,
  DocumentDesignMapping
} from '../../types/billCustomization';
import { CompanySettings, Invoice, Customer } from '../../types';
import {
  TEMPLATE_METADATA_LIST,
  PRESET_COLOR_PALETTES,
  DEFAULT_COLUMNS,
  SAMPLE_PREVIEW_INVOICE,
  SAMPLE_PREVIEW_CUSTOMER,
  createDefaultBillSettings
} from '../../utils/defaultBillTemplates';
import { LiveBillPreview } from './LiveBillPreview';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

interface BillCustomizationViewProps {
  companySettings: CompanySettings;
  designs: BillCustomizationSettings[];
  documentMapping: DocumentDesignMapping;
  recentInvoices?: Invoice[];
  customers?: Customer[];
  onSaveDesign: (design: BillCustomizationSettings) => Promise<void>;
  onDeleteDesign: (id: string) => Promise<void>;
  onUpdateMapping: (mapping: DocumentDesignMapping) => Promise<void>;
  onBackToInvoices?: () => void;
}

type CustomizationTab =
  | 'templates'
  | 'colors'
  | 'columns'
  | 'header'
  | 'logo'
  | 'customer'
  | 'bank'
  | 'qr'
  | 'signature'
  | 'gst_payment'
  | 'terms_words'
  | 'page_footer';

export const BillCustomizationView: React.FC<BillCustomizationViewProps> = ({
  companySettings,
  designs,
  documentMapping,
  recentInvoices = [],
  customers = [],
  onSaveDesign,
  onDeleteDesign,
  onUpdateMapping,
  onBackToInvoices
}) => {
  // Active design selection
  const [selectedDesignId, setSelectedDesignId] = useState<string>(
    designs[0]?.id || 'design_classic_ref'
  );

  const initialActive = designs.find(d => d.id === selectedDesignId) || designs[0] || createDefaultBillSettings();
  const [currentDesign, setCurrentDesign] = useState<BillCustomizationSettings>(
    JSON.parse(JSON.stringify(initialActive))
  );

  const [activeTab, setActiveTab] = useState<CustomizationTab>('templates');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [selectedPreviewInvoiceId, setSelectedPreviewInvoiceId] = useState<string>('sample');
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Sync state if selectedDesignId changes from dropdown
  const handleSelectDesign = (designId: string) => {
    setSelectedDesignId(designId);
    const found = designs.find(d => d.id === designId);
    if (found) {
      setCurrentDesign(JSON.parse(JSON.stringify(found)));
    }
  };

  // Preview Invoice selection
  const previewInvoice: Invoice = useMemo(() => {
    if (selectedPreviewInvoiceId === 'sample' || recentInvoices.length === 0) {
      return SAMPLE_PREVIEW_INVOICE;
    }
    return recentInvoices.find(inv => inv.id === selectedPreviewInvoiceId) || SAMPLE_PREVIEW_INVOICE;
  }, [selectedPreviewInvoiceId, recentInvoices]);

  const previewCustomer: Customer | undefined = useMemo(() => {
    if (selectedPreviewInvoiceId === 'sample' || customers.length === 0) {
      return SAMPLE_PREVIEW_CUSTOMER;
    }
    return customers.find(c => c.id === previewInvoice.customerId);
  }, [selectedPreviewInvoiceId, previewInvoice, customers]);

  // Handle Apply Template
  const handleApplyTemplate = (templateId: TemplateId) => {
    const templateMeta = TEMPLATE_METADATA_LIST.find(t => t.id === templateId);
    if (!templateMeta) return;

    // Pick recommended colors for this template
    const matchedPalette = PRESET_COLOR_PALETTES.find(p => {
      if (templateId === 'corporate_navy') return p.name.includes('Navy');
      if (templateId === 'professional_blue') return p.name.includes('Blue');
      if (templateId === 'minimal_slate') return p.name.includes('Slate');
      if (templateId === 'fire_safety_pro' || templateId === 'classic_gst_ref') return p.name.includes('Fire Red');
      return p.name.includes('Fire Red');
    }) || PRESET_COLOR_PALETTES[0];

    setCurrentDesign(prev => ({
      ...prev,
      templateId,
      colors: { ...matchedPalette.colors },
      updatedAt: new Date().toISOString()
    }));
  };

  // Color modification helper
  const handleColorChange = (key: keyof BillColors, val: string) => {
    setCurrentDesign(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: val
      }
    }));
  };

  // Column reordering and visibility
  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newCols = [...currentDesign.columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCols.length) return;

    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;

    setCurrentDesign(prev => ({ ...prev, columns: newCols }));
  };

  const toggleColumnVisibility = (colId: string) => {
    setCurrentDesign(prev => ({
      ...prev,
      columns: prev.columns.map(col => (col.id === colId ? { ...col, visible: !col.visible } : col))
    }));
  };

  const updateColumnLabel = (colId: string, label: string) => {
    setCurrentDesign(prev => ({
      ...prev,
      columns: prev.columns.map(col => (col.id === colId ? { ...col, label } : col))
    }));
  };

  // Image uploads (Logo & Signature)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentDesign(prev => ({
        ...prev,
        logo: {
          ...prev.logo,
          logoUrl: reader.result as string,
          showLogo: true
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentDesign(prev => ({
        ...prev,
        signature: {
          ...prev.signature,
          signatureImage: reader.result as string,
          showSignature: true,
          showStampSeal: false
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save current design
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveDesign({
        ...currentDesign,
        updatedAt: new Date().toISOString()
      });
      setSaveSuccessMessage('Design profile saved successfully!');
      setTimeout(() => setSaveSuccessMessage(''), 3500);
    } catch (e: any) {
      alert('Failed to save design: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new design profile
  const handleCreateNew = () => {
    const name = prompt('Enter a name for the new design profile (e.g. "Corporate AMC Invoice"):');
    if (!name) return;

    const newDesign = createDefaultBillSettings('classic_gst_ref', name.trim());
    newDesign.id = `design_${Date.now()}`;
    newDesign.isDefault = false;

    setCurrentDesign(newDesign);
    onSaveDesign(newDesign);
    setSelectedDesignId(newDesign.id);
  };

  // Duplicate current design
  const handleDuplicate = () => {
    const newDesign: BillCustomizationSettings = {
      ...JSON.parse(JSON.stringify(currentDesign)),
      id: `design_${Date.now()}`,
      name: `${currentDesign.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentDesign(newDesign);
    onSaveDesign(newDesign);
    setSelectedDesignId(newDesign.id);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Reset this design to factory standard GST layout and colors?')) {
      const reset = createDefaultBillSettings(currentDesign.templateId, currentDesign.name);
      reset.id = currentDesign.id;
      setCurrentDesign(reset);
    }
  };

  // Print Preview
  const handlePrintTest = () => {
    window.print();
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    await generateInvoicePDF(previewInvoice, companySettings, previewCustomer, currentDesign);
  };

  const tabs: { id: CustomizationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'templates', label: '10 Templates', icon: <Layout className="w-4 h-4" /> },
    { id: 'colors', label: 'Colors & Theme', icon: <Palette className="w-4 h-4" /> },
    { id: 'columns', label: 'Columns & Grid', icon: <Columns3 className="w-4 h-4" /> },
    { id: 'header', label: 'Header Info', icon: <Building2 className="w-4 h-4" /> },
    { id: 'logo', label: 'Company Logo', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'customer', label: 'Customer Block', icon: <Users className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank Details', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'qr', label: 'Payment QR', icon: <QrCode className="w-4 h-4" /> },
    { id: 'signature', label: 'Sign & Seal', icon: <FileSignature className="w-4 h-4" /> },
    { id: 'gst_payment', label: 'GST & Totals', icon: <Percent className="w-4 h-4" /> },
    { id: 'terms_words', label: 'Terms & Words', icon: <FileText className="w-4 h-4" /> },
    { id: 'page_footer', label: 'Page & Footer', icon: <Sliders className="w-4 h-4" /> }
  ];

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 pb-24 lg:pb-12">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 text-red-700 font-bold">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Bill & Invoice Customization Studio
              </h1>
              <p className="text-xs text-slate-500">
                Design 100% compliant Indian GST invoices, adjust colors, reorder columns, dynamic UPI QR, & seals
              </p>
            </div>
          </div>
        </div>

        {/* Profile Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Profile Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDesignId}
              onChange={e => handleSelectDesign(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {designs.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
            title="Create New Design Profile"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicate}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
            title="Duplicate Current Design"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Duplicate</span>
          </button>

          {/* Download Sample PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Download PDF with Current Design"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Print Test */}
          <button
            type="button"
            onClick={handlePrintTest}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Print Test"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Primary Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Mobile Mode Switcher: Edit Controls vs Live Preview */}
      <div className="flex lg:hidden bg-slate-200 p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMobileViewMode('editor')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileViewMode === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Customization Controls</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileViewMode('preview')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileViewMode === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Bill Preview</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Category Tabs & Controls Panel (8 cols on lg or 5 cols) */}
        <div className={`lg:col-span-6 xl:col-span-5 space-y-4 ${mobileViewMode === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Tabs Navigation Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-[10px] truncate max-w-full">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Panel Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
            {/* 1. Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Select 1 of 10 Pre-Built Design Templates
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                    {TEMPLATE_METADATA_LIST.length} Designs
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {TEMPLATE_METADATA_LIST.map(tmpl => {
                    const isCurrent = currentDesign.templateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => handleApplyTemplate(tmpl.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isCurrent
                            ? 'border-red-600 bg-red-50/40 ring-2 ring-red-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{ backgroundColor: tmpl.themeColor }}
                            />
                            <span className="font-bold text-xs text-slate-900">{tmpl.name}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isCurrent ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isCurrent ? 'Active Template' : tmpl.badge}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug">{tmpl.description}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {tmpl.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                            >
                              • {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">Preset Color Palettes</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Click any palette to instantly apply harmonized colors
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_COLOR_PALETTES.map((pal, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() =>
                          setCurrentDesign(prev => ({
                            ...prev,
                            colors: { ...pal.colors }
                          }))
                        }
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all text-left flex items-center justify-between gap-2"
                      >
                        <span className="text-[11px] font-bold text-slate-800 truncate">{pal.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ backgroundColor: pal.colors.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ backgroundColor: pal.colors.headerBg }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-sm">Individual Color Customization</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          colors: { ...PRESET_COLOR_PALETTES[0].colors }
                        }))
                      }
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Reset Colors
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Primary Brand Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentDesign.colors.primary}
                          onChange={e => handleColorChange('primary', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <input
                          type="text"
                          value={currentDesign.colors.primary}
                          onChange={e => handleColorChange('primary', e.target.value)}
                          className="w-full px-2 py-1.5 font-mono text-xs uppercase rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Table Header BG</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentDesign.colors.tableHeaderBg}
                          onChange={e => handleColorChange('tableHeaderBg', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <input
                          type="text"
                          value={currentDesign.colors.tableHeaderBg}
                          onChange={e => handleColorChange('tableHeaderBg', e.target.value)}
                          className="w-full px-2 py-1.5 font-mono text-xs uppercase rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Table Header Text</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentDesign.colors.tableHeaderText}
                          onChange={e => handleColorChange('tableHeaderText', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <input
                          type="text"
                          value={currentDesign.colors.tableHeaderText}
                          onChange={e => handleColorChange('tableHeaderText', e.target.value)}
                          className="w-full px-2 py-1.5 font-mono text-xs uppercase rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Header Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentDesign.colors.headerBg}
                          onChange={e => handleColorChange('headerBg', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <input
                          type="text"
                          value={currentDesign.colors.headerBg}
                          onChange={e => handleColorChange('headerBg', e.target.value)}
                          className="w-full px-2 py-1.5 font-mono text-xs uppercase rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Borders Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentDesign.colors.borderColor}
                          onChange={e => handleColorChange('borderColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <input
                          type="text"
                          value={currentDesign.colors.borderColor}
                          onChange={e => handleColorChange('borderColor', e.target.value)}
                          className="w-full px-2 py-1.5 font-mono text-xs uppercase rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Page Canvas BG</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentDesign.colors.pageBackground}
                          onChange={e => handleColorChange('pageBackground', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <input
                          type="text"
                          value={currentDesign.colors.pageBackground}
                          onChange={e => handleColorChange('pageBackground', e.target.value)}
                          className="w-full px-2 py-1.5 font-mono text-xs uppercase rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Columns Tab */}
            {activeTab === 'columns' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">Invoice Item Table Columns</h3>
                  <p className="text-xs text-slate-500">
                    Toggle visibility, rename headers, and reorder positions using the Up/Down buttons
                  </p>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {currentDesign.columns.map((col, idx) => (
                    <div
                      key={col.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        col.visible ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      {/* Left: Toggle & Label */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleColumnVisibility(col.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            col.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}
                          title={col.visible ? 'Hide column' : 'Show column'}
                        >
                          {col.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <input
                          type="text"
                          value={col.label}
                          onChange={e => updateColumnLabel(col.id, e.target.value)}
                          className="text-xs font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-red-500 focus:outline-hidden px-1 py-0.5 w-full"
                        />
                      </div>

                      {/* Right: Reorder Up/Down */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveColumn(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                          title="Move column up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveColumn(idx, 'down')}
                          disabled={idx === currentDesign.columns.length - 1}
                          className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                          title="Move column down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Header Tab */}
            {activeTab === 'header' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Document Title & Header Metadata</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Invoice Main Title</label>
                    <input
                      type="text"
                      value={currentDesign.header.titleText}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          header: { ...prev.header, titleText: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={currentDesign.header.recipientBadgeText}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          header: { ...prev.header, recipientBadgeText: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'showTitle', label: 'Show Title Text' },
                      { key: 'showRecipientBadge', label: 'Show Recipient Badge' },
                      { key: 'showInvoiceNo', label: 'Show Invoice Number' },
                      { key: 'showInvoiceDate', label: 'Show Invoice Date' },
                      { key: 'showDueDate', label: 'Show Payment Due Date' },
                      { key: 'showGstin', label: 'Show Company GSTIN' },
                      { key: 'showPan', label: 'Show Company PAN' },
                      { key: 'showMsme', label: 'Show MSME / UDYAM' },
                      { key: 'showPhone', label: 'Show Phone Number' },
                      { key: 'showEmail', label: 'Show Email Address' },
                      { key: 'showWebsite', label: 'Show Website' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(currentDesign.header as any)[item.key]}
                          onChange={e =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              header: { ...prev.header, [item.key]: e.target.checked }
                            }))
                          }
                          className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                        />
                        <span className="text-slate-700 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Company Logo Tab */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Company Logo Customization</h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={currentDesign.logo.showLogo}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          logo: { ...prev.logo, showLogo: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Display Logo on Invoices</span>
                  </label>

                  {/* Upload Custom Logo */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Upload Custom Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                  </div>

                  {/* Logo Size */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Logo Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['small', 'medium', 'large'].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              logo: { ...prev.logo, size: sz as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold capitalize rounded-lg border ${
                            currentDesign.logo.size === sz
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Position */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'top_left', label: 'Top Left' },
                        { id: 'top_center', label: 'Centered' },
                        { id: 'top_right', label: 'Top Right' }
                      ].map(pos => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              logo: { ...prev.logo, position: pos.id as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold rounded-lg border ${
                            currentDesign.logo.position === pos.id
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Customer Block Tab */}
            {activeTab === 'customer' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Customer & Place of Supply Block</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Layout Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'side_by_side', label: 'Side-by-Side (Bill To & Ship To)' },
                        { id: 'stacked', label: 'Stacked Vertically' }
                      ].map(l => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              customer: { ...prev.customer, layout: l.id as any }
                            }))
                          }
                          className={`p-2 text-xs font-semibold rounded-lg border text-center ${
                            currentDesign.customer.layout === l.id
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'showBillTo', label: 'Show Bill To Block' },
                      { key: 'showShipTo', label: 'Show Ship To Block' },
                      { key: 'showBillingAddress', label: 'Show Billing Address' },
                      { key: 'showShippingAddress', label: 'Show Shipping Address' },
                      { key: 'showCustomerGstin', label: 'Show Customer GSTIN' },
                      { key: 'showCustomerPan', label: 'Show Customer PAN' },
                      { key: 'showCustomerMobile', label: 'Show Customer Mobile' },
                      { key: 'showCustomerEmail', label: 'Show Customer Email' },
                      { key: 'showPlaceOfSupply', label: 'Show Place of Supply' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(currentDesign.customer as any)[item.key]}
                          onChange={e =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              customer: { ...prev.customer, [item.key]: e.target.checked }
                            }))
                          }
                          className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                        />
                        <span className="text-slate-700 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Bank Details Tab */}
            {activeTab === 'bank' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Bank Credentials & Position</h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={currentDesign.bank.showBankDetails}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          bank: { ...prev.bank, showBankDetails: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Print Bank Details on Invoices</span>
                  </label>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Position on Invoice</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bottom_left', label: 'Bottom Left' },
                        { id: 'bottom_right', label: 'Bottom Right' },
                        { id: 'full_width', label: 'Full Width' }
                      ].map(pos => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              bank: { ...prev.bank, position: pos.id as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold rounded-lg border ${
                            currentDesign.bank.position === pos.id
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'showBankName', label: 'Show Bank Name' },
                      { key: 'showAccountName', label: 'Show A/C Name' },
                      { key: 'showAccountNumber', label: 'Show A/C Number' },
                      { key: 'showIfsc', label: 'Show IFSC Code' },
                      { key: 'showBranch', label: 'Show Branch Name' },
                      { key: 'showAccountType', label: 'Show Account Type' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(currentDesign.bank as any)[item.key]}
                          onChange={e =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              bank: { ...prev.bank, [item.key]: e.target.checked }
                            }))
                          }
                          className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                        />
                        <span className="text-slate-700 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. Payment QR Code Tab */}
            {activeTab === 'qr' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Dynamic UPI Payment QR Code</h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={currentDesign.qr.showQr}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          qr: { ...prev.qr, showQr: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Print UPI Payment QR Code</span>
                  </label>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Embedded QR Amount</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'outstanding_balance', label: 'Outstanding Balance (Recommended)' },
                        { id: 'full_amount', label: 'Full Invoice Grand Total' }
                      ].map(amt => (
                        <button
                          key={amt.id}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              qr: { ...prev.qr, amountType: amt.id as any }
                            }))
                          }
                          className={`p-2 text-xs font-semibold rounded-lg border text-center ${
                            currentDesign.qr.amountType === amt.id
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {amt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">QR Code Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['small', 'medium', 'large'].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              qr: { ...prev.qr, size: sz as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold capitalize rounded-lg border ${
                            currentDesign.qr.size === sz
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentDesign.qr.showUpiId}
                        onChange={e =>
                          setCurrentDesign(prev => ({
                            ...prev,
                            qr: { ...prev.qr, showUpiId: e.target.checked }
                          }))
                        }
                        className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="text-slate-700 font-medium">Show UPI ID text under QR</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentDesign.qr.showInstructions}
                        onChange={e =>
                          setCurrentDesign(prev => ({
                            ...prev,
                            qr: { ...prev.qr, showInstructions: e.target.checked }
                          }))
                        }
                        className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="text-slate-700 font-medium">Show Scan & Pay instructions</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 9. Sign & Seal Tab */}
            {activeTab === 'signature' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Authorized Signature & Seal Stamp</h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={currentDesign.signature.showSignature}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          signature: { ...prev.signature, showSignature: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Show Authorized Signatory Block</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDesign.signature.showStampSeal}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          signature: { ...prev.signature, showStampSeal: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-medium text-slate-700">Display Official Round Seal Stamp</span>
                  </label>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Upload Custom Signature / Stamp Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Signatory Prefix Text</label>
                    <input
                      type="text"
                      value={currentDesign.signature.signatoryText}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          signature: { ...prev.signature, signatoryText: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. GST & Payments Tab */}
            {activeTab === 'gst_payment' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Tax Summary & Totals Breakdown</h3>

                <div className="space-y-2.5 text-xs">
                  {[
                    { key: 'showTaxableAmount', label: 'Show Taxable Amount' },
                    { key: 'showCgst', label: 'Show CGST Total' },
                    { key: 'showSgst', label: 'Show SGST Total' },
                    { key: 'showIgst', label: 'Show IGST Total' },
                    { key: 'showRoundOff', label: 'Show Round Off' },
                    { key: 'showGrandTotal', label: 'Show Grand Total' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(currentDesign.gst as any)[item.key]}
                        onChange={e =>
                          setCurrentDesign(prev => ({
                            ...prev,
                            gst: { ...prev.gst, [item.key]: e.target.checked }
                          }))
                        }
                        className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="text-slate-700 font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-bold text-slate-800 text-sm pt-3 border-t border-slate-100">
                  Payment Status & Balance Due
                </h3>

                <div className="space-y-2.5 text-xs">
                  {[
                    { key: 'showPaymentSummary', label: 'Show Payment Summary Section' },
                    { key: 'showReceivedAmount', label: 'Show Amount Paid' },
                    { key: 'showBalanceDue', label: 'Show Balance Due' },
                    { key: 'showPaymentStatus', label: 'Show Status Badge (PAID / DUE)' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(currentDesign.payment as any)[item.key]}
                        onChange={e =>
                          setCurrentDesign(prev => ({
                            ...prev,
                            payment: { ...prev.payment, [item.key]: e.target.checked }
                          }))
                        }
                        className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="text-slate-700 font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 11. Terms & Words Tab */}
            {activeTab === 'terms_words' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Terms & Conditions & Amount In Words</h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={currentDesign.terms.showTerms}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          terms: { ...prev.terms, showTerms: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Display Terms & Conditions</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDesign.amountInWords.showAmountInWords}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          amountInWords: { ...prev.amountInWords, showAmountInWords: e.target.checked }
                        }))
                      }
                      className="rounded-xs text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Display Amount In Words</span>
                  </label>

                  {/* Terms List editor */}
                  <div className="pt-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Terms Lines (One per line)
                    </label>
                    <textarea
                      rows={5}
                      value={currentDesign.terms.termsList.join('\n')}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          terms: { ...prev.terms, termsList: e.target.value.split('\n') }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 12. Page & Footer Tab */}
            {activeTab === 'page_footer' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Page Sizing, Margins & Typography</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Page Paper Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['A4', 'A5', 'Letter'].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              page: { ...prev.page, pageSize: sz as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold rounded-lg border ${
                            currentDesign.page.pageSize === sz
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Font Family</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'sans', label: 'Clean Sans' },
                        { id: 'serif', label: 'Serif Classic' },
                        { id: 'mono', label: 'Monospace' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              page: { ...prev.page, fontFamily: f.id as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold rounded-lg border ${
                            currentDesign.page.fontFamily === f.id
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Font Scale</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['compact', 'regular', 'large'].map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() =>
                            setCurrentDesign(prev => ({
                              ...prev,
                              page: { ...prev.page, fontSize: scale as any }
                            }))
                          }
                          className={`py-1.5 text-xs font-semibold capitalize rounded-lg border ${
                            currentDesign.page.fontSize === scale
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Footer Note Text</label>
                    <textarea
                      rows={2}
                      value={currentDesign.footer.customFooterText}
                      onChange={e =>
                        setCurrentDesign(prev => ({
                          ...prev,
                          footer: { ...prev.footer, customFooterText: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Real-Time Live Preview (7 cols on lg or 7 cols on xl) */}
        <div className={`lg:col-span-6 xl:col-span-7 space-y-3 ${mobileViewMode === 'editor' ? 'hidden lg:block' : 'block'}`}>
          {/* Preview Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Live Real-Time Document Preview</span>
            </div>

            {/* Test Invoice Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Preview Data:</span>
              <select
                value={selectedPreviewInvoiceId}
                onChange={e => setSelectedPreviewInvoiceId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden"
              >
                <option value="sample">Sample Reliance Invoice (4 Items)</option>
                {recentInvoices.slice(0, 8).map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNo} - {inv.customerName.slice(0, 20)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Canvas Viewport Container */}
          <div className="bg-slate-200/80 p-2 sm:p-4 rounded-2xl border border-slate-300/80 overflow-x-auto shadow-inner flex justify-center">
            <div className="min-w-full flex justify-center">
              <LiveBillPreview
                settings={currentDesign}
                invoice={previewInvoice}
                companySettings={companySettings}
                customer={previewCustomer}
                className="shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
