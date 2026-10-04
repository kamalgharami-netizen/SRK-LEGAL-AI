import React from 'react';
import {
  Scale,
  Calendar,
  Clock,
  Plus,
  FileSpreadsheet,
  Printer,
  User,
  Share2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  FileText,
  FileCheck,
  Volume2,
  CheckCheck,
} from 'lucide-react';
import { LegalCase, DailyTask, CompanyProfile, Party, CaseType } from '../../types/erp';
import { NotificationService } from '../../services/notificationService';
import { useLanguage } from '../../context/LanguageContext';

interface WorkDashboardViewProps {
  cases: LegalCase[];
  tasks: DailyTask[];
  parties: Party[];
  company: CompanyProfile;
  onOpenNewCase: (type?: CaseType) => void;
  onSelectCase: (c: LegalCase) => void;
  onToggleTask: (id: string) => void;
  onOpenDailyTasksDrawer: () => void;
  onNavigateCaseCategory: (cat: string) => void;
  onSwitchToErp: () => void;
  onOpenPrintCauseList: () => void;
  onExportExcel: () => void;
}

export const WorkDashboardView: React.FC<WorkDashboardViewProps> = ({
  cases,
  tasks,
  parties,
  company,
  onOpenNewCase,
  onSelectCase,
  onToggleTask,
  onOpenDailyTasksDrawer,
  onNavigateCaseCategory,
  onSwitchToErp,
  onOpenPrintCauseList,
  onExportExcel,
}) => {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  // Cases by category
  const mutationCases = cases.filter((c) => c.type === 'mutation');
  const miscCases = cases.filter((c) => c.type === 'misc_case');
  const rtiCases = cases.filter((c) => c.type === 'rti');
  const lrAppeals = cases.filter((c) => c.type === 'lr_appeal');

  // Hearing filters
  const todayHearings = cases.filter((c) => c.nextHearingDate === todayStr);
  const urgentHearings = cases.filter((c) => {
    if (!c.nextHearingDate) return false;
    const diff = (new Date(c.nextHearingDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 7;
  });

  const overdueHearings = cases.filter((c) => {
    if (!c.nextHearingDate) return false;
    return c.nextHearingDate < todayStr && c.status !== 'disposed' && c.status !== 'dismissed';
  });

  // Tasks
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  // Recent hearings across all cases
  const recentHearings: { caseItem: LegalCase; hearing: any }[] = [];
  cases.forEach((c) => {
    c.hearings.forEach((h) => {
      recentHearings.push({ caseItem: c, hearing: h });
    });
  });
  recentHearings.sort((a, b) => new Date(b.hearing.date).getTime() - new Date(a.hearing.date).getTime());

  const handleShareWhatsApp = (c: LegalCase) => {
    const isToday = c.nextHearingDate === todayStr;
    const text = `Notice from ${company.name}:\nCase: ${c.caseNo} (${c.type.toUpperCase()})\nTitle: ${c.title}\nCourt / Authority: ${c.courtOrAuthority}\nStatus: ${c.status.toUpperCase()}\nNext Hearing: ${c.nextHearingDate || 'TBD'}${isToday ? ' (SCHEDULED FOR TODAY)' : ''}\n\nClient: ${c.partyName}${c.brokerName ? `\nBroker: ${c.brokerName}` : ''}`;
    const cleanPhone = (c.partyPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Work & Tracking Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700 text-white shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {t('Work & Tracking Operations', 'কাজ ও ট্র্যাকিং পরিচালনা')}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {t('WORK & TRACKING', 'কাজ ও ট্র্যাকিং')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Mutation, Misc Case Dockets, RTI Applications, LR Appeals & Daily Cause List', 'মিউটেশন, মিস কেস ডকেট, আরটিআই আবেদন, আপিল ও দৈনিক কজ লিস্ট')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSwitchToErp}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs transition-colors"
          >
            <span>{t('Switch to ERP & Billing Portion →', 'ইআরপি ও বিলিং-এ যান →')}</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t('Export Excel', 'এক্সেলে ডাউনলোড')}</span>
          </button>

          <button
            onClick={onOpenPrintCauseList}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('Cause List PDF', 'কজ লিস্ট প্রিন্ট')}</span>
          </button>

          <button
            onClick={() => onOpenNewCase()}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('+ New Case Entry (F3)', '+ নতুন মামলা যোগ (F3)')}</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner: Today's Hearings */}
      {todayHearings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-900 shrink-0 shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/90 text-amber-900 font-mono">
                  {t('Daily Hearing Alert', 'আজকের শুনানির নোটিশ')}
                </span>
                <span className="text-xs font-mono font-semibold text-amber-800">
                  {todayStr}
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-950 mt-1">
                {todayHearings.length} {t('Case Hearing(s) Scheduled for Today', 'টি মামলার শুনানি আজ নির্ধারিত আছে')}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                {todayHearings
                  .map((c) => `${c.caseNo} (${c.type.toUpperCase()}) — ${c.courtOrAuthority} [${c.partyName}${c.brokerName ? ` / Broker: ${c.brokerName}` : ''}]`)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => NotificationService.playAlertChime()}
              title={t('Play Alert Chime', 'শব্দ সংকেত বাজান')}
              className="p-2 text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSelectCase(todayHearings[0])}
              className="h-8 px-3 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              {t('Open Hearing Order Sheet →', 'শুনানির আদেশনামা দেখুন →')}
            </button>
          </div>
        </div>
      )}

      {/* 4 Category Operational Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Mutation Cases */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono">
                {t('Mutation Cases', 'মিউটেশন মামলা')}
              </span>
              <span className="text-[10px] text-purple-700 font-mono font-bold">Sec 50 RoR</span>
            </div>

            <div className="mt-2 text-3xl font-extrabold font-mono text-purple-950 tabular-nums">
              {mutationCases.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('Banglarbhumi apps, Broker, R.O. & R.I., Deed Year & Area', 'বাংলারভূমি আবেদন, দালাল, রেভিনিউ অফিসার ও দলিল')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateCaseCategory('mutation')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>{t('View Records', 'রেকর্ড দেখুন')}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => onOpenNewCase('mutation')}
              className="p-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
              title={t('Add Mutation Case', 'মিউটেশন কেস যোগ')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Misc Cases */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                {t('Misc Cases (Docket)', 'মিস কেস (ডকেট)')}
              </span>
              <span className="text-[10px] text-blue-700 font-mono font-bold">Docket & Date</span>
            </div>

            <div className="mt-2 text-3xl font-extrabold font-mono text-blue-950 tabular-nums">
              {miscCases.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('Docket No, Docket Date, Demarcation & SDO Proceedings', 'ডকেট নং, ডকেটের তারিখ, সীমানা নির্ধারণ ও এসডিও ফাইল')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateCaseCategory('misc_case')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>{t('View Dockets', 'ডকেট দেখুন')}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => onOpenNewCase('misc_case')}
              className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title={t('Add Misc Case', 'মিস কেস যোগ')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3. RTI Applications */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                {t('RTI Inquiries', 'আরটিআই (তথ্য অধিকার)')}
              </span>
              <span className="text-[10px] text-amber-700 font-mono font-bold">30-Day Timer</span>
            </div>

            <div className="mt-2 text-3xl font-extrabold font-mono text-amber-950 tabular-nums">
              {rtiCases.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('Statutory compliance countdown, PIO & First Appellate Authority', '৩০ দিনের সময়সীমা, পিআইও ও প্রথম আপিল কর্তৃপক্ষ')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateCaseCategory('rti')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              <span>{t('View RTI Files', 'আরটিআই ফাইল')}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => onOpenNewCase('rti')}
              className="p-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
              title={t('Add RTI', 'আরটিআই যোগ')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4. LR Appeals */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-rose-300 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                {t('LR Appeals', 'এল.আর. আপিল')}
              </span>
              <span className="text-[10px] text-rose-700 font-mono font-bold">Tribunal & SDO</span>
            </div>

            <div className="mt-2 text-3xl font-extrabold font-mono text-rose-950 tabular-nums">
              {lrAppeals.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('Appeal Memo No, Lower Court Case, Stay Orders & Injunctions', 'আপিল মেমো নং, নিম্ন আদালত নির্দেশ, স্থগিতাদেশ ও ইনজাংশন')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateCaseCategory('lr_appeal')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
            >
              <span>{t('View Appeals', 'আপিল দেখুন')}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => onOpenNewCase('lr_appeal')}
              className="p-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
              title={t('Add Appeal', 'আপিল যোগ')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Operational Grid: Cause List (Left) + Tasks/Deadlines (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cause List & Upcoming Hearings (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>{t("Today's Cause List & Hearing Schedule", 'আজকের কজ লিস্ট ও শুনানির সময়সূচী')}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {t('Listing of cases for appearance before Revenue Officers & Tribunals', 'রেভিনিউ অফিসার ও ট্রাইব্যুনালে হাজিরার মামলার তালিকা')}
              </p>
            </div>

            <button
              onClick={onOpenPrintCauseList}
              className="h-8 px-2.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t('Print Cause List', 'কজ লিস্ট প্রিন্ট')}</span>
            </button>
          </div>

          {todayHearings.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Calendar className="h-10 w-10 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                {t('No case hearings listed for today', 'আজকে কোনো শুনানির তালিকা নেই')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('All upcoming hearings in the next 7 days appear in the calendar below', 'পরবর্তী ৭ দিনের সমস্ত শুনানি নিচে প্রদর্শিত হচ্ছে')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayHearings.map((c) => {
                const refNo = c.type === 'mutation' ? (c.applicationNo || '-') : c.type === 'misc_case' ? (c.docketNo || '-') : (c.rtiMemoNo || c.appealMemoNo || '-');

                return (
                  <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-900 text-xs">
                          {c.caseNo}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded bg-purple-100 text-purple-800">
                          {c.type.toUpperCase()}
                        </span>
                        {refNo !== '-' && (
                          <span className="text-[11px] font-mono text-slate-500">
                            Ref: <b>{refNo}</b>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {t('Party / Client:', 'মক্কেল:')} <span className="font-semibold text-slate-700">{c.partyName}</span>
                        {c.brokerName && <span> · {t('Broker:', 'দালাল:')} <span className="font-semibold text-indigo-700">{c.brokerName}</span></span>}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {t('Court / Authority:', 'আদালত বা কর্তৃপক্ষ:')} <b>{c.courtOrAuthority}</b>
                        {c.roName && <span> (R.O.: {c.roName})</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => handleShareWhatsApp(c)}
                        title={t('Send WhatsApp Hearing Notice', 'হোয়াটসঅ্যাপ নোটিশ পাঠান')}
                        className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onSelectCase(c)}
                        className="h-8 px-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs"
                      >
                        {t('Order Sheet →', 'আদেশনামা →')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 7-Day Upcoming Hearings Preview */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/70">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
              {t('Upcoming Listings (Next 7 Days)', 'পরবর্তী ৭ দিনের শুনানির তালিকা')}
            </h3>

            {urgentHearings.length === 0 ? (
              <p className="text-xs text-slate-400">
                {t('No other hearings scheduled within the next 7 days.', 'পরবর্তী ৭ দিনে কোনো শুনানি নির্ধারিত নেই।')}
              </p>
            ) : (
              <div className="space-y-2">
                {urgentHearings.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">{c.caseNo}</span>
                      <span className="text-[11px] text-slate-500 mr-2">[{c.partyName}]</span>
                      <span className="text-[11px] text-slate-600 font-semibold">{c.courtOrAuthority}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-purple-700">{c.nextHearingDate}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Tasks, RTI Deadlines & Reminders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Tasks Card */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{t('Daily Work Tasks & Follow-ups', 'দৈনিক কাজ ও তাগিদ তালিকা')}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t(`${pendingTasks.length} pending task(s)`, `${pendingTasks.length} টি কাজ বাকি আছে`)}
                </p>
              </div>

              <button
                onClick={onOpenDailyTasksDrawer}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
              >
                {t('Open Drawer →', 'তাগিদ ড্রয়ার →')}
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {t('No tasks recorded yet.', 'কোনো কাজ এখনো তৈরি করা হয়নি।')}
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      task.isCompleted ? 'bg-slate-50/70 text-slate-400 line-through' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-purple-600"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                        {task.caseNo && <span>Case: <b>{task.caseNo}</b></span>}
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RTI 30-Day Expiry Tracker Card */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-4">
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>{t('RTI 30-Day Compliance Tracker', 'আরটিআই ৩০ দিনের সংবিধিবদ্ধ ট্র্যাকার')}</span>
            </h3>

            {rtiCases.length === 0 ? (
              <p className="text-xs text-slate-400">
                {t('No active RTI applications registered.', 'কোনো সক্রিয় আরটিআই আবেদন নেই।')}
              </p>
            ) : (
              <div className="space-y-2">
                {rtiCases.map((c) => {
                  const deadline = c.rtiDeadlineDate || '';
                  const isExpired = deadline && deadline < todayStr;

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCase(c)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-amber-300 cursor-pointer bg-slate-50/50 hover:bg-white transition-colors"
                    >
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-mono font-bold text-amber-900">{c.caseNo}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded font-mono ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isExpired ? t('EXPIRED (Appeal Due)', 'মেয়াদ উত্তীর্ণ (আপিল প্রয়োজন)') : t(`Deadline: ${deadline}`, `সময়সীমা: ${deadline}`)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">{c.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t('PIO Authority:', 'তথ্য আধিকারিক:')} <b>{c.rtiOfficerOrPio || c.courtOrAuthority}</b>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
