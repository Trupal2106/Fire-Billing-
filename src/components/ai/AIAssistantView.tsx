import React, { useState } from 'react';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  Flame,
  ShieldCheck,
  FileText,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { CompanySettings, Invoice, Customer, AmcContract } from '../../types';

interface AIAssistantViewProps {
  companySettings: CompanySettings;
  customers: Customer[];
  invoices: Invoice[];
  amcContracts: AmcContract[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  companySettings,
  customers,
  invoices,
  amcContracts
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **Patel Fire Safety & Business AI Advisor**.\n\nI can assist you with:\n- **IS 2190 / NBC 2016 Fire Safety Standards** (Extinguisher sizing, placement rules, testing intervals)\n- **Fire Pump & Hydrant Testing Calculations** (GPM flow rates, bar pressure heads)\n- **Drafting Professional Quotation Proposals & WhatsApp Payment Reminders**\n- **GST Tax Categorization** (HSN codes for fire equipment and SAC for AMC services)\n- **AMC Contract Expiry & Inspection Summaries**\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "What are the IS 2190 refilling and hydraulic pressure testing frequencies for ABC & CO2 extinguishers?",
    "Draft a professional WhatsApp payment reminder for a client with overdue invoice.",
    "Recommend fire extinguisher quantities for a 10,000 sq ft industrial engineering workshop.",
    "Draft standard Terms & Conditions for an Annual Fire Hydrant & Extinguisher AMC Contract."
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          businessContext: {
            companyName: companySettings.name || companySettings.companyName || 'Fire Care Safety Solution',
            totalCustomers: customers.length,
            activeAmcCount: amcContracts.filter(a => a.status === 'Active').length,
            totalInvoicesCount: invoices.length
          }
        })
      });

      const data = await res.json();
      const replyContent = data.reply || data.error || 'No response received.';

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Offline Notice: Could not connect to AI service. Note that all your local billing, GST invoicing, and PDF export features remain 100% operational offline.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 pb-24 lg:pb-12 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Fire Safety Intelligence & Assistant
            </h1>
            <p className="text-xs text-slate-500">
              IS 2190 standards lookup, technical draft generator & business advice powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span className="truncate max-w-xs">{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-slate-800'
                  : 'bg-gradient-to-br from-indigo-600 to-indigo-800'
              }`}
            >
              {m.role === 'user' ? 'YOU' : <Sparkles className="w-4 h-4 text-amber-300" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {m.content}
              </div>
              <span
                className={`block text-[10px] mt-1.5 ${
                  m.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Analyzing fire safety standards & formulating advice...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about IS 2190 standards, fire extinguishers, quotations, AMC or client notices..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white shadow-2xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
