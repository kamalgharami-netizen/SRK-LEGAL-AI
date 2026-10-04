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
  Smartphone,
  Mail,
  FileSpreadsheet,
  Send,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  HardDrive,
  Cloud,
  FolderArchive,
  Copy,
  FolderOpen,
} from 'lucide-react';
import { CompanyProfile } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { DeviceAuthService, DeviceLoginRecord } from '../../services/deviceAuthService';

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

  // Device Registration & Google Sheets state
  const [registeredUser, setRegisteredUser] = useState(DeviceAuthService.getRegisteredUser());
  const [loginLogs, setLoginLogs] = useState<DeviceLoginRecord[]>(DeviceAuthService.getLoginHistory());
  const [googleSheetWebhook, setGoogleSheetWebhookState] = useState(DeviceAuthService.getGoogleSheetWebhook());
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);

  // Multi-target backup state (Local Path, Google Drive, OneDrive)
  const [preferredLocalPath, setPreferredLocalPath] = useState(StorageService.getPreferredBackupPath());
  const [preferredPathSaved, setPreferredPathSaved] = useState(false);
  const [backupLogs, setBackupLogs] = useState(StorageService.getBackupLogs());
  const [cloudRestoreOpen, setCloudRestoreOpen] = useState(false);
  const [cloudRestoreInput, setCloudRestoreInput] = useState('');
  const [cloudRestoreError, setCloudRestoreError] = useState('');
  const [isProcessingCloud, setIsProcessingCloud] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSavePreferredLocalPath = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.setPreferredBackupPath(preferredLocalPath);
    setPreferredPathSaved(true);
    setTimeout(() => setPreferredPathSaved(false), 2000);
    showToast(t('Preferred local backup directory saved.', 'পছন্দের লোকাল ব্যাকআপ ডিরেক্টরি সংরক্ষিত হয়েছে।'));
  };

  const handleSaveToLocalPath = async () => {
    const json = StorageService.exportDatabase();
    const fileName = `SRK_ERP_Local_Backup_${new Date().toISOString().split('T')[0]}.json`;

    // Try modern File System Access API if supported
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'SRK ERP Database Backup JSON',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();

        StorageService.recordBackupLog({
          destination: 'local',
          fileName,
          customPath: handle.name || preferredLocalPath,
        });
        setBackupLogs(StorageService.getBackupLogs());
        showToast(t('Backup saved to your selected local folder path!', 'আপনার নির্বাচিত ফোল্ডারে ব্যাকআপ সংরক্ষিত হয়েছে!'));
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Standard download fallback
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    StorageService.recordBackupLog({
      destination: 'local',
      fileName,
      customPath: preferredLocalPath || 'Downloads',
    });
    setBackupLogs(StorageService.getBackupLogs());
    showToast(t('Backup JSON saved to local computer.', 'লোকাল কম্পিউটারে ব্যাকআপ JSON সংরক্ষণ সম্পন্ন।'));
  };

  const handleSaveToGoogleDrive = () => {
    const json = StorageService.exportDatabase();
    const fileName = `SRK_ERP_GoogleDrive_Backup_${new Date().toISOString().split('T')[0]}.json`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      navigator.clipboard.writeText(json);
    } catch {}

    window.open('https://drive.google.com/drive/u/0/my-drive', '_blank');

    StorageService.recordBackupLog({
      destination: 'google_drive',
      fileName,
      customPath: 'Google Drive Cloud Storage',
    });
    setBackupLogs(StorageService.getBackupLogs());
    showToast(
      t(
        'Google Drive opened! Backup file downloaded & JSON copied to clipboard for easy upload.',
        'গুগল ড্রাইভ খোলা হয়েছে! ব্যাকআপ ফাইল ডাউনলোড ও ক্লিপবোর্ডে কপি করা হয়েছে।'
      )
    );
  };

  const handleSaveToOneDrive = () => {
    const json = StorageService.exportDatabase();
    const fileName = `SRK_ERP_OneDrive_Backup_${new Date().toISOString().split('T')[0]}.json`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      navigator.clipboard.writeText(json);
    } catch {}

    window.open('https://onedrive.live.com', '_blank');

    StorageService.recordBackupLog({
      destination: 'onedrive',
      fileName,
      customPath: 'Microsoft OneDrive Cloud Storage',
    });
    setBackupLogs(StorageService.getBackupLogs());
    showToast(
      t(
        'Microsoft OneDrive opened! Backup file downloaded & JSON copied to clipboard.',
        'মাইক্রোসফট ওয়ানড্রাইভ খোলা হয়েছে! ব্যাকআপ ফাইল ডাউনলোড ও ক্লিপবোর্ডে কপি করা হয়েছে।'
      )
    );
  };

  const handleRestoreCloudLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudRestoreInput.trim()) return;
    setCloudRestoreError('');
    setIsProcessingCloud(true);

    try {
      let raw = cloudRestoreInput.trim();
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const ok = StorageService.importDatabase(raw);
        if (ok) {
          showToast(t('Data successfully restored from Cloud backup!', 'ক্লাউড ব্যাকআপ থেকে সমস্ত ডাটা সফলভাবে রিস্টোর হয়েছে!'));
          setCloudRestoreOpen(false);
          setCloudRestoreInput('');
          onDatabaseImported();
          return;
        } else {
          throw new Error('Invalid JSON format');
        }
      }

      // Try Google Drive share link resolution
      const gDriveMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (gDriveMatch && gDriveMatch[1]) {
        raw = `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
      }

      const res = await fetch(raw);
      if (!res.ok) throw new Error('Cloud fetch failed');
      const text = await res.text();
      const ok = StorageService.importDatabase(text);
      if (ok) {
        showToast(t('Data successfully restored from Cloud backup!', 'ক্লাউড ব্যাকআপ থেকে সমস্ত ডাটা সফলভাবে রিস্টোর হয়েছে!'));
        setCloudRestoreOpen(false);
        setCloudRestoreInput('');
        onDatabaseImported();
      } else {
        throw new Error('Invalid backup file');
      }
    } catch {
      setCloudRestoreError(
        t(
          'Could not restore directly from link (due to cloud access restrictions). Please download the JSON file to your PC and use "Restore from Local Computer".',
          'ক্লাউড প্রাইভেসির কারণে সরাসরি পড়া যায়নি। ফাইলটি কম্পিউটারে ডাউনলোড করে "লোকাল কম্পিউটার থেকে রিস্টোর" ব্যবহার করুন।'
        )
      );
    } finally {
      setIsProcessingCloud(false);
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    DeviceAuthService.setGoogleSheetWebhook(googleSheetWebhook);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  };

  const handleTestAlert = async () => {
    setTestNotificationStatus('sending');
    const record = await DeviceAuthService.recordLoginSession();
    if (record) {
      setLoginLogs(DeviceAuthService.getLoginHistory());
      setTestNotificationStatus('sent');
      setTimeout(() => setTestNotificationStatus(null), 3000);
    } else {
      setTestNotificationStatus('error');
    }
  };

  const handleExportLoginRows = () => {
    DeviceAuthService.exportLoginsToCsv();
  };

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

      {/* Device Registration & Google Sheets Login Notification Section */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t(
                  'Device Registration & Login Security Audit',
                  'ডিভাইস নিবন্ধন ও লগইন নিরাপত্তা অডিট'
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'Every device login is automatically audited and stored row-wise with full system details.',
                  'প্রতিটি ডিভাইসের লগইন স্বয়ংক্রিয়ভাবে অডিট ও সম্পূর্ণ তথ্য সহ সংরক্ষিত হয়।'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportLoginRows}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t('Export to Google Sheet (CSV)', 'গুগল শিটে এক্সপোর্ট (CSV)')}</span>
            </button>

            <button
              type="button"
              onClick={handleTestAlert}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t('Test Send Alert', 'টেস্ট নোটিফিকেশন পাঠান')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    t(
                      'Reset device registration to re-test mandatory OTP registration on next launch?',
                      'বাধ্যতামূলক ওটিপি পরীক্ষা করতে ডিভাইসের নিবন্ধন রিসেট করবেন?'
                    )
                  )
                ) {
                  DeviceAuthService.resetRegistration();
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
              <span>{t('Reset Device / Test OTP', 'ওটিপি রিসেট ও টেস্ট')}</span>
            </button>
          </div>
        </div>

        {testNotificationStatus === 'sending' && (
          <div className="p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>{t('Dispatching security test notification...', 'টেস্ট নোটিফিকেশন পাঠানো হচ্ছে...')}</span>
          </div>
        )}
        {testNotificationStatus === 'sent' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{t('Alert successfully dispatched and logged in security table!', 'সফলভাবে নোটিফিকেশন পাঠানো হয়েছে এবং টেবিলে সংরক্ষিত হয়েছে!')}</span>
          </div>
        )}

        {/* Current Device Registration Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">
              {t('Registered Mobile Number', 'নিবন্ধিত মোবাইল নম্বর')}:
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
              <Smartphone className="h-4 w-4 text-indigo-600" />
              {registeredUser?.mobile || t('Not Registered Yet', 'এখনও নিবন্ধিত হয়নি')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">
              {t('Registered User / Chamber', 'ব্যবহারকারী বা চেম্বার')}:
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {registeredUser?.name || 'Advocate / Business Office'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">
              {t('Security Audit Channel', 'নিরাপত্তা অডিট চ্যানেল')}:
            </span>
            <span className="font-mono font-bold text-emerald-700 text-xs flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {t('Encrypted & Active', 'এনক্রিপ্টেড ও সক্রিয়')}
            </span>
          </div>
        </div>

        {/* Google Sheets Webhook Configuration */}
        <form onSubmit={handleSaveWebhook} className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t('Google Sheets Sync Webhook URL (Optional Auto-Sync)', 'গুগল শিট অটো-সিঙ্ক ওয়েবহুক লিঙ্ক (ঐচ্ছিক)')}</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec or SheetDB API URL"
              value={googleSheetWebhook}
              onChange={(e) => setGoogleSheetWebhookState(e.target.value)}
              className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
            />
            <button
              type="submit"
              className="h-9 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              {webhookSaved ? t('Saved!', 'সংরক্ষিত!') : t('Save Webhook', 'লিঙ্ক সংরক্ষণ')}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {t(
              'Paste your Google Apps Script Web App URL or SheetDB endpoint to auto-append rows to your live Google Sheet on every login.',
              'আপনার গুগল অ্যাপ স্ক্রিপ্ট বা শীটডিবি লিঙ্ক দিলে প্রতিটি নতুন লগইনের রো সরাসরি আপনার গুগল শিটে যোগ হবে।'
            )}
          </span>
        </form>

        {/* Row-Wise Login Audit Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">
              {t('Row-Wise Login & Device Access History', 'প্রতিটি লগইনের রো-ভিত্তিক রেকর্ড')}
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              {loginLogs.length} {t('records logged', 'টি লগইন সংরক্ষিত')}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-64">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase font-mono text-[10px] sticky top-0">
                <tr>
                  <th className="py-2 px-3">{t('Timestamp (IST)', 'তারিখ ও সময়')}</th>
                  <th className="py-2 px-3">{t('Mobile Number', 'মোবাইল নম্বর')}</th>
                  <th className="py-2 px-3">{t('User Name', 'নাম')}</th>
                  <th className="py-2 px-3">{t('Device & OS', 'ডিভাইস ও ওএস')}</th>
                  <th className="py-2 px-3">{t('Browser', 'ব্রাউজার')}</th>
                  <th className="py-2 px-3">{t('IP & Location', 'আইপি ও লোকেশন')}</th>
                  <th className="py-2 px-3 text-right">{t('Alert Destination', 'বিজ্ঞপ্তি')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loginLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 font-sans">
                      {t('No login history recorded yet.', 'এখনও কোনো লগইন হিস্টোরি তৈরি হয়নি।')}
                    </td>
                  </tr>
                ) : (
                  loginLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-800 font-semibold">{log.formattedDate}</td>
                      <td className="py-2 px-3 text-indigo-700 font-bold">{log.mobile}</td>
                      <td className="py-2 px-3 font-sans text-slate-700">{log.userName}</td>
                      <td className="py-2 px-3 text-slate-600">{log.os} ({log.deviceType})</td>
                      <td className="py-2 px-3 text-slate-500">{log.browser}</td>
                      <td className="py-2 px-3 text-slate-600">{log.ip} • {log.location}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          kamalgharami@gmail.com
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Backup, Restore & Multi-Target Cloud Storage Section */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t('Database Backup & Multi-Target Storage', 'ডাটাবেস ব্যাকআপ ও মাল্টি-টার্গেট সংরক্ষণ')}
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
            Local • Google Drive • OneDrive
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t(
            'Store all your company data, GST invoices, party ledgers, and legal case dockets to your preferred destination: Google Drive, Microsoft OneDrive, or any chosen local path on your computer.',
            'আপনার সমস্ত কোম্পানির তথ্য, জিএসটি ইনভয়েস, পার্টি লেজার ও লিগ্যাল কেস ফাইল পছন্দের স্থানে ব্যাকআপ রাখুন: গুগল ড্রাইভ, মাইক্রোসফট ওয়ানড্রাইভ বা লোকাল কম্পিউটারের যেকোনো পাথে।'
          )}
        </p>

        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {importStatus && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold">
            {importStatus}
          </div>
        )}

        {/* 3 Prominent Backup Action Cards: Local Computer, Google Drive, OneDrive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Local Computer / Selected Path */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-400 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <HardDrive className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">Local PC</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {t('Local Computer Path', 'লোকাল কম্পিউটার পাথ')}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t('Save to your chosen folder or disk directory.', 'কম্পিউটারের নির্দিষ্ট ফোল্ডার বা পাথে সংরক্ষণ করুন।')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveToLocalPath}
              className="w-full h-8 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="h-3 w-3" />
              <span>{t('Choose Path & Save', 'পাথ নির্বাচন ও সেভ')}</span>
            </button>
          </div>

          {/* Card 2: Google Drive */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40 hover:border-emerald-400 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Cloud className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 font-mono">Google Cloud</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {t('Google Drive Storage', 'গুগল ড্রাইভ ব্যাকআপ')}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t('Export and open your Google Drive folder to store securely.', 'গুগল ড্রাইভ ফোল্ডারে ফাইল ও ক্লাউড কপি সেভ করুন।')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveToGoogleDrive}
              className="w-full h-8 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{t('Save to Google Drive', 'গুগল ড্রাইভে সংরক্ষণ')}</span>
            </button>
          </div>

          {/* Card 3: Microsoft OneDrive */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/20 hover:bg-sky-50/40 hover:border-sky-400 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Cloud className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-sky-700 font-mono">OneDrive</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {t('Microsoft OneDrive', 'মাইক্রোসফট ওয়ানড্রাইভ')}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t('Save directly into your Microsoft OneDrive personal or work drive.', 'মাইক্রোসফট ওয়ানড্রাইভে সরাসরি ব্যাকআপ সেভ করুন।')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveToOneDrive}
              className="w-full h-8 px-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{t('Save to OneDrive', 'ওয়ানড্রাইভে সংরক্ষণ')}</span>
            </button>
          </div>
        </div>

        {/* Custom Local Path Configuration */}
        <form onSubmit={handleSavePreferredLocalPath} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t('Selected Local Backup Directory / Path', 'নির্দিষ্ট লোকাল ব্যাকআপ পাথ')}</span>
            </label>
            <span className="text-[10px] text-slate-400">
              {t('Local drive destination on your computer', 'আপনার কম্পিউটারের ড্রাইভ বা ফোল্ডার')}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={preferredLocalPath}
              onChange={(e) => setPreferredLocalPath(e.target.value)}
              placeholder="e.g. D:\SRK_ERP_Backups\ or /home/user/backups/"
              className="flex-1 h-8 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
            />
            <button
              type="submit"
              className="h-8 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shrink-0"
            >
              {preferredPathSaved ? t('Saved!', 'সংরক্ষিত!') : t('Set Path', 'পাথ সেট করুন')}
            </button>
          </div>
        </form>

        {/* Data Restoration Section */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800">
              {t('Restore Data from Local Computer or Cloud', 'লোকাল কম্পিউটার বা ক্লাউড থেকে ডাটা রিস্টোর')}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs cursor-pointer transition-colors">
              <HardDrive className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t('Restore from Local Computer (.json)', 'লোকাল কম্পিউটার থেকে রিস্টোর')}</span>
              <input
                type="file"
                accept=".json,.backup"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setCloudRestoreOpen(!cloudRestoreOpen);
                setCloudRestoreError('');
              }}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <Cloud className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t('Restore from Google Drive / OneDrive Link', 'গুগল ড্রাইভ / ওয়ানড্রাইভ লিঙ্ক থেকে রিস্টোর')}</span>
            </button>

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
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors ml-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t('Reset Demo Data', 'ডেমো ডাটা রিসেট')}</span>
            </button>
          </div>

          {/* Cloud Restore Input Dropdown */}
          {cloudRestoreOpen && (
            <form onSubmit={handleRestoreCloudLink} className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {t('Paste Google Drive / OneDrive Share Link or Raw JSON', 'গুগল ড্রাইভ বা ওয়ানড্রাইভ শেয়ার লিঙ্ক পেস্ট করুন')}
                </span>
                <button
                  type="button"
                  onClick={() => setCloudRestoreOpen(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={cloudRestoreInput}
                  onChange={(e) => setCloudRestoreInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or OneDrive link / raw JSON"
                  className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isProcessingCloud || !cloudRestoreInput.trim()}
                  className="h-9 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                >
                  {isProcessingCloud ? t('Fetching...', 'লোড হচ্ছে...') : t('Restore Data', 'রিস্টোর করুন')}
                </button>
              </div>

              {cloudRestoreError && (
                <p className="text-[11px] text-rose-600">{cloudRestoreError}</p>
              )}
            </form>
          )}
        </div>

        {/* Recent Backup History Table */}
        {backupLogs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800">
              {t('Recent Backup History & Destinations', 'সাম্প্রতিক ব্যাকআপ হিস্টোরি')}
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase font-mono text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">{t('Timestamp', 'তারিখ')}</th>
                    <th className="py-2 px-3">{t('Destination', 'গন্তব্য')}</th>
                    <th className="py-2 px-3">{t('File Name', 'ফাইলের নাম')}</th>
                    <th className="py-2 px-3">{t('Path / Cloud', 'লোকেশন')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {backupLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-800">{log.formattedDate}</td>
                      <td className="py-1.5 px-3">
                        {log.destination === 'google_drive' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-sans font-bold">
                            <Cloud className="h-3 w-3" /> Google Drive
                          </span>
                        ) : log.destination === 'onedrive' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-sans font-bold">
                            <Cloud className="h-3 w-3" /> OneDrive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-sans font-bold">
                            <HardDrive className="h-3 w-3" /> Local Path
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">{log.fileName}</td>
                      <td className="py-1.5 px-3 text-slate-500 truncate max-w-xs">{log.customPath || 'Default'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
