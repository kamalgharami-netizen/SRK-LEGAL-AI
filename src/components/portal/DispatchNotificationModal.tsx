import React, { useState } from 'react';
import {
  Send,
  Share2,
  CheckCircle2,
  ExternalLink,
  Printer,
  Copy,
  Check,
  X,
  Smartphone,
  Globe,
  FileText,
  Scale,
  MessageSquare,
} from 'lucide-react';
import { Transaction, LegalCase, Party, CompanyProfile } from '../../types/erp';
import { ClientNotificationLog } from '../../services/clientDispatchService';
import { useLanguage } from '../../context/LanguageContext';

interface DispatchNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'invoice' | 'case';
  invoice?: Transaction | null;
  caseItem?: LegalCase | null;
  party?: Party | null;
  log?: ClientNotificationLog | null;
  url: string;
  waUrl?: string;
  message?: string;
  onOpenClientPortal: () => void;
}

export const DispatchNotificationModal: React.FC<DispatchNotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  invoice,
  caseItem,
  party,
  log,
  url,
  waUrl,
  message,
  onOpenClientPortal,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);

  if (!isOpen) return null;

  const partyName = party?.name || invoice?.partyName || caseItem?.partyName || 'Client';
  const partyPhone = party?.phone || invoice?.partyPhone || caseItem?.partyPhone || 'Registered Mobile';
  const referenceNo = invoice?.invoiceNo || caseItem?.caseNo || log?.referenceNo || 'REF';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (waUrl) {
      const a = document.createElement('a');
      a.href = waUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
              <Send className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  {type === 'invoice'
                    ? t('Bill Dispatched to Client', 'মক্কেলকে বিল পাঠানো হয়েছে')
                    : t('Case Status Dispatched to Client', 'মামলার স্থিতি মক্কেলকে পাঠানো হয়েছে')}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 px-2 py-0.5 rounded font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('Dispatched', 'প্রেরিত')}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {t(
                  'Automated Internet & Mobile Notification Active',
                  'স্বয়ংক্রিয় ইন্টারনেট ও মোবাইল নোটিফিকেশন সক্রিয়'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                {t('Client / Recipient', 'মক্কেল / গ্রাহক')}:
              </span>
              <span className="font-bold text-slate-900">{partyName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                {t('Registered Mobile / WhatsApp', 'নিবন্ধিত মোবাইল / হোয়াটসঅ্যাপ')}:
              </span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                {partyPhone}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                {type === 'invoice' ? t('Invoice / Bill No', 'বিল / ইনভয়েস নং') : t('Case No', 'মামলা নম্বর')}:
              </span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {referenceNo}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
              <span className="text-slate-500 font-medium">{t('Transmission Mode', 'প্রেরণের মাধ্যম')}:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {t('Internet Webhook & Mobile Portal', 'ইন্টারনেট ওয়েবহুক ও মোবাইল পোর্টাল')}
              </span>
            </div>
          </div>

          {/* Client Live View & Print Link */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t('Client Live View & Print Link', 'মক্কেলের জন্য লাইভ দর্শন ও প্রিন্ট লিঙ্ক')}:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full h-9 px-3 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-9 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1 font-semibold shrink-0 transition-colors shadow-2xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t('Copied', 'কপি হয়েছে') : t('Copy', 'কপি')}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              {t(
                'Clients can open this link on their mobile or PC to instantly inspect, verify, and print their official document.',
                'মক্কেল এই লিঙ্কে ক্লিক করে মোবাইল বা কম্পিউটারে তাদের বিল বা কেস ডসিয়ার সরাসরি দেখতে ও প্রিন্ট করতে পারবেন।'
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
            >
              <Share2 className="h-4 w-4" />
              <span>{t('Send via WhatsApp Now', 'হোয়াটসঅ্যাপে পাঠান')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenClientPortal();
              }}
              className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
            >
              <Printer className="h-4 w-4" />
              <span>{t('View & Print Client Copy', 'মক্কেলের কপি দেখুন ও প্রিন্ট')}</span>
            </button>
          </div>

          {/* Message Preview Accordion */}
          {message && (
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowMessagePreview(!showMessagePreview)}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  {showMessagePreview
                    ? t('Hide Notification Message Preview', 'বার্তার প্রিভিউ লুকান')
                    : t('Show Notification Message Preview', 'বার্তার প্রিভিউ দেখুন')}
                </span>
              </button>

              {showMessagePreview && (
                <pre className="mt-2 p-3 bg-slate-900 text-emerald-300 font-mono text-[10px] rounded-xl whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800">
                  {message}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>SRK ERP AND DAILY MANAGEMENT SOFTWARE</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            {t('Done', 'সম্পন্ন')}
          </button>
        </div>
      </div>
    </div>
  );
};
