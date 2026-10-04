import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Party, BankAccount, Transaction, PaymentMode } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'payment_in' | 'payment_out';
  party?: Party;
  invoice?: Transaction;
  parties: Party[];
  accounts: BankAccount[];
  currencySymbol: string;
  onConfirm: (data: {
    partyId: string;
    amount: number;
    accountId: string;
    mode: PaymentMode;
    type: 'payment_in' | 'payment_out';
    notes?: string;
    invoiceId?: string;
  }) => void;
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  onClose,
  type,
  party,
  invoice,
  parties,
  accounts,
  currencySymbol,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const [selectedPartyId, setSelectedPartyId] = useState(
    party ? party.id : invoice?.partyId || (parties[0]?.id ?? '')
  );
  const defaultAmount = invoice ? invoice.balanceDue : party ? Math.abs(party.currentBalance) : 0;
  const [amount, setAmount] = useState<number>(defaultAmount || 1000);
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc_cash');
  const [mode, setMode] = useState<PaymentMode>('bank');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || amount <= 0) return;
    onConfirm({
      partyId: selectedPartyId,
      amount: Number(amount),
      accountId,
      mode,
      type,
      notes,
      invoiceId: invoice?.id,
    });
    onClose();
  };

  const isCustomer = type === 'payment_in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs no-print">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isCustomer
                ? t('Record Payment In (Receipt)', 'টাকা প্রাপ্তি রসিদ (পেমেন্ট ইন)')
                : t('Record Payment Out (Voucher)', 'টাকা প্রদান ভাউচার (পেমেন্ট আউট)')}
            </h3>
            <p className="text-xs text-slate-500">
              {invoice
                ? `${t('Settling Invoice', 'ইনভয়েস পরিশোধ')} #${invoice.invoiceNo}`
                : t('Settle party ledger balance', 'পার্টির বকেয়া হিসাব নিষ্পত্তি')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isCustomer ? t('Received From (Customer)', 'যার কাছ থেকে গ্রহণ (মক্কেল/গ্রাহক)') : t('Paid To (Supplier)', 'যাকে প্রদান (সরবরাহকারী)')}
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              disabled={!!invoice || !!party}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type}) — {t('Balance:', 'ব্যালেন্স:')} {currencySymbol}
                  {p.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('Amount', 'টাকার পরিমাণ')} ({currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 text-base font-mono font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tabular-nums"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('Payment Mode', 'পেমেন্টের মাধ্যম')}
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as PaymentMode)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="bank">{t('Bank Transfer / NEFT', 'ব্যাংক ট্রান্সফার / এনইএফটি')}</option>
                <option value="upi">{t('UPI / QR Code', 'ইউপিআই / কিউআর কোড')}</option>
                <option value="cash">{t('Cash', 'নগদ ক্যাশ')}</option>
                <option value="cheque">{t('Cheque', 'চেক')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('Account', 'একাউন্ট')}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({currencySymbol}{acc.currentBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('Notes / Reference Details', 'নোট বা রেফারেন্স বিবরণ')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('e.g. Settlement for invoice or advance', 'যেমন: আংশিক পেমেন্ট বা অগ্রিম পরিশোধ')}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              {t('Cancel', 'বাতিল')}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-xs flex items-center gap-1.5 ${
                isCustomer ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{isCustomer ? t('Confirm Receipt', 'রসিদ নিশ্চিত করুন') : t('Confirm Payment', 'পেমেন্ট নিশ্চিত করুন')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
