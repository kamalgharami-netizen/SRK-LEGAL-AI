import React from 'react';
import {
  Printer,
  Share2,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  AlertCircle,
  FileCheck,
  Receipt,
  Download,
  Phone,
  Scale,
} from 'lucide-react';
import { Transaction, LegalCase, CompanyProfile, Party } from '../../types/erp';

interface ClientPublicPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'invoice' | 'case';
  invoice?: Transaction | null;
  caseItem?: LegalCase | null;
  company: CompanyProfile;
  party?: Party | null;
}

export const ClientPublicPortalModal: React.FC<ClientPublicPortalModalProps> = ({
  isOpen,
  onClose,
  type,
  invoice,
  caseItem,
  company,
  party,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const origin = window.location.origin + window.location.pathname;
    const url =
      type === 'invoice' && invoice
        ? `${origin}?view=invoice&id=${encodeURIComponent(invoice.id)}`
        : caseItem
        ? `${origin}?view=case&id=${encodeURIComponent(caseItem.id)}`
        : origin;

    const phone = (party?.phone || invoice?.partyPhone || caseItem?.partyPhone || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const text = `Hello! Please find the official document from ${company.name} here: ${url}`;
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm tracking-wide text-indigo-300">
              SRK ERP AND DAILY MANAGEMENT SOFTWARE
            </span>
            <span className="text-[10px] bg-indigo-800 text-indigo-200 font-mono px-2 py-0.5 rounded">
              Client Portal View
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-4 sm:p-8 bg-white print:p-0 print:m-0 text-slate-900" id="client-printable-area">
          {/* Header & Company Details */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-700 block mb-1">
                SRK ERP AND DAILY MANAGEMENT SOFTWARE
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {company.name}
              </h1>
              <p className="text-xs text-slate-600 max-w-md mt-1 leading-relaxed">
                {company.address}, {company.city} - {company.pincode}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-mono mt-2">
                <span>Phone: <b>{company.phone}</b></span>
                {company.email && <span>Email: <b>{company.email}</b></span>}
                {company.gstin && <span>GSTIN: <b>{company.gstin}</b></span>}
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200 w-full sm:w-auto">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900 text-white mb-2">
                {type === 'invoice' ? 'OFFICIAL TAX INVOICE' : 'OFFICIAL CASE DOSSIER'}
              </span>
              <div className="text-sm font-mono font-bold text-indigo-700">
                {type === 'invoice' && invoice
                  ? invoice.invoiceNo || (invoice as any).invoiceNumber || ''
                  : caseItem
                  ? caseItem.caseNo
                  : ''}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Date: {type === 'invoice' && invoice ? invoice.date : caseItem ? caseItem.filingDate : new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Client Details Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block mb-1">
              Billed To / Client Information
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {type === 'invoice' && invoice ? invoice.partyName : caseItem ? caseItem.partyName : party?.name || 'Valued Client'}
                </h3>
                {(party?.phone || invoice?.partyPhone || caseItem?.partyPhone) && (
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Mobile: <b>{party?.phone || caseItem?.partyPhone || invoice?.partyPhone}</b>
                  </p>
                )}
              </div>
              <div className="sm:text-right text-xs text-slate-600">
                <span className="font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block font-mono text-[11px]">
                  ✓ Verified Client Record
                </span>
              </div>
            </div>
          </div>

          {/* INVOICE BILLING CONTENT */}
          {type === 'invoice' && invoice && (
            <div className="space-y-6">
              {/* Item Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item / Service Description</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Tax</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {invoice.items.map((item, idx) => {
                      const itemName = item.itemName || (item as any).name || 'Item';
                      const unitPrice = item.unitPrice ?? (item as any).rate ?? 0;
                      const totalAmount = item.totalAmount ?? (item as any).finalAmount ?? (unitPrice * item.qty);
                      return (
                        <tr key={item.id || (item as any).itemId || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400 font-sans">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                            {itemName}
                          </td>
                          <td className="py-2.5 px-3 text-right">{item.qty} {item.unit || ''}</td>
                          <td className="py-2.5 px-3 text-right">₹{unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{item.taxRate}%</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="text-xs text-slate-500 max-w-xs space-y-1">
                  <p className="font-semibold text-slate-700">Payment Status & Terms:</p>
                  <p className="text-[11px] leading-relaxed">
                    Payment Mode: <b>{(invoice.paymentMode || 'CASH').toUpperCase()}</b>
                  </p>
                  {company.defaultInvoiceTerms && (
                    <p className="text-[10px] text-slate-400 whitespace-pre-line mt-2">
                      {company.defaultInvoiceTerms}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {(invoice.totalTax || (invoice as any).taxAmount || 0) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Total Tax (GST):</span>
                      <span>₹{(invoice.totalTax || (invoice as any).taxAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {((invoice as any).discountTotal || (invoice as any).discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{((invoice as any).discountTotal || (invoice as any).discountAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                    <span className="font-sans font-bold">Net Total:</span>
                    <span>₹{(invoice.grandTotal || (invoice as any).netTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Amount Paid:</span>
                    <span>₹{(invoice.paidAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-black pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span>₹{(invoice.balanceDue || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEGAL CASE / MUTATION CONTENT */}
          {type === 'case' && caseItem && (
            <div className="space-y-5">
              {/* Status Header Alert */}
              <div className="p-4 rounded-xl border text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-50 to-indigo-50 border-indigo-200">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold block mb-0.5">
                    Live Case Tracking Status
                  </span>
                  <div className="text-base font-black text-indigo-950 uppercase">
                    {caseItem.status === 'case_registered'
                      ? '1) CASE REGISTERED (আবেদন নথিভুক্ত)'
                      : caseItem.status === 'hearing'
                      ? '2) HEARING SCHEDULED (শুনানি নির্ধারিত)'
                      : caseItem.status === 'under_inquiry'
                      ? '3) UNDER INQUIRY (আর.আই তদন্তাধীন)'
                      : caseItem.status === 'hearing_completed'
                      ? '4) HEARING COMPLETED (শুনানি সম্পন্ন)'
                      : caseItem.status === 'disposed'
                      ? '5) DISPOSED / ALLOWED (মিউটেশন নিষ্পত্তি)'
                      : caseItem.status === 'rejected'
                      ? '6) REJECTED (আবেদন খারিজ)'
                      : caseItem.status.replace('_', ' ')}
                  </div>
                </div>

                {caseItem.status === 'hearing' && caseItem.nextHearingDate && (
                  <div className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold">
                    Hearing Date: {caseItem.nextHearingDate}
                  </div>
                )}
                {caseItem.status === 'disposed' && caseItem.khatianNo && (
                  <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold">
                    Allotted Khatian: {caseItem.khatianNo}
                  </div>
                )}
              </div>

              {/* Status-specific Detail Card */}
              {caseItem.status === 'under_inquiry' && (
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                  <span className="font-bold block">Inquiry Officer & Investigation Details:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>Revenue Inspector (R.I.): <b>{caseItem.riName || 'Designated RI Circle'}</b></div>
                    <div>Date of Inquiry given by RI: <b>{caseItem.riInquiryDate || 'Pending Submission'}</b></div>
                  </div>
                </div>
              )}

              {caseItem.status === 'rejected' && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
                  <span className="font-bold block">Reason of Rejection Recorded:</span>
                  <p className="text-[11px] font-semibold text-rose-900">
                    {caseItem.rejectionReason || 'Stated on Order Sheet'}
                  </p>
                </div>
              )}

              {/* Authority & Land Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block font-sans text-[11px]">Case Number:</span>
                  <b className="text-slate-900">{caseItem.caseNo}</b>
                </div>
                {caseItem.applicationNo && (
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">Application No:</span>
                    <b className="text-purple-900">{caseItem.applicationNo}</b>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block font-sans text-[11px]">Court / Authority:</span>
                  <b className="text-slate-900 font-sans">{caseItem.courtOrAuthority}</b>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[11px]">Filing Date:</span>
                  <b className="text-slate-900">{caseItem.filingDate}</b>
                </div>

                {caseItem.deedNo && (
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">Deed No & Year:</span>
                    <b>{caseItem.deedNo} ({caseItem.deedYear || '—'})</b>
                  </div>
                )}
                {caseItem.landArea && (
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">Land Area:</span>
                    <b>{caseItem.landArea}</b>
                  </div>
                )}
                {caseItem.mouza && (
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">Mouza & J.L.:</span>
                    <b>{caseItem.mouza} {caseItem.jlNo ? `(JL ${caseItem.jlNo})` : ''}</b>
                  </div>
                )}
                {caseItem.plotNo && (
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">Plot / Dag No:</span>
                    <b>{caseItem.plotNo}</b>
                  </div>
                )}
              </div>

              {/* Hearing Timeline */}
              {caseItem.hearings && caseItem.hearings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Hearing History & Order Sheet Timeline
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {caseItem.hearings.map((h, idx) => (
                      <div key={h.id || idx} className="p-3 bg-white flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <span className="font-mono font-bold text-indigo-700">{h.date}</span>
                          <span className="text-slate-700 font-medium ml-2">— {h.purpose}</span>
                          {h.outcome && (
                            <p className="text-[11px] text-slate-500 mt-0.5">Outcome: {h.outcome}</p>
                          )}
                        </div>
                        {h.nextHearingDate && (
                          <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold shrink-0">
                            Next: {h.nextHearingDate}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer & Signature Stamp */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">
                Generated via SRK ERP AND DAILY MANAGEMENT SOFTWARE
              </p>
              <p className="text-[11px]">
                Official client record • Transmitted securely via internet & WhatsApp
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="h-12 w-32 border-b border-dashed border-slate-400 mb-1 mx-auto sm:ml-auto" />
              <span className="font-bold text-slate-800 block">Authorized Signature</span>
              <span className="text-[10px] text-slate-400 font-mono">For {company.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
