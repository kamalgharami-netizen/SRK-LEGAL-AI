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
  globalSearch,
}) => {
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

  const filtered = transactions.filter((t) => {
    if (t.type !== targetType) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    const query = (globalSearch || localSearch).trim().toLowerCase();
    if (query) {
      const matchInv = t.invoiceNo.toLowerCase().includes(query);
      const matchParty = t.partyName.toLowerCase().includes(query);
      const matchPhone = (t.partyPhone || '').includes(query);
      if (!matchInv && !matchParty && !matchPhone) return false;
    }
    return true;
  });

  // Calculate summaries
  const totalAmount = filtered.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalPaid = filtered.reduce((acc, t) => acc + t.paidAmount, 0);
  const totalBalance = filtered.reduce((acc, t) => acc + t.balanceDue, 0);

  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Date', 'Due Date', 'Party Name', 'Phone', 'Grand Total', 'Paid', 'Balance', 'Status', 'Payment Mode'];
    const rows = filtered.map((t) => [
      `"${t.invoiceNo}"`,
      `"${t.date}"`,
      `"${t.dueDate || ''}"`,
      `"${t.partyName}"`,
      `"${t.partyPhone || ''}"`,
      t.grandTotal,
      t.paidAmount,
      t.balanceDue,
      `"${t.status}"`,
      `"${t.paymentMode}"`,
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
    const text = `Hello ${invoice.partyName},\n\nHere is your Invoice #${invoice.invoiceNo} from ${company.name}.\n\nTotal: ${company.currencySymbol}${invoice.grandTotal.toLocaleString()}\nPaid: ${company.currencySymbol}${invoice.paidAmount.toLocaleString()}\nDue: ${company.currencySymbol}${invoice.balanceDue.toLocaleString()}\n\nThank you for doing business with us!`;
    const cleanPhone = (invoice.partyPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sales & Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage tax invoices, quotations/estimates, and customer billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          {activeSubTab === 'estimates' ? (
            <button
              onClick={onOpenNewEstimate}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Estimate</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewSale}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Sale Invoice (F1)</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 -mb-px">
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'sales'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tax Invoices
          </button>
          <button
            onClick={() => setActiveSubTab('estimates')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'estimates'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Quotations / Estimates
          </button>
          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'returns'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Credit Notes (Returns)
          </button>
        </div>

        {/* Status Filters */}
        {activeSubTab === 'sales' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(['all', 'paid', 'partial', 'unpaid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium rounded-md capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Billed</span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {company.currencySymbol}{totalAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{filtered.length} Invoices</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Collected</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {company.currencySymbol}{totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}% Realized
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Pending Receivables</span>
          <div className="mt-1 text-xl font-bold font-mono text-rose-600 tabular-nums">
            {company.currencySymbol}{totalBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Uncollected balance</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice # or customer name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-400 outline-none"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {filtered.length} entries
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-sm font-semibold text-slate-700">No records found</div>
            <p className="text-xs text-slate-500 mt-1">
              Create your first {activeSubTab === 'estimates' ? 'estimate' : 'tax invoice'} to begin tracking sales.
            </p>
            <button
              onClick={activeSubTab === 'estimates' ? onOpenNewEstimate : onOpenNewSale}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              + Create {activeSubTab === 'estimates' ? 'Estimate' : 'Invoice'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tx.invoiceNo}
                      {tx.items?.length > 0 && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {tx.items.length} items
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
                        <span className="text-slate-400">Paid In Full</span>
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
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.type === 'estimate' && (
                          <button
                            onClick={() => onConvertToInvoice(tx)}
                            title="Convert Estimate to Invoice"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                          >
                            <span>Convert</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}

                        <button
                          onClick={() => onPrintInvoice(tx)}
                          title="Print / View Invoice"
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(tx)}
                          title="Share on WhatsApp"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>

                        {tx.balanceDue > 0 && tx.type === 'sale_invoice' && (
                          <button
                            onClick={() => onRecordPayment(tx)}
                            title="Record Payment"
                            className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                          >
                            Receive
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete invoice #${tx.invoiceNo}?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title="Delete Invoice"
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
