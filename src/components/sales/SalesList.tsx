import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Printer,
  Share2,
  Trash2,
  FileCheck,
  CreditCard,
  Download,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Transaction, CompanyProfile, Party } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface SalesListProps {
  transactions: Transaction[];
  company: CompanyProfile;
  parties: Party[];
  onOpenNewSale: () => void;
  onOpenNewEstimate: () => void;
  onPrintInvoice: (tx: Transaction) => void;
  onRecordPayment: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onConvertToInvoice: (estimate: Transaction) => void;
  onDispatchInvoice?: (tx: Transaction) => void;
  globalSearch: string;
}

export const SalesList: React.FC<SalesListProps> = ({
  transactions,
  company,
  parties,
  onOpenNewSale,
  onOpenNewEstimate,
  onPrintInvoice,
  onRecordPayment,
  onDeleteTransaction,
  onConvertToInvoice,
  onDispatchInvoice,
  globalSearch,
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'estimates' | 'returns'>('sales');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [localSearch, setLocalSearch] = useState('');

  // Target transaction types based on subtab
  const targetType =
    activeSubTab === 'sales'
      ? 'sale_invoice'
      : activeSubTab === 'estimates'
      ? 'estimate'
      : 'sale_return';

  const filtered = transactions.filter((tx) => {
    if (tx.type !== targetType) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

    const query = (globalSearch || localSearch).trim().toLowerCase();
    if (query) {
      const matchInv = tx.invoiceNo.toLowerCase().includes(query);
      const matchParty = tx.partyName.toLowerCase().includes(query);
      const matchPhone = (tx.partyPhone || '').includes(query);
      if (!matchInv && !matchParty && !matchPhone) return false;
    }
    return true;
  });

  // Calculate summaries
  const totalAmount = filtered.reduce((acc, tx) => acc + tx.grandTotal, 0);
  const totalPaid = filtered.reduce((acc, tx) => acc + tx.paidAmount, 0);
  const totalBalance = filtered.reduce((acc, tx) => acc + tx.balanceDue, 0);

  const handleExportCSV = () => {
    const headers = [
      t('Invoice No', 'ইনভয়েস নং'),
      t('Date', 'তারিখ'),
      t('Due Date', 'পরিশোধের শেষ তারিখ'),
      t('Party Name', 'পার্টির নাম'),
      t('Phone', 'মোবাইল'),
      t('Grand Total', 'মোট টাকা'),
      t('Paid', 'পরিশোধিত'),
      t('Balance', 'বকেয়া'),
      t('Status', 'অবস্থা'),
      t('Payment Mode', 'পেমেন্ট মাধ্যম'),
    ];
    const rows = filtered.map((tx) => [
      `"${tx.invoiceNo}"`,
      `"${tx.date}"`,
      `"${tx.dueDate || ''}"`,
      `"${tx.partyName}"`,
      `"${tx.partyPhone || ''}"`,
      tx.grandTotal,
      tx.paidAmount,
      tx.balanceDue,
      `"${tx.status}"`,
      `"${tx.paymentMode}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${activeSubTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsApp = (invoice: Transaction) => {
    if (onDispatchInvoice) {
      onDispatchInvoice(invoice);
      return;
    }

    const text = t(
      `Hello ${invoice.partyName},\n\nHere is your Invoice #${invoice.invoiceNo} from ${company.name}.\n\nTotal: ${company.currencySymbol}${invoice.grandTotal.toLocaleString()}\nPaid: ${company.currencySymbol}${invoice.paidAmount.toLocaleString()}\nDue: ${company.currencySymbol}${invoice.balanceDue.toLocaleString()}\n\nThank you for doing business with us!`,
      `শ্রদ্ধেয় ${invoice.partyName},\n\n${company.name}-এর পক্ষ থেকে আপনার ইনভয়েস #${invoice.invoiceNo}।\n\nমোট: ${company.currencySymbol}${invoice.grandTotal.toLocaleString()}\nপরিশোধিত: ${company.currencySymbol}${invoice.paidAmount.toLocaleString()}\nবকেয়া: ${company.currencySymbol}${invoice.balanceDue.toLocaleString()}\n\nধন্যবাদ!`
    );
    const cleanPhone = (invoice.partyPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t('Sales & Invoicing', 'বিক্রয় ও বিলিং ইনভয়েস')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Manage tax invoices, quotations/estimates, and customer billing',
              'ট্যাক্স ইনভয়েস, কোটেশন / এস্টিমেট ও গ্রাহক বিলিং ব্যবস্থাপনা'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t('Export CSV', 'সিএসভি ডাউনলোড')}</span>
          </button>

          {activeSubTab === 'estimates' ? (
            <button
              onClick={onOpenNewEstimate}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{t('+ New Estimate', '+ নতুন এস্টিমেট')}</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewSale}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{t('+ New Sale Invoice (F1)', '+ নতুন বিক্রয় ইনভয়েস (F1)')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2 -mb-px">
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'sales'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('Tax Invoices', 'বিক্রয় ইনভয়েস')}
          </button>
          <button
            onClick={() => setActiveSubTab('estimates')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'estimates'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('Quotations / Estimates', 'কোটেশন / এস্টিমেট')}
          </button>
          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'returns'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('Credit Notes (Returns)', 'বিক্রয় ফেরত')}
          </button>
        </div>

        {/* Status Filters */}
        {activeSubTab === 'sales' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto mb-2 sm:mb-0">
            {(['all', 'paid', 'partial', 'unpaid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium rounded-md capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all'
                  ? t('All', 'সকল')
                  : st === 'paid'
                  ? t('Paid', 'পরিশোধিত')
                  : st === 'partial'
                  ? t('Partial', 'আংশিক')
                  : t('Unpaid', 'বকেয়া')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Total Billed', 'মোট বিল')}</span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {company.currencySymbol}{totalAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {t(`${filtered.length} Invoices`, `${filtered.length} টি ইনভয়েস`)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Total Collected', 'মোট সংগৃহীত')}</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {company.currencySymbol}{totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}% {t('Realized', 'আদায় হয়েছে')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Pending Receivables', 'মোট পাওনা বাকি')}</span>
          <div className="mt-1 text-xl font-bold font-mono text-rose-600 tabular-nums">
            {company.currencySymbol}{totalBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{t('Uncollected balance', 'বকেয়া হিসাব')}</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('Search by invoice # or customer name...', 'ইনভয়েস নং বা গ্রাহকের নাম দিয়ে খুঁজুন...')}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-400 outline-none"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {t(`Showing ${filtered.length} entries`, `${filtered.length} টি রেকর্ড প্রদর্শিত`)}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-sm font-semibold text-slate-700">{t('No records found', 'কোনো রেকর্ড পাওয়া যায়নি')}</div>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                `Create your first ${activeSubTab === 'estimates' ? 'estimate' : 'tax invoice'} to begin tracking sales.`,
                `নতুন ${activeSubTab === 'estimates' ? 'এস্টিমেট' : 'বিক্রয় ইনভয়েস'} তৈরি করে হিসাব শুরু করুন।`
              )}
            </p>
            <button
              onClick={activeSubTab === 'estimates' ? onOpenNewEstimate : onOpenNewSale}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              {t(`+ Create ${activeSubTab === 'estimates' ? 'Estimate' : 'Invoice'}`, `+ নতুন ${activeSubTab === 'estimates' ? 'এস্টিমেট' : 'ইনভয়েস'}`)}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">{t('Invoice #', 'ইনভয়েস নং')}</th>
                  <th className="py-2.5 px-3">{t('Date', 'তারিখ')}</th>
                  <th className="py-2.5 px-3">{t('Party Name', 'পার্টির নাম')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Total Amount', 'মোট টাকা')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Balance Due', 'বকেয়া')}</th>
                  <th className="py-2.5 px-3 text-center">{t('Status', 'অবস্থা')}</th>
                  <th className="py-2.5 px-4 text-right">{t('Actions', 'পদক্ষেপ')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tx.invoiceNo}
                      {tx.items?.length > 0 && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {tx.items.length} {t('items', 'আইটেম')}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                      {tx.date}
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-900">
                      <div>{tx.partyName}</div>
                      {tx.partyPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Ph: {tx.partyPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {company.currencySymbol}{tx.grandTotal.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {tx.balanceDue > 0 ? (
                        <span className="font-bold text-rose-600">
                          {company.currencySymbol}{tx.balanceDue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">{t('Paid In Full', 'সম্পূর্ণ পরিশোধিত')}</span>
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
                        {tx.status === 'paid'
                          ? t('PAID', 'পরিশোধিত')
                          : tx.status === 'partial'
                          ? t('PARTIAL', 'আংশিক')
                          : t('UNPAID', 'বকেয়া')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.type === 'estimate' && (
                          <button
                            onClick={() => onConvertToInvoice(tx)}
                            title={t('Convert Estimate to Invoice', 'এস্টিমেট থেকে ইনভয়েস তৈরি')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                          >
                            <span>{t('Convert', 'রূপান্তর')}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}

                        <button
                          onClick={() => onPrintInvoice(tx)}
                          title={t('Print / View Invoice', 'ইনভয়েস প্রিন্ট / দেখুন')}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(tx)}
                          title={t('Share on WhatsApp', 'হোয়াটসঅ্যাপে পাঠান')}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>

                        {tx.balanceDue > 0 && tx.type === 'sale_invoice' && (
                          <button
                            onClick={() => onRecordPayment(tx)}
                            title={t('Record Payment', 'পেমেন্ট গ্রহণ')}
                            className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                          >
                            {t('Receive', 'গ্রহণ')}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const conf = t(`Delete invoice #${tx.invoiceNo}?`, `আপনি কি ইনভয়েস #${tx.invoiceNo} মুছে ফেলতে চান?`);
                            if (window.confirm(conf)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title={t('Delete Invoice', 'মুছুন')}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
