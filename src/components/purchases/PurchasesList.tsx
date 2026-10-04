import React, { useState } from 'react';
import {
  Plus,
  Search,
  Printer,
  Trash2,
  Download,
  ShoppingBag,
} from 'lucide-react';
import { Transaction, CompanyProfile } from '../../types/erp';

interface PurchasesListProps {
  transactions: Transaction[];
  company: CompanyProfile;
  onOpenNewPurchase: () => void;
  onPrintInvoice: (tx: Transaction) => void;
  onRecordPayment: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  globalSearch: string;
}

export const PurchasesList: React.FC<PurchasesListProps> = ({
  transactions,
  company,
  onOpenNewPurchase,
  onPrintInvoice,
  onRecordPayment,
  onDeleteTransaction,
  globalSearch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'returns'>('bills');
  const [localSearch, setLocalSearch] = useState('');

  const targetType = activeSubTab === 'bills' ? 'purchase_bill' : 'purchase_return';

  const filtered = transactions.filter((t) => {
    if (t.type !== targetType) return false;
    const query = (globalSearch || localSearch).trim().toLowerCase();
    if (query) {
      const matchInv = t.invoiceNo.toLowerCase().includes(query);
      const matchParty = t.partyName.toLowerCase().includes(query);
      if (!matchInv && !matchParty) return false;
    }
    return true;
  });

  const totalCost = filtered.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalPaid = filtered.reduce((acc, t) => acc + t.paidAmount, 0);
  const totalDue = filtered.reduce((acc, t) => acc + t.balanceDue, 0);

  const handleExportCSV = () => {
    const headers = ['Bill No', 'Date', 'Supplier Name', 'Total Amount', 'Paid', 'Balance Due', 'Status'];
    const rows = filtered.map((t) => [
      `"${t.invoiceNo}"`,
      `"${t.date}"`,
      `"${t.partyName}"`,
      t.grandTotal,
      t.paidAmount,
      t.balanceDue,
      `"${t.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Purchases & Supplier Bills
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log procurement bills, restock items, and track accounts payable
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

          <button
            onClick={onOpenNewPurchase}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Record Purchase Bill (F2)</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('bills')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'bills'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Purchase Bills
        </button>
        <button
          onClick={() => setActiveSubTab('returns')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'returns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Debit Notes (Returns)
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Purchase Value</span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {company.currencySymbol}{totalCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{filtered.length} Bills</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Amount Paid</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {company.currencySymbol}{totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Disbursed to suppliers</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Accounts Payable (To Pay)</span>
          <div className="mt-1 text-xl font-bold font-mono text-rose-600 tabular-nums">
            {company.currencySymbol}{totalDue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Pending supplier balance</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bill # or supplier name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-400 outline-none"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {filtered.length} records
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">No purchase bills recorded yet</div>
            <p className="text-xs text-slate-500 mt-1">
              Add your vendor invoices to update item stock inventory automatically.
            </p>
            <button
              onClick={onOpenNewPurchase}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              + Record Purchase Bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Bill #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tx.invoiceNo}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {tx.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {tx.partyName}
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
                        <span className="text-slate-400">Settled</span>
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
                        <button
                          onClick={() => onPrintInvoice(tx)}
                          title="Print Purchase Bill"
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {tx.balanceDue > 0 && (
                          <button
                            onClick={() => onRecordPayment(tx)}
                            title="Pay Supplier"
                            className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete purchase bill #${tx.invoiceNo}?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title="Delete Bill"
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
