import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  CompanyProfile,
  Party,
  Item,
  Transaction,
  BankAccount,
  ExpenseRecord,
  StockAdjustment,
  TransactionType,
  PaymentMode,
  LegalCase,
  DailyTask,
  HearingLog,
  CaseType,
} from './types/erp';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { SalesList } from './components/sales/SalesList';
import { PurchasesList } from './components/purchases/PurchasesList';
import { PartiesView } from './components/parties/PartiesView';
import { ItemsView } from './components/items/ItemsView';
import { CashBankView } from './components/cash-bank/CashBankView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { InvoiceEditor } from './components/sales/InvoiceEditor';
import { InvoicePrintModal } from './components/sales/InvoicePrintModal';
import { QuickPaymentModal } from './components/common/QuickPaymentModal';
import { CaseTrackerView } from './components/cases/CaseTrackerView';
import { DailyTasksDrawer } from './components/cases/DailyTasksDrawer';
import { WorkDashboardView } from './components/dashboard/WorkDashboardView';
import { DeviceRegistrationModal } from './components/auth/DeviceRegistrationModal';
import { DeviceAuthService } from './services/deviceAuthService';
import { CompanySetupModal } from './components/company/CompanySetupModal';
import { ClientPublicPortalModal } from './components/portal/ClientPublicPortalModal';
import { DispatchNotificationModal } from './components/portal/DispatchNotificationModal';
import { ClientDispatchService, ClientNotificationLog } from './services/clientDispatchService';

export default function App() {
  // Navigation, mode & global search
  const [appMode, setAppMode] = useState<'erp' | 'work'>('erp');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [caseSubTab, setCaseSubTab] = useState<string>('all');

  // Primary Data State
  const [company, setCompany] = useState<CompanyProfile>(StorageService.getCompany());
  const [parties, setParties] = useState<Party[]>(StorageService.getParties());
  const [items, setItems] = useState<Item[]>(StorageService.getItems());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [accounts, setAccounts] = useState<BankAccount[]>(StorageService.getAccounts());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(StorageService.getExpenses());
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(StorageService.getStockAdjustments());
  const [cases, setCases] = useState<LegalCase[]>(StorageService.getCases());
  const [tasks, setTasks] = useState<DailyTask[]>(StorageService.getTasks());

  // Modal States
  const [isInvoiceEditorOpen, setIsInvoiceEditorOpen] = useState(false);
  const [invoiceEditorType, setInvoiceEditorType] = useState<TransactionType>('sale_invoice');
  const [initialEditInvoice, setInitialEditInvoice] = useState<Transaction | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintInvoice, setSelectedPrintInvoice] = useState<Transaction | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'payment_in' | 'payment_out'>('payment_in');
  const [paymentModalParty, setPaymentModalParty] = useState<Party | undefined>();
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Transaction | undefined>();

  const [isDailyTasksDrawerOpen, setIsDailyTasksDrawerOpen] = useState(false);
  const [isDeviceRegistrationOpen, setIsDeviceRegistrationOpen] = useState(!DeviceAuthService.isRegistered());

  // Client Public Portal Modal (opens when client visits view URL or clicks view)
  const [clientPortalState, setClientPortalState] = useState<{
    isOpen: boolean;
    type: 'invoice' | 'case';
    invoice?: Transaction | null;
    caseItem?: LegalCase | null;
    party?: Party | null;
  }>({ isOpen: false, type: 'invoice' });

  // Outbound Dispatch Notification Modal (triggered on billing or case save)
  const [dispatchAlert, setDispatchAlert] = useState<{
    isOpen: boolean;
    type: 'invoice' | 'case';
    invoice?: Transaction | null;
    caseItem?: LegalCase | null;
    party?: Party | null;
    log?: ClientNotificationLog | null;
    url: string;
    waUrl?: string;
    message?: string;
  } | null>(null);

  // Check URL Query params (?view=invoice&id=... or ?view=case&id=...) on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const view = searchParams.get('view');
      const id = searchParams.get('id');
      if (view === 'invoice' && id) {
        const allTx = StorageService.getTransactions();
        const found = allTx.find((t) => t.id === id);
        if (found) {
          const allParties = StorageService.getParties();
          const p = allParties.find((x) => x.id === found.partyId);
          setClientPortalState({
            isOpen: true,
            type: 'invoice',
            invoice: found,
            party: p || null,
          });
        }
      } else if (view === 'case' && id) {
        const allCases = StorageService.getCases();
        const found = allCases.find((c) => c.id === id);
        if (found) {
          const allParties = StorageService.getParties();
          const p = allParties.find((x) => x.id === found.partyId);
          setClientPortalState({
            isOpen: true,
            type: 'case',
            caseItem: found,
            party: p || null,
          });
        }
      }
    } catch {}
  }, []);

  // Record session login audit on app start if device already registered
  useEffect(() => {
    if (DeviceAuthService.isRegistered()) {
      DeviceAuthService.recordLoginSession();
    }
  }, []);

  // Synchronize state reload from storage
  const reloadData = () => {
    setCompany(StorageService.getCompany());
    setParties(StorageService.getParties());
    setItems(StorageService.getItems());
    setTransactions(StorageService.getTransactions());
    setAccounts(StorageService.getAccounts());
    setExpenses(StorageService.getExpenses());
    setAdjustments(StorageService.getStockAdjustments());
    setCases(StorageService.getCases());
    setTasks(StorageService.getTasks());
  };

  // Setup Keyboard Shortcuts (F1 for Sale, F2 for Purchase, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        openNewSale();
      } else if (e.key === 'F2') {
        e.preventDefault();
        openNewPurchase();
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleOpenNewCase();
      } else if (e.key === 'Escape') {
        setIsInvoiceEditorOpen(false);
        setIsPrintModalOpen(false);
        setIsPaymentModalOpen(false);
        setIsDailyTasksDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Invoices
  const openNewSale = () => {
    setInvoiceEditorType('sale_invoice');
    setInitialEditInvoice(null);
    setIsInvoiceEditorOpen(true);
  };

  const openNewEstimate = () => {
    setInvoiceEditorType('estimate');
    setInitialEditInvoice(null);
    setIsInvoiceEditorOpen(true);
  };

  const openNewPurchase = () => {
    setInvoiceEditorType('purchase_bill');
    setInitialEditInvoice(null);
    setIsInvoiceEditorOpen(true);
  };

  const handleSaveTransaction = async (tx: Transaction, andPrint?: boolean) => {
    StorageService.saveTransaction(tx);
    reloadData();
    setIsInvoiceEditorOpen(false);

    if (andPrint) {
      setSelectedPrintInvoice(tx);
      setIsPrintModalOpen(true);
    }

    // Auto-dispatch bill to client's registered mobile / WhatsApp via internet
    if (tx.type === 'sale_invoice' || tx.type === 'estimate') {
      const foundParty = parties.find((p) => p.id === tx.partyId);
      const result = await ClientDispatchService.dispatchInvoiceNotification(
        tx,
        foundParty,
        company,
        false
      );
      setDispatchAlert({
        isOpen: true,
        type: 'invoice',
        invoice: tx,
        party: foundParty || null,
        log: result.log,
        url: result.url,
        waUrl: result.waUrl,
        message: result.message,
      });
    }
  };

  const handleManualDispatchInvoice = async (tx: Transaction) => {
    const foundParty = parties.find((p) => p.id === tx.partyId);
    const result = await ClientDispatchService.dispatchInvoiceNotification(
      tx,
      foundParty,
      company,
      false
    );
    setDispatchAlert({
      isOpen: true,
      type: 'invoice',
      invoice: tx,
      party: foundParty || null,
      log: result.log,
      url: result.url,
      waUrl: result.waUrl,
      message: result.message,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    StorageService.deleteTransaction(id);
    reloadData();
  };

  const handleConvertEstimateToInvoice = (estimate: Transaction) => {
    const newInv: Transaction = {
      ...estimate,
      id: `tx_${Date.now()}`,
      type: 'sale_invoice',
      invoiceNo: StorageService.getNextInvoiceNumber('sale_invoice'),
      status: 'unpaid',
      balanceDue: estimate.grandTotal,
      paidAmount: 0,
      createdAt: new Date().toISOString(),
    };
    setInvoiceEditorType('sale_invoice');
    setInitialEditInvoice(newInv);
    setIsInvoiceEditorOpen(true);
  };

  // Print Handlers
  const handleOpenPrint = (tx: Transaction) => {
    setSelectedPrintInvoice(tx);
    setIsPrintModalOpen(true);
  };

  // Payment Handlers
  const handleOpenPaymentForInvoice = (tx?: Transaction) => {
    if (!tx) {
      setPaymentModalType('payment_in');
      setPaymentModalInvoice(undefined);
      setPaymentModalParty(parties[0]);
      setIsPaymentModalOpen(true);
      return;
    }
    setPaymentModalType(tx.type === 'purchase_bill' ? 'payment_out' : 'payment_in');
    setPaymentModalInvoice(tx);
    const foundParty = parties.find((p) => p.id === tx.partyId);
    setPaymentModalParty(foundParty);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPaymentForParty = (party: Party, type: 'payment_in' | 'payment_out') => {
    setPaymentModalType(type);
    setPaymentModalParty(party);
    setPaymentModalInvoice(undefined);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (data: {
    partyId: string;
    amount: number;
    accountId: string;
    mode: PaymentMode;
    type: 'payment_in' | 'payment_out';
    notes?: string;
    invoiceId?: string;
  }) => {
    StorageService.recordPayment(data);
    reloadData();
  };

  // Party Handlers
  const handleSaveParty = (party: Party) => {
    StorageService.saveParty(party);
    reloadData();
  };

  const handleDeleteParty = (id: string) => {
    StorageService.deleteParty(id);
    reloadData();
  };

  // Item Handlers
  const handleSaveItem = (item: Item) => {
    StorageService.saveItem(item);
    reloadData();
  };

  const handleDeleteItem = (id: string) => {
    StorageService.deleteItem(id);
    reloadData();
  };

  const handleAdjustStock = (itemId: string, qtyDelta: number, reason: string, type: 'add' | 'reduce') => {
    StorageService.adjustStock(itemId, qtyDelta, reason, type);
    reloadData();
  };

  // Cash / Bank / Expense Handlers
  const handleSaveAccount = (account: BankAccount) => {
    StorageService.saveAccount(account);
    reloadData();
  };

  const handleSaveExpense = (expense: ExpenseRecord) => {
    StorageService.saveExpense(expense);
    reloadData();
  };

  const handleDeleteExpense = (id: string) => {
    StorageService.deleteExpense(id);
    reloadData();
  };

  const handleTransferMoney = (fromId: string, toId: string, amount: number, notes: string) => {
    StorageService.debitAccount(fromId, amount);
    StorageService.creditAccount(toId, amount);
    reloadData();
  };

  // Case Tracker Handlers
  const handleSaveCase = async (c: LegalCase) => {
    StorageService.saveCase(c);
    reloadData();

    // Auto-dispatch case status update to registered mobile / WhatsApp via internet
    const foundParty = parties.find((p) => p.id === c.partyId);
    const result = await ClientDispatchService.dispatchCaseNotification(
      c,
      foundParty,
      company,
      false
    );
    setDispatchAlert({
      isOpen: true,
      type: 'case',
      caseItem: c,
      party: foundParty || null,
      log: result.log,
      url: result.url,
      waUrl: result.waUrl,
      message: result.message,
    });
  };

  const handleManualDispatchCase = async (c: LegalCase) => {
    const foundParty = parties.find((p) => p.id === c.partyId);
    const result = await ClientDispatchService.dispatchCaseNotification(
      c,
      foundParty,
      company,
      false
    );
    setDispatchAlert({
      isOpen: true,
      type: 'case',
      caseItem: c,
      party: foundParty || null,
      log: result.log,
      url: result.url,
      waUrl: result.waUrl,
      message: result.message,
    });
  };

  const handleDeleteCase = (id: string) => {
    StorageService.deleteCase(id);
    reloadData();
  };

  const handleAddHearing = (caseId: string, hearing: HearingLog, nextDate?: string) => {
    StorageService.addHearingLog(caseId, hearing, nextDate);
    reloadData();
  };

  const handleOpenNewCase = (type?: CaseType) => {
    setAppMode('work');
    if (type) {
      setCaseSubTab(type);
    }
    setActiveTab('cases');
  };

  const handleSwitchAppMode = (mode: 'erp' | 'work') => {
    setAppMode(mode);
    if (mode === 'erp') {
      if (activeTab === 'work_dashboard' || activeTab === 'cases') {
        setActiveTab('dashboard');
      }
    } else {
      if (
        activeTab === 'dashboard' ||
        activeTab === 'sales' ||
        activeTab === 'purchases' ||
        activeTab === 'cash-bank' ||
        activeTab === 'expenses' ||
        activeTab === 'items' ||
        activeTab === 'reports' ||
        activeTab === 'settings'
      ) {
        setActiveTab('work_dashboard');
      }
    }
  };

  const handleOpenBillingForCase = (c: LegalCase) => {
    const matchingParty = parties.find((p) => p.id === c.partyId);
    const feeInvoice: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'sale_invoice',
      invoiceNo: StorageService.getNextInvoiceNumber('sale_invoice'),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      partyId: c.partyId,
      partyName: c.partyName,
      partyPhone: c.partyPhone,
      partyGstin: matchingParty?.gstin,
      items: [
        {
          id: `row_${Date.now()}_1`,
          itemName: `Legal & Revenue Professional Fee: Case #${c.caseNo} (${c.type.toUpperCase()})`,
          hsnCode: '998211',
          qty: 1,
          unit: 'SERVICE',
          unitPrice: 3500,
          discountPercent: 0,
          discountAmount: 0,
          taxRate: 18,
          taxableAmount: 3500,
          taxAmount: 630,
          totalAmount: 4130,
        },
      ],
      subtotal: 3500,
      discountTotal: 0,
      taxableTotal: 3500,
      cgstTotal: 315,
      sgstTotal: 315,
      igstTotal: 0,
      totalTax: 630,
      roundOff: 0,
      grandTotal: 4130,
      paidAmount: 0,
      balanceDue: 4130,
      paymentMode: 'credit',
      status: 'unpaid',
      notes: `Matter: ${c.title}. Court/Authority: ${c.courtOrAuthority}. Docket/App No: ${c.applicationNo || c.docketNo || 'N/A'}. Broker: ${c.brokerName || 'None'}`,
      createdAt: new Date().toISOString(),
    };
    setAppMode('erp');
    setInvoiceEditorType('sale_invoice');
    setInitialEditInvoice(feeInvoice);
    setIsInvoiceEditorOpen(true);
  };

  // Daily Tasks Handlers
  const handleSaveTask = (task: DailyTask) => {
    StorageService.saveTask(task);
    reloadData();
  };

  const handleDeleteTask = (id: string) => {
    StorageService.deleteTask(id);
    reloadData();
  };

  const handleToggleTask = (id: string) => {
    StorageService.toggleTask(id);
    reloadData();
  };

  // Company Settings Handlers
  const handleSaveCompany = (updatedCompany: CompanyProfile) => {
    StorageService.saveCompany(updatedCompany);
    reloadData();
  };

  const handleResetData = () => {
    StorageService.resetToDefaultData();
    reloadData();
  };

  // KPI Calculations
  const lowStockCount = items.filter(
    (i) => i.type === 'product' && i.stockQty <= i.minStockAlert
  ).length;

  const totalReceivables = parties
    .filter((p) => p.currentBalance > 0)
    .reduce((acc, p) => acc + p.currentBalance, 0);

  const lowStockItems = items.filter(
    (i) => i.type === 'product' && i.stockQty <= i.minStockAlert
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHearingsCount = cases.filter((c) => c.nextHearingDate === todayStr).length;
  const pendingTasksCount =
    tasks.filter((t) => !t.isCompleted).length + todayHearingsCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        company={company}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'work_dashboard' || tab === 'cases') {
            setAppMode('work');
          } else if (tab !== 'parties') {
            setAppMode('erp');
          }
        }}
        appMode={appMode}
        setAppMode={handleSwitchAppMode}
        onOpenNewSale={openNewSale}
        onOpenNewPurchase={openNewPurchase}
        onOpenNewCase={handleOpenNewCase}
        lowStockItems={lowStockItems}
        pendingTasksCount={pendingTasksCount}
        todayHearingsCount={todayHearingsCount}
        onOpenDailyTasksDrawer={() => setIsDailyTasksDrawerOpen(true)}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'work_dashboard' || tab === 'cases') {
              setAppMode('work');
            } else if (tab !== 'parties') {
              setAppMode('erp');
            }
          }}
          appMode={appMode}
          setAppMode={handleSwitchAppMode}
          caseSubTab={caseSubTab}
          setCaseSubTab={(sub) => {
            setCaseSubTab(sub);
            setAppMode('work');
            setActiveTab('cases');
          }}
          lowStockCount={lowStockCount}
          totalReceivables={totalReceivables}
          activeCasesCount={cases.length}
          todayHearingsCount={todayHearingsCount}
          mutationCount={cases.filter((c) => c.type === 'mutation').length}
          miscCount={cases.filter((c) => c.type === 'misc_case').length}
          rtiCount={cases.filter((c) => c.type === 'rti').length}
          lrAppealCount={cases.filter((c) => c.type === 'lr_appeal').length}
          currencySymbol={company.currencySymbol}
          onOpenDailyTasksDrawer={() => setIsDailyTasksDrawerOpen(true)}
        />

        {/* Viewport Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              parties={parties}
              items={items}
              accounts={accounts}
              cases={cases}
              tasks={tasks}
              company={company}
              onOpenNewSale={openNewSale}
              onOpenNewPurchase={openNewPurchase}
              onOpenAddParty={() => {
                setAppMode('erp');
                setActiveTab('parties');
              }}
              onOpenAddItem={() => {
                setAppMode('erp');
                setActiveTab('items');
              }}
              onOpenNewCase={handleOpenNewCase}
              onToggleTask={handleToggleTask}
              onOpenDailyTasksDrawer={() => setIsDailyTasksDrawerOpen(true)}
              onOpenRecordPayment={handleOpenPaymentForInvoice}
              onOpenPrintInvoice={handleOpenPrint}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'cases' || tab === 'work_dashboard') setAppMode('work');
                else setAppMode('erp');
              }}
              setActiveCaseSubTab={(sub) => {
                setCaseSubTab(sub);
                setAppMode('work');
                setActiveTab('cases');
              }}
              onSwitchToWork={() => handleSwitchAppMode('work')}
            />
          )}

          {activeTab === 'work_dashboard' && (
            <WorkDashboardView
              cases={cases}
              tasks={tasks}
              parties={parties}
              company={company}
              onOpenNewCase={handleOpenNewCase}
              onSelectCase={(c) => {
                setAppMode('work');
                setCaseSubTab(c.type);
                setActiveTab('cases');
              }}
              onToggleTask={handleToggleTask}
              onOpenDailyTasksDrawer={() => setIsDailyTasksDrawerOpen(true)}
              onNavigateCaseCategory={(cat) => {
                setAppMode('work');
                setCaseSubTab(cat);
                setActiveTab('cases');
              }}
              onSwitchToErp={() => handleSwitchAppMode('erp')}
              onOpenPrintCauseList={() => {
                setAppMode('work');
                setCaseSubTab('cause_list');
                setActiveTab('cases');
              }}
              onExportExcel={() => {
                setAppMode('work');
                setActiveTab('cases');
              }}
            />
          )}

          {activeTab === 'cases' && (
            <CaseTrackerView
              cases={cases}
              parties={parties}
              company={company}
              initialSubTab={caseSubTab}
              onSaveCase={handleSaveCase}
              onDeleteCase={handleDeleteCase}
              onAddHearing={handleAddHearing}
              onOpenPartyLedger={(partyId) => {
                setActiveTab('parties');
              }}
              onOpenBillingForCase={handleOpenBillingForCase}
              onAddTaskForCase={(caseId, caseNo, title, dueDate) => {
                const newTask: DailyTask = {
                  id: `task_${Date.now()}`,
                  caseId,
                  caseNo,
                  title,
                  dueDate,
                  priority: 'high',
                  isCompleted: false,
                  createdAt: new Date().toISOString(),
                };
                handleSaveTask(newTask);
              }}
              onDispatchCase={handleManualDispatchCase}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'sales' && (
            <SalesList
              transactions={transactions}
              company={company}
              parties={parties}
              onOpenNewSale={openNewSale}
              onOpenNewEstimate={openNewEstimate}
              onPrintInvoice={handleOpenPrint}
              onRecordPayment={handleOpenPaymentForInvoice}
              onDeleteTransaction={handleDeleteTransaction}
              onConvertToInvoice={handleConvertEstimateToInvoice}
              onDispatchInvoice={handleManualDispatchInvoice}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesList
              transactions={transactions}
              company={company}
              onOpenNewPurchase={openNewPurchase}
              onPrintInvoice={handleOpenPrint}
              onRecordPayment={handleOpenPaymentForInvoice}
              onDeleteTransaction={handleDeleteTransaction}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'parties' && (
            <PartiesView
              parties={parties}
              transactions={transactions}
              cases={cases}
              company={company}
              onSaveParty={handleSaveParty}
              onDeleteParty={handleDeleteParty}
              onRecordPayment={handleOpenPaymentForParty}
              onOpenCaseTracker={() => setActiveTab('cases')}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'items' && (
            <ItemsView
              items={items}
              adjustments={adjustments}
              company={company}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
              onAdjustStock={handleAdjustStock}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'cash-bank' && (
            <CashBankView
              accounts={accounts}
              expenses={expenses}
              company={company}
              onSaveAccount={handleSaveAccount}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onTransferMoney={handleTransferMoney}
            />
          )}

          {activeTab === 'expenses' && (
            <CashBankView
              accounts={accounts}
              expenses={expenses}
              company={company}
              onSaveAccount={handleSaveAccount}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onTransferMoney={handleTransferMoney}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              parties={parties}
              items={items}
              expenses={expenses}
              company={company}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              company={company}
              onSaveCompany={handleSaveCompany}
              onResetData={handleResetData}
              onDatabaseImported={reloadData}
            />
          )}
        </main>
      </div>

      {/* Invoice Creator / Editor Modal */}
      {isInvoiceEditorOpen && (
        <InvoiceEditor
          isOpen={isInvoiceEditorOpen}
          onClose={() => setIsInvoiceEditorOpen(false)}
          type={invoiceEditorType}
          initialInvoice={initialEditInvoice}
          parties={parties}
          items={items}
          accounts={accounts}
          company={company}
          onSave={handleSaveTransaction}
          onQuickAddParty={handleSaveParty}
        />
      )}

      {/* Invoice View & Print Modal (A4 GST and 80mm Thermal Receipt) */}
      {isPrintModalOpen && (
        <InvoicePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          invoice={selectedPrintInvoice}
          company={company}
        />
      )}

      {/* Quick Collect / Record Payment Modal */}
      {isPaymentModalOpen && (
        <QuickPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          type={paymentModalType}
          party={paymentModalParty}
          invoice={paymentModalInvoice}
          parties={parties}
          accounts={accounts}
          currencySymbol={company.currencySymbol}
          onConfirm={handleConfirmPayment}
        />
      )}

      {/* Daily Tasks & Hearing Notifications Drawer */}
      <DailyTasksDrawer
        isOpen={isDailyTasksDrawerOpen}
        onClose={() => setIsDailyTasksDrawerOpen(false)}
        tasks={tasks}
        cases={cases}
        company={company}
        onToggleTask={handleToggleTask}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        onSelectCase={(c) => {
          setIsDailyTasksDrawerOpen(false);
          setActiveTab('cases');
          setCaseSubTab(c.type);
        }}
      />

      {/* First-Time Mobile Number Registration & Login Alert Modal */}
      <DeviceRegistrationModal
        isOpen={isDeviceRegistrationOpen}
        onRegistered={() => {
          setIsDeviceRegistrationOpen(false);
        }}
      />

      {/* Client Outbound Dispatch Notification Modal (When bill or case happens) */}
      {dispatchAlert && (
        <DispatchNotificationModal
          isOpen={dispatchAlert.isOpen}
          onClose={() => setDispatchAlert(null)}
          type={dispatchAlert.type}
          invoice={dispatchAlert.invoice}
          caseItem={dispatchAlert.caseItem}
          party={dispatchAlert.party}
          log={dispatchAlert.log}
          url={dispatchAlert.url}
          waUrl={dispatchAlert.waUrl}
          message={dispatchAlert.message}
          onOpenClientPortal={() => {
            setClientPortalState({
              isOpen: true,
              type: dispatchAlert.type,
              invoice: dispatchAlert.invoice,
              caseItem: dispatchAlert.caseItem,
              party: dispatchAlert.party,
            });
          }}
        />
      )}

      {/* Client Public Live View & Print Portal Modal */}
      <ClientPublicPortalModal
        isOpen={clientPortalState.isOpen}
        onClose={() => setClientPortalState({ isOpen: false, type: 'invoice' })}
        type={clientPortalState.type}
        invoice={clientPortalState.invoice}
        caseItem={clientPortalState.caseItem}
        company={company}
        party={clientPortalState.party}
      />
    </div>
  );
}
