import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Printer,
  Barcode,
  Building2,
  CreditCard,
  Percent,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  Party,
  Item,
  InvoiceItem,
  BankAccount,
  CompanyProfile,
  PaymentMode,
  UnitType,
} from '../../types/erp';
import { StorageService } from '../../services/storage';

interface InvoiceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType; // 'sale_invoice' | 'estimate' | 'purchase_bill'
  initialInvoice?: Transaction | null;
  parties: Party[];
  items: Item[];
  accounts: BankAccount[];
  company: CompanyProfile;
  onSave: (tx: Transaction, andPrint?: boolean) => void;
  onQuickAddParty: (party: Party) => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  isOpen,
  onClose,
  type,
  initialInvoice,
  parties,
  items,
  accounts,
  company,
  onSave,
  onQuickAddParty,
}) => {
  if (!isOpen) return null;

  const isSale = type === 'sale_invoice';
  const isEstimate = type === 'estimate';
  const isPurchase = type === 'purchase_bill';

  // Filter parties by type: sales/estimates -> customers, purchases -> suppliers
  const relevantParties = parties.filter((p) =>
    isPurchase ? p.type === 'supplier' || p.type === 'both' : p.type === 'customer' || p.type === 'both'
  );

  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    initialInvoice?.partyId || (relevantParties[0]?.id ?? '')
  );

  const [invoiceNo, setInvoiceNo] = useState<string>(
    initialInvoice?.invoiceNo || StorageService.getNextInvoiceNumber(type as any)
  );

  const [date, setDate] = useState<string>(
    initialInvoice?.date || new Date().toISOString().split('T')[0]
  );

  const [dueDate, setDueDate] = useState<string>(
    initialInvoice?.dueDate ||
      new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );

  // Line Items
  const [lineItems, setLineItems] = useState<InvoiceItem[]>(
    initialInvoice?.items?.length
      ? initialInvoice.items
      : [
          {
            id: `row_${Date.now()}_1`,
            itemId: items[0]?.id,
            itemName: items[0]?.name || '',
            sku: items[0]?.sku || '',
            hsnCode: items[0]?.hsnCode || '',
            qty: 1,
            unit: items[0]?.unit || 'PCS',
            unitPrice: isPurchase ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0),
            discountPercent: 0,
            discountAmount: 0,
            taxRate: items[0]?.taxRate || 18,
            taxableAmount: isPurchase ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0),
            taxAmount: ((isPurchase ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0)) * (items[0]?.taxRate || 18)) / 100,
            totalAmount: ((isPurchase ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0)) * (1 + (items[0]?.taxRate || 18) / 100)),
          },
        ]
  );

  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    initialInvoice?.paymentMode || 'bank'
  );

  const [paymentAccountId, setPaymentAccountId] = useState<string>(
    initialInvoice?.paymentAccountId || accounts[0]?.id || 'acc_cash'
  );

  const [paidAmountManual, setPaidAmountManual] = useState<number | null>(
    initialInvoice ? initialInvoice.paidAmount : null
  );

  const [notes, setNotes] = useState<string>(
    initialInvoice?.notes || (isEstimate ? 'Quotation valid for 15 days.' : 'Thank you for your business!')
  );

  const [terms, setTerms] = useState<string>(
    initialInvoice?.terms || company.defaultInvoiceTerms
  );

  // Quick Party Modal State
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyGstin, setNewPartyGstin] = useState('');
  const [newPartyState, setNewPartyState] = useState(company.state);

  // Quick Barcode Scan Search
  const [barcodeSearch, setBarcodeSearch] = useState('');

  // Selected party object
  const party = parties.find((p) => p.id === selectedPartyId);

  // Inter-state check for GST calculation: Same state = CGST + SGST; Different state = IGST
  const isInterState =
    party?.state &&
    company.state &&
    party.state.trim().toLowerCase() !== company.state.trim().toLowerCase();

  // Recalculate row
  const updateRow = (idx: number, updates: Partial<InvoiceItem>) => {
    const next = [...lineItems];
    const row = { ...next[idx], ...updates };

    const qty = Number(row.qty) || 0;
    const rate = Number(row.unitPrice) || 0;
    const gross = qty * rate;

    const discPercent = Number(row.discountPercent) || 0;
    const discAmount = (gross * discPercent) / 100;
    const taxable = Math.max(0, gross - discAmount);

    const taxRate = Number(row.taxRate) || 0;
    const tax = (taxable * taxRate) / 100;
    const total = taxable + tax;

    row.discountAmount = discAmount;
    row.taxableAmount = taxable;
    row.taxAmount = tax;
    row.totalAmount = total;

    next[idx] = row;
    setLineItems(next);
  };

  const handleItemSelect = (idx: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const price = isPurchase ? item.purchasePrice : item.salePrice;
    updateRow(idx, {
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      hsnCode: item.hsnCode,
      unit: item.unit,
      unitPrice: price,
      taxRate: item.taxRate,
    });
  };

  const addRow = () => {
    const defaultItem = items[0];
    const price = defaultItem ? (isPurchase ? defaultItem.purchasePrice : defaultItem.salePrice) : 0;
    const taxRate = defaultItem?.taxRate || 18;
    setLineItems([
      ...lineItems,
      {
        id: `row_${Date.now()}_${Math.random()}`,
        itemId: defaultItem?.id,
        itemName: defaultItem?.name || '',
        sku: defaultItem?.sku || '',
        hsnCode: defaultItem?.hsnCode || '',
        qty: 1,
        unit: defaultItem?.unit || 'PCS',
        unitPrice: price,
        discountPercent: 0,
        discountAmount: 0,
        taxRate,
        taxableAmount: price,
        taxAmount: (price * taxRate) / 100,
        totalAmount: price * (1 + taxRate / 100),
      },
    ]);
  };

  const removeRow = (idx: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleBarcodeAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;
    const query = barcodeSearch.trim().toLowerCase();
    const matched = items.find(
      (it) =>
        it.sku.toLowerCase() === query ||
        it.name.toLowerCase().includes(query) ||
        it.hsnCode === query
    );
    if (matched) {
      const price = isPurchase ? matched.purchasePrice : matched.salePrice;
      const taxRate = matched.taxRate || 18;
      setLineItems([
        ...lineItems,
        {
          id: `row_${Date.now()}_${Math.random()}`,
          itemId: matched.id,
          itemName: matched.name,
          sku: matched.sku,
          hsnCode: matched.hsnCode,
          qty: 1,
          unit: matched.unit,
          unitPrice: price,
          discountPercent: 0,
          discountAmount: 0,
          taxRate,
          taxableAmount: price,
          taxAmount: (price * taxRate) / 100,
          totalAmount: price * (1 + taxRate / 100),
        },
      ]);
      setBarcodeSearch('');
    }
  };

  // Totals calculation
  const subtotal = lineItems.reduce((acc, row) => acc + (row.qty * row.unitPrice), 0);
  const discountTotal = lineItems.reduce((acc, row) => acc + row.discountAmount, 0);
  const taxableTotal = lineItems.reduce((acc, row) => acc + row.taxableAmount, 0);
  const totalTax = lineItems.reduce((acc, row) => acc + row.taxAmount, 0);

  const unroundedTotal = taxableTotal + totalTax;
  const grandTotal = Math.round(unroundedTotal);
  const roundOff = Math.round((grandTotal - unroundedTotal) * 100) / 100;

  const cgstTotal = isInterState ? 0 : totalTax / 2;
  const sgstTotal = isInterState ? 0 : totalTax / 2;
  const igstTotal = isInterState ? totalTax : 0;

  // Paid amount calculation
  const defaultPaid = isEstimate ? 0 : initialInvoice ? initialInvoice.paidAmount : grandTotal;
  const paidAmount = paidAmountManual !== null ? paidAmountManual : defaultPaid;
  const balanceDue = Math.max(0, grandTotal - paidAmount);

  const status =
    isEstimate
      ? 'draft'
      : balanceDue <= 0
      ? 'paid'
      : paidAmount > 0
      ? 'partial'
      : 'unpaid';

  const handleQuickSaveParty = () => {
    if (!newPartyName.trim()) return;
    const newPty: Party = {
      id: `pty_${Date.now()}`,
      name: newPartyName.trim(),
      type: isPurchase ? 'supplier' : 'customer',
      phone: newPartyPhone.trim(),
      gstin: newPartyGstin.trim(),
      billingAddress: '',
      city: '',
      state: newPartyState,
      openingBalance: 0,
      currentBalance: 0,
      createdAt: new Date().toISOString(),
    };
    onQuickAddParty(newPty);
    setSelectedPartyId(newPty.id);
    setShowAddPartyModal(false);
    setNewPartyName('');
    setNewPartyPhone('');
    setNewPartyGstin('');
  };

  const handleSave = (andPrint = false) => {
    if (!selectedPartyId && !party) return;
    if (lineItems.length === 0) return;

    const tx: Transaction = {
      id: initialInvoice?.id || `tx_${Date.now()}`,
      type,
      invoiceNo,
      date,
      dueDate,
      partyId: party?.id,
      partyName: party?.name || 'Walk-in Customer',
      partyPhone: party?.phone,
      partyGstin: party?.gstin,
      partyAddress: party?.billingAddress,
      partyState: party?.state,
      items: lineItems,
      subtotal,
      discountTotal,
      taxableTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      roundOff,
      grandTotal,
      paidAmount,
      balanceDue,
      paymentMode,
      paymentAccountId,
      status,
      notes,
      terms,
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
    };

    onSave(tx, andPrint);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isSale ? 'Create Sales Invoice' : isEstimate ? 'Create Quotation / Estimate' : 'Record Purchase Bill'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Inv #{invoiceNo}</span>
                <span>·</span>
                <span>{isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Save & Print</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Save Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Party and Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Party Selector */}
            <div className="md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {isPurchase ? 'Supplier / Vendor' : 'Customer / Party'} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Add New Party
                </button>
              </div>
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {relevantParties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city || p.state || 'Local'})
                  </option>
                ))}
              </select>

              {party && (
                <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-mono">
                  {party.phone && <div>Phone: {party.phone}</div>}
                  {party.gstin && <div>GSTIN: {party.gstin}</div>}
                  <div>State: {party.state}</div>
                </div>
              )}
            </div>

            {/* Invoice Number & Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="mt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Due Date & State of Supply */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="mt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Place of Supply (State)
                </label>
                <input
                  type="text"
                  value={party?.state || company.state}
                  readOnly
                  className="w-full h-9 px-3 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Barcode / SKU Scan input */}
          <form onSubmit={handleBarcodeAdd} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Scan barcode or type SKU / item name to add..."
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg"
            >
              + Quick Scan / Add
            </button>
          </form>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Item / Description</th>
                  <th className="py-2.5 px-2 w-20 text-center">HSN</th>
                  <th className="py-2.5 px-2 w-24 text-right">Qty</th>
                  <th className="py-2.5 px-2 w-24 text-center">Unit</th>
                  <th className="py-2.5 px-2 w-28 text-right">Rate ({company.currencySymbol})</th>
                  <th className="py-2.5 px-2 w-20 text-right">Disc %</th>
                  <th className="py-2.5 px-2 w-20 text-right">Tax %</th>
                  <th className="py-2.5 px-3 w-32 text-right">Amount ({company.currencySymbol})</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {lineItems.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-center text-xs font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Item Select or Custom Title */}
                    <td className="py-2 px-3">
                      <select
                        value={row.itemId || ''}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-slate-900"
                      >
                        <option value="">Custom Item / Service</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} (Stock: {it.stockQty} {it.unit})
                          </option>
                        ))}
                      </select>
                      {!row.itemId && (
                        <input
                          type="text"
                          value={row.itemName}
                          onChange={(e) => updateRow(idx, { itemName: e.target.value })}
                          placeholder="Type custom item name..."
                          className="mt-1 w-full h-7 px-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      )}
                    </td>

                    {/* HSN */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={row.hsnCode}
                        onChange={(e) => updateRow(idx, { hsnCode: e.target.value })}
                        className="w-full h-8 text-center text-xs font-mono bg-white border border-slate-300 rounded outline-none"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={row.qty || ''}
                        onChange={(e) => updateRow(idx, { qty: parseFloat(e.target.value) || 0 })}
                        className="w-full h-8 px-2 text-right text-xs font-mono font-semibold bg-white border border-slate-300 rounded outline-none tabular-nums"
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-2 px-2 text-center">
                      <select
                        value={row.unit}
                        onChange={(e) => updateRow(idx, { unit: e.target.value as UnitType })}
                        className="w-full h-8 px-1 text-center text-xs bg-white border border-slate-300 rounded outline-none"
                      >
                        <option value="PCS">PCS</option>
                        <option value="BOX">BOX</option>
                        <option value="KG">KG</option>
                        <option value="LTR">LTR</option>
                        <option value="MTR">MTR</option>
                        <option value="BAG">BAG</option>
                        <option value="SET">SET</option>
                        <option value="NOS">NOS</option>
                      </select>
                    </td>

                    {/* Rate */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unitPrice || ''}
                        onChange={(e) =>
                          updateRow(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full h-8 px-2 text-right text-xs font-mono font-semibold bg-white border border-slate-300 rounded outline-none tabular-nums"
                      />
                    </td>

                    {/* Discount % */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.discountPercent || ''}
                        onChange={(e) =>
                          updateRow(idx, { discountPercent: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full h-8 px-1 text-right text-xs font-mono bg-white border border-slate-300 rounded outline-none tabular-nums"
                      />
                    </td>

                    {/* Tax % */}
                    <td className="py-2 px-2 text-right">
                      <select
                        value={row.taxRate}
                        onChange={(e) =>
                          updateRow(idx, { taxRate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full h-8 px-1 text-right text-xs font-mono bg-white border border-slate-300 rounded outline-none"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>

                    {/* Line Amount */}
                    <td className="py-2 px-3 text-right font-mono font-semibold text-xs tabular-nums text-slate-900">
                      {company.currencySymbol}{row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Delete */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        disabled={lineItems.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Item Row</span>
              </button>
            </div>
          </div>

          {/* Bottom Financial Summaries & Payment Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Payment & Terms Section */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Collection
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI / QR Code</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="credit">Credit / Unpaid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deposit Into Account
                    </label>
                    <select
                      value={paymentAccountId}
                      onChange={(e) => setPaymentAccountId(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Paid Amount ({company.currencySymbol})
                      </label>
                      <button
                        type="button"
                        onClick={() => setPaidAmountManual(grandTotal)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Full Paid
                      </button>
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmountManual(parseFloat(e.target.value) || 0)}
                      className="w-full h-9 px-3 text-sm font-mono font-semibold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Balance Due ({company.currencySymbol})
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${company.currencySymbol}${balanceDue.toLocaleString()}`}
                      className="w-full h-9 px-3 text-sm font-mono font-bold bg-slate-100 border border-slate-200 rounded-lg text-rose-700 outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Notes & Payment Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Thanks for your business!"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 text-slate-600">
                <span className="font-sans font-medium">Subtotal (Gross):</span>
                <span className="tabular-nums">
                  {company.currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between py-1 text-emerald-700">
                  <span className="font-sans font-medium">Discount Total:</span>
                  <span className="tabular-nums">
                    -{company.currencySymbol}{discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 text-slate-600">
                <span className="font-sans font-medium">Taxable Amount:</span>
                <span className="tabular-nums">
                  {company.currencySymbol}{taxableTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {cgstTotal > 0 && (
                <div className="flex justify-between py-0.5 text-slate-500">
                  <span className="font-sans">CGST:</span>
                  <span className="tabular-nums">
                    +{company.currencySymbol}{cgstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {sgstTotal > 0 && (
                <div className="flex justify-between py-0.5 text-slate-500">
                  <span className="font-sans">SGST:</span>
                  <span className="tabular-nums">
                    +{company.currencySymbol}{sgstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {igstTotal > 0 && (
                <div className="flex justify-between py-0.5 text-slate-500">
                  <span className="font-sans">IGST (Inter-State):</span>
                  <span className="tabular-nums">
                    +{company.currencySymbol}{igstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {roundOff !== 0 && (
                <div className="flex justify-between py-0.5 text-slate-400">
                  <span className="font-sans">Round Off:</span>
                  <span className="tabular-nums">
                    {roundOff > 0 ? `+${roundOff}` : roundOff}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-3 border-y-2 border-slate-900 text-sm font-bold text-slate-900">
                <span className="font-sans uppercase text-base">Grand Total:</span>
                <span className="text-xl font-bold text-indigo-700 tabular-nums">
                  {company.currencySymbol}{grandTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between pt-1 text-emerald-700 font-semibold">
                <span className="font-sans">Paid Amount:</span>
                <span className="tabular-nums">
                  {company.currencySymbol}{paidAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-rose-700 font-semibold">
                <span className="font-sans">Balance Due:</span>
                <span className="tabular-nums">
                  {company.currencySymbol}{balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Party Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Add New {isPurchase ? 'Supplier' : 'Customer'}
              </h3>
              <button
                onClick={() => setShowAddPartyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Party Name *</label>
              <input
                type="text"
                required
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="Business or customer name"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={newPartyPhone}
                onChange={(e) => setNewPartyPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={newPartyGstin}
                onChange={(e) => setNewPartyGstin(e.target.value)}
                placeholder="15-digit GSTIN"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                value={newPartyState}
                onChange={(e) => setNewPartyState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPartyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickSaveParty}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Save Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
