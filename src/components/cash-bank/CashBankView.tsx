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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();
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
      alert(t('Please select two distinct accounts and a positive transfer amount.', 'অনুগ্রহ করে দুটি ভিন্ন একাউন্ট এবং বৈধ টাকার পরিমাণ নির্বাচন করুন।'));
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
    const headers = [
      t('Date', 'তারিখ'),
      t('Category', 'বিভাগ'),
      t('Amount', 'পরিমাণ'),
      t('Paid Via', 'পেমেন্টের মাধ্যম'),
      t('Recipient', 'প্রাপক'),
      t('Reference No', 'রেফারেন্স নং'),
      t('Notes', 'বিবরণ'),
    ];
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
            {t('Cash, Bank & Expense Management', 'নগদ ক্যাশ, ব্যাংক ও খরচ হিসাব')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Monitor bank balances, internal transfers & operational business overheads',
              'ব্যাংক ও ক্যাশ ব্যালেন্স পর্যবেক্ষণ, অভ্যন্তরীণ ফান্ড ট্রান্সফার ও খরচের হিসাব'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('Transfer Money', 'টাকা ট্রান্সফার')}</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
          >
            <TrendingDown className="h-4 w-4" />
            <span>{t('+ Record Expense', '+ খরচ যুক্ত করুন')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'accounts'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Bank & Cash Accounts', 'ব্যাংক ও নগদ একাউন্ট')}
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Expenses Register', 'খরচ রেজিস্টার')} ({expenses.length})
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Total Liquid Funds', 'মোট নগদ ও ব্যাংক ব্যালেন্স')}</span>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-700 tabular-nums">
            {company.currencySymbol}{totalLiquidity.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {t(`Across ${accounts.length} registers & bank accounts`, `মোট ${accounts.length} টি একাউন্টে মজুত`)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Total Recorded Expenses', 'মোট নথিভুক্ত খরচ')}</span>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {company.currencySymbol}{totalExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {t(`${expenses.length} expense vouchers logged`, `${expenses.length} টি ভাউচার লিপিবদ্ধ`)}
          </span>
        </div>
      </div>

      {activeTab === 'accounts' ? (
        /* ================= ACCOUNTS VIEW ================= */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('Active Accounts & Payment Registers', 'সক্রিয় একাউন্ট ও পেমেন্ট রেজিস্টার')}
            </h2>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {t('+ Add Bank Account', '+ নতুন ব্যাংক একাউন্ট')}
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
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                        {acc.type === 'cash' ? t('Cash in Hand', 'নগদ ক্যাশ') : acc.type === 'upi' ? 'UPI' : t('Bank Account', 'ব্যাংক একাউন্ট')}
                      </span>
                    </div>
                  </div>
                  {acc.isDefault && (
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {t('Default', 'ডিফল্ট')}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500 font-mono">
                  {acc.accountNumber && <div>A/C: {acc.accountNumber}</div>}
                  {acc.ifsc && <div>IFSC: {acc.ifsc}</div>}
                  {acc.upiId && <div>UPI: {acc.upiId}</div>}
                </div>

                <div className="pt-2 flex justify-between items-baseline border-t border-slate-100">
                  <span className="text-xs text-slate-400">{t('Available Balance:', 'উপলব্ধ ব্যালেন্স:')}</span>
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
              {t('Direct Expenses Log', 'দৈনন্দিন খরচের তালিকা')}
            </h3>
            <button
              onClick={handleExportExpensesCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('Export CSV', 'সিএসভি ডাউনলোড')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">{t('Date', 'তারিখ')}</th>
                  <th className="py-2.5 px-3">{t('Expense Category', 'খরচের খাত')}</th>
                  <th className="py-2.5 px-3">{t('Recipient / Vendor', 'প্রাপক')}</th>
                  <th className="py-2.5 px-3 text-center">{t('Paid Via', 'মাধ্যম')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Amount', 'পরিমাণ')}</th>
                  <th className="py-2.5 px-4 text-right">{t('Action', 'পদক্ষেপ')}</th>
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
                      <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {exp.paidVia}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-rose-600">
                      {company.currencySymbol}{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const conf = t('Delete this expense record?', 'আপনি কি এই খরচের ভাউচারটি মুছতে চান?');
                          if (window.confirm(conf)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
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

      {/* Create Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t('Add Bank / Cash Account', 'নতুন ব্যাংক বা ক্যাশ হিসাব')}</h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('Account Display Name *', 'একাউন্টের নাম *')}</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder={t('e.g. HDFC Current Account', 'যেমন: এসবিআই চলতি একাউন্ট')}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('Account Type', 'একাউন্টের ধরণ')}</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="bank">{t('Bank Account', 'ব্যাংক একাউন্ট')}</option>
                  <option value="cash">{t('Cash in Hand / Drawer', 'নগদ ক্যাশ / ড্রয়ার')}</option>
                  <option value="upi">{t('UPI / Digital Wallet', 'ইউপিআই / ডিজিটাল ওয়ালেট')}</option>
                </select>
              </div>

              {accType !== 'cash' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('Bank Name', 'ব্যাংকের নাম')}</label>
                    <input
                      type="text"
                      value={accBankName}
                      onChange={(e) => setAccBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('Account Number', 'একাউন্ট নম্বর')}</label>
                    <input
                      type="text"
                      value={accNumber}
                      onChange={(e) => setAccNumber(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('IFSC Code', 'আইএফএসসি কোড (IFSC)')}</label>
                    <input
                      type="text"
                      value={accIfsc}
                      onChange={(e) => setAccIfsc(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono uppercase"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('Opening Balance', 'প্রারম্ভিক ব্যালেন্স')} ({company.currencySymbol})
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
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {t('Save Account', 'সংরক্ষণ')}
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
              <h3 className="text-sm font-bold text-slate-900">{t('Internal Fund Transfer', 'অভ্যন্তরীণ ফান্ড ট্রান্সফার')}</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('Transfer From', 'উৎস একাউন্ট')}</label>
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
                  <label className="font-semibold text-slate-700 block mb-1">{t('Transfer To', 'গন্তব্য একাউন্ট')}</label>
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
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('Amount to Transfer', 'ট্রান্সফার পরিমাণ')} ({company.currencySymbol}) *
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
                <label className="font-semibold text-slate-700 block mb-1">{t('Notes / Narration', 'বিবরণ / নোট')}</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder={t('e.g. Daily cash deposit', 'যেমন: দৈনিক ক্যাশ ব্যাংকে জমা')}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {t('Execute Transfer', 'ট্রান্সফার নিশ্চিত করুন')}
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
              <h3 className="text-sm font-bold text-slate-900">{t('Record Direct Business Expense', 'ব্যবসায়িক খরচ লিপিবদ্ধকরণ')}</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('Expense Category', 'খরচের খাত')}</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="Office Rent & Maintenance">{t('Office Rent & Maintenance', 'অফিস ভাড়া ও রক্ষণাবেক্ষণ')}</option>
                  <option value="Electricity & Utilities">{t('Electricity & Utilities', 'বিদ্যুৎ ও পরিষেবা বিল')}</option>
                  <option value="Salaries & Staff Wages">{t('Salaries & Staff Wages', 'কর্মচারীদের বেতন ও মজুরি')}</option>
                  <option value="Tea, Pantry & Refreshments">{t('Tea, Pantry & Refreshments', 'চা, নাস্তা ও আপ্যায়ন')}</option>
                  <option value="Courier & Local Logistics">{t('Courier & Local Logistics', 'কুরিয়ার ও যাতায়াত খরচ')}</option>
                  <option value="Marketing & Advertising">{t('Marketing & Advertising', 'বিজ্ঞাপন ও বিপণন')}</option>
                  <option value="Software & Tech Tools">{t('Software & Tech Tools', 'সফটওয়্যার ও প্রযুক্তি খরচ')}</option>
                  <option value="Miscellaneous Overhead">{t('Miscellaneous Overhead', 'বিবিধ প্রশাসনিক ব্যয়')}</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('Amount', 'পরিমাণ')} ({company.currencySymbol}) *
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
                  <label className="font-semibold text-slate-700 block mb-1">{t('Expense Date', 'খরচের তারিখ')}</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('Paid From Account', 'পরিশোধের একাউন্ট')}</label>
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
                <label className="font-semibold text-slate-700 block mb-1">{t('Paid To / Recipient', 'প্রাপকের নাম')}</label>
                <input
                  type="text"
                  value={expRecipient}
                  onChange={(e) => setExpRecipient(e.target.value)}
                  placeholder={t('e.g. Landlord, Electric Board, BlueDart', 'যেমন: বাড়িওয়ালা, ইলেকট্রিক অফিস')}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('Notes / Voucher Reference', 'ভাউচার বা রসিদ রেফারেন্স')}</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder={t('Receipt number or details', 'রসিদ নম্বর বা বিবরণ')}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  {t('Record Expense', 'খরচ সংরক্ষণ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
