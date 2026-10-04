import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import {
  Transaction,
  Party,
  Item,
  ExpenseRecord,
  CompanyProfile,
} from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface ReportsViewProps {
  transactions: Transaction[];
  parties: Party[];
  items: Item[];
  expenses: ExpenseRecord[];
  company: CompanyProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  parties,
  items,
  expenses,
  company,
}) => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<
    'pnl' | 'daybook' | 'gstr1' | 'stock' | 'outstanding'
  >('pnl');

  const [dayBookDate, setDayBookDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Financial Calculations for P&L
  const salesInvoices = transactions.filter((tx) => tx.type === 'sale_invoice');
  const salesReturns = transactions.filter((tx) => tx.type === 'sale_return');
  const purchaseBills = transactions.filter((tx) => tx.type === 'purchase_bill');
  const purchaseReturns = transactions.filter((tx) => tx.type === 'purchase_return');

  const grossSales = salesInvoices.reduce((a, b) => a + b.grandTotal, 0);
  const totalSalesReturns = salesReturns.reduce((a, b) => a + b.grandTotal, 0);
  const netSalesRevenue = grossSales - totalSalesReturns;

  const grossPurchases = purchaseBills.reduce((a, b) => a + b.grandTotal, 0);
  const totalPurchaseReturns = purchaseReturns.reduce((a, b) => a + b.grandTotal, 0);
  const netPurchases = grossPurchases - totalPurchaseReturns;

  const grossProfit = netSalesRevenue - netPurchases;

  const totalOperatingExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  // Day Book Filter
  const dayBookTxs = transactions.filter((tx) => tx.date === dayBookDate);
  const dayBookExpenses = expenses.filter((e) => e.date === dayBookDate);

  // GSTR-1 Summaries
  const gstrTaxableSales = salesInvoices.reduce((a, b) => a + b.taxableTotal, 0);
  const gstrCgstTotal = salesInvoices.reduce((a, b) => a + b.cgstTotal, 0);
  const gstrSgstTotal = salesInvoices.reduce((a, b) => a + b.sgstTotal, 0);
  const gstrIgstTotal = salesInvoices.reduce((a, b) => a + b.igstTotal, 0);
  const gstrTotalTax = salesInvoices.reduce((a, b) => a + b.totalTax, 0);

  // Receivables & Payables
  const receivables = parties.filter((p) => p.currentBalance > 0);
  const payables = parties.filter((p) => p.currentBalance < 0);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReport === 'pnl') {
      headers = [t('Category', 'বিভাগ'), t('Amount', 'টাকা')];
      rows = [
        [t('Gross Sales Revenue', 'মোট বিক্রয় আয়'), grossSales],
        [t('Less: Sales Returns', 'বাদ: বিক্রয় ফেরত'), totalSalesReturns],
        [t('Net Sales Revenue', 'প্রকৃত বিক্রয় টার্নওভার'), netSalesRevenue],
        [t('Cost of Goods Sold (Purchases)', 'বিক্রীত পণ্যের ক্রয়মূল্য'), netPurchases],
        [t('Gross Profit', 'মোট ব্যবসায়িক মুনাফা'), grossProfit],
        [t('Operating Expenses', 'পরিচালন ব্যয় ও খরচ'), totalOperatingExpenses],
        [t('Net Business Profit / Loss', 'চূড়ান্ত নিট লাভ বা ক্ষতি'), netProfit],
      ];
    } else if (selectedReport === 'gstr1') {
      headers = [
        t('Invoice No', 'ইনভয়েস নং'),
        t('Date', 'তারিখ'),
        t('Party Name', 'পার্টির নাম'),
        t('Party GSTIN', 'জিএসটি নম্বর'),
        t('Taxable Value', 'করযোগ্য মূল্য'),
        t('CGST', 'সিজিএসটি'),
        t('SGST', 'এসজিএসটি'),
        t('IGST', 'আইজিএসটি'),
        t('Total Tax', 'মোট কর'),
        t('Invoice Total', 'ইনভয়েস মোট'),
      ];
      rows = salesInvoices.map((inv) => [
        `"${inv.invoiceNo}"`,
        `"${inv.date}"`,
        `"${inv.partyName}"`,
        `"${inv.partyGstin || ''}"`,
        inv.taxableTotal,
        inv.cgstTotal,
        inv.sgstTotal,
        inv.igstTotal,
        inv.totalTax,
        inv.grandTotal,
      ]);
    } else if (selectedReport === 'stock') {
      headers = [
        t('Item Name', 'পণ্যের নাম'),
        t('SKU', 'এসকেইউ'),
        t('Category', 'বিভাগ'),
        t('Stock Qty', 'স্টক পরিমাণ'),
        t('Unit', 'একক'),
        t('Purchase Cost', 'ক্রয় খরচ'),
        t('Stock Valuation', 'স্টক মূল্যায়ন'),
      ];
      rows = items.map((i) => [
        `"${i.name}"`,
        `"${i.sku}"`,
        `"${i.category}"`,
        i.stockQty,
        `"${i.unit}"`,
        i.purchasePrice,
        i.stockQty * i.purchasePrice,
      ]);
    } else if (selectedReport === 'outstanding') {
      headers = [
        t('Party Name', 'পার্টির নাম'),
        t('Type', 'ধরণ'),
        t('Phone', 'মোবাইল'),
        t('Outstanding Balance', 'বকেয়া ব্যালেন্স'),
      ];
      rows = parties
        .filter((p) => p.currentBalance !== 0)
        .map((p) => [
          `"${p.name}"`,
          `"${p.type}"`,
          `"${p.phone}"`,
          p.currentBalance,
        ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t('Financial Statements & ERP Reports', 'আর্থিক বিবরণী ও ব্যবসায়িক রিপোর্ট')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Profit & Loss, Day Book, GSTR-1 GST summary, stock valuations & party aging',
              'লাভ-ক্ষতি বিবরণী, দৈনিক ডে-বুক, জিএসটিআর-১ ট্যাক্স রিপোর্ট, স্টক মূল্যায়ন ও বাকি হিসাব'
            )}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t('Export Current Report CSV', 'রিপোর্ট সিএসভি ডাউনলোড')}</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
        <button
          onClick={() => setSelectedReport('pnl')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'pnl'
              ? 'bg-white text-indigo-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Profit & Loss Statement', 'লাভ-ক্ষতি হিসাব (P&L)')}
        </button>
        <button
          onClick={() => setSelectedReport('daybook')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'daybook'
              ? 'bg-white text-indigo-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Day Book (Daily Ledger)', 'দৈনিক খাতা (ডে-বুক)')}
        </button>
        <button
          onClick={() => setSelectedReport('gstr1')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'gstr1'
              ? 'bg-white text-indigo-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('GSTR-1 (GST Tax Summary)', 'জিএসটিআর-১ (ট্যাক্স রিপোর্ট)')}
        </button>
        <button
          onClick={() => setSelectedReport('stock')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'stock'
              ? 'bg-white text-indigo-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Stock Valuation & Summary', 'মজুত স্টক ও সম্পদ মূল্যায়ন')}
        </button>
        <button
          onClick={() => setSelectedReport('outstanding')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'outstanding'
              ? 'bg-white text-indigo-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Party Outstanding (Aging)', 'বকেয়া পাওনা ও দেনা হিসাব')}
        </button>
      </div>

      {/* ================= 1. PROFIT & LOSS ================= */}
      {selectedReport === 'pnl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('Gross Sales Revenue', 'মোট বিক্রয় টার্নওভার')}</span>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {company.currencySymbol}{netSalesRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{t('From all settled sales', 'সমস্ত বিক্রয় ইনভয়েস থেকে')}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('Cost of Goods Sold (Purchases)', 'বিক্রীত পণ্যের মোট ক্রয়মূল্য')}</span>
              <div className="mt-1 text-xl font-bold font-mono text-slate-800 tabular-nums">
                {company.currencySymbol}{netPurchases.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{t('Procurement expense', 'সাপ্লায়ার ক্রয় বিল থেকে')}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('Net Business Profit', 'চূড়ান্ত নিট ব্যবসায়িক মুনাফা')}</span>
              <div
                className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                  netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {company.currencySymbol}{netProfit.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{t('After operating expenses', 'সমস্ত খরচ বাদের পর')}</span>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-6 max-w-3xl">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-wider">
              {t(`Profit & Loss Statement for ${company.name}`, `${company.name}-এর লাভ ও ক্ষতির পূর্ণাঙ্গ বিবরণী`)}
            </h3>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-800">
                <span className="font-sans font-semibold">{t('Gross Sales Invoices', 'মোট বিক্রয় ইনভয়েস')}</span>
                <span className="font-bold tabular-nums">
                  +{company.currencySymbol}{grossSales.toLocaleString()}
                </span>
              </div>

              {totalSalesReturns > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                  <span className="font-sans">{t('Less: Sales Returns & Credit Notes', 'বাদ: বিক্রয় ফেরত ও ক্রেডিট নোট')}</span>
                  <span className="tabular-nums">
                    -{company.currencySymbol}{totalSalesReturns.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded font-bold text-slate-900">
                <span className="font-sans">{t('Net Sales Turnover', 'প্রকৃত বিক্রয় রাজস্ব')}</span>
                <span className="tabular-nums">
                  {company.currencySymbol}{netSalesRevenue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span className="font-sans">{t('Purchases & Direct Procurement', 'ক্রয় ও সংগ্রহ খরচ')}</span>
                <span className="tabular-nums">
                  -{company.currencySymbol}{netPurchases.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-y border-slate-200 font-bold text-slate-900 text-sm">
                <span className="font-sans">{t('Gross Profit', 'মোট লাভ (গ্রস প্রফিট)')}</span>
                <span className="text-indigo-700 tabular-nums">
                  {company.currencySymbol}{grossProfit.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 text-slate-500 font-sans uppercase font-bold text-[11px]">
                {t('Operating Overheads & Expenses', 'পরিচালন ও অফিস খরচসমূহ')}
              </div>

              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between text-slate-600 pl-4 py-0.5">
                  <span className="font-sans">{e.category}</span>
                  <span className="tabular-nums">
                    -{company.currencySymbol}{e.amount.toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded text-slate-700">
                <span className="font-sans font-semibold">{t('Total Operating Overheads', 'মোট পরিচালন ব্যয়')}</span>
                <span className="font-bold tabular-nums">
                  -{company.currencySymbol}{totalOperatingExpenses.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-3 border-y-2 border-slate-900 text-base font-bold text-slate-900 mt-4">
                <span className="font-sans uppercase">{t('Net Business Profit / (Loss)', 'চূড়ান্ত নিট ব্যবসায়িক লাভ / (ক্ষতি)')}</span>
                <span
                  className={`tabular-nums ${
                    netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {company.currencySymbol}{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. DAY BOOK ================= */}
      {selectedReport === 'daybook' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">{t('Select Date for Day Book:', 'ডে-বুকের তারিখ নির্বাচন করুন:')}</span>
            <input
              type="date"
              value={dayBookDate}
              onChange={(e) => setDayBookDate(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono"
            />
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-semibold text-xs text-slate-700">
              {t(`Transactions & Vouchers Recorded on ${dayBookDate}`, `${dayBookDate} তারিখে লিপিবদ্ধ সমস্ত লেনদেন ও খরচ`)}
            </div>

            {dayBookTxs.length === 0 && dayBookExpenses.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                {t('No transactions or expenses recorded on this date.', 'এই তারিখে কোনো লেনদেন বা খরচ পাওয়া যায়নি।')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">{t('Ref #', 'রেফারেন্স')}</th>
                      <th className="py-2.5 px-3">{t('Type', 'ধরণ')}</th>
                      <th className="py-2.5 px-3">{t('Entity / Details', 'পার্টি / বিবরণ')}</th>
                      <th className="py-2.5 px-3 text-right">{t('Inflow (Debit)', 'জমা (+)')}</th>
                      <th className="py-2.5 px-4 text-right">{t('Outflow (Credit)', 'খরচ (-)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dayBookTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{tx.invoiceNo}</td>
                        <td className="py-2.5 px-3 capitalize font-semibold">
                          {tx.type === 'sale_invoice'
                            ? t('Sale Invoice', 'বিক্রয় ইনভয়েস')
                            : tx.type === 'payment_in'
                            ? t('Payment Received', 'পেমেন্ট গ্রহণ')
                            : tx.type === 'purchase_bill'
                            ? t('Purchase Bill', 'ক্রয় বিল')
                            : tx.type === 'payment_out'
                            ? t('Payment Out', 'পেমেন্ট প্রদান')
                            : tx.type}
                        </td>
                        <td className="py-2.5 px-3">{tx.partyName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {tx.paidAmount > 0 && tx.type === 'sale_invoice' ? `${company.currencySymbol}${tx.paidAmount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700 tabular-nums">
                          {tx.paidAmount > 0 && tx.type === 'purchase_bill' ? `${company.currencySymbol}${tx.paidAmount.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                    {dayBookExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono text-slate-500">EXP-{exp.id.slice(-4)}</td>
                        <td className="py-2.5 px-3 font-semibold text-rose-700">{t('Expense', 'খরচ')}</td>
                        <td className="py-2.5 px-3">{exp.category} ({exp.recipientName || t('Direct', 'সরাসরি')})</td>
                        <td className="py-2.5 px-3 text-right font-mono">-</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700 tabular-nums">
                          {company.currencySymbol}{exp.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. GSTR-1 TAX REPORT ================= */}
      {selectedReport === 'gstr1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('Taxable Sales Value', 'মোট করযোগ্য বিক্রয়')}</span>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
                {company.currencySymbol}{gstrTaxableSales.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('CGST Collected', 'আদায়কিত CGST')}</span>
              <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {company.currencySymbol}{gstrCgstTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('SGST Collected', 'আদায়কিত SGST')}</span>
              <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {company.currencySymbol}{gstrSgstTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">{t('IGST (Inter-State)', 'আদায়কিত IGST')}</span>
              <div className="mt-1 text-xl font-bold font-mono text-blue-700 tabular-nums">
                {company.currencySymbol}{gstrIgstTotal.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-semibold text-xs text-slate-700">
              {t('GSTR-1 Outward Supplies (B2B & B2C Taxable Sales)', 'জিএসটিআর-১ আউটওয়ার্ড সাপ্লাই (করযোগ্য বিক্রয় তালিকা)')}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">{t('Invoice #', 'ইনভয়েস নং')}</th>
                    <th className="py-2.5 px-3">{t('Date', 'তারিখ')}</th>
                    <th className="py-2.5 px-3">{t('Customer', 'গ্রাহক')}</th>
                    <th className="py-2.5 px-3">{t('GSTIN', 'জিএসটিIN')}</th>
                    <th className="py-2.5 px-3 text-right">{t('Taxable Val', 'করযোগ্য মূল্য')}</th>
                    <th className="py-2.5 px-2 text-right">{t('CGST', 'সিজিএসটি')}</th>
                    <th className="py-2.5 px-2 text-right">{t('SGST', 'এসজিএসটি')}</th>
                    <th className="py-2.5 px-2 text-right">{t('IGST', 'আইজিএসটি')}</th>
                    <th className="py-2.5 px-4 text-right">{t('Total Invoice', 'মোট ইনভয়েস')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{inv.partyName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inv.partyGstin || t('Consumer (B2C)', 'খুচরা গ্রাহক (B2C)')}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{company.currencySymbol}{inv.taxableTotal.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">{inv.cgstTotal > 0 ? `${company.currencySymbol}${inv.cgstTotal.toLocaleString()}` : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">{inv.sgstTotal > 0 ? `${company.currencySymbol}${inv.sgstTotal.toLocaleString()}` : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-blue-700">{inv.igstTotal > 0 ? `${company.currencySymbol}${inv.igstTotal.toLocaleString()}` : '-'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {company.currencySymbol}{inv.grandTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. STOCK VALUATION ================= */}
      {selectedReport === 'stock' && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-semibold text-xs text-slate-700">
            {t('Stock Valuation & Reorder Inventory Report', 'স্টক মূল্যায়ন ও পুনঃঅর্ডার ইনভেন্টরি রিপোর্ট')}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">{t('Item Name', 'পণ্যের নাম')}</th>
                  <th className="py-2.5 px-3">{t('SKU', 'এসকেইউ')}</th>
                  <th className="py-2.5 px-3">{t('Category', 'বিভাগ')}</th>
                  <th className="py-2.5 px-3 text-right">{t('In Stock', 'মজুত স্টক')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Purchase Price', 'ক্রয় মূল্য')}</th>
                  <th className="py-2.5 px-4 text-right">{t('Valuation (Cost)', 'স্টক মূল্যায়ন')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{i.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{i.sku}</td>
                    <td className="py-2.5 px-3 text-slate-600">{i.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      {i.stockQty} {i.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {company.currencySymbol}{i.purchasePrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700 tabular-nums">
                      {company.currencySymbol}{(i.stockQty * i.purchasePrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 5. PARTY OUTSTANDING (AGING) ================= */}
      {selectedReport === 'outstanding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receivables */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
              <span className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                {t('Customer Receivables (To Collect)', 'মক্কেল / গ্রাহকের কাছে বকেয়া পাওনা (পাবেন)')}
              </span>
              <span className="font-mono font-bold text-blue-700 text-xs">
                {company.currencySymbol}
                {receivables.reduce((a, b) => a + b.currentBalance, 0).toLocaleString()}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {receivables.map((p) => (
                <div key={p.id} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{p.phone}</div>
                  </div>
                  <div className="font-mono font-bold text-blue-600 tabular-nums">
                    {company.currencySymbol}{p.currentBalance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payables */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-rose-50/50 flex justify-between items-center">
              <span className="font-bold text-xs text-rose-900 uppercase tracking-wider">
                {t('Supplier Payables (To Pay)', 'সাপ্লায়ার / বিক্রেতাকে প্রদেয় বাকি (দেবেন)')}
              </span>
              <span className="font-mono font-bold text-rose-700 text-xs">
                {company.currencySymbol}
                {payables.reduce((a, b) => a + Math.abs(b.currentBalance), 0).toLocaleString()}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {payables.map((p) => (
                <div key={p.id} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{p.phone}</div>
                  </div>
                  <div className="font-mono font-bold text-rose-600 tabular-nums">
                    {company.currencySymbol}{Math.abs(p.currentBalance).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
