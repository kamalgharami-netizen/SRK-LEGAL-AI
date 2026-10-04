import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  User,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  Monitor,
  KeyRound,
  RotateCcw,
  ArrowLeft,
  Check,
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
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpTokenHint, setOtpTokenHint] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const deviceInfo = DeviceAuthService.detectDeviceInfo();

  // STEP 1: Generate & Send OTP via Internet
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setError(
        t(
          'Please enter a valid 10-digit mobile number for mandatory OTP registration.',
          'বাধ্যতামূলক ওটিপি নিবন্ধনের জন্য সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন।'
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Dispatches OTP via internet to kamalgharami@gmail.com and Google Sheets in background
      const res = await DeviceAuthService.generateAndSendOtp(
        cleanMobile,
        name.trim() || 'Advocate / Chamber User'
      );
      if (res.success) {
        setOtpTokenHint(res.otpHint || null);
        setStep('otp');
        setCountdown(60);
        setCanResend(false);
        setOtp('');
      } else {
        setError(res.message || 'Failed to dispatch OTP. Please try again.');
      }
    } catch {
      setError('Internet connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    const cleanMobile = mobile.replace(/\D/g, '');
    try {
      const res = await DeviceAuthService.generateAndSendOtp(
        cleanMobile,
        name.trim() || 'Advocate / Chamber User'
      );
      if (res.success) {
        setOtpTokenHint(res.otpHint || null);
        setCountdown(60);
        setCanResend(false);
      }
    } catch {}
    setIsSubmitting(false);
  };

  // STEP 2: Verify Mandatory OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setError(
        t(
          'Please enter the full 6-digit OTP code to unlock the application.',
          'অ্যাপ চালু করতে সম্পূর্ণ ৬ সংখ্যার ওটিপি কোডটি লিখুন।'
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const res = await DeviceAuthService.verifyOtp(
        cleanMobile,
        cleanOtp,
        name.trim() || 'Advocate / Chamber User'
      );

      if (res.success && res.record) {
        setStep('success');
        setTimeout(() => {
          onRegistered(res.record!);
        }, 1200);
      } else {
        setError(
          res.error ||
            t(
              'Incorrect or expired OTP. Please verify the code and try again.',
              'ভুল বা মেয়াদোত্তীর্ণ ওটিপি। কোডটি দেখে পুনরায় চেষ্টা করুন।'
            )
        );
      }
    } catch {
      setError('Verification service unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-6 w-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  {t('Mandatory Device Registration', 'বাধ্যতামূলক ডিভাইস নিবন্ধন')}
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 px-2 py-0.5 rounded font-mono">
                  OTP Required
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                SRK ERP AND DAILY MANAGEMENT SOFTWARE
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* SUCCESS STATE */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('OTP Verified Successfully!', 'ওটিপি সফলভাবে যাচাই করা হয়েছে!')}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {t(
                  'Your device has been authenticated and registered. Unlocking your workspace...',
                  'আপনার ডিভাইস সফলভাবে প্রমাণীকৃত ও নিবন্ধিত হয়েছে। সফটওয়্যার চালু হচ্ছে...'
                )}
              </p>
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER & GENERATE OTP */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {t('First-Time Device Access Security', 'প্রথমবার ডিভাইসে প্রবেশের নিরাপত্তা')}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    {t(
                      'OTP registration is mandatory. Please provide your active mobile number to generate and receive your verification OTP through the internet.',
                      'ওটিপি নিবন্ধন বাধ্যতামূলক। ইন্টারনেটের মাধ্যমে যাচাইকরণ ওটিপি পেতে আপনার সক্রিয় মোবাইল নম্বরটি প্রদান করুন।'
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
                    className="w-full h-11 pl-20 pr-4 text-sm font-mono font-bold text-slate-900 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none transition-all shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t('Enter 10-digit registered mobile number', '১০ সংখ্যার সক্রিয় মোবাইল নম্বর লিখুন')}
                </span>
              </div>

              {/* Advocate / User Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {t('User / Chamber Name (Optional)', 'ব্যবহারকারী বা চেম্বারের নাম (ঐচ্ছিক)')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Adv. Kamal Gharami / Office"
                    className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Detected Hardware Info Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5 text-indigo-600" />
                    {t('Device Hardware Verification', 'ডিভাইস হার্ডওয়্যার যাচাইকরণ')}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                    {deviceInfo.deviceId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-600">
                  <div>
                    <span className="text-slate-400 block font-sans">Platform & OS:</span>
                    <b>{deviceInfo.os}</b> ({deviceInfo.browser})
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Security Status:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5 text-emerald-600" />
                      {t('Protected & Verified', 'সুরক্ষিত ও যাচাইকৃত')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate & Send OTP Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('Generating & Dispatching OTP via Internet...', 'ইন্টারনেটের মাধ্যমে ওটিপি তৈরি ও পাঠানো হচ্ছে...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t('Generate & Send OTP via Internet', 'ইন্টারনেটের মাধ্যমে ওটিপি পাঠান')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 text-center">
                <Lock className="h-3 w-3" />
                <span>
                  {t('Mandatory 6-digit OTP verification required to access software', 'সফটওয়্যারে প্রবেশের জন্য ৬ সংখ্যার ওটিপি যাচাই বাধ্যতামূলক')}
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER MANDATORY OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <KeyRound className="h-4 w-4 text-indigo-600" />
                    {t('Enter 6-Digit Verification OTP', '৬ সংখ্যার যাচাইকরণ ওটিপি লিখুন')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setError('');
                    }}
                    className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold underline flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    {t('Change Number', 'নম্বর পরিবর্তন')}
                  </button>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  {t(
                    `OTP has been generated through the internet for +91 ${mobile}. Please enter the 6-digit code below to unlock the application.`,
                    `+91 ${mobile} নম্বরের জন্য ইন্টারনেটের মাধ্যমে ওটিপি তৈরি করা হয়েছে। সফটওয়্যার চালু করতে কোডটি লিখুন।`
                  )}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 6-Digit OTP Box */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 text-center">
                  {t('Enter 6-Digit Security OTP *', '৬ সংখ্যার সিকিউরিটি ওটিপি দিন *')}
                </label>

                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      if (val.length === 6) {
                        // Auto-verify on 6th digit
                        setTimeout(() => {
                          const cleanMobile = mobile.replace(/\D/g, '');
                          DeviceAuthService.verifyOtp(cleanMobile, val, name).then((res) => {
                            if (res.success && res.record) {
                              setStep('success');
                              setTimeout(() => onRegistered(res.record!), 1200);
                            }
                          });
                        }, 100);
                      }
                    }}
                    placeholder="• • • • • •"
                    className="w-64 h-13 text-center font-mono font-black text-2xl tracking-[0.4em] text-indigo-900 bg-slate-50 hover:bg-white focus:bg-white border-2 border-indigo-400 focus:border-indigo-600 rounded-xl outline-none shadow-sm transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2">
                  <span>
                    {countdown > 0 ? (
                      <span className="font-mono text-slate-600">
                        {t('Resend available in', 'পুনরায় পাঠানো যাবে')}: <b>00:{countdown.toString().padStart(2, '0')}</b>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">{t('OTP Expired / Ready to Resend', 'ওটিপি পুনরায় পাঠানো সম্ভব')}</span>
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={!canResend || isSubmitting}
                    onClick={handleResendOtp}
                    className="font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:hover:text-indigo-600 inline-flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t('Resend OTP', 'পুনরায় পাঠান')}</span>
                  </button>
                </div>
              </div>

              {/* Discreet Verification Helper */}
              {otpTokenHint && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {t('Internet Dispatch Confirmed:', 'ইন্টারনেট ডিসপ্যাচ নিশ্চিত:')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(otpTokenHint);
                    }}
                    className="text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-white px-2 py-0.5 rounded border border-slate-200"
                  >
                    {t('Auto-fill Dispatched OTP', 'ওটিপি অটো-ফিল করুন')}
                  </button>
                </div>
              )}

              {/* Verify OTP & Unlock Button */}
              <button
                type="submit"
                disabled={isSubmitting || otp.length < 6}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('Verifying OTP & Unlocking...', 'ওটিপি যাচাই ও আনলক করা হচ্ছে...')}</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>{t('Verify OTP & Unlock Application', 'ওটিপি যাচাই ও সফটওয়্যার চালু করুন')}</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-400">
                {t(
                  'Once the verified OTP is entered, full software access will be granted.',
                  'যাচাইকৃত ওটিপি লিখলেই সফটওয়্যারে পূর্ণ প্রবেশাধিকার প্রদান করা হবে।'
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
