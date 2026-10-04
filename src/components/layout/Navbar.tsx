import React from 'react';
import {
  Building2,
  Plus,
  Receipt,
  ShoppingBag,
  Bell,
  Search,
} from 'lucide-react';
import { CompanyProfile, Item } from '../../types/erp';

interface NavbarProps {
  company: CompanyProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  lowStockItems: Item[];
  pendingTasksCount: number;
  onOpenDailyTasksDrawer: () => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  activeTab,
  setActiveTab,
  onOpenNewSale,
  onOpenNewPurchase,
  lowStockItems,
  pendingTasksCount,
  onOpenDailyTasksDrawer,
  globalSearch,
  setGlobalSearch,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs no-print">
      {/* Zone 1: Brand title, one line */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              SRK ERP Software
            </span>
            <span className="text-[11px] font-medium text-slate-500 block leading-none">
              {company.name}
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links & Search */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices, parties, items..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-400 rounded-lg outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Tasks & Hearing Notification Bell */}
        <button
          onClick={onOpenDailyTasksDrawer}
          title="Daily Tasks & Hearing Notifications"
          className="relative flex items-center justify-center h-9 px-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
        >
          <Bell className="h-4 w-4 text-indigo-600" />
          {pendingTasksCount > 0 ? (
            <span className="ml-1.5 flex items-center gap-1 font-mono text-[11px] text-white bg-rose-600 px-1.5 py-0.2 rounded-full font-bold">
              {pendingTasksCount}
            </span>
          ) : (
            <span className="ml-1 hidden sm:inline text-slate-500 font-normal">Tasks</span>
          )}
        </button>

        {lowStockItems.length > 0 && (
          <button
            onClick={() => setActiveTab('items')}
            title={`${lowStockItems.length} items low on stock`}
            className="relative flex items-center justify-center h-9 px-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <span className="hidden sm:inline text-[11px]">Stock Alert:</span>
            <span className="ml-1 font-mono">{lowStockItems.length}</span>
          </button>
        )}

        <button
          onClick={onOpenNewPurchase}
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <ShoppingBag className="h-4 w-4 text-slate-600" />
          <span>+ Purchase</span>
        </button>

        <button
          onClick={onOpenNewSale}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Invoice (F1)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Company Settings"
        >
          <Building2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
