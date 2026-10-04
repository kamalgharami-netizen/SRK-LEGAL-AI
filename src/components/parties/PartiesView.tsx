import React, { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Share2,
  Download,
  X,
  FileText,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import { Party, Transaction, CompanyProfile, PartyType, LegalCase } from '../../types/erp';

interface PartiesViewProps {
  parties: Party[];
  transactions: Transaction[];
  cases?: LegalCase[];
  company: CompanyProfile;
  onSaveParty: (party: Party) => void;
  onDeleteParty: (id: string) => void;
  onRecordPayment: (party: Party, type: 'payment_in' | 'payment_out') => void;
  onOpenCaseTracker?: (partyId: string) => void;
  globalSearch: string;
}

export const PartiesView: React.FC<PartiesViewProps> = ({
  parties,
  transactions,
  cases = [],
  company,
  onSaveParty,
  onDeleteParty,
  onRecordPayment,
  onOpenCaseTracker,
  globalSearch,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'supplier'>('all');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || '');
  const [partyViewTab, setPartyViewTab] = useState<'ledger' | 'cases'>('ledger');
  const [localSearch, setLocalSearch] = useState('');

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PartyType>('customer');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState(company.state);
  const [formOpeningBalance, setFormOpeningBalance] = useState<number>(0);

  const filteredParties = parties.filter((p) => {
    if (filterType === 'customer' && p.type !== 'customer' && p.type !== 'both') return false;
    if (filterType === 'supplier' && p.type !== 'supplier' && p.type !== 'both') return false;
    const query = (globalSearch || localSearch).trim().toLowerCase();
    if (query) {
      const matchName = p.name.toLowerCase().includes(query);
      const matchPhone = (p.phone || '').includes(query);
      const matchCity = (p.city || '').toLowerCase().includes(query);
      if (!matchName && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  const selectedParty = parties.find((p) => p.id === selectedPartyId) || filteredParties[0];

  // Transactions for selected party to build ledger statement
  const partyTransactions = transactions.filter(
    (t) => t.partyId === selectedParty?.id || (selectedParty && t.partyName === selectedParty.name)
  );

  // Build running balance ledger
  let runningBal = selectedParty ? selectedParty.openingBalance : 0;
  const ledgerEntries = partyTransactions.map((tx) => {
    let debit = 0;
    let credit = 0;

    if (tx.type === 'sale_invoice') {
      debit = tx.grandTotal;
      runningBal += (tx.grandTotal - tx.paidAmount);
    } else if (tx.type === 'payment_in') {
      credit = tx.grandTotal;
      runningBal -= tx.grandTotal;
    } else if (tx.type === 'purchase_bill') {
      credit = tx.grandTotal;
      runningBal -= (tx.grandTotal - tx.paidAmount);
    } else if (tx.type === 'payment_out') {
      debit = tx.grandTotal;
      runningBal += tx.grandTotal;
    }

    return {
      tx,
      debit,
      credit,
      runningBalance: runningBal,
    };
  });

  const partyCases = cases.filter(
    (c) => c.partyId === selectedParty?.id || (selectedParty && c.partyName === selectedParty.name)
  );

  const openNewPartyModal = () => {
    setEditingParty(null);
    setFormName('');
    setFormType('customer');
    setFormPhone('');
    setFormEmail('');
    setFormGstin('');
    setFormAddress('');
    setFormCity('');
    setFormState(company.state);
    setFormOpeningBalance(0);
    setIsModalOpen(true);
  };

  const openEditPartyModal = (party: Party) => {
    setEditingParty(party);
    setFormName(party.name);
    setFormType(party.type);
    setFormPhone(party.phone);
    setFormEmail(party.email || '');
    setFormGstin(party.gstin || '');
    setFormAddress(party.billingAddress || '');
    setFormCity(party.city || '');
    setFormState(party.state || company.state);
    setFormOpeningBalance(party.openingBalance || 0);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const partyData: Party = {
      id: editingParty ? editingParty.id : `pty_${Date.now()}`,
      name: formName.trim(),
      type: formType,
      phone: formPhone.trim(),
      email: formEmail.trim(),
      gstin: formGstin.trim(),
      billingAddress: formAddress.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      openingBalance: Number(formOpeningBalance) || 0,
      currentBalance: editingParty
        ? editingParty.currentBalance
        : Number(formOpeningBalance) || 0,
      createdAt: editingParty?.createdAt || new Date().toISOString(),
    };

    onSaveParty(partyData);
    setSelectedPartyId(partyData.id);
    setIsModalOpen(false);
  };

  const handleWhatsAppReminder = () => {
    if (!selectedParty) return;
    const balance = Math.abs(selectedParty.currentBalance);
    const isReceivable = selectedParty.currentBalance > 0;

    const message = isReceivable
      ? `Dear ${selectedParty.name},\n\nGreetings from ${company.name}!\n\nThis is a gentle reminder that a pending balance of ${company.currencySymbol}${balance.toLocaleString()} is outstanding on your account.\n\nPlease arrange for settlement at your convenience via UPI: ${company.upiId} or Bank Transfer.\n\nThank you for your valued partnership!`
      : `Dear ${selectedParty.name},\n\nGreetings from ${company.name}!\n\nWe have recorded our ledger balance with you. For any queries regarding statements, please reply back.\n\nThank you!`;

    const cleanPhone = (selectedParty.phone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleExportLedgerCSV = () => {
    if (!selectedParty) return;
    const headers = ['Date', 'Type', 'Reference No', 'Debit', 'Credit', 'Running Balance'];
    const rows = ledgerEntries.map((row) => [
      `"${row.tx.date}"`,
      `"${row.tx.type}"`,
      `"${row.tx.invoiceNo}"`,
      row.debit,
      row.credit,
      row.runningBalance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${selectedParty.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Parties & Customer CRM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer directory, vendor records, ledger statements & payment reminders
          </p>
        </div>

        <button
          onClick={openNewPartyModal}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add New Party</span>
        </button>
      </div>

      {/* Main 2-Column Split: Party Directory (Left) + Party Ledger Statement (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Party Directory (4 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 space-y-2">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({parties.length})
              </button>
              <button
                onClick={() => setFilterType('customer')}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  filterType === 'customer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setFilterType('supplier')}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  filterType === 'supplier' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Suppliers
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search parties..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Parties List */}
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredParties.map((p) => {
              const isSelected = selectedParty?.id === p.id;
              const isReceivable = p.currentBalance > 0;
              const isPayable = p.currentBalance < 0;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPartyId(p.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-xs text-slate-900 truncate max-w-[200px]">
                      {p.name}
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-xs tabular-nums ${
                          isReceivable
                            ? 'text-blue-600'
                            : isPayable
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {company.currencySymbol}{Math.abs(p.currentBalance).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {isReceivable ? 'Receivable' : isPayable ? 'Payable' : 'Settled'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{p.phone || p.city || 'No contact'}</span>
                    <span className="capitalize text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {p.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Statement of Accounts / Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedParty ? (
            <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              {/* Party Header Banner */}
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{selectedParty.name}</h2>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {selectedParty.type}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                    {selectedParty.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedParty.phone}
                      </span>
                    )}
                    {selectedParty.gstin && <span>GSTIN: {selectedParty.gstin}</span>}
                    {selectedParty.city && <span>{selectedParty.city}, {selectedParty.state}</span>}
                  </div>
                </div>

                {/* Balance & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleWhatsAppReminder}
                    title="Send WhatsApp Payment Reminder"
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {selectedParty.currentBalance > 0 ? (
                    <button
                      onClick={() => onRecordPayment(selectedParty, 'payment_in')}
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                    >
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      <span>Receive Money</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onRecordPayment(selectedParty, 'payment_out')}
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Pay Vendor</span>
                    </button>
                  )}

                  <button
                    onClick={() => openEditPartyModal(selectedParty)}
                    className="h-8 px-2.5 text-xs text-slate-600 hover:bg-slate-200/70 border border-slate-300 rounded-lg"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Balance Summary Bar */}
              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 text-center p-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Opening Balance</span>
                  <span className="font-mono font-bold text-slate-800 tabular-nums">
                    {company.currencySymbol}{Math.abs(selectedParty.openingBalance).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Total Invoiced</span>
                  <span className="font-mono font-bold text-indigo-700 tabular-nums">
                    {company.currencySymbol}
                    {ledgerEntries.reduce((a, b) => a + b.debit, 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Current Balance</span>
                  <span
                    className={`font-mono font-bold text-sm tabular-nums ${
                      selectedParty.currentBalance > 0
                        ? 'text-blue-600'
                        : selectedParty.currentBalance < 0
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {company.currencySymbol}{Math.abs(selectedParty.currentBalance).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tab Switcher: Ledger Statement vs Linked Cases */}
              <div className="flex items-center justify-between border-b border-slate-200 px-4 pt-2 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPartyViewTab('ledger')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                      partyViewTab === 'ledger'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Financial Ledger Statement</span>
                  </button>

                  <button
                    onClick={() => setPartyViewTab('cases')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                      partyViewTab === 'cases'
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>Linked Case Files ({partyCases.length})</span>
                  </button>
                </div>

                {partyViewTab === 'ledger' ? (
                  <button
                    onClick={handleExportLedgerCSV}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Export Statement CSV</span>
                  </button>
                ) : (
                  onOpenCaseTracker && (
                    <button
                      onClick={() => onOpenCaseTracker(selectedParty.id)}
                      className="text-xs font-semibold text-purple-700 hover:underline py-1"
                    >
                      Open Case Tracker →
                    </button>
                  )
                )}
              </div>

              {partyViewTab === 'ledger' ? (
                /* Ledger Statement Table */
                ledgerEntries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No invoices or transactions recorded yet for this party.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Transaction</th>
                          <th className="py-2.5 px-3 text-right">Debit (+)</th>
                          <th className="py-2.5 px-3 text-right">Credit (-)</th>
                          <th className="py-2.5 px-4 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgerEntries.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums">
                              {row.tx.date}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800">
                                {row.tx.type === 'sale_invoice'
                                  ? 'Sale Invoice'
                                  : row.tx.type === 'payment_in'
                                  ? 'Payment Received'
                                  : row.tx.type === 'purchase_bill'
                                  ? 'Purchase Bill'
                                  : 'Payment Made'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                #{row.tx.invoiceNo}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                              {row.debit > 0 ? `${company.currencySymbol}${row.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                              {row.credit > 0 ? `${company.currencySymbol}${row.credit.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                              {company.currencySymbol}{Math.abs(row.runningBalance).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Linked Cases Table */
                partyCases.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <Scale className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                    <span>No legal or land revenue case records associated with this client.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3">Case # & Ref</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Broker / Agent</th>
                          <th className="py-2.5 px-3">Court & Officers</th>
                          <th className="py-2.5 px-3">Land / Deed</th>
                          <th className="py-2.5 px-3">Next Hearing</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {partyCases.map((c) => {
                          const ref = c.type === 'mutation' && c.applicationNo
                            ? `App: ${c.applicationNo}`
                            : c.type === 'misc_case' && c.docketNo
                            ? `Docket: ${c.docketNo}`
                            : '';

                          return (
                            <tr key={c.id} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3">
                                <span className="font-mono font-bold text-indigo-700 block">{c.caseNo}</span>
                                {ref && <span className="font-mono text-[10px] text-purple-700 block">{ref}</span>}
                              </td>
                              <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-700">
                                {c.type.replace('_', ' ')}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                                {c.brokerName ? (
                                  <div>
                                    <span className="font-semibold text-slate-900">{c.brokerName}</span>
                                    {c.brokerPhone && <span className="block font-mono text-[10px] text-slate-400">{c.brokerPhone}</span>}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 truncate max-w-[150px]">
                                <div className="font-medium text-slate-800">{c.courtOrAuthority}</div>
                                {c.roName && <span className="text-[10px] text-slate-500 block">RO: {c.roName}</span>}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                {c.mouza ? (
                                  <div>
                                    <span>{c.mouza} {c.jlNo ? `(JL ${c.jlNo})` : ''}</span>
                                    {c.plotNo && <span className="block text-[10px]">Plot: {c.plotNo}</span>}
                                    {c.deedNo && <span className="block text-[10px]">Deed: {c.deedNo} {c.deedYear ? `(${c.deedYear})` : ''}</span>}
                                  </div>
                                ) : (
                                  <span>{c.title}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                {c.nextHearingDate || 'Not set'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="uppercase text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                  {c.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">No party selected</div>
              <p className="text-xs text-slate-500 mt-1">Select a customer or supplier on the left to view ledger.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Party Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingParty ? 'Edit Party Details' : 'Add New Party / CRM Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Party / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Party Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PartyType)}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="customer">Customer (Buyer)</option>
                    <option value="supplier">Supplier (Vendor)</option>
                    <option value="both">Both (Customer & Vendor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN (Tax ID)
                  </label>
                  <input
                    type="text"
                    value={formGstin}
                    onChange={(e) => setFormGstin(e.target.value)}
                    placeholder="15-digit GSTIN"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Shop/Street address"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                {!editingParty && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Opening Balance ({company.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formOpeningBalance}
                      onChange={(e) => setFormOpeningBalance(parseFloat(e.target.value) || 0)}
                      placeholder="+ for receivable, - for payable"
                      className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none tabular-nums"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {editingParty ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${editingParty.name}?`)) {
                        onDeleteParty(editingParty.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Delete Party
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Save Party
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
