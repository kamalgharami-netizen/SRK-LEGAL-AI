import React from 'react';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  Package,
  Landmark,
  CreditCard,
  BarChart3,
  Settings,
  AlertTriangle,
  Scale,
  Calendar,
  Clock,
  ArrowRightLeft,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appMode: 'erp' | 'work';
  setAppMode: (mode: 'erp' | 'work') => void;
  caseSubTab?: string;
  setCaseSubTab?: (subTab: string) => void;
  lowStockCount: number;
  totalReceivables: number;
  activeCasesCount?: number;
  todayHearingsCount?: number;
  mutationCount?: number;
  miscCount?: number;
  rtiCount?: number;
  lrAppealCount?: number;
  currencySymbol: string;
  onOpenDailyTasksDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  appMode,
  setAppMode,
  caseSubTab = 'all',
  setCaseSubTab,
  lowStockCount,
  totalReceivables,
  activeCasesCount = 0,
  todayHearingsCount = 0,
  mutationCount = 0,
  miscCount = 0,
  rtiCount = 0,
  lrAppealCount = 0,
  currencySymbol,
  onOpenDailyTasksDrawer,
}) => {
  const { t } = useLanguage();

  const handleSelectCaseCategory = (subTab: string) => {
    setActiveTab('cases');
    if (setCaseSubTab) {
      setCaseSubTab(subTab);
    }
  };

  // ERP Portion Navigation Items
  const erpMenuItems = [
    {
      id: 'dashboard',
      en: 'ERP Dashboard',
      bn: 'ড্যাশবোর্ড',
      icon: LayoutDashboard,
    },
    {
      id: 'sales',
      en: 'Sales & Invoices',
      bn: 'বিক্রয় ও ইনভয়েস',
      icon: FileText,
      badge: totalReceivables > 0 ? `${currencySymbol}${Math.round(totalReceivables).toLocaleString()}` : undefined,
    },
    {
      id: 'purchases',
      en: 'Purchases & Bills',
      bn: 'ক্রয় ও খরচ বিল',
      icon: ShoppingBag,
    },
    {
      id: 'parties',
      en: 'Parties & CRM',
      bn: 'পক্ষ ও মক্কেল খতিয়ান',
      icon: Users,
    },
    {
      id: 'items',
      en: 'Items & Services',
      bn: 'পণ্য ও সেবা স্টক',
      icon: Package,
      alertCount: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'cash-bank',
      en: 'Cash & Bank',
      bn: 'নগদ ক্যাশ ও ব্যাংক',
      icon: Landmark,
    },
    {
      id: 'expenses',
      en: 'Expenses',
      bn: 'দৈনন্দিন খরচসমূহ',
      icon: CreditCard,
    },
    {
      id: 'reports',
      en: 'Reports & P&L',
      bn: 'রিপোর্ট ও হিসাব',
      icon: BarChart3,
    },
    {
      id: 'settings',
      en: 'Settings',
      bn: 'সফটওয়্যার সেটিংস',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 sm:w-72 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)] no-print">
      {/* Top Module Indicator Box */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            {t('Active Portion', 'সক্রিয় অংশ')}
          </span>
          <button
            onClick={() => {
              if (appMode === 'erp') {
                setAppMode('work');
                setActiveTab('work_dashboard');
              } else {
                setAppMode('erp');
                setActiveTab('dashboard');
              }
            }}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <ArrowRightLeft className="h-3 w-3" />
            <span>{t('Switch', 'পরিবর্তন')}</span>
          </button>
        </div>

        {/* Dual Tab Segmented Pill */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-lg text-xs font-bold">
          <button
            onClick={() => {
              setAppMode('erp');
              if (activeTab === 'work_dashboard' || activeTab === 'cases') {
                setActiveTab('dashboard');
              }
            }}
            className={`py-1.5 rounded-md transition-all text-center ${
              appMode === 'erp'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('ERP & Billing', 'ইআরপি ও বিল')}
          </button>
          <button
            onClick={() => {
              setAppMode('work');
              if (activeTab === 'dashboard' || activeTab === 'sales' || activeTab === 'purchases') {
                setActiveTab('work_dashboard');
              }
            }}
            className={`py-1.5 rounded-md transition-all text-center ${
              appMode === 'work'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('Work & Tracking', 'কাজ ও ট্র্যাকিং')}
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        {/* ================= ERP PORTION MENUS ================= */}
        {appMode === 'erp' && (
          <>
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('ERP & Billing Menus', 'ইআরপি ও বিলিং মেনু')}
            </div>

            {erpMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{t(item.en, item.bn)}</span>
                  </div>

                  {item.alertCount ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                      <AlertTriangle className="h-3 w-3" />
                      {item.alertCount}
                    </span>
                  ) : item.badge ? (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </>
        )}

        {/* ================= WORK & TRACKING PORTION MENUS ================= */}
        {appMode === 'work' && (
          <>
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-900/70 font-mono">
              {t('Work & Tracking Menus', 'কাজ ও ট্র্যাকিং মেনু')}
            </div>

            {/* Work Overview */}
            <button
              onClick={() => setActiveTab('work_dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'work_dashboard'
                  ? 'bg-purple-100 text-purple-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scale className="h-4 w-4 text-purple-700 shrink-0" />
                <span>{t('Work Overview', 'কাজের সারসংক্ষেপ')}</span>
              </div>
            </button>

            {/* Mutation Cases */}
            <button
              onClick={() => handleSelectCaseCategory('mutation')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'cases' && caseSubTab === 'mutation'
                  ? 'bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileCheck className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="truncate">{t('Mutation (RoR)', 'মিউটেশন (খারিজ)')}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                {mutationCount}
              </span>
            </button>

            {/* Misc Cases */}
            <button
              onClick={() => handleSelectCaseCategory('misc_case')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'cases' && caseSubTab === 'misc_case'
                  ? 'bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="truncate">{t('Misc Cases (Docket)', 'মিস কেস (ডকেট)')}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                {miscCount}
              </span>
            </button>

            {/* RTI Applications */}
            <button
              onClick={() => handleSelectCaseCategory('rti')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'cases' && caseSubTab === 'rti'
                  ? 'bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="truncate">{t('RTI Inquiries (30D)', 'আরটিআই (তথ্য অধিকার)')}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                {rtiCount}
              </span>
            </button>

            {/* LR Appeals */}
            <button
              onClick={() => handleSelectCaseCategory('lr_appeal')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'cases' && caseSubTab === 'lr_appeal'
                  ? 'bg-rose-50 text-rose-900 font-bold ring-1 ring-rose-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Scale className="h-4 w-4 text-rose-600 shrink-0" />
                <span className="truncate">{t('LR Appeals (Tribunal)', 'এল.আর. আপিল')}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded shrink-0">
                {lrAppealCount}
              </span>
            </button>

            {/* All Cases */}
            <button
              onClick={() => handleSelectCaseCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'cases' && caseSubTab === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Scale className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{t('All Case Records', 'সমস্ত মামলা ও নথি')}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-500 shrink-0">
                {activeCasesCount}
              </span>
            </button>

            {/* Daily Cause List */}
            <button
              onClick={() => handleSelectCaseCategory('cause_list')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'cases' && caseSubTab === 'cause_list'
                  ? 'bg-purple-700 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="truncate">{t('Daily Cause List', 'দৈনিক কজ লিস্ট')}</span>
              </div>
              {todayHearingsCount > 0 && (
                <span className="font-mono text-[10px] font-bold text-white bg-rose-600 px-1.5 py-0.5 rounded shrink-0">
                  {todayHearingsCount} {t('Today', 'আজ')}
                </span>
              )}
            </button>

            {/* Client & Broker Directory */}
            <button
              onClick={() => setActiveTab('parties')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'parties'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Users className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="truncate">{t('Clients & Brokers CRM', 'মক্কেল ও দালাল')}</span>
              </div>
            </button>

            {/* Daily Tasks & Reminders Drawer Opener */}
            {onOpenDailyTasksDrawer && (
              <button
                onClick={onOpenDailyTasksDrawer}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Clock className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="truncate">{t('Daily Tasks & Reminders', 'দৈনিক কাজ ও তাগিদ')}</span>
                </div>
              </button>
            )}
          </>
        )}
      </div>

      {/* Switch Module Quick Banner at Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => {
            if (appMode === 'erp') {
              setAppMode('work');
              setActiveTab('work_dashboard');
            } else {
              setAppMode('erp');
              setActiveTab('dashboard');
            }
          }}
          className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
            appMode === 'erp'
              ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
          }`}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {t('Jump to', 'প্রবেশ করুন')}
            </div>
            <div className="text-xs font-bold">
              {appMode === 'erp' ? `⚖️ ${t('Work & Tracking', 'কাজ ও ট্র্যাকিং')}` : `💼 ${t('ERP & Billing Suite', 'ইআরপি ও বিলিং')}`}
            </div>
          </div>
          <ArrowRightLeft className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        <div className="mt-2 text-[10px] text-slate-500 text-center font-mono">
          SRK ERP v2.6 · {t('English & Bengali Dual', 'দ্বৈত ভাষা সক্রিয়')}
        </div>
      </div>
    </aside>
  );
};
