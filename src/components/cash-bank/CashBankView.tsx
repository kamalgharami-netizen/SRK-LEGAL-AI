import React, { useState } from 'react';
import {
  Plus,
  Landmark,
  CreditCard,
  ArrowRightLeft,
  DollarSign,
  TrendingDown,
  X,
  Trash2,
  Download,
} from 'lucide-react';
import { BankAccount, ExpenseRecord, CompanyProfile, PaymentMode } from '../../types/erp';

interface CashBankViewProps {
  accounts: BankAccount[];
  expenses: ExpenseRecord[];
  company: CompanyProfile;
  onSaveAccount: (account: BankAccount) => void;
  onSaveExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  onTransferMoney: (fromId: string, toId: string, amount: number, notes: string) => void;
}

export const CashBankView: React.FC<CashBankViewProps> = ({
  accounts,
  expenses,
  company,
  onSaveAccount,
  onSaveExpense,
  onDeleteExpense,
  onTransferMoney,
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'expenses'>('accounts');

  // New Account Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'cash' | 'bank' | 'upi'>('bank');
  const [accNumber, setAccNumber] = useState('');
  const [accBankName, setAccBankName] = useState('');
  const [accIfsc, setAccIfsc] = useState('');
  const [accOpeningBal, setAccOpeningBal] = useState<number>(0);

  // Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(1000);
  const [transferNotes, setTransferNotes] = useState('Cash Deposit to Bank');

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState('Office Rent & Maintenance');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expPaidVia, setExpPaidVia] = useState<PaymentMode>('bank');
  const [expAccountId, setExpAccountId] = useState(accounts[0]?.id || '');
  const [expRecipient, setExpRecipient] = useState('');
  const [expRef, setExpRef] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const totalLiquidity = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    const newAcc: BankAccount = {
      id: `acc_${Date.now()}`,
      name: accName.trim(),
      type: accType,
      accountNumber: accNumber.trim(),
      bankName: accBankName.trim(),
      ifsc: accIfsc.trim(),
      openingBalance: Number(accOpeningBal) || 0,
      currentBalance: Number(accOpeningBal) || 0,
    };

    onSaveAccount(newAcc);
    setIsAccountModalOpen(false);
    setAccName('');
    setAccNumber('');
    setAccBankName('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || transferAmount <= 0) {
      alert('Please select two distinct accounts and a positive transfer amount.');
      return;
    }
    onTransferMoney(fromAccountId, toAccountId, transferAmount, transferNotes);
    setIsTransferModalOpen(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;

    const newExp: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      date: expDate,
      category: expCategory,
      amount: Number(expAmount),
      paidVia: expPaidVia,
      bankAccountId: expAccountId,
      recipientName: expRecipient.trim(),
      referenceNo: expRef.trim(),
      notes: expNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(newExp);
    setIsExpenseModalOpen(false);
    setExpAmount(0);
    setExpRecipient('');
    setExpRef('');
    setExpNotes('');
  };

  const handleExportExpensesCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Paid Via', 'Recipient', 'Reference No', 'Notes'];
    const rows = expenses.map((e) => [
      `"${e.date}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.paidVia}"`,
      `"${e.recipientName || ''}"`,
      `"${e.referenceNo || ''}"`,
      `"${e.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cash, Bank & Expense Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor bank balances, internal transfers & operational business overheads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
            <span>Transfer Money</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
          >
            <TrendingDown className="h-4 w-4" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'accounts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bank & Cash Accounts
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Expenses Register ({expenses.length})
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Liquid Funds</span>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-700 tabular-nums">
            {company.currencySymbol}{totalLiquidity.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Across {accounts.length} registers & bank accounts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Recorded Expenses</span>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {company.currencySymbol}{totalExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {expenses.length} expense vouchers logged
          </span>
        </div>
      </div>

      {activeTab === 'accounts' ? (
        /* ================= ACCOUNTS VIEW ================= */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Accounts & Payment Registers
            </h2>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              + Add Bank Account
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      {acc.type === 'cash' ? <DollarSign className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{acc.type}</span>
                    </div>
                  </div>
                  {acc.isDefault && (
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500 font-mono">
                  {acc.accountNumber && <div>A/C: {acc.accountNumber}</div>}
                  {acc.ifsc && <div>IFSC: {acc.ifsc}</div>}
                  {acc.upiId && <div>UPI: {acc.upiId}</div>}
                </div>

                <div className="pt-2 flex justify-between items-baseline border-t border-slate-100">
                  <span className="text-xs text-slate-400">Available Balance:</span>
                  <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {company.currencySymbol}{acc.currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= EXPENSES VIEW ================= */
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Direct Expenses Log
            </h3>
            <button
              onClick={handleExportExpensesCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3">Expense Category</th>
                  <th className="py-2.5 px-3">Recipient / Vendor</th>
                  <th className="py-2.5 px-3 text-center">Paid Via</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {exp.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{exp.category}</div>
                      {exp.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {exp.recipientName || '-'}
                      {exp.referenceNo && (
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Ref: {exp.referenceNo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {exp.paidVia}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                      {company.currencySymbol}{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete expense of ${company.currencySymbol}${exp.amount}?`)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add Bank Account or Cash Drawer</h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. Axis Current Account"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Type</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash Counter / Register</option>
                  <option value="upi">UPI / Online Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  placeholder="e.g. 918239012390"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={accIfsc}
                  onChange={(e) => setAccIfsc(e.target.value)}
                  placeholder="e.g. UTIB0000123"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Opening Balance ({company.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  value={accOpeningBal}
                  onChange={(e) => setAccOpeningBal(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono tabular-nums"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Money Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Transfer Funds (Contra Entry)</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">From Account (Source)</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({company.currencySymbol}{a.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">To Account (Destination)</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({company.currencySymbol}{a.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Transfer Amount ({company.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-semibold tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Narration</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="e.g. Daily cash deposit"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Record Direct Business Expense</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="Office Rent & Maintenance">Office Rent & Maintenance</option>
                  <option value="Electricity & Utilities">Electricity & Utilities</option>
                  <option value="Salaries & Staff Wages">Salaries & Staff Wages</option>
                  <option value="Tea, Pantry & Refreshments">Tea, Pantry & Refreshments</option>
                  <option value="Courier & Local Logistics">Courier & Local Logistics</option>
                  <option value="Marketing & Advertising">Marketing & Advertising</option>
                  <option value="Software & Tech Tools">Software & Tech Tools</option>
                  <option value="Miscellaneous Overhead">Miscellaneous Overhead</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Amount ({company.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-semibold tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Paid From Account</label>
                  <select
                    value={expAccountId}
                    onChange={(e) => setExpAccountId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paid To / Recipient</label>
                <input
                  type="text"
                  value={expRecipient}
                  onChange={(e) => setExpRecipient(e.target.value)}
                  placeholder="e.g. Landlord, Electric Board, BlueDart"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="Receipt number or details"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
