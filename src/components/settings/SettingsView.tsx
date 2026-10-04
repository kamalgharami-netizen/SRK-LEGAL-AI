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
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { CompanyProfile } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';

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
  const { langMode, setLangMode, t } = useLanguage();
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
        setImportStatus(t('Database successfully restored!', 'ডাটাবেস সফলভাবে উদ্ধার করা হয়েছে!'));
        onDatabaseImported();
      } else {
        setImportStatus(t('Failed to import database file. Invalid format.', 'ডাটাবেস ফাইল ইমপোর্ট ব্যর্থ হয়েছে।'));
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
            {t('Company Settings & System Configuration', 'প্রতিষ্ঠান সেটিংস ও সিস্টেম কনফিগারেশন')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Configure business identity, language preferences, print headers & local backups',
              'ব্যবসায়িক পরিচয়, ভাষা নির্বাচন, ইনভয়েস হেডার ও লোকাল ব্যাকআপ সেট করুন'
            )}
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <Check className="h-4 w-4" />
            <span>{t('Settings saved successfully!', 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')}</span>
          </div>
        )}
      </div>

      {/* Language Preference Section */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t('Software Display Language', 'সফটওয়্যার প্রদর্শনের ভাষা')}
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {langMode === 'en' ? 'Primary: English' : 'সক্রিয়: বাংলা'}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          {t(
            'Select your preferred application language. English is the default primary language. Switching to Bengali translates all menus, invoices, legal dossiers, and reports.',
            'আপনার পছন্দের ভাষা নির্বাচন করুন। ইংরেজি হলো প্রাথমিক বা ডিফল্ট ভাষা। বাংলায় পরিবর্তন করলে সমস্ত মেনু, ইনভয়েস, আইনি নথি ও হিসাব বিবরণী বাংলায় প্রদর্শিত হবে।'
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* English Option */}
          <button
            type="button"
            onClick={() => setLangMode('en')}
            className={`p-4 rounded-xl border text-left transition-all ${
              langMode === 'en'
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  EN
                </span>
                <span className="text-sm font-bold text-slate-900">English (Primary / Default)</span>
              </div>
              {langMode === 'en' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
            </div>
            <p className="text-xs text-slate-500">
              Clean standard English for ERP, Sales Invoices, Legal Work Tracking & Financial Reports.
            </p>
          </button>

          {/* Bengali Option */}
          <button
            type="button"
            onClick={() => setLangMode('bn')}
            className={`p-4 rounded-xl border text-left transition-all ${
              langMode === 'bn'
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  বাংলা
                </span>
                <span className="text-sm font-bold text-slate-900">বাংলা (Bengali)</span>
              </div>
              {langMode === 'bn' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
            </div>
            <p className="text-xs text-slate-500">
              সহজ বোধগম্য সম্পূর্ণ বাংলা ইন্টারফেস - ইনভয়েস, মিউটেশন, আরটিআই ও পার্টি খতিয়ানের জন্য।
            </p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t('Company / Business Information', 'প্রতিষ্ঠান / ফার্মের তথ্যাবলী')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Company Display Name *', 'প্রতিষ্ঠানের নাম *')}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-900 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Tagline / Subtitle', 'ট্যাগলাইন বা স্লোগান')}
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Official Phone', 'অফিসিয়াল মোবাইল / ফোন')}
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Official Email', 'ইমেইল অ্যাড্রেস')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('GSTIN (Tax Identifier)', 'জিএসটি নম্বর (GSTIN)')}
              </label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono font-semibold focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('PAN Number', 'প্যান কার্ড নম্বর (PAN)')}
              </label>
              <input
                type="text"
                value={form.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Physical Address', 'অফিসের ঠিকানা')}
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('City / District', 'শহর / জেলা')}
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('State (Place of Supply)', 'রাজ্য')}
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Banking & UPI */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t('Default Bank Account for Invoices', 'ইনভয়েসে প্রদর্শিত ব্যাংক একাউন্ট')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Bank Name', 'ব্যাংকের নাম')}
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Bank Account Number', 'একাউন্ট নম্বর')}
              </label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => handleChange('bankAccount', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('IFSC Code', 'আইএফএসসি কোড (IFSC)')}
              </label>
              <input
                type="text"
                value={form.bankIfsc}
                onChange={(e) => handleChange('bankIfsc', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono uppercase focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('UPI ID (QR Payments)', 'ইউপিআই আইডি (UPI ID)')}
              </label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Billing & Invoicing Preferences */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            {t('Invoice Formats & Preferences', 'ইনভয়েস ফরম্যাট ও প্রিফিক্স')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Currency Symbol', 'মুদ্রার প্রতীক')}
              </label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-bold focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Sale Invoice Prefix', 'বিক্রয় ইনভয়েস প্রিফিক্স')}
              </label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Estimate Prefix', 'এস্টিমেট প্রিফিক্স')}
              </label>
              <input
                type="text"
                value={form.estimatePrefix}
                onChange={(e) => handleChange('estimatePrefix', e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">
                {t('Default Terms & Conditions', 'ডিফল্ট শর্তাবলী ও বিবরণ')}
              </label>
              <textarea
                rows={3}
                value={form.defaultInvoiceTerms}
                onChange={(e) => handleChange('defaultInvoiceTerms', e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none leading-relaxed focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{t('Save Company Preferences', 'সেটিংস সংরক্ষণ করুন')}</span>
          </button>
        </div>
      </form>

      {/* Backup, Restore & Reset Section */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {t('Database Backup & Recovery', 'ডাটাবেস ব্যাকআপ ও রিকভারি')}
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t(
            'All transactions, inventory records, party ledgers and case tracker dockets are saved securely in your browser storage. Download periodic JSON backups to ensure your business data is secure.',
            'আপনার সমস্ত ইনভয়েস, স্টক রেকর্ড, পার্টি খতিয়ান ও আইনি কেস লোকাল ব্রাউজারে সুরক্ষিত রয়েছে। নিয়মিত ব্যাকআপ JSON ফাইল ডাউনলোড করে সংরক্ষণ করুন।'
          )}
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
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t('Download Database Backup (JSON)', 'ব্যাকআপ ডাউনলোড (JSON)')}</span>
          </button>

          <label className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5" />
            <span>{t('Restore Backup JSON', 'ব্যাকআপ রিস্টোর করুন')}</span>
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
              const confirmMsg = t(
                'Reset all transactions and parties to default sample business data?',
                'আপনি কি সব ট্রানজাকশন ও পার্টি রিসেট করে ডিফল্ট ডেমো ডাটায় ফিরিয়ে নিতে চান?'
              );
              if (window.confirm(confirmMsg)) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t('Reset Demo Data', 'ডেমো ডাটা রিসেট')}</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Keyboard className="h-4 w-4 text-indigo-600" />
          <span>{t('Quick Keyboard Shortcuts', 'কীবোর্ড শর্টকাট গাইড')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-sans">F1</kbd> {t('New Sale Invoice', 'নতুন বিক্রয় ইনভয়েস')}</div>
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-sans">F2</kbd> {t('New Purchase Bill', 'নতুন ক্রয় বিল')}</div>
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-sans">ESC</kbd> {t('Close Dialogs', 'উইন্ডো বন্ধ')}</div>
          <div><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-sans">Ctrl+P</kbd> {t('Print Document', 'প্রিন্ট রশিদ')}</div>
        </div>
      </div>
    </div>
  );
};
