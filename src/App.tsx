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

export default function App() {
  // Navigation & global search
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

  const handleSaveTransaction = (tx: Transaction, andPrint?: boolean) => {
    StorageService.saveTransaction(tx);
    reloadData();
    setIsInvoiceEditorOpen(false);

    if (andPrint) {
      setSelectedPrintInvoice(tx);
      setIsPrintModalOpen(true);
    }
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
  const handleSaveCase = (c: LegalCase) => {
    StorageService.saveCase(c);
    reloadData();
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
    if (type) {
      setCaseSubTab(type);
    }
    setActiveTab('cases');
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
        setActiveTab={setActiveTab}
        onOpenNewSale={openNewSale}
        onOpenNewPurchase={openNewPurchase}
        lowStockItems={lowStockItems}
        pendingTasksCount={pendingTasksCount}
        onOpenDailyTasksDrawer={() => setIsDailyTasksDrawerOpen(true)}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          caseSubTab={caseSubTab}
          setCaseSubTab={setCaseSubTab}
          lowStockCount={lowStockCount}
          totalReceivables={totalReceivables}
          activeCasesCount={cases.length}
          todayHearingsCount={todayHearingsCount}
          mutationCount={cases.filter((c) => c.type === 'mutation').length}
          miscCount={cases.filter((c) => c.type === 'misc_case').length}
          rtiCount={cases.filter((c) => c.type === 'rti').length}
          lrAppealCount={cases.filter((c) => c.type === 'lr_appeal').length}
          currencySymbol={company.currencySymbol}
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
              onOpenAddParty={() => setActiveTab('parties')}
              onOpenAddItem={() => setActiveTab('items')}
              onOpenNewCase={handleOpenNewCase}
              onToggleTask={handleToggleTask}
              onOpenDailyTasksDrawer={() => setIsDailyTasksDrawerOpen(true)}
              onOpenRecordPayment={handleOpenPaymentForInvoice}
              onOpenPrintInvoice={handleOpenPrint}
              setActiveTab={setActiveTab}
              setActiveCaseSubTab={setCaseSubTab}
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
    </div>
  );
}
