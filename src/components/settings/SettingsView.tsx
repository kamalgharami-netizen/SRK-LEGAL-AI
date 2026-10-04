import React, { useState } from 'react';
import {
  Building2,
  Save,
  Download,
  Upload,
  RefreshCw,
  Check,
  CreditCard,
  Keyboard,
  ShieldCheck,
} from 'lucide-react';
import { CompanyProfile } from '../../types/erp';
import { StorageService } from '../../services/storage';

interface SettingsViewProps {
  company: CompanyProfile;
  onSaveCompany: (company: CompanyProfile) => void;
  onResetData: () => void;
  onDatabaseImported: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  onSaveCompany,
  onResetData,
  onDatabaseImported,
}) => {
  const [form, setForm] = useState<CompanyProfile>(company);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleChange = (field: keyof CompanyProfile, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const json = StorageService.exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SRK_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDatabase(content);
      if (success) {
        setImportStatus('Database successfully restored!');
        onDatabaseImported();
      } else {
        setImportStatus('Failed to import database file. Invalid format.');
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Company Settings & System Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure business identity, print headers, invoice sequences & local backups
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <Check className="h-4 w-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Company / Business Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Display Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">GSTIN (Tax Identifier)</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">PAN Number</label>
              <input
                type="text"
                value={form.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Physical Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">State (Place of Supply)</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Banking & UPI */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Default Bank Account for Invoices</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank Account Number</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => handleChange('bankAccount', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">IFSC Code</label>
              <input
                type="text"
                value={form.bankIfsc}
                onChange={(e) => handleChange('bankIfsc', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">UPI ID (QR Payments)</label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Billing & Invoicing Preferences */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            Invoice Formats & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sale Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estimate Prefix</label>
              <input
                type="text"
                value={form.estimatePrefix}
                onChange={(e) => handleChange('estimatePrefix', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">Default Terms & Conditions</label>
              <textarea
                rows={3}
                value={form.defaultInvoiceTerms}
                onChange={(e) => handleChange('defaultInvoiceTerms', e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Company Preferences</span>
          </button>
        </div>
      </form>

      {/* Backup, Restore & Reset Section */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Database Backup & Recovery</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          SRK ERP Software stores all transactions, inventory records, and party ledgers in your local browser storage. Download periodic JSON backups to ensure your business data is secure or transfer to other machines.
        </p>

        {importStatus && (
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Database Backup (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            <span>Restore Backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all transactions and parties to default sample business data?')) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Keyboard className="h-4 w-4 text-indigo-600" />
          <span>Quick Keyboard Shortcuts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300">F1</kbd> New Sale Invoice</div>
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300">F2</kbd> New Purchase Bill</div>
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300">ESC</kbd> Close Dialogs</div>
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300">Ctrl+P</kbd> Print Receipt</div>
        </div>
      </div>
    </div>
  );
};
