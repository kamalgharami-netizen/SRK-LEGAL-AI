import React from 'react';
import {
  Receipt,
  Scale,
  Bell,
  Search,
  Plus,
} from 'lucide-react';
import { CompanyProfile, Item } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  company: CompanyProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appMode: 'erp' | 'work';
  setAppMode: (mode: 'erp' | 'work') => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenNewCase: () => void;
  lowStockItems: Item[];
  pendingTasksCount: number;
  todayHearingsCount: number;
  onOpenDailyTasksDrawer: () => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  activeTab,
  setActiveTab,
  appMode,
  setAppMode,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenNewCase,
  lowStockItems,
  pendingTasksCount,
  todayHearingsCount,
  onOpenDailyTasksDrawer,
  globalSearch,
  setGlobalSearch,
}) => {
  const { langMode, setLangMode, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6 shadow-xs no-print">
      {/* Zone 1: Brand title & Company */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (appMode === 'erp') setActiveTab('dashboard');
            else setActiveTab('work_dashboard');
          }}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
              SRK ERP & Daily Management
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block leading-none">
              SRK ERP AND DAILY MANAGEMENT SOFTWARE · <span className="text-indigo-600 font-semibold">{t('FY 2025-26', 'অর্থবছর ২০২৫-২৬')}</span>
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: MAIN DUAL MODULE SWITCHER (ERP & BILLING vs WORK & TRACKING) */}
      <div className="flex items-center mx-2 sm:mx-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
          {/* ERP & Billing */}
          <button
            onClick={() => {
              setAppMode('erp');
              if (activeTab === 'work_dashboard' || activeTab === 'cases') {
                setActiveTab('dashboard');
              }
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              appMode === 'erp'
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('ERP & Billing', 'ইআরপি ও বিলিং')}</span>
            <span className="md:hidden">ERP</span>
          </button>

          {/* Work & Tracking */}
          <button
            onClick={() => {
              setAppMode('work');
              if (activeTab === 'dashboard' || activeTab === 'sales' || activeTab === 'purchases') {
                setActiveTab('work_dashboard');
              }
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              appMode === 'work'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('Work & Tracking', 'কাজ ও ট্র্যাকিং')}</span>
            <span className="md:hidden">{t('Work', 'কাজ')}</span>

            {todayHearingsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                {todayHearingsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Zone 3: Global Search (Hidden on small mobile) */}
      <div className="hidden xl:flex items-center flex-1 max-w-xs mx-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              appMode === 'erp'
                ? t('Search bills, parties, items...', 'ইনভয়েস, পার্টি বা পণ্য খুঁজুন...')
                : t('Search case #, app #, docket #, party...', 'কেস নং, আবেদন নং, ডকেট নং খুঁজুন...')
            }
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-400 rounded-lg outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Zone 4: Language Selector, Fast Actions & Notification Bell */}
      <div className="flex items-center gap-2">
        {/* Language Change Option (English / বাংলা) */}
        <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200 shadow-2xs" role="group" aria-label="Language selector">
          <button
            onClick={() => setLangMode('en')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              langMode === 'en'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="English (Primary Default)"
          >
            <span className="font-mono text-[10px] font-bold">EN</span>
            <span className="hidden sm:inline">English</span>
          </button>
          <button
            onClick={() => setLangMode('bn')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              langMode === 'bn'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="বাংলা ভাষায় পরিবর্তন করুন"
          >
            <span className="font-sans font-bold">বাংলা</span>
          </button>
        </div>

        {/* Daily Tasks & Hearing Notification Bell */}
        <button
          onClick={onOpenDailyTasksDrawer}
          title={t('Daily Tasks & Hearing Notifications', 'দৈনিক কাজ ও শুনানির তাগিদ')}
          className="relative flex items-center justify-center h-8 sm:h-9 px-2 sm:px-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
        >
          <Bell className="h-4 w-4 text-indigo-600" />
          {pendingTasksCount > 0 ? (
            <span className="ml-1 flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-white bg-rose-600 px-1.5 py-0.2 rounded-full font-bold">
              {pendingTasksCount}
            </span>
          ) : (
            <span className="ml-1 hidden md:inline text-slate-500 font-normal">{t('Tasks', 'তাগিদ')}</span>
          )}
        </button>

        {lowStockItems.length > 0 && appMode === 'erp' && (
          <button
            onClick={() => setActiveTab('items')}
            title={`${lowStockItems.length} items low on stock`}
            className="hidden sm:flex items-center justify-center h-9 px-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <span className="text-[11px]">{t('Low Stock:', 'কম স্টক:')}</span>
            <span className="ml-1 font-mono font-bold">{lowStockItems.length}</span>
          </button>
        )}

        {/* Quick Context Add Button */}
        {appMode === 'erp' ? (
          <button
            onClick={onOpenNewSale}
            className="inline-flex items-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('+ Sale (F1)', '+ বিক্রয় (F1)')}</span>
            <span className="sm:hidden">{t('+ Sale', '+ বিক্রয়')}</span>
          </button>
        ) : (
          <button
            onClick={onOpenNewCase}
            className="inline-flex items-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('+ Case (F3)', '+ মামলা (F3)')}</span>
            <span className="sm:hidden">{t('+ Case', '+ মামলা')}</span>
          </button>
        )}
      </div>
    </header>
  );
};
