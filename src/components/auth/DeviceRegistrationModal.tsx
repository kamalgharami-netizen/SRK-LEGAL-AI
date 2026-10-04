import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  User,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Mail,
  FileSpreadsheet,
} from 'lucide-react';
import { DeviceAuthService, DeviceLoginRecord } from '../../services/deviceAuthService';
import { useLanguage } from '../../context/LanguageContext';

interface DeviceRegistrationModalProps {
  isOpen: boolean;
  onRegistered: (record: DeviceLoginRecord) => void;
}

export const DeviceRegistrationModal: React.FC<DeviceRegistrationModalProps> = ({
  isOpen,
  onRegistered,
}) => {
  const { t } = useLanguage();
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const deviceInfo = DeviceAuthService.detectDeviceInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setError(
        t(
          'Please enter a valid 10-digit mobile number for software registration.',
          'সফটওয়্যার নিবন্ধনের জন্য দয়া করে সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন।'
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await DeviceAuthService.registerDevice(
        cleanMobile,
        name.trim() || 'Advocate Chamber / User'
      );
      setSuccess(true);
      setTimeout(() => {
        onRegistered(record);
      }, 1200);
    } catch (err: any) {
      setError('Registration failed. Please check network connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-6 w-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {t('Device Registration & Activation', 'ডিভাইস নিবন্ধন ও সফটওয়্যার সক্রিয়করণ')}
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                {t(
                  'SRK Legal AI & Vyapar Business Suite',
                  'এসআরকে লিগ্যাল এআই ও ব্যাপার বিজনেস স্যুট'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('Device Registered Successfully!', 'ডিভাইস সফলভাবে নিবন্ধিত হয়েছে!')}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {t(
                  'Login notification alert has been dispatched to kamalgharami@gmail.com and logged row-wise. Loading your workspace...',
                  'লগইন বিজ্ঞপ্তির তথ্য kamalgharami@gmail.com-এ পাঠানো হয়েছে এবং সংরক্ষিত হয়েছে। সফটওয়্যার চালু হচ্ছে...'
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {t('First-Time Device Access Security', 'প্রথমবার ডিভাইসে প্রবেশের নিরাপত্তা যাচাই')}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    {t(
                      'Please provide your active mobile number. An instant device login notification will be forwarded directly to kamalgharami@gmail.com and saved row-wise.',
                      'দয়া করে আপনার সক্রিয় মোবাইল নম্বর দিন। এই ডিভাইসের লগইন তথ্য সরাসরি kamalgharami@gmail.com-এ নোটিফাই করা হবে এবং সংরক্ষিত থাকবে।'
                    )}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Mobile Number Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {t('Mobile Number for Registration *', 'নিবন্ধনের জন্য মোবাইল নম্বর *')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-mono text-xs border-r border-slate-200 pr-2">
                    <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={14}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    autoFocus
                    className="w-full h-10 pl-20 pr-4 text-sm font-mono font-bold text-slate-900 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t('10-digit mobile number without spaces', 'স্পেস ছাড়া ১০ সংখ্যার মোবাইল নম্বর লিখুন')}
                </span>
              </div>

              {/* Advocate / User Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {t('User / Advocate Chamber Name (Optional)', 'ব্যবহারকারী বা অ্যাডভোকেটের নাম (ঐচ্ছিক)')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Adv. Kamal Gharami / Office"
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Detected Hardware Info Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5 text-indigo-600" />
                    {t('Device & System Audit Data', 'ডিভাইস ও সিস্টেম অডিট তথ্য')}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                    {deviceInfo.deviceId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-600">
                  <div>
                    <span className="text-slate-400 block font-sans">OS & Platform:</span>
                    <b>{deviceInfo.os}</b> ({deviceInfo.browser})
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Forward Alert To:</span>
                    <span className="text-indigo-700 font-bold flex items-center gap-1">
                      <Mail className="h-2.5 w-2.5" />
                      kamalgharami@gmail.com
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('Forwarding Login Alert & Activating...', 'লগইন নোটিফিকেশন পাঠানো ও সক্রিয় করা হচ্ছে...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t('Register & Open Application', 'নিবন্ধন করুন ও সফটওয়্যার চালু করুন')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 text-center">
                <Lock className="h-3 w-3" />
                <span>
                  {t(
                    'Secure registration • All device logins stored row-wise in Google Sheet format',
                    'নিরাপদ নিবন্ধন • সমস্ত ডিভাইসের লগইন গুগল শিট আকারে রেকর্ড করা হয়'
                  )}
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
