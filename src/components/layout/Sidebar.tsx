import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
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
}) => {
  const [isCasesExpanded, setIsCasesExpanded] = useState(true);

  const handleCasesClick = () => {
    setActiveTab('cases');
    setIsCasesExpanded(true);
  };

  const handleSubTabClick = (subTab: string) => {
    setActiveTab('cases');
    if (setCaseSubTab) {
      setCaseSubTab(subTab);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'sales',
      label: 'Sales & Invoices',
      icon: FileText,
      badge: totalReceivables > 0 ? `${currencySymbol}${Math.round(totalReceivables).toLocaleString()}` : undefined,
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: ShoppingBag,
    },
    {
      id: 'parties',
      label: 'Parties & CRM',
      icon: Users,
    },
    {
      id: 'items',
      label: 'Items & Stock',
      icon: Package,
      alertCount: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'cash-bank',
      label: 'Cash & Bank',
      icon: Landmark,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: CreditCard,
    },
    {
      id: 'reports',
      label: 'Reports & P&L',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)] no-print">
      <div className="p-3 space-y-1">
        {/* Dashboard Link */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard
              className={`h-4 w-4 ${
                activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'
              }`}
            />
            <span>Dashboard</span>
          </div>
        </button>

        {/* Case Tracker with Dedicated Sub-Menus */}
        <div className="pt-1 pb-1">
          <button
            onClick={handleCasesClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'cases'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Scale
                className={`h-4 w-4 ${
                  activeTab === 'cases' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>Case Tracker</span>
            </div>

            <div className="flex items-center gap-1.5">
              {todayHearingsCount > 0 ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  {todayHearingsCount} Today
                </span>
              ) : activeCasesCount > 0 ? (
                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 font-bold px-1.5 py-0.5 rounded">
                  {activeCasesCount}
                </span>
              ) : null}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCasesExpanded(!isCasesExpanded);
                }}
                className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
              >
                {isCasesExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </button>

          {/* Sub-menu items for Mutation, Misc Case, RTI, LR Appeal, Cause List */}
          {isCasesExpanded && (
            <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-0.5">
              <button
                onClick={() => handleSubTabClick('all')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'cases' && caseSubTab === 'all'
                    ? 'font-bold text-indigo-700 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>All Cases</span>
                <span className="font-mono text-[10px] text-slate-400">{activeCasesCount}</span>
              </button>

              <button
                onClick={() => handleSubTabClick('mutation')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'cases' && caseSubTab === 'mutation'
                    ? 'font-bold text-purple-700 bg-purple-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>Mutation (RoR)</span>
                </span>
                <span className="font-mono text-[10px] text-purple-700 font-semibold">{mutationCount}</span>
              </button>

              <button
                onClick={() => handleSubTabClick('misc_case')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'cases' && caseSubTab === 'misc_case'
                    ? 'font-bold text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Misc Case (SDO)</span>
                </span>
                <span className="font-mono text-[10px] text-blue-700 font-semibold">{miscCount}</span>
              </button>

              <button
                onClick={() => handleSubTabClick('rti')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'cases' && caseSubTab === 'rti'
                    ? 'font-bold text-amber-700 bg-amber-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>RTI Inquiries</span>
                </span>
                <span className="font-mono text-[10px] text-amber-700 font-semibold">{rtiCount}</span>
              </button>

              <button
                onClick={() => handleSubTabClick('lr_appeal')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'cases' && caseSubTab === 'lr_appeal'
                    ? 'font-bold text-rose-700 bg-rose-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>LR Appeal (Tribunal)</span>
                </span>
                <span className="font-mono text-[10px] text-rose-700 font-semibold">{lrAppealCount}</span>
              </button>

              <button
                onClick={() => handleSubTabClick('cause_list')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'cases' && caseSubTab === 'cause_list'
                    ? 'font-bold text-indigo-700 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-indigo-600" />
                  <span>Cause List Calendar</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Standard ERP Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.alertCount ? (
                <span className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  {item.alertCount}
                </span>
              ) : item.badge ? (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 m-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="text-xs font-semibold text-slate-800 mb-1">
          SRK ERP Software v2.6
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          Integrated Business ERP with Land Revenue & Case Tracker Suite.
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>Status:</span>
          <span className="font-semibold text-emerald-600">● Local Active</span>
        </div>
      </div>
    </aside>
  );
};
