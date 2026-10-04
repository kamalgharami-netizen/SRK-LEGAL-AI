import React, { useState } from 'react';
import {
  Building2,
  FolderArchive,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  FileText,
  ShieldCheck,
  Scale,
  Users,
  Package,
  Landmark,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';
import { CompanyProfile } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';

interface CompanySetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  registeredMobile?: string;
  registeredName?: string;
}

const INDIAN_STATES = [
  'West Bengal',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Bihar',
  'Jharkhand',
  'Odisha',
  'Assam',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Telangana',
  'Andhra Pradesh',
  'Kerala',
];

export const CompanySetupModal: React.FC<CompanySetupModalProps> = ({
  isOpen,
  onComplete,
  registeredMobile = '',
  registeredName = '',
}) => {
  const { t } = useLanguage();
  const [view, setView] = useState<'choice' | 'create' | 'import'>('choice');
  const [importSource, setImportSource] = useState<'local' | 'google_drive' | 'onedrive'>('local');

  // Form state for creating a new company
  const [companyForm, setCompanyForm] = useState<CompanyProfile>({
    name: registeredName ? `${registeredName} Office` : 'SRK Enterprises & Legal Office',
    tagline: 'Business ERP & Legal Management Chamber',
    phone: registeredMobile ? `+91 ${registeredMobile}` : '+91 98765 43210',
    email: 'office@srkerp.internal',
    website: '',
    gstin: '',
    pan: '',
    address: 'Chamber / Office Suite 101, Main Road',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700001',
    bankName: 'State Bank of India',
    bankAccount: '',
    bankIfsc: '',
    bankBranch: 'Main Branch',
    upiId: '',
    currencySymbol: '₹',
    taxSystem: 'GST',
    defaultInvoiceTerms:
      '1. Payment due within 15 days of invoice date.\n2. Invoices & Legal dockets are digitally tracked.\n3. Goods or services once billed are subject to standard jurisdictional terms.',
    invoicePrefix: 'INV-2026-',
    estimatePrefix: 'EST-2026-',
    purchasePrefix: 'PUR-2026-',
  });

  // Import State
  const [importedRawJson, setImportedRawJson] = useState<string>('');
  const [importStats, setImportStats] = useState<ReturnType<typeof StorageService.parseBackupStats> | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cloudLinkInput, setCloudLinkInput] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle file reading from local computer or dropped file
  const handleFileSelect = (file: File) => {
    setImportError('');
    if (!file.name.endsWith('.json') && !file.name.endsWith('.backup') && !file.type.includes('json')) {
      setImportError(
        t('Please upload a valid JSON (.json) backup file.', 'অনুগ্রহ করে সঠিক JSON ব্যাকআপ ফাইল আপলোড করুন।')
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setImportError(t('Selected file is empty.', 'ফাইলটি খালি।'));
        return;
      }
      processJsonContent(content);
    };
    reader.onerror = () => {
      setImportError(t('Failed to read local file.', 'লোকাল ফাইলটি পড়তে ব্যর্থ হয়েছে।'));
    };
    reader.readAsText(file);
  };

  // Inspect and process backup JSON payload
  const processJsonContent = (jsonString: string) => {
    setImportError('');
    const stats = StorageService.parseBackupStats(jsonString);
    if (!stats.isValid) {
      setImportError(
        stats.error ||
          t(
            'The selected data is not a valid SRK ERP backup file.',
            'নির্বাচিত ফাইলটিতে সঠিক এসআরকে ইআরপি ব্যাকআপ ডাটা পাওয়া যায়নি।'
          )
      );
      setImportStats(null);
      setImportedRawJson('');
      return;
    }
    setImportedRawJson(jsonString);
    setImportStats(stats);
  };

  // Resolve and fetch Google Drive / OneDrive shared links
  const handleFetchCloudLink = async () => {
    if (!cloudLinkInput.trim()) return;
    setImportError('');
    setIsProcessing(true);

    try {
      let url = cloudLinkInput.trim();

      // Check if user pasted direct raw JSON
      if (url.startsWith('{') && url.endsWith('}')) {
        processJsonContent(url);
        setIsProcessing(false);
        return;
      }

      // Convert standard Google Drive view link to direct download link
      // Format: https://drive.google.com/file/d/FILE_ID/view...
      const gDriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (gDriveMatch && gDriveMatch[1]) {
        const fileId = gDriveMatch[1];
        url = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }

      // Attempt fetch
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Cloud storage response failed');
      }
      const text = await res.text();
      processJsonContent(text);
    } catch {
      setImportError(
        t(
          'Could not directly fetch the file from the link (due to cloud privacy or CORS). Please download the JSON file from Google Drive / OneDrive and select it under "Local Computer", or paste the JSON text here.',
          'ক্লাউড প্রাইভেসির কারণে সরাসরি ডাউনলোড সম্ভব হয়নি। গুগল ড্রাইভ বা ওয়ানড্রাইভ থেকে ফাইলটি ডাউনলোড করে "লোকাল কম্পিউটার" ট্যাবে সিলেক্ট করুন অথবা টেক্সটটি পেস্ট করুন।'
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit New Company Creation
  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim()) return;

    StorageService.saveCompany(companyForm);
    StorageService.setCompanySetupCompleted(true);
    onComplete();
  };

  // Submit Backup Restoration
  const handleConfirmRestore = () => {
    if (!importedRawJson) return;
    setIsProcessing(true);

    setTimeout(() => {
      const ok = StorageService.importDatabase(importedRawJson);
      if (ok) {
        StorageService.setCompanySetupCompleted(true);
        setIsProcessing(false);
        onComplete();
      } else {
        setImportError(
          t(
            'Failed to restore backup data into browser storage.',
            'ব্রাউজার স্টোরেজে ডাটা রিস্টোর করতে সমস্যা হয়েছে।'
          )
        );
        setIsProcessing(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  {t('Company Setup & Data Restoration', 'প্রতিষ্ঠান সেটআপ ও ডাটা রিস্টোর')}
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-mono font-bold">
                  Device Verified
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                {t(
                  'Create your company profile or restore existing data from Google Drive, OneDrive, or Local PC.',
                  'নতুন প্রতিষ্ঠান তৈরি করুন অথবা গুগল ড্রাইভ, ওয়ানড্রাইভ বা লোকাল পিসি থেকে ডাটা রিস্টোর করুন।'
                )}
              </p>
            </div>
          </div>

          {view !== 'choice' && (
            <button
              type="button"
              onClick={() => {
                setView('choice');
                setImportError('');
              }}
              className="text-xs font-semibold text-indigo-200 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('Back to Options', 'ফিরে যান')}</span>
            </button>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: INITIAL CHOICE */}
          {view === 'choice' && (
            <div className="space-y-6 py-2">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('Welcome to SRK ERP & Management Suite', 'এসআরকে ইআরপি ও ম্যানেজমেন্ট স্যুটে স্বাগতম')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'Your device security has been verified via OTP. How would you like to initialize your workspace?',
                    'আপনার ডিভাইস ওটিপি দিয়ে যাচাই করা হয়েছে। আপনার কাজের পরিবেশ কীভাবে চালু করতে চান?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* CHOICE 1: CREATE NEW COMPANY */}
                <div
                  onClick={() => setView('create')}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/20 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                          {t('Create New Company', 'নতুন প্রতিষ্ঠান তৈরি করুন')}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          New Setup
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {t(
                          'Configure company name, GSTIN, bank details, and start fresh billing, inventory & legal case records.',
                          'নতুন প্রতিষ্ঠানের নাম, জিএসটি, ব্যাংক অ্যাকাউন্ট ও ঠিকানা পূরণ করে ফ্রেশ শুরু করুন।'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>{t('Enter Company Details', 'কোম্পানির তথ্য দিন')}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* CHOICE 2: IMPORT EXISTING BACKUP */}
                <div
                  onClick={() => setView('import')}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <FolderArchive className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                          {t('Import Company File / Restore Data', 'বিদ্যমান ব্যাকআপ ফাইল রিস্টোর করুন')}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Restore Existing
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {t(
                          'Already have existing business data? Restore all invoices, parties, cases, and ledgers from Google Drive, OneDrive, or Local PC.',
                          'পূর্বের সংরক্ষিত ব্যাকআপ থাকলে গুগল ড্রাইভ, ওয়ানড্রাইভ বা লোকাল পিসি থেকে সব ডাটা রিস্টোর করুন।'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                    <span>{t('Restore from Drive or PC', 'ড্রাইভ বা পিসি থেকে রিস্টোর')}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Note on seamless access */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {t(
                    'Note: Once initialized, your device and company are permanently saved. You will not be asked to log in again on future visits.',
                    'উল্লেখ্য: একবার সেটআপ সম্পন্ন হলে আপনার ডিভাইস ও কোম্পানি সংরক্ষিত থাকবে এবং পরবর্তী সময়ে পুনরায় লগইন করতে হবে না।'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2A: CREATE NEW COMPANY FORM */}
          {view === 'create' && (
            <form onSubmit={handleCreateCompanySubmit} className="space-y-4">
              <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('Company & Chamber Details', 'প্রতিষ্ঠান ও চেম্বারের বিবরণ')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('Provide business identity for invoices, bills, and legal dockets.', 'ইনভয়েস ও আইনি নথিপত্রের জন্য প্রতিষ্ঠানের তথ্য দিন।')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  Step 2 of 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Company / Firm / Chamber Display Name *', 'প্রতিষ্ঠানের নাম *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="e.g. SRK Legal Chambers & Associates / Apex Traders"
                    className="w-full h-10 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-semibold text-slate-900"
                  />
                </div>

                {/* Tagline */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Business Tagline / Subtitle', 'ট্যাগলাইন বা স্লোগান')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.tagline}
                    onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                    placeholder="e.g. Advocates, Consultants & Legal Tax Advisory"
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none text-slate-700"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Official Phone Number *', 'ফোন নম্বর *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Official Email Address', 'ইমেইল ঠিকানা')}
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('GSTIN (If Applicable)', 'জিএসটি নম্বর (প্রযোজ্য হলে)')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.gstin}
                    onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 19AAACA1234F1Z5"
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono uppercase"
                  />
                </div>

                {/* PAN */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('PAN Number', 'প্যান নম্বর')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.pan}
                    onChange={(e) => setCompanyForm({ ...companyForm, pan: e.target.value.toUpperCase() })}
                    placeholder="e.g. AAACA1234F"
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono uppercase"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Office / Chamber Address *', 'অফিস বা চেম্বারের ঠিকানা *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('State *', 'রাজ্য *')}
                  </label>
                  <select
                    value={companyForm.state}
                    onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                    className="w-full h-9 px-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-medium"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('City *', 'শহর *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Pincode', 'পিন কোড')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={companyForm.pincode}
                    onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })}
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Bank Name', 'ব্যাংকের নাম')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.bankName}
                    onChange={(e) => setCompanyForm({ ...companyForm, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India / HDFC"
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none"
                  />
                </div>

                {/* Bank Account */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('Bank Account Number', 'অ্যাকাউন্ট নম্বর')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.bankAccount}
                    onChange={(e) => setCompanyForm({ ...companyForm, bankAccount: e.target.value })}
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono"
                  />
                </div>

                {/* IFSC */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('IFSC Code', 'আইএফএসসি কোড')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.bankIfsc}
                    onChange={(e) => setCompanyForm({ ...companyForm, bankIfsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono uppercase"
                  />
                </div>

                {/* UPI ID */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t('UPI ID for Instant QR Billing', 'ইউপিআই আইডি')}
                  </label>
                  <input
                    type="text"
                    value={companyForm.upiId}
                    onChange={(e) => setCompanyForm({ ...companyForm, upiId: e.target.value })}
                    placeholder="e.g. chamber@sbi"
                    className="w-full h-9 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setView('choice')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {t('Back', 'পেছনে')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  <span>{t('Save Company & Launch Workspace', 'কোম্পানি সংরক্ষণ ও সফটওয়্যার চালু করুন')}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: IMPORT COMPANY FILE / RESTORE DATA */}
          {view === 'import' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('Restore Business Data from Existing File', 'বিদ্যমান ফাইল থেকে সমস্ত ডাটা রিস্টোর')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t(
                      'Restore from Google Drive, Local Computer or Microsoft OneDrive.',
                      'গুগল ড্রাইভ, লোকাল কম্পিউটার বা মাইক্রোসফট ওয়ানড্রাইভ থেকে ব্যাকআপ রিস্টোর করুন।'
                    )}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Data Restoration
                </span>
              </div>

              {/* 3 Source Tabs: Local Computer, Google Drive, OneDrive */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setImportSource('local');
                    setImportError('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    importSource === 'local'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HardDrive className="h-4 w-4 text-indigo-600" />
                  <span>{t('Local Computer', 'লোকাল কম্পিউটার')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportSource('google_drive');
                    setImportError('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    importSource === 'google_drive'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cloud className="h-4 w-4 text-emerald-600" />
                  <span>{t('Google Drive', 'গুগল ড্রাইভ')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportSource('onedrive');
                    setImportError('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    importSource === 'onedrive'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cloud className="h-4 w-4 text-sky-600" />
                  <span>{t('OneDrive', 'ওয়ানড্রাইভ')}</span>
                </button>
              </div>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* TAB 1: LOCAL COMPUTER RESTORE */}
              {importSource === 'local' && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      dragActive
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-2">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {t('Select or Drag & Drop Backup File from Local Computer', 'লোকাল কম্পিউটার থেকে ব্যাকআপ ফাইল নির্বাচন করুন')}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t('Supports .json or .backup files exported from SRK ERP.', 'এসআরকে ইআরপি থেকে এক্সপোর্ট করা .json ফাইল দিন।')}
                    </p>

                    <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors">
                      <HardDrive className="h-3.5 w-3.5" />
                      <span>{t('Browse Local Computer File', 'কম্পিউটার থেকে ফাইল বাছুন')}</span>
                      <input
                        type="file"
                        accept=".json,.backup"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE DRIVE RESTORE */}
              {importSource === 'google_drive' && (
                <div className="space-y-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200">
                  <div className="flex items-start gap-2.5">
                    <Cloud className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        {t('Restore from Google Drive', 'গুগল ড্রাইভ থেকে রিস্টোর করুন')}
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        {t(
                          'You can import directly by selecting your Google Drive downloaded backup file, or by pasting your Google Drive shared file link or JSON content.',
                          'গুগল ড্রাইভ থেকে ডাউনলোড করা ব্যাকআপ ফাইল সিলেক্ট করুন, অথবা গুগল ড্রাইভের শেয়ার লিঙ্ক বা JSON টেক্সট পেস্ট করুন।'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste Google Drive File Link (drive.google.com/file/d/...) or Raw JSON"
                      value={cloudLinkInput}
                      onChange={(e) => setCloudLinkInput(e.target.value)}
                      className="flex-1 h-10 px-3 bg-white border border-emerald-300 focus:border-emerald-600 rounded-xl text-xs outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={!cloudLinkInput.trim() || isProcessing}
                      onClick={handleFetchCloudLink}
                      className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>{t('Load from Drive', 'ড্রাইভ থেকে লোড')}</span>
                    </button>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-900">
                    <span className="font-sans">Or choose file from your Google Drive synced folder:</span>
                    <label className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline cursor-pointer">
                      <Upload className="h-3 w-3" />
                      <span>{t('Upload Google Drive JSON File', 'গুগল ড্রাইভ ফাইল আপলোড')}</span>
                      <input
                        type="file"
                        accept=".json,.backup"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: MICROSOFT ONEDRIVE RESTORE */}
              {importSource === 'onedrive' && (
                <div className="space-y-3 p-4 bg-sky-50/40 rounded-2xl border border-sky-200">
                  <div className="flex items-start gap-2.5">
                    <Cloud className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-sky-950">
                        {t('Restore from Microsoft OneDrive', 'মাইক্রোসফট ওয়ানড্রাইভ থেকে রিস্টোর করুন')}
                      </h4>
                      <p className="text-[11px] text-sky-800">
                        {t(
                          'Upload the backup JSON saved on your Microsoft OneDrive, or paste the OneDrive file link / JSON content.',
                          'আপনার মাইক্রোসফট ওয়ানড্রাইভে সংরক্ষিত ব্যাকআপ ফাইল আপলোড করুন অথবা লিঙ্ক পেস্ট করুন।'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste OneDrive Share Link or Raw Backup JSON content"
                      value={cloudLinkInput}
                      onChange={(e) => setCloudLinkInput(e.target.value)}
                      className="flex-1 h-10 px-3 bg-white border border-sky-300 focus:border-sky-600 rounded-xl text-xs outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={!cloudLinkInput.trim() || isProcessing}
                      onClick={handleFetchCloudLink}
                      className="h-10 px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>{t('Load from OneDrive', 'ওয়ানড্রাইভ থেকে লোড')}</span>
                    </button>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-sky-900">
                    <span className="font-sans">Or choose file from your OneDrive folder:</span>
                    <label className="inline-flex items-center gap-1 font-bold text-sky-800 hover:underline cursor-pointer">
                      <Upload className="h-3 w-3" />
                      <span>{t('Upload OneDrive JSON File', 'ওয়ানড্রাইভ ফাইল আপলোড')}</span>
                      <input
                        type="file"
                        accept=".json,.backup"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* LIVE BACKUP INSPECTION & STATS PREVIEW */}
              {importStats && importStats.isValid && (
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          {t('Valid Backup Data Verified', 'বৈধ ব্যাকআপ ডাটা যাচাই সম্পন্ন')}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {importStats.companyName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-300">
                      Version {importStats.version}
                    </span>
                  </div>

                  {/* Summary Counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 text-[10px] block font-sans">
                        {t('Transactions / Bills', 'ইনভয়েস ও বিল')}
                      </span>
                      <b className="text-sm font-mono text-indigo-700">
                        {importStats.transactionsCount}
                      </b>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 text-[10px] block font-sans">
                        {t('Parties / Clients', 'পার্টি ও ক্লায়েন্ট')}
                      </span>
                      <b className="text-sm font-mono text-slate-800">
                        {importStats.partiesCount}
                      </b>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 text-[10px] block font-sans">
                        {t('Legal Cases', 'আইনি কেস')}
                      </span>
                      <b className="text-sm font-mono text-purple-700">
                        {importStats.casesCount}
                      </b>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 text-[10px] block font-sans">
                        {t('Inventory Items', 'আইটেম ও পণ্য')}
                      </span>
                      <b className="text-sm font-mono text-slate-800">
                        {importStats.itemsCount}
                      </b>
                    </div>
                  </div>

                  {/* Confirm Restoration Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleConfirmRestore}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t('Restoring All Data to Workspace...', 'সমস্ত ডাটা রিস্টোর করা হচ্ছে...')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{t('Restore All Data & Unlock App', 'সমস্ত ডাটা রিস্টোর ও সফটওয়্যার আনলক করুন')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
