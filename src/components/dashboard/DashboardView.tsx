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
  Share2,
  Scale,
  Clock,
  CheckCircle2,
  Circle,
  Calendar,
  ExternalLink,
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
}) => {
  // KPIs
  const sales = transactions.filter((t) => t.type === 'sale_invoice');
  const purchases = transactions.filter((t) => t.type === 'purchase_bill');

  const totalSalesRevenue = sales.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalPurchasesCost = purchases.reduce((acc, t) => acc + t.grandTotal, 0);

  // Total Receivables (Money to collect from customers)
  const totalReceivables = parties
    .filter((p) => p.currentBalance > 0)
    .reduce((acc, p) => acc + p.currentBalance, 0);

  // Total Payables (Money to pay to suppliers)
  const totalPayables = parties
    .filter((p) => p.currentBalance < 0)
    .reduce((acc, p) => acc + Math.abs(p.currentBalance), 0);

  // Total Liquid Cash & Bank
  const totalCashBank = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  // Low stock items
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

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Top selling items
  const itemSalesMap = new Map<string, { name: string; qty: number; total: number }>();
  sales.forEach((inv) => {
    inv.items.forEach((it) => {
      const existing = itemSalesMap.get(it.itemName) || { name: it.itemName, qty: 0, total: 0 };
      existing.qty += it.qty;
      existing.total += it.totalAmount;
      itemSalesMap.set(it.itemName, existing);
    });
  });
  const topSellingItems = Array.from(itemSalesMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Business & Case Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial status, inventory, case tracking & daily task notifications for {company.name}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewSale}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Sale (F1)</span>
          </button>

          <button
            onClick={() => onOpenNewCase()}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-xs transition-colors"
          >
            <Scale className="h-3.5 w-3.5 text-purple-600" />
            <span>+ New Case</span>
          </button>

          <button
            onClick={onOpenDailyTasksDrawer}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Daily Tasks ({pendingTasks.length})</span>
          </button>

          <button
            onClick={onOpenNewPurchase}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>+ Purchase</span>
          </button>

          <button
            onClick={onOpenAddParty}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>+ Party</span>
          </button>
        </div>
      </div>

      {/* Case Tracker & Hearing Notification Alert if any */}
      {todayHearings.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-200/80 text-purple-900 shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950">
                Notice: {todayHearings.length} Legal / Revenue Hearing(s) Today
              </h4>
              <p className="text-xs text-purple-800 mt-0.5">
                {todayHearings.map((c) => `${c.caseNo} (${c.type.toUpperCase()}) at ${c.courtOrAuthority}`).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigateCaseCategory('all')}
              className="h-8 px-3 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Open Case Tracker →
            </button>
          </div>
        </div>
      )}

      {/* Low Stock Warning Alert if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Low Stock Alert ({lowStockItems.length} Products)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowStockItems.map((i) => `${i.name} (${i.stockQty} ${i.unit} left)`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('items')}
            className="h-8 px-3 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Manage Inventory →
          </button>
        </div>
      )}

      {/* 4-Zone Business Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Sales</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {company.currencySymbol}{totalSalesRevenue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span>{sales.length} Invoices</span>
            <span>·</span>
            <span className="text-emerald-600">Active billing</span>
          </div>
        </div>

        {/* To Collect (Receivables) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">To Collect (Receivable)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {company.currencySymbol}{totalReceivables.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            From {parties.filter((p) => p.currentBalance > 0).length} customer parties
          </div>
        </div>

        {/* To Pay (Payables) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">To Pay (Payable)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {company.currencySymbol}{totalPayables.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            To {parties.filter((p) => p.currentBalance < 0).length} suppliers
          </div>
        </div>

        {/* Cash & Bank in Hand */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cash & Bank Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-700 tabular-nums">
            {company.currencySymbol}{totalCashBank.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {accounts.length} bank/cash registers
          </div>
        </div>
      </div>

      {/* ================= CASE TRACKER DASHBOARD SECTION ================= */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Case Tracker & Revenue Proceedings
              </h2>
              <span className="text-xs text-slate-500">
                Mutation, Misc Cases, RTI Applications & LR Appeals linked with CRM Parties
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigateCaseCategory('all')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900"
            >
              Open Full Case Tracker →
            </button>
          </div>
        </div>

        {/* 4 Category Case Status Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => handleNavigateCaseCategory('mutation')}
            className="p-3 rounded-lg bg-purple-50/60 border border-purple-200 hover:border-purple-300 cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-purple-900 uppercase">Mutation Cases</div>
            <div className="text-xl font-bold font-mono text-purple-700 mt-1 tabular-nums">
              {mutationCases.length}
            </div>
            <span className="text-[10px] text-purple-600 block mt-0.5">Plot & Khatian records</span>
          </div>

          <div
            onClick={() => handleNavigateCaseCategory('misc_case')}
            className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-blue-900 uppercase">Misc Cases</div>
            <div className="text-xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
              {miscCases.length}
            </div>
            <span className="text-[10px] text-blue-600 block mt-0.5">Demarcation & SDO files</span>
          </div>

          <div
            onClick={() => handleNavigateCaseCategory('rti')}
            className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 hover:border-amber-300 cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-amber-900 uppercase">RTI Applications</div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
              {rtiCases.length}
            </div>
            <span className="text-[10px] text-amber-600 block mt-0.5">30-day statutory timer</span>
          </div>

          <div
            onClick={() => handleNavigateCaseCategory('lr_appeal')}
            className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 hover:border-rose-300 cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-rose-900 uppercase">LR Appeals</div>
            <div className="text-xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
              {lrAppeals.length}
            </div>
            <span className="text-[10px] text-rose-600 block mt-0.5">Sec 54 DL&LRO Tribunal</span>
          </div>
        </div>

        {/* 2-Column Split: Upcoming Hearings + Daily Task Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Left: Upcoming Hearings */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>Upcoming Case Hearings & RTI Deadlines</span>
              </span>
              <button
                onClick={() => handleNavigateCaseCategory('all')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {cases.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <span className="font-mono text-indigo-700">{c.caseNo}</span>
                      <span className="text-slate-400">·</span>
                      <span className="truncate">{c.partyName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.courtOrAuthority} {c.mouza ? `(Mouza: ${c.mouza})` : ''}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      {c.nextHearingDate || 'No date'}
                    </div>
                    <span
                      className={`text-[9px] uppercase font-semibold px-1 rounded ${
                        c.type === 'mutation'
                          ? 'bg-purple-100 text-purple-800'
                          : c.type === 'rti'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {c.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Daily Tasks Checklist */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>Today's Task Notifications ({pendingTasks.length} Pending)</span>
              </span>
              <button
                onClick={onOpenDailyTasksDrawer}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                + Add / Open Drawer
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <button
                      onClick={() => onToggleTask(t.id)}
                      className="text-slate-400 hover:text-indigo-600 shrink-0"
                    >
                      {t.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      className={`truncate ${
                        t.isCompleted ? 'line-through text-slate-400' : 'font-medium text-slate-800'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 ${
                      t.priority === 'high'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Transactions + Top Items & Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All Sales →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const isSaleTx = tx.type === 'sale_invoice';
                  const isEstimateTx = tx.type === 'estimate';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                        {tx.date}
                        <span className="text-[10px] text-slate-400 block">{tx.invoiceNo}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold text-[11px] ${
                            isSaleTx
                              ? 'text-emerald-700'
                              : isEstimateTx
                              ? 'text-amber-700'
                              : 'text-indigo-700'
                          }`}
                        >
                          {isSaleTx ? 'Sale Invoice' : isEstimateTx ? 'Estimate' : 'Purchase'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {tx.partyName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {company.currencySymbol}{tx.grandTotal.toLocaleString()}
                        {tx.balanceDue > 0 && (
                          <span className="text-[10px] text-rose-600 font-normal block">
                            Due: {company.currencySymbol}{tx.balanceDue.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            tx.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tx.status === 'partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenPrintInvoice(tx)}
                            title="Print GST Invoice"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          {tx.balanceDue > 0 && (
                            <button
                              onClick={() => onOpenRecordPayment(tx)}
                              className="px-2 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                            >
                              Collect
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

        {/* Right 1 Col: Cash & Bank Accounts + Top Selling Products */}
        <div className="space-y-6">
          {/* Bank & Cash balances */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cash & Bank Accounts
              </h3>
              <button
                onClick={() => setActiveTab('cash-bank')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Manage
              </button>
            </div>
            <div className="space-y-2.5">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{acc.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{acc.type}</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                    {company.currencySymbol}{acc.currentBalance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Revenue Items
              </h3>
              <button
                onClick={() => setActiveTab('items')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Inventory
              </button>
            </div>
            <div className="space-y-3">
              {topSellingItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {item.name}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {company.currencySymbol}{item.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Sold: {item.qty} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
