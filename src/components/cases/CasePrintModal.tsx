import React, { useState } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle2,
  Scale,
  Briefcase,
  FileText,
  FileCheck,
} from 'lucide-react';
import { LegalCase, HearingLog, CompanyProfile } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface CasePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCase?: LegalCase | null;
  cases: LegalCase[];
  company: CompanyProfile;
  initialMode?: 'dossier' | 'cause_list';
}

export const CasePrintModal: React.FC<CasePrintModalProps> = ({
  isOpen,
  onClose,
  selectedCase,
  cases,
  company,
  initialMode = 'dossier',
}) => {
  const { t } = useLanguage();
  const [printMode, setPrintMode] = useState<'dossier' | 'cause_list'>(
    selectedCase ? initialMode : 'cause_list'
  );
  const [causeListFilter, setCauseListFilter] = useState<'today' | 'all' | 'mutation' | 'misc_case' | 'rti' | 'lr_appeal'>('today');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  // Filtered cases for Cause List
  const causeListCases = cases.filter((c) => {
    if (causeListFilter === 'today') return c.nextHearingDate === todayStr;
    if (causeListFilter === 'all') return true;
    return c.type === causeListFilter;
  });

  // Export to true Excel XML / HTML format with all comprehensive fields
  const handleExportExcel = () => {
    const listToExport = printMode === 'dossier' && selectedCase ? [selectedCase] : causeListCases;

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          th { background-color: #312e81; color: #ffffff; font-weight: bold; border: 1px solid #999; padding: 6px; }
          td { border: 1px solid #ccc; padding: 5px; font-family: Arial, sans-serif; font-size: 11px; }
          .header-title { font-size: 16px; font-weight: bold; color: #1e1b4b; }
          .today-highlight { background-color: #fef3c7; font-weight: bold; color: #92400e; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="17" class="header-title">${company.name} — Legal & Land Revenue Case Tracker</td></tr>
          <tr><td colspan="17">Generated on: ${new Date().toLocaleString()} | Filter: ${printMode === 'dossier' ? 'Single Case Dossier' : causeListFilter.toUpperCase()}</td></tr>
          <tr></tr>
          <tr>
            <th>Case Number</th>
            <th>Category</th>
            <th>Application # / Docket #</th>
            <th>Docket Date</th>
            <th>Party / Client Name</th>
            <th>Client Mobile</th>
            <th>Broker / Agent Name</th>
            <th>Opposite Party</th>
            <th>Court / Authority</th>
            <th>R.O. Name</th>
            <th>R.I. Name</th>
            <th>Deed # & Year</th>
            <th>Mouza & J.L. No</th>
            <th>Plot & Khatian</th>
            <th>Land Area</th>
            <th>Next Hearing Date</th>
            <th>Status</th>
          </tr>
    `;

    listToExport.forEach((c) => {
      const refCol = c.type === 'mutation'
        ? (c.applicationNo || '-')
        : c.type === 'misc_case'
        ? (c.docketNo || '-')
        : (c.rtiMemoNo || c.appealMemoNo || '-');

      const deedDesc = [c.deedNo ? `Deed: ${c.deedNo}` : '', c.deedYear ? `Yr: ${c.deedYear}` : ''].filter(Boolean).join(' / ');
      const mouzaDesc = [c.mouza || '', c.jlNo ? `(JL ${c.jlNo})` : ''].filter(Boolean).join(' ');
      const plotDesc = [c.plotNo ? `Plot: ${c.plotNo}` : '', c.khatianNo ? `Kh: ${c.khatianNo}` : ''].filter(Boolean).join(', ');

      tableHtml += `
        <tr>
          <td style="font-weight: bold; color: #4338ca;">${c.caseNo}</td>
          <td>${c.type.toUpperCase()}</td>
          <td><b>${refCol}</b></td>
          <td>${c.docketDate || '-'}</td>
          <td><b>${c.partyName}</b></td>
          <td>${c.partyPhone || ''}</td>
          <td>${c.brokerName || '-'}</td>
          <td>${c.oppositeParty || '-'}</td>
          <td>${c.courtOrAuthority}</td>
          <td>${c.roName || '-'}</td>
          <td>${c.riName || '-'}</td>
          <td>${deedDesc || '-'}</td>
          <td>${mouzaDesc || '-'}</td>
          <td>${plotDesc || '-'}</td>
          <td>${c.landArea || '-'}</td>
          <td class="${c.nextHearingDate === todayStr ? 'today-highlight' : ''}">${c.nextHearingDate || 'Not Scheduled'}</td>
          <td>${c.status.toUpperCase()}</td>
        </tr>
      `;
    });

    tableHtml += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SRK_Cases_${printMode === 'dossier' && selectedCase ? selectedCase.caseNo : causeListFilter}_${todayStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 no-print gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-200/70 rounded-lg">
              {selectedCase && (
                <button
                  onClick={() => setPrintMode('dossier')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    printMode === 'dossier'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>{t('Case Dossier & Order Sheet', 'কেস নথি ও আদেশনামা')}</span>
                </button>
              )}

              <button
                onClick={() => setPrintMode('cause_list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printMode === 'cause_list'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{t('Cause List / Court Register', 'কজ লিস্ট / আদালত রেজিস্টার')}</span>
              </button>
            </div>

            {printMode === 'cause_list' && (
              <select
                value={causeListFilter}
                onChange={(e) => setCauseListFilter(e.target.value as any)}
                className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg outline-none font-medium"
              >
                <option value="today">{t("Today's Hearings", "আজকের শুনানি")} ({cases.filter((c) => c.nextHearingDate === todayStr).length})</option>
                <option value="all">{t('All Cases', 'সকল কেস')} ({cases.length})</option>
                <option value="mutation">{t('Mutation Cases', 'মিউটেশন কেস')}</option>
                <option value="misc_case">{t('Misc Cases', 'মিস কেস')}</option>
                <option value="rti">{t('RTI Inquiries', 'আরটিআই আবেদন')}</option>
                <option value="lr_appeal">{t('LR Appeals', 'এলআর আপিল')}</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{t('Export Excel (.xls)', 'এক্সেলে ডাউনলোড (.xls)')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t('Print / Save as PDF', 'প্রিন্ট / PDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-100/50 flex justify-center">
          <div className="w-full max-w-[820px] bg-white p-8 sm:p-10 shadow-sm border border-slate-200 printable-area text-slate-800 text-xs">
            {/* Document Letterhead */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                    {company.name}
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">{company.tagline}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {company.address}, {company.city} — {company.pincode} · Ph: {company.phone}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
                    {printMode === 'dossier' ? 'LEGAL CASE DOSSIER' : 'COURT CAUSE LIST / ROSTER'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Generated: {todayStr}
                  </div>
                </div>
              </div>
            </div>

            {/* MODE 1: INDIVIDUAL CASE DOSSIER & ORDER SHEET */}
            {printMode === 'dossier' && selectedCase ? (
              <div className="space-y-5">
                {/* Case Summary Header Box */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-300">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                        Case Number
                      </span>
                      <span className="font-mono text-base font-bold text-indigo-900">
                        {selectedCase.caseNo}
                      </span>
                      <span className="text-[10px] block text-indigo-700 font-semibold uppercase mt-0.5">
                        {selectedCase.type.replace('_', ' ')}
                      </span>
                      {selectedCase.type === 'mutation' && selectedCase.applicationNo && (
                        <span className="text-[10px] font-mono text-purple-800 font-bold block mt-0.5">
                          App: {selectedCase.applicationNo}
                        </span>
                      )}
                      {selectedCase.type === 'misc_case' && selectedCase.docketNo && (
                        <span className="text-[10px] font-mono text-blue-800 font-bold block mt-0.5">
                          Docket: {selectedCase.docketNo}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                        Forum / Court / Authority
                      </span>
                      <span className="font-semibold text-slate-900 block">
                        {selectedCase.courtOrAuthority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Filing Date: {selectedCase.filingDate}
                      </span>
                      {selectedCase.docketDate && selectedCase.type === 'misc_case' && (
                        <span className="text-[10px] text-blue-900 font-mono font-bold block">
                          Docket Date: {selectedCase.docketDate}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                        Current Status
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                        {selectedCase.status.replace('_', ' ')}
                      </span>
                      {selectedCase.nextHearingDate && (
                        <span className="block font-mono text-amber-800 font-bold mt-1 text-[11px]">
                          Next Date: {selectedCase.nextHearingDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Subject / Matter
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {selectedCase.title}
                    </span>
                  </div>
                </div>

                {/* Parties Information & Broker Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Applicant / Client & Broker
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{selectedCase.partyName}</div>
                    {selectedCase.partyPhone && (
                      <div className="text-[11px] text-slate-600 font-mono">
                        Contact: {selectedCase.partyPhone}
                      </div>
                    )}
                    {selectedCase.brokerName && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-indigo-900 font-medium">
                        Broker / Agent: <b>{selectedCase.brokerName}</b>
                        {selectedCase.brokerPhone && (
                          <span className="text-slate-500 font-mono text-[10px] block">
                            Broker Mobile: {selectedCase.brokerPhone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Opposite Party / Designated Officers
                    </span>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedCase.oppositeParty || 'State / Proforma Respondent'}
                    </div>
                    {selectedCase.roName && (
                      <div className="text-[11px] text-slate-700 mt-1">
                        R.O. Name: <b>{selectedCase.roName}</b>
                      </div>
                    )}
                    {selectedCase.riName && (
                      <div className="text-[11px] text-slate-700">
                        R.I. Name: <b>{selectedCase.riName}</b>
                      </div>
                    )}
                    {selectedCase.lowerCourtCaseNo && (
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Lower Court Case: {selectedCase.lowerCourtCaseNo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Land & Property Schedule / Specific Domain Details */}
                {(selectedCase.mouza || selectedCase.plotNo || selectedCase.khatianNo || selectedCase.deedNo || selectedCase.landArea) && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-amber-50/50">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-2">
                      Schedule of Landed Property / Deed Identification
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Mouza:</span>
                        <span className="font-bold text-slate-900">{selectedCase.mouza || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">J.L. No.:</span>
                        <span className="font-bold text-slate-900">{selectedCase.jlNo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Plot / Dag No.:</span>
                        <span className="font-bold text-slate-900">{selectedCase.plotNo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Khatian No.:</span>
                        <span className="font-bold text-slate-900">{selectedCase.khatianNo || '—'}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-amber-200/70 flex flex-wrap gap-4 text-[10px] text-slate-700 font-mono">
                      {selectedCase.deedNo && (
                        <span>
                          Deed No: <b>{selectedCase.deedNo}</b>
                        </span>
                      )}
                      {selectedCase.deedYear && (
                        <span>
                          Deed Year: <b>{selectedCase.deedYear}</b>
                        </span>
                      )}
                      {selectedCase.landArea && (
                        <span>
                          Land Area: <b>{selectedCase.landArea}</b>
                        </span>
                      )}
                      {selectedCase.landClassification && (
                        <span>
                          Class: <b>{selectedCase.landClassification}</b>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* RTI Specific details */}
                {selectedCase.type === 'rti' && (
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Right to Information (RTI) Details
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Public Information Officer:</span>
                        <span className="font-semibold text-slate-900">{selectedCase.rtiOfficerOrPio || 'Designated SPIO'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Statutory 30-Day Deadline:</span>
                        <span className="font-mono font-bold text-amber-900">{selectedCase.rtiDeadlineDate || '30 days from filing'}</span>
                      </div>
                      {selectedCase.rtiIpoNo && (
                        <div>
                          <span className="text-slate-500 block">IPO / Fee Details:</span>
                          <span className="font-mono font-semibold text-slate-800">{selectedCase.rtiIpoNo}</span>
                        </div>
                      )}
                      {selectedCase.rtiFaaName && (
                        <div>
                          <span className="text-slate-500 block">First Appellate Authority:</span>
                          <span className="font-semibold text-slate-800">{selectedCase.rtiFaaName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LR Appeal details */}
                {selectedCase.type === 'lr_appeal' && selectedCase.stayOrderStatus && (
                  <div className="p-3 rounded-lg border border-rose-200 bg-rose-50">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900 mb-1">
                      Appellate Order & Stay Status
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Stay Order:</span>
                        <span className="font-bold text-rose-800">{selectedCase.stayOrderStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Impugned Order Date:</span>
                        <span className="font-mono font-bold text-slate-800">{selectedCase.lowerCourtOrderDate || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCase.remarks && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Case Notes & Advocate Observations
                    </span>
                    <p className="text-slate-700 leading-relaxed">{selectedCase.remarks}</p>
                  </div>
                )}

                {/* Hearing & Order Sheet Table */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-indigo-700" />
                    <span>Chronological Hearing Log & Order Sheet</span>
                  </div>

                  {selectedCase.hearings.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-300 rounded text-center text-slate-400 italic">
                      No hearings recorded yet. Case pending primary scrutiny.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 uppercase font-semibold">
                          <th className="py-2 px-3 border-r border-slate-300 w-24">Date</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-36">Purpose / Stage</th>
                          <th className="py-2 px-3 border-r border-slate-300">Order / Action Taken</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-28">Attended By</th>
                          <th className="py-2 px-3 w-24">Next Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedCase.hearings.map((h, i) => (
                          <tr key={h.id || i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                              {h.date}
                            </td>
                            <td className="py-2 px-3 font-semibold text-indigo-900 border-r border-slate-200">
                              {h.purpose}
                            </td>
                            <td className="py-2 px-3 text-slate-700 leading-snug border-r border-slate-200">
                              {h.outcome || 'Hearing conducted. Directions awaited.'}
                            </td>
                            <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                              {h.attendedBy || '—'}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-amber-900">
                              {h.nextHearingDate || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Signatures & Seal */}
                <div className="pt-8 flex justify-between items-end text-[11px] text-slate-600">
                  <div className="border-t border-slate-400 pt-2 w-48 text-center">
                    Prepared By / Clerk
                  </div>
                  <div className="border-t border-slate-400 pt-2 w-56 text-center font-bold text-slate-900">
                    Advocate / Authorized Signatory
                    <span className="block font-normal text-[10px] text-slate-500">{company.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* MODE 2: CAUSE LIST & MASTER COURT REGISTER */
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-300">
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase text-sm">
                      {causeListFilter === 'today'
                        ? `Today's Daily Cause List (${todayStr})`
                        : `${causeListFilter.replace('_', ' ').toUpperCase()} Case Register`}
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Total Listed Cases: <b>{causeListCases.length}</b>
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-500">
                    SRK ERP Legal Management
                  </div>
                </div>

                {causeListCases.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-300 rounded text-center text-slate-400 italic">
                    No cases match the selected filter.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 uppercase font-semibold">
                        <th className="py-2 px-2.5 border-r border-slate-300 w-10 text-center">Sl</th>
                        <th className="py-2 px-3 border-r border-slate-300 w-36">Case # / App / Docket</th>
                        <th className="py-2 px-3 border-r border-slate-300">Party & Broker</th>
                        <th className="py-2 px-3 border-r border-slate-300">Court / Officer</th>
                        <th className="py-2 px-3 border-r border-slate-300">Land & Deed Spec</th>
                        <th className="py-2 px-2.5 border-r border-slate-300 w-24 text-center">Hearing Date</th>
                        <th className="py-2 px-2.5 w-24 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {causeListCases.map((c, idx) => {
                        const ref = c.type === 'mutation' && c.applicationNo
                          ? `App: ${c.applicationNo}`
                          : c.type === 'misc_case' && c.docketNo
                          ? `Docket: ${c.docketNo} (${c.docketDate || ''})`
                          : '';

                        return (
                          <tr key={c.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="py-2 px-2 text-center font-mono text-slate-500 border-r border-slate-200">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200">
                              <span className="font-mono font-bold text-indigo-900 block">{c.caseNo}</span>
                              {ref && <span className="text-[10px] font-mono font-semibold text-slate-700 block">{ref}</span>}
                              <span className="text-[9px] uppercase font-semibold text-slate-500">
                                {c.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200">
                              <div className="font-bold text-slate-900">{c.partyName}</div>
                              {c.brokerName && (
                                <div className="text-[10px] text-indigo-700">Broker: {c.brokerName}</div>
                              )}
                              {c.oppositeParty && (
                                <div className="text-[10px] text-slate-500 truncate">vs {c.oppositeParty}</div>
                              )}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200">
                              <div className="font-medium text-slate-800 leading-tight">{c.courtOrAuthority}</div>
                              {c.roName && <div className="text-[10px] text-slate-500">RO: {c.roName}</div>}
                            </td>
                            <td className="py-2 px-3 font-mono text-[10px] border-r border-slate-200 text-slate-600">
                              {c.type === 'rti' ? (
                                <span>PIO: {c.rtiOfficerOrPio || 'SPIO'} (Exp: {c.rtiDeadlineDate || '30D'})</span>
                              ) : (
                                <div>
                                  {c.mouza && <div>Mouza: {c.mouza} {c.jlNo ? `(JL ${c.jlNo})` : ''}</div>}
                                  {c.plotNo && <div>Plot: {c.plotNo}</div>}
                                  {c.deedNo && <div>Deed: {c.deedNo} {c.deedYear ? `(${c.deedYear})` : ''}</div>}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-2.5 border-r border-slate-200 text-center font-mono font-bold">
                              <span className={c.nextHearingDate === todayStr ? 'text-amber-800 bg-amber-100 px-1 rounded' : 'text-slate-800'}>
                                {c.nextHearingDate || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="text-[10px] uppercase font-semibold text-slate-700">
                                {c.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                <div className="pt-8 flex justify-between items-end text-[11px] text-slate-500">
                  <div>SRK ERP Software Legal Management Roster</div>
                  <div className="border-t border-slate-400 pt-2 w-48 text-center font-bold text-slate-800">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
