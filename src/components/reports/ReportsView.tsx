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
  const [selectedReport, setSelectedReport] = useState<
    'pnl' | 'daybook' | 'gstr1' | 'stock' | 'outstanding'
  >('pnl');

  const [dayBookDate, setDayBookDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Financial Calculations for P&L
  const salesInvoices = transactions.filter((t) => t.type === 'sale_invoice');
  const salesReturns = transactions.filter((t) => t.type === 'sale_return');
  const purchaseBills = transactions.filter((t) => t.type === 'purchase_bill');
  const purchaseReturns = transactions.filter((t) => t.type === 'purchase_return');

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
  const dayBookTxs = transactions.filter((t) => t.date === dayBookDate);
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
      headers = ['Category', 'Amount'];
      rows = [
        ['Gross Sales Revenue', grossSales],
        ['Less: Sales Returns', totalSalesReturns],
        ['Net Sales Revenue', netSalesRevenue],
        ['Cost of Goods Sold (Purchases)', netPurchases],
        ['Gross Profit', grossProfit],
        ['Operating Expenses', totalOperatingExpenses],
        ['Net Business Profit / Loss', netProfit],
      ];
    } else if (selectedReport === 'gstr1') {
      headers = ['Invoice No', 'Date', 'Party Name', 'Party GSTIN', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax', 'Invoice Total'];
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
      headers = ['Item Name', 'SKU', 'Category', 'Stock Qty', 'Unit', 'Purchase Cost', 'Stock Valuation'];
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
      headers = ['Party Name', 'Type', 'Phone', 'Outstanding Balance'];
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
            Financial Statements & ERP Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profit & Loss, Day Book, GSTR-1 GST summary, stock valuations & party aging
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Current Report CSV</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
        <button
          onClick={() => setSelectedReport('pnl')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'pnl'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setSelectedReport('daybook')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'daybook'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Day Book (Daily Ledger)
        </button>
        <button
          onClick={() => setSelectedReport('gstr1')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'gstr1'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          GSTR-1 (GST Tax Summary)
        </button>
        <button
          onClick={() => setSelectedReport('stock')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'stock'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock Valuation & Summary
        </button>
        <button
          onClick={() => setSelectedReport('outstanding')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedReport === 'outstanding'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Party Outstanding (Aging)
        </button>
      </div>

      {/* ================= 1. PROFIT & LOSS ================= */}
      {selectedReport === 'pnl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">Gross Sales Revenue</span>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {company.currencySymbol}{netSalesRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">From all settled sales</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">Cost of Goods Sold (Purchases)</span>
              <div className="mt-1 text-xl font-bold font-mono text-slate-800 tabular-nums">
                {company.currencySymbol}{netPurchases.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Procurement expense</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">Net Business Profit</span>
              <div
                className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                  netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {company.currencySymbol}{netProfit.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">After operating expenses</span>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-6 max-w-3xl">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-wider">
              Profit & Loss Statement for {company.name}
            </h3>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-800">
                <span className="font-sans font-semibold">Gross Sales Invoices</span>
                <span className="font-bold tabular-nums">
                  +{company.currencySymbol}{grossSales.toLocaleString()}
                </span>
              </div>

              {totalSalesReturns > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                  <span className="font-sans">Less: Sales Returns & Credit Notes</span>
                  <span className="tabular-nums">
                    -{company.currencySymbol}{totalSalesReturns.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded font-bold text-slate-900">
                <span className="font-sans">Net Sales Turnover</span>
                <span className="tabular-nums">
                  {company.currencySymbol}{netSalesRevenue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span className="font-sans">Purchases & Direct Procurement</span>
                <span className="tabular-nums">
                  -{company.currencySymbol}{netPurchases.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-y border-slate-200 font-bold text-slate-900 text-sm">
                <span className="font-sans">Gross Profit</span>
                <span className="text-indigo-700 tabular-nums">
                  {company.currencySymbol}{grossProfit.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 text-slate-500 font-sans uppercase font-bold text-[11px]">
                Operating Overheads & Expenses
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
                <span className="font-sans font-semibold">Total Operating Overheads</span>
                <span className="font-bold tabular-nums">
                  -{company.currencySymbol}{totalOperatingExpenses.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-3 border-y-2 border-slate-900 text-base font-bold text-slate-900 mt-4">
                <span className="font-sans uppercase">Net Business Profit / (Loss)</span>
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
            <span className="text-xs font-semibold text-slate-700">Select Date for Day Book:</span>
            <input
              type="date"
              value={dayBookDate}
              onChange={(e) => setDayBookDate(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono"
            />
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Transactions & Vouchers Recorded on {dayBookDate}
            </div>

            {dayBookTxs.length === 0 && dayBookExpenses.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No transactions or expenses recorded on this date.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Ref #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Entity / Details</th>
                      <th className="py-2.5 px-3 text-right">Inflow (Debit)</th>
                      <th className="py-2.5 px-4 text-right">Outflow (Credit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dayBookTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{t.invoiceNo}</td>
                        <td className="py-2.5 px-3 capitalize font-semibold">{t.type.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3">{t.partyName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {t.paidAmount > 0 && t.type === 'sale_invoice' ? `${company.currencySymbol}${t.paidAmount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700 tabular-nums">
                          {t.paidAmount > 0 && t.type === 'purchase_bill' ? `${company.currencySymbol}${t.paidAmount.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                    {dayBookExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono text-slate-500">EXP-{exp.id.slice(-4)}</td>
                        <td className="py-2.5 px-3 font-semibold text-rose-700">Expense</td>
                        <td className="py-2.5 px-3">{exp.category} ({exp.recipientName || 'Direct'})</td>
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
              <span className="text-xs text-slate-500">Taxable Sales Value</span>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
                {company.currencySymbol}{gstrTaxableSales.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">CGST Collected</span>
              <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {company.currencySymbol}{gstrCgstTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">SGST Collected</span>
              <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {company.currencySymbol}{gstrSgstTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">IGST (Inter-State)</span>
              <div className="mt-1 text-xl font-bold font-mono text-blue-700 tabular-nums">
                {company.currencySymbol}{gstrIgstTotal.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-semibold text-xs text-slate-700">
              GSTR-1 Outward Supplies (B2B & B2C Taxable Sales)
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">GSTIN</th>
                    <th className="py-2.5 px-3 text-right">Taxable Val</th>
                    <th className="py-2.5 px-2 text-right">CGST</th>
                    <th className="py-2.5 px-2 text-right">SGST</th>
                    <th className="py-2.5 px-2 text-right">IGST</th>
                    <th className="py-2.5 px-4 text-right">Total Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{inv.partyName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inv.partyGstin || 'Consumer (B2C)'}</td>
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
            Stock Valuation & Reorder Inventory Report
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">In Stock</th>
                  <th className="py-2.5 px-3 text-right">Purchase Price</th>
                  <th className="py-2.5 px-4 text-right">Valuation (Cost)</th>
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
                Customer Receivables (To Collect)
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
                Supplier Payables (To Pay)
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
