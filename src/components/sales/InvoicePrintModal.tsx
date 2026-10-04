import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  Receipt,
  FileText,
  Building,
  CreditCard,
} from 'lucide-react';
import { Transaction, CompanyProfile } from '../../types/erp';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Transaction | null;
  company: CompanyProfile;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  company,
}) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [copyType, setCopyType] = useState<'Original' | 'Duplicate' | 'Transporter'>('Original');

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `Hello ${invoice.partyName},\n\nHere is your Invoice #${invoice.invoiceNo} from ${company.name}.\n\nTotal Amount: ${company.currencySymbol}${invoice.grandTotal.toLocaleString()}\nPaid: ${company.currencySymbol}${invoice.paidAmount.toLocaleString()}\nBalance Due: ${company.currencySymbol}${invoice.balanceDue.toLocaleString()}\n\nThank you for choosing ${company.name}!`;
    const cleanPhone = (invoice.partyPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-200/70 rounded-lg">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printFormat === 'a4'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>GST Tax Invoice (A4)</span>
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printFormat === 'thermal'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Thermal Slip (80mm)</span>
              </button>
            </div>

            {printFormat === 'a4' && (
              <select
                value={copyType}
                onChange={(e) => setCopyType(e.target.value as any)}
                className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 outline-none"
              >
                <option value="Original">Original for Recipient</option>
                <option value="Duplicate">Duplicate for Supplier</option>
                <option value="Transporter">Transporter Copy</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {printFormat === 'a4' ? (
            /* ================= STANDARD A4 GST INVOICE ================= */
            <div className="printable-area w-full max-w-[800px] bg-white p-8 shadow-sm border border-slate-200 text-slate-900 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                    {company.name}
                  </h1>
                  <p className="text-slate-500 font-medium text-xs mt-0.5">{company.tagline}</p>
                  <p className="text-slate-600 mt-2 max-w-sm leading-relaxed">
                    {company.address}, {company.city}, {company.state} - {company.pincode}
                  </p>
                  <p className="text-slate-600 mt-1">
                    Phone: <span className="font-mono">{company.phone}</span> | Email: {company.email}
                  </p>
                  <div className="mt-2 text-slate-700 font-mono font-medium">
                    <span>GSTIN: </span><span className="font-semibold">{company.gstin}</span>
                    <span className="mx-2">·</span>
                    <span>PAN: </span><span>{company.pan}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold tracking-wide uppercase text-sm rounded">
                    {invoice.type === 'estimate' ? 'ESTIMATE / QUOTE' : 'TAX INVOICE'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">({copyType})</p>
                  
                  <div className="mt-4 text-right space-y-1 font-mono">
                    <div>
                      <span className="text-slate-500 text-xs">Invoice No: </span>
                      <span className="font-bold text-slate-900">{invoice.invoiceNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Date: </span>
                      <span className="text-slate-800">{invoice.date}</span>
                    </div>
                    {invoice.dueDate && (
                      <div>
                        <span className="text-slate-500 text-xs">Due Date: </span>
                        <span className="text-slate-800">{invoice.dueDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                    Billed To:
                  </h4>
                  <div className="text-sm font-semibold text-slate-900">{invoice.partyName}</div>
                  {invoice.partyAddress && (
                    <p className="text-slate-600 mt-1 leading-relaxed">{invoice.partyAddress}</p>
                  )}
                  {invoice.partyPhone && (
                    <p className="text-slate-600 mt-1">
                      Phone: <span className="font-mono">{invoice.partyPhone}</span>
                    </p>
                  )}
                  {invoice.partyGstin && (
                    <p className="text-slate-700 mt-1 font-mono">
                      GSTIN: <span className="font-semibold">{invoice.partyGstin}</span>
                    </p>
                  )}
                  {invoice.partyState && (
                    <p className="text-slate-600 mt-0.5">
                      Place of Supply: <span className="font-medium">{invoice.partyState}</span>
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Payment Status
                  </h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-semibold uppercase text-slate-800">{invoice.paymentMode}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`font-bold uppercase ${
                        invoice.status === 'paid'
                          ? 'text-emerald-700'
                          : invoice.status === 'partial'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Balance Due:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {company.currencySymbol}{invoice.balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-y border-slate-300 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2 text-center">HSN</th>
                      <th className="py-2.5 px-2 text-right">Qty</th>
                      <th className="py-2.5 px-2 text-right">Rate</th>
                      <th className="py-2.5 px-2 text-right">Disc %</th>
                      <th className="py-2.5 px-2 text-right">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {line.itemName}
                          {line.sku && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              SKU: {line.sku}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                          {line.hsnCode || '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                          {line.qty} {line.unit}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                          {company.currencySymbol}{line.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-500">
                          {line.discountPercent > 0 ? `${line.discountPercent}%` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                          {line.taxRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {company.currencySymbol}{line.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax & Total Calculation Breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  {/* Bank Details & QR */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Bank & Payment Details</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-600">
                      <div><span className="text-slate-400">Bank:</span> {company.bankName}</div>
                      <div><span className="text-slate-400">A/C No:</span> <span className="font-mono font-semibold text-slate-800">{company.bankAccount}</span></div>
                      <div><span className="text-slate-400">IFSC:</span> <span className="font-mono">{company.bankIfsc}</span></div>
                      <div><span className="text-slate-400">Branch:</span> {company.bankBranch}</div>
                      <div><span className="text-slate-400">UPI ID:</span> <span className="font-mono font-medium text-indigo-600">{company.upiId}</span></div>
                    </div>
                  </div>

                  {invoice.terms && (
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-700 block mb-1">Terms & Conditions:</span>
                      <pre className="whitespace-pre-line font-sans">{invoice.terms}</pre>
                    </div>
                  )}
                </div>

                <div className="space-y-2 font-mono">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span className="font-sans">Sub Total:</span>
                    <span>{company.currencySymbol}{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between py-1 text-emerald-700">
                      <span className="font-sans">Total Discount:</span>
                      <span>-{company.currencySymbol}{invoice.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 text-slate-600">
                    <span className="font-sans">Taxable Value:</span>
                    <span>{company.currencySymbol}{invoice.taxableTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {invoice.cgstTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-slate-500 text-xs">
                      <span className="font-sans">CGST:</span>
                      <span>+{company.currencySymbol}{invoice.cgstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {invoice.sgstTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-slate-500 text-xs">
                      <span className="font-sans">SGST:</span>
                      <span>+{company.currencySymbol}{invoice.sgstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {invoice.igstTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-slate-500 text-xs">
                      <span className="font-sans">IGST:</span>
                      <span>+{company.currencySymbol}{invoice.igstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {invoice.roundOff !== 0 && (
                    <div className="flex justify-between py-0.5 text-slate-400 text-xs">
                      <span className="font-sans">Round Off:</span>
                      <span>{invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2.5 border-y-2 border-slate-900 text-sm font-bold text-slate-900">
                    <span className="font-sans uppercase">Grand Total:</span>
                    <span className="text-base text-indigo-700">
                      {company.currencySymbol}{invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-emerald-700 text-xs font-semibold">
                    <span className="font-sans">Paid Amount:</span>
                    <span>{company.currencySymbol}{invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between py-1 text-rose-700 text-xs font-semibold">
                    <span className="font-sans">Balance Due:</span>
                    <span>{company.currencySymbol}{invoice.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Footer Signatory */}
              <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[11px] text-slate-400">
                  This is a computer generated invoice. No signature required.
                </div>
                <div className="text-center">
                  <div className="h-12 border-b border-dashed border-slate-400 w-44 mb-1"></div>
                  <p className="text-[11px] font-semibold text-slate-700">For {company.name}</p>
                  <p className="text-[10px] text-slate-400">Authorized Signatory</p>
                </div>
              </div>
            </div>
          ) : (
            /* ================= 80MM THERMAL RECEIPT SLIP ================= */
            <div className="printable-area w-[320px] bg-white p-4 shadow-sm border border-slate-200 font-mono text-[11px] text-slate-900">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h2 className="text-sm font-bold uppercase">{company.name}</h2>
                <p className="text-[10px] text-slate-600">{company.address}</p>
                <p className="text-[10px] text-slate-600">Ph: {company.phone}</p>
                <p className="text-[10px] font-semibold">GSTIN: {company.gstin}</p>
                <div className="mt-1 font-bold text-xs uppercase bg-slate-100 py-0.5">
                  TAX INVOICE
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div>Inv: <span className="font-bold">{invoice.invoiceNo}</span></div>
                <div>Date: {invoice.date}</div>
                <div>Customer: <span className="font-semibold">{invoice.partyName}</span></div>
                {invoice.partyPhone && <div>Mob: {invoice.partyPhone}</div>}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-slate-200">
                  <span>ITEM</span>
                  <span>QTY x RATE</span>
                  <span>AMT</span>
                </div>
                {invoice.items.map((it, i) => (
                  <div key={i} className="py-1">
                    <div className="font-semibold truncate">{it.itemName}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{it.qty} {it.unit} @ {company.currencySymbol}{it.unitPrice}</span>
                      <span className="font-bold text-slate-900">
                        {company.currencySymbol}{it.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>{company.currencySymbol}{invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{company.currencySymbol}{invoice.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total Tax:</span>
                  <span>+{company.currencySymbol}{invoice.totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>{company.currencySymbol}{invoice.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Paid ({invoice.paymentMode}):</span>
                  <span>{company.currencySymbol}{invoice.paidAmount.toLocaleString()}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between font-bold text-rose-700">
                    <span>Balance Due:</span>
                    <span>{company.currencySymbol}{invoice.balanceDue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500">
                <p>UPI: {company.upiId}</p>
                <p className="mt-1 font-bold">THANK YOU! VISIT AGAIN</p>
                <p className="text-[9px] mt-0.5">Powered by SRK ERP Software</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
