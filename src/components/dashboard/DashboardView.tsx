import React from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  AlertTriangle,
  Receipt,
  Plus,
  Users,
  CreditCard,
  Printer,
  Scale,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Wallet,
  Landmark,
} from 'lucide-react';
import {
  Transaction,
  Party,
  Item,
  BankAccount,
  CompanyProfile,
  LegalCase,
  DailyTask,
  CaseType,
} from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardViewProps {
  transactions: Transaction[];
  parties: Party[];
  items: Item[];
  accounts: BankAccount[];
  cases: LegalCase[];
  tasks: DailyTask[];
  company: CompanyProfile;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenAddParty: () => void;
  onOpenAddItem: () => void;
  onOpenNewCase: (type?: CaseType) => void;
  onToggleTask: (id: string) => void;
  onOpenDailyTasksDrawer: () => void;
  onOpenRecordPayment: (tx?: Transaction) => void;
  onOpenPrintInvoice: (tx: Transaction) => void;
  setActiveTab: (tab: string) => void;
  setActiveCaseSubTab?: (subTab: string) => void;
  onSwitchToWork?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  parties,
  items,
  accounts,
  cases,
  tasks,
  company,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenAddParty,
  onOpenAddItem,
  onOpenNewCase,
  onToggleTask,
  onOpenDailyTasksDrawer,
  onOpenRecordPayment,
  onOpenPrintInvoice,
  setActiveTab,
  setActiveCaseSubTab,
  onSwitchToWork,
}) => {
  const { t } = useLanguage();

  // Financial KPIs
  const sales = transactions.filter((t) => t.type === 'sale_invoice');
  const purchases = transactions.filter((t) => t.type === 'purchase_bill');

  const totalSalesRevenue = sales.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalPurchasesCost = purchases.reduce((acc, t) => acc + t.grandTotal, 0);

  // Total Receivables (Money to collect from customers - You'll Receive)
  const receivingParties = parties.filter((p) => p.currentBalance > 0);
  const totalReceivables = receivingParties.reduce((acc, p) => acc + p.currentBalance, 0);

  // Total Payables (Money to pay to suppliers - You'll Pay)
  const payingParties = parties.filter((p) => p.currentBalance < 0);
  const totalPayables = payingParties.reduce((acc, p) => acc + Math.abs(p.currentBalance), 0);

  // Liquid Cash & Bank
  const totalCashBank = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const totalCashInHand = cashAccounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalBankBalance = totalCashBank - totalCashInHand;

  // Stock inventory
  const totalStockValue = items.reduce((acc, i) => acc + (i.stockQty * i.purchasePrice), 0);
  const lowStockItems = items.filter(
    (i) => i.type === 'product' && i.stockQty <= i.minStockAlert
  );

  // Case Tracker Stats
  const mutationCases = cases.filter((c) => c.type === 'mutation');
  const miscCases = cases.filter((c) => c.type === 'misc_case');
  const rtiCases = cases.filter((c) => c.type === 'rti');
  const lrAppeals = cases.filter((c) => c.type === 'lr_appeal');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHearings = cases.filter((c) => c.nextHearingDate === todayStr);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 6);

  const handleNavigateCaseCategory = (category: string) => {
    if (setActiveCaseSubTab) {
      setActiveCaseSubTab(category);
    }
    setActiveTab('cases');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {t('ERP & Billing Dashboard', 'ইআরপি ও বিলিং ড্যাশবোর্ড')}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {t('ERP PORTION', 'ইআরপি অংশ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Sales bills, purchase records, party ledgers & inventory', 'বিক্রয় বিল, ক্রয় রেকর্ড, পার্টির খতিয়ান ও স্টক বিবরণী')} · {company.name}
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToWork && (
            <button
              onClick={onSwitchToWork}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-xs transition-colors"
            >
              <Scale className="h-3.5 w-3.5 text-purple-600" />
              <span>{t('Go to Work & Tracking', 'কাজ ও ট্র্যাকিং-এ যান')} →</span>
            </button>
          )}

          <button
            onClick={onOpenNewSale}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('+ New Sale (F1)', '+ নতুন বিক্রয় (F1)')}</span>
          </button>

          <button
            onClick={onOpenNewPurchase}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('+ Purchase (F2)', '+ ক্রয় (F2)')}</span>
          </button>

          <button
            onClick={onOpenAddParty}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('+ Party', '+ পার্টি')}</span>
          </button>
        </div>
      </div>

      {/* ================= SIGNATURE DUAL-CARD BUSINESS SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: YOU'LL RECEIVE (GREEN) */}
        <div className="p-5 rounded-2xl bg-white border-2 border-emerald-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {t("You'll Receive (Receivables)", 'আপনি পাবেন (পাওনা / বকেয়া)')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {t(`From ${receivingParties.length} Customer Parties`, `${receivingParties.length} জন গ্রাহকের কাছে পাওনা`)}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs">
              <ArrowDownLeft className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 tabular-nums">
              {company.currencySymbol}{Math.round(totalReceivables).toLocaleString()}
            </div>
            <button
              onClick={() => setActiveTab('parties')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {t('View Parties →', 'পার্টি দেখুন →')}
            </button>
          </div>
        </div>

        {/* Card 2: YOU'LL PAY (ROSE RED) */}
        <div className="p-5 rounded-2xl bg-white border-2 border-rose-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                {t("You'll Pay (Payables)", 'আপনি দেবেন (দেনা / মহাজন বিল)')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {t(`To ${payingParties.length} Supplier Accounts`, `${payingParties.length} জন মহাজন বা সাপ্লায়ারকে দেয়`)}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 shadow-2xs">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-700 tabular-nums">
              {company.currencySymbol}{Math.round(totalPayables).toLocaleString()}
            </div>
            <button
              onClick={() => setActiveTab('parties')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline"
            >
              {t('Pay Now →', 'টাকা পরিশোধ →')}
            </button>
          </div>
        </div>

        {/* Card 3: CASH & BANK BALANCE (INDIGO) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                {t('Cash & Bank Balance', 'নগদ ক্যাশ ও ব্যাংক স্থিতি')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {t(`Across ${accounts.length} Liquid Accounts`, `${accounts.length} টি সক্রিয় অ্যাকাউন্ট ও ড্রয়ার`)}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-2xs">
              <Landmark className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-700 tabular-nums">
              {company.currencySymbol}{Math.round(totalCashBank).toLocaleString()}
            </div>
            <button
              onClick={() => setActiveTab('cash-bank')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {t('Manage Accounts →', 'অ্যাকাউন্ট দেখুন →')}
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
            <span>{t('Cash in Hand:', 'হাতে নগদ:')} <b>{company.currencySymbol}{Math.round(totalCashInHand).toLocaleString()}</b></span>
            <span>{t('In Bank:', 'ব্যাংকে জমা:')} <b>{company.currencySymbol}{Math.round(totalBankBalance).toLocaleString()}</b></span>
          </div>
        </div>
      </div>

      {/* Secondary Financial Metrics: Total Sales & Inventory Valuation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Sales */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              {t('Total Sales (Turnover)', 'মোট বিক্রয় (টার্নওভার)')}
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
              {company.currencySymbol}{Math.round(totalSalesRevenue).toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {sales.length} {t('Invoices billed', 'টি ইনভয়েস সম্পন্ন')}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Total Purchases */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              {t('Total Purchases & Expenses', 'মোট ক্রয় ও খরচ')}
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
              {company.currencySymbol}{Math.round(totalPurchasesCost).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {purchases.length} {t('Bills registered', 'টি বিল লিপিবদ্ধ')}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* Stock Inventory Value & Low Stock Alert */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              {t('Stock Inventory Value', 'মজুত পণ্যের বাজারমূল্য')}
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
              {company.currencySymbol}{Math.round(totalStockValue).toLocaleString()}
            </div>
            {lowStockItems.length > 0 ? (
              <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {lowStockItems.length} {t('Low Stock Alert(s)', 'টি পণ্যের স্টক কম')}
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium">
                {t('All items well stocked', 'স্টক পর্যাপ্ত আছে')}
              </span>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ================= WORK & TRACKING DUAL-PORTION BRIDGE BANNER ================= */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-purple-950 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 text-white shrink-0 shadow-xs">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 bg-purple-200/80 px-2.5 py-0.5 rounded font-mono">
                {t('Work & Tracking Portion', 'কাজ ও ট্র্যাকিং অংশ')}
              </span>
              {todayHearings.length > 0 && (
                <span className="text-xs font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full animate-pulse">
                  {todayHearings.length} {t('Hearing(s) Scheduled Today!', 'টি শুনানি আজ নির্ধারিত!')}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-purple-950 mt-1">
              {t('Land Revenue, Mutation & Legal Proceedings Tracking', 'ভূমি রাজস্ব, মিউটেশন, বিবিধ মামলা ও আরটিআই ট্র্যাকিং')}
            </h3>
            <p className="text-xs text-purple-800 mt-0.5">
              <b>{cases.length}</b> {t('Active Case Files', 'সক্রিয় মামলা')} ({mutationCases.length} {t('Mutation', 'মিউটেশন')}, {miscCases.length} {t('Misc Cases', 'মিস কেস')}, {rtiCases.length} {t('RTI', 'আরটিআই')}, {lrAppeals.length} {t('LR Appeals', 'এল.আর. আপিল')}) · <b>{pendingTasks.length}</b> {t('tasks due', 'টি কাজ বাকি')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => onOpenNewCase()}
            className="h-9 px-3 text-xs font-bold text-purple-800 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-2xs"
          >
            {t('+ New Case (F3)', '+ নতুন মামলা (F3)')}
          </button>
          <button
            onClick={() => {
              if (onSwitchToWork) onSwitchToWork();
              else setActiveTab('work_dashboard');
            }}
            className="h-9 px-3.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>{t('Open Work & Tracking', 'কাজ ও ট্র্যাকিং খুলুন')}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Case Tracker 4-Category Quick Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => handleNavigateCaseCategory('mutation')}
          className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors shadow-2xs"
        >
          <div className="text-[11px] font-bold text-purple-900 uppercase">
            {t('Mutation (RoR)', 'মিউটেশন ও রেকর্ড')}
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-700 mt-1 tabular-nums">
            {mutationCases.length}
          </div>
          <span className="text-[10px] text-purple-600 block mt-0.5">
            {t('Plot, Khatian & Deed records', 'দাগ, খতিয়ান ও দলিলের রেকর্ড')}
          </span>
        </div>

        <div
          onClick={() => handleNavigateCaseCategory('misc_case')}
          className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors shadow-2xs"
        >
          <div className="text-[11px] font-bold text-blue-900 uppercase">
            {t('Misc Cases (Docket)', 'মিস কেস (ডকেট)')}
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-700 mt-1 tabular-nums">
            {miscCases.length}
          </div>
          <span className="text-[10px] text-blue-600 block mt-0.5">
            {t('Docket No & Boundary files', 'ডকেট নং ও সীমানা বিরোধ')}
          </span>
        </div>

        <div
          onClick={() => handleNavigateCaseCategory('rti')}
          className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-colors shadow-2xs"
        >
          <div className="text-[11px] font-bold text-amber-900 uppercase">
            {t('RTI Inquiries (30D)', 'তথ্য অধিকার (আরটিআই)')}
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1 tabular-nums">
            {rtiCases.length}
          </div>
          <span className="text-[10px] text-amber-600 block mt-0.5">
            {t('30-day compliance counter', '৩০ দিনের সংবিধিবদ্ধ সময়সীমা')}
          </span>
        </div>

        <div
          onClick={() => handleNavigateCaseCategory('lr_appeal')}
          className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer transition-colors shadow-2xs"
        >
          <div className="text-[11px] font-bold text-rose-900 uppercase">
            {t('LR Appeals (Tribunal)', 'এল.আর. আপিল')}
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1 tabular-nums">
            {lrAppeals.length}
          </div>
          <span className="text-[10px] text-rose-600 block mt-0.5">
            {t('BL&LRO, SDO & Stay orders', 'ট্রাইব্যুনাল ও স্থগিতাদেশ')}
          </span>
        </div>
      </div>

      {/* ================= RECENT INVOICES & TRANSACTIONS TABLE ================= */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {t('Recent Transactions & Invoices', 'সাম্প্রতিক ইনভয়েস ও লেনদেন')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('Latest billing entries, payments received & pending invoices', 'সাম্প্রতিক বিক্রয় বিল, গৃহীত পেমেন্ট ও বকেয়া রশিদ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {t('View All Invoices →', 'সমস্ত ইনভয়েস দেখুন →')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase font-mono text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">{t('Type / Bill #', 'ধরণ / বিল নং')}</th>
                <th className="py-2.5 px-4">{t('Party / Client', 'পার্টি / মক্কেল')}</th>
                <th className="py-2.5 px-4">{t('Date', 'তারিখ')}</th>
                <th className="py-2.5 px-4 text-right">{t('Total', 'মোট টাকা')}</th>
                <th className="py-2.5 px-4 text-right">{t('Balance Due', 'বকেয়া')}</th>
                <th className="py-2.5 px-4 text-center">{t('Status', 'অবস্থা')}</th>
                <th className="py-2.5 px-4 text-center">{t('Action', 'পদক্ষেপ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentTransactions.map((tx) => {
                const isPaid = tx.status === 'paid';
                const isPartial = tx.status === 'partial';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      <div>{tx.invoiceNo}</div>
                      <span className="text-[10px] text-slate-500 font-normal uppercase">
                        {tx.type === 'sale_invoice' ? t('Sale Bill', 'বিক্রয় বিল') : t('Purchase', 'ক্রয়')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{tx.partyName}</div>
                      {tx.partyPhone && (
                        <span className="text-[11px] font-mono text-slate-500">{tx.partyPhone}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{tx.date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {company.currencySymbol}{tx.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {tx.balanceDue > 0 ? (
                        <span className="text-rose-600">{company.currencySymbol}{tx.balanceDue.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-600">0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPartial
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPaid ? t('Paid', 'পরিশোধিত') : isPartial ? t('Partial', 'আংশিক') : t('Unpaid', 'বাকি')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenPrintInvoice(tx)}
                          title={t('Print Bill', 'বিল প্রিন্ট করুন')}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {tx.balanceDue > 0 && (
                          <button
                            onClick={() => onOpenRecordPayment(tx)}
                            title={t('Collect Payment', 'টাকা জমা নিন')}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                          >
                            {t('Collect', 'আদায়')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
