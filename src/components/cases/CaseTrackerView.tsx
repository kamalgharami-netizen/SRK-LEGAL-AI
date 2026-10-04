import React, { useState } from 'react';
import {
  Plus,
  Search,
  Scale,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  Share2,
  Trash2,
  CheckCircle2,
  Download,
  X,
  History,
  AlertCircle,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  Bell,
  Volume2,
  ArrowRight,
  Filter,
  Phone,
  Briefcase,
  FileCheck,
  Receipt,
} from 'lucide-react';
import { LegalCase, CaseType, CaseStatus, Party, HearingLog, CompanyProfile } from '../../types/erp';
import { CasePrintModal } from './CasePrintModal';
import { NotificationService } from '../../services/notificationService';
import { useLanguage } from '../../context/LanguageContext';

interface CaseTrackerViewProps {
  cases: LegalCase[];
  parties: Party[];
  company: CompanyProfile;
  initialSubTab?: string;
  onSaveCase: (c: LegalCase) => void;
  onDeleteCase: (id: string) => void;
  onAddHearing: (caseId: string, hearing: HearingLog, nextDate?: string) => void;
  onOpenPartyLedger?: (partyId: string) => void;
  onAddTaskForCase?: (caseId: string, caseNo: string, title: string, dueDate: string) => void;
  onOpenBillingForCase?: (c: LegalCase) => void;
  globalSearch: string;
}

export const CaseTrackerView: React.FC<CaseTrackerViewProps> = ({
  cases,
  parties,
  company,
  initialSubTab = 'all',
  onSaveCase,
  onDeleteCase,
  onAddHearing,
  onOpenPartyLedger,
  onAddTaskForCase,
  onOpenBillingForCase,
  globalSearch,
}) => {
  const { t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<'all' | 'mutation' | 'misc_case' | 'rti' | 'lr_appeal' | 'cause_list'>(
    (initialSubTab as any) || 'all'
  );

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveMenu(initialSubTab as any);
    }
  }, [initialSubTab]);
  const [statusFilter, setStatusFilter] = useState<'all' | CaseStatus>('all');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');

  // Selected Case for Details & Hearing Dates Alert Modal
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  // Add / Edit Case Modal State
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);

  // Print / PDF Dossier & Cause List Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalTargetCase, setPrintModalTargetCase] = useState<LegalCase | null>(null);
  const [printModalMode, setPrintModalMode] = useState<'dossier' | 'cause_list'>('dossier');

  // Core Form Fields
  const [formCaseNo, setFormCaseNo] = useState('');
  const [formType, setFormType] = useState<CaseType>('mutation');
  const [formTitle, setFormTitle] = useState('');
  const [formPartyId, setFormPartyId] = useState(parties[0]?.id || '');
  const [formOppositeParty, setFormOppositeParty] = useState('');
  const [formCourt, setFormCourt] = useState('Office of the BL&LRO');
  const [formFilingDate, setFormFilingDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNextHearingDate, setFormNextHearingDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [formStatus, setFormStatus] = useState<CaseStatus>('hearing_scheduled');

  // Intermediary / Broker & Contact
  const [formBrokerName, setFormBrokerName] = useState('');
  const [formBrokerPhone, setFormBrokerPhone] = useState('');

  // Mutation & General Application
  const [formApplicationNo, setFormApplicationNo] = useState('');
  const [formMutationType, setFormMutationType] = useState('Sale Deed Purchase');
  const [formRoName, setFormRoName] = useState('Revenue Officer (R.O.)');
  const [formRiName, setFormRiName] = useState('Revenue Inspector (R.I.)');
  const [formDeedNo, setFormDeedNo] = useState('');
  const [formDeedYear, setFormDeedYear] = useState(new Date().getFullYear().toString());
  const [formLandArea, setFormLandArea] = useState('');
  const [formLandClassification, setFormLandClassification] = useState('Bastu');

  // Misc Case specific: Docket No instead of Application No, Date of Docket
  const [formDocketNo, setFormDocketNo] = useState('');
  const [formDocketDate, setFormDocketDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMiscNature, setFormMiscNature] = useState('Demarcation & Boundary Injunction');

  // Land & Revenue fields
  const [formMouza, setFormMouza] = useState('');
  const [formJlNo, setFormJlNo] = useState('');
  const [formKhatianNo, setFormKhatianNo] = useState('');
  const [formPlotNo, setFormPlotNo] = useState('');

  // LR Appeal specific
  const [formAppealMemoNo, setFormAppealMemoNo] = useState('');
  const [formLowerCourtCaseNo, setFormLowerCourtCaseNo] = useState('');
  const [formLowerCourtOrderDate, setFormLowerCourtOrderDate] = useState('');
  const [formStayOrderStatus, setFormStayOrderStatus] = useState('Ad-Interim Stay Granted');

  // RTI fields
  const [formRtiOfficerOrPio, setFormRtiOfficerOrPio] = useState('');
  const [formRtiMemoNo, setFormRtiMemoNo] = useState('');
  const [formRtiFeeMode, setFormRtiFeeMode] = useState('IPO (Postal Order)');
  const [formRtiIpoNo, setFormRtiIpoNo] = useState('');
  const [formRtiFaaName, setFormRtiFaaName] = useState('');
  const [formRtiDeadline, setFormRtiDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [formRemarks, setFormRemarks] = useState('');

  // Add Hearing Log Modal
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [hearingTargetCase, setHearingTargetCase] = useState<LegalCase | null>(null);
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().split('T')[0]);
  const [hearingPurpose, setHearingPurpose] = useState('Hearing on Merit / Report Scrutiny');
  const [hearingOutcome, setHearingOutcome] = useState('');
  const [hearingNextDate, setHearingNextDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [hearingAttendedBy, setHearingAttendedBy] = useState('Advocate / Authorized Representative');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to compute hearing alert status for any case
  const getHearingAlert = (c: LegalCase) => {
    if (!c.nextHearingDate) {
      return { status: 'none', label: 'No Hearing Fixed', color: 'slate', days: null };
    }
    const diffTime = new Date(c.nextHearingDate).getTime() - new Date(todayStr).getTime();
    const days = Math.round(diffTime / (1000 * 3600 * 24));

    if (days === 0) {
      return { status: 'today', label: 'HEARING TODAY!', color: 'rose', days: 0 };
    }
    if (days < 0) {
      return { status: 'overdue', label: `${Math.abs(days)}d Overdue Date`, color: 'amber', days };
    }
    if (days <= 3) {
      return { status: 'urgent', label: `In ${days} day${days > 1 ? 's' : ''}`, color: 'amber', days };
    }
    if (days <= 7) {
      return { status: 'upcoming', label: `In ${days} days`, color: 'indigo', days };
    }
    return { status: 'scheduled', label: `In ${days} days`, color: 'slate', days };
  };

  // Helper for RTI 30-day statutory timer
  const getRtiAlert = (c: LegalCase) => {
    if (c.type !== 'rti' || !c.rtiDeadlineDate) return null;
    const diffTime = new Date(c.rtiDeadlineDate).getTime() - new Date(todayStr).getTime();
    const daysLeft = Math.round(diffTime / (1000 * 3600 * 24));
    return {
      daysLeft,
      isExpired: daysLeft < 0,
      isUrgent: daysLeft >= 0 && daysLeft <= 5,
    };
  };

  // Filter cases by menu type, status, party, and search
  const filteredCases = cases.filter((c) => {
    if (activeMenu === 'cause_list') {
      if (!c.nextHearingDate) return false;
    } else if (activeMenu !== 'all' && c.type !== activeMenu) {
      return false;
    }

    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (partyFilter !== 'all' && c.partyId !== partyFilter) return false;

    const query = (globalSearch || localSearch).trim().toLowerCase();
    if (query) {
      const matchNo = c.caseNo.toLowerCase().includes(query);
      const matchApp = (c.applicationNo || '').toLowerCase().includes(query);
      const matchDocket = (c.docketNo || '').toLowerCase().includes(query);
      const matchTitle = c.title.toLowerCase().includes(query);
      const matchParty = c.partyName.toLowerCase().includes(query);
      const matchBroker = (c.brokerName || '').toLowerCase().includes(query);
      const matchCourt = c.courtOrAuthority.toLowerCase().includes(query);
      const matchMouza = (c.mouza || '').toLowerCase().includes(query);
      const matchPlot = (c.plotNo || '').toLowerCase().includes(query);
      const matchDeed = (c.deedNo || '').toLowerCase().includes(query);
      const matchRo = (c.roName || '').toLowerCase().includes(query);
      const matchRi = (c.riName || '').toLowerCase().includes(query);
      if (
        !matchNo &&
        !matchApp &&
        !matchDocket &&
        !matchTitle &&
        !matchParty &&
        !matchBroker &&
        !matchCourt &&
        !matchMouza &&
        !matchPlot &&
        !matchDeed &&
        !matchRo &&
        !matchRi
      ) {
        return false;
      }
    }
    return true;
  });

  // KPI stats
  const totalMutation = cases.filter((c) => c.type === 'mutation').length;
  const totalMisc = cases.filter((c) => c.type === 'misc_case').length;
  const totalRti = cases.filter((c) => c.type === 'rti').length;
  const totalLrAppeal = cases.filter((c) => c.type === 'lr_appeal').length;
  const todayHearings = cases.filter((c) => c.nextHearingDate === todayStr);
  const urgentHearings = cases.filter((c) => {
    if (!c.nextHearingDate) return false;
    const diff = (new Date(c.nextHearingDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 3;
  });

  const openNewCaseModal = (defaultType?: CaseType) => {
    const typeToSet = defaultType || (activeMenu === 'all' || activeMenu === 'cause_list' ? 'mutation' : activeMenu);
    setEditingCase(null);
    setFormCaseNo(
      typeToSet === 'mutation'
        ? `MUT/2026/${Math.floor(1000 + Math.random() * 9000)}`
        : typeToSet === 'misc_case'
        ? `REV-MISC/2026/${Math.floor(100 + Math.random() * 900)}`
        : typeToSet === 'rti'
        ? `RTI/2026/${Math.floor(1000 + Math.random() * 9000)}`
        : `LRA/2026/${Math.floor(10 + Math.random() * 90)}`
    );
    setFormType(typeToSet);
    setFormTitle(
      typeToSet === 'mutation'
        ? 'Mutation & Record of Rights Regularization'
        : typeToSet === 'misc_case'
        ? 'Miscellaneous Revenue Boundary Petition'
        : typeToSet === 'rti'
        ? 'RTI Application for Certified Land Records'
        : 'Land Revenue Appeal under Sec 54'
    );
    setFormPartyId(parties[0]?.id || '');
    setFormOppositeParty('');
    setFormCourt(
      typeToSet === 'mutation'
        ? 'Office of the BL&LRO'
        : typeToSet === 'misc_case'
        ? 'Court of the Sub-Divisional Officer (SDO)'
        : typeToSet === 'rti'
        ? 'Office of the SPIO / Survey Dept'
        : 'Appellate Tribunal / DL&LRO Bench'
    );
    setFormFilingDate(todayStr);
    setFormNextHearingDate(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
    setFormStatus('hearing_scheduled');

    // Broker & Intermediary
    setFormBrokerName('');
    setFormBrokerPhone('');

    // Mutation specific
    setFormApplicationNo(
      typeToSet === 'mutation' ? `2026/01/MUT/${Math.floor(1000 + Math.random() * 9000)}` : ''
    );
    setFormMutationType('Sale Deed Purchase');
    setFormRoName('Revenue Officer, BL&LRO Office');
    setFormRiName('Revenue Inspector RI Circle');
    setFormDeedNo('');
    setFormDeedYear(new Date().getFullYear().toString());
    setFormLandArea('');
    setFormLandClassification('Bastu');

    // Misc Case specific: Docket No instead of Application No, Date of Docket
    setFormDocketNo(
      typeToSet === 'misc_case' ? `DKT/SDO/2026/${Math.floor(100 + Math.random() * 900)}` : ''
    );
    setFormDocketDate(todayStr);
    setFormMiscNature('Demarcation & Boundary Injunction');

    // Land records
    setFormMouza('');
    setFormJlNo('');
    setFormKhatianNo('');
    setFormPlotNo('');

    // LR Appeal
    setFormAppealMemoNo(
      typeToSet === 'lr_appeal' ? `APL-MEMO/2026/${Math.floor(10 + Math.random() * 90)}` : ''
    );
    setFormLowerCourtCaseNo('');
    setFormLowerCourtOrderDate('');
    setFormStayOrderStatus('Ad-Interim Stay Granted');

    // RTI
    setFormRtiOfficerOrPio('State Public Information Officer (SPIO)');
    setFormRtiMemoNo(
      typeToSet === 'rti' ? `MEMO/SPIO/2026/${Math.floor(100 + Math.random() * 900)}` : ''
    );
    setFormRtiFeeMode('Indian Postal Order (IPO)');
    setFormRtiIpoNo('');
    setFormRtiFaaName('First Appellate Authority / ADM');
    setFormRtiDeadline(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

    setFormRemarks('');
    setIsCaseModalOpen(true);
  };

  const openEditCaseModal = (c: LegalCase) => {
    setEditingCase(c);
    setFormCaseNo(c.caseNo);
    setFormType(c.type);
    setFormTitle(c.title);
    setFormPartyId(c.partyId);
    setFormOppositeParty(c.oppositeParty || '');
    setFormCourt(c.courtOrAuthority);
    setFormFilingDate(c.filingDate);
    setFormNextHearingDate(c.nextHearingDate || '');
    setFormStatus(c.status);

    // Broker
    setFormBrokerName(c.brokerName || '');
    setFormBrokerPhone(c.brokerPhone || '');

    // Mutation
    setFormApplicationNo(c.applicationNo || '');
    setFormMutationType(c.mutationType || 'Sale Deed Purchase');
    setFormRoName(c.roName || '');
    setFormRiName(c.riName || '');
    setFormDeedNo(c.deedNo || '');
    setFormDeedYear(c.deedYear || '');
    setFormLandArea(c.landArea || '');
    setFormLandClassification(c.landClassification || 'Bastu');

    // Misc Case: Docket No & Docket Date
    setFormDocketNo(c.docketNo || '');
    setFormDocketDate(c.docketDate || c.filingDate);
    setFormMiscNature(c.miscNature || 'Demarcation & Boundary Injunction');

    // Land
    setFormMouza(c.mouza || '');
    setFormJlNo(c.jlNo || '');
    setFormKhatianNo(c.khatianNo || '');
    setFormPlotNo(c.plotNo || '');

    // LR Appeal
    setFormAppealMemoNo(c.appealMemoNo || '');
    setFormLowerCourtCaseNo(c.lowerCourtCaseNo || '');
    setFormLowerCourtOrderDate(c.lowerCourtOrderDate || '');
    setFormStayOrderStatus(c.stayOrderStatus || 'Ad-Interim Stay Granted');

    // RTI
    setFormRtiOfficerOrPio(c.rtiOfficerOrPio || '');
    setFormRtiMemoNo(c.rtiMemoNo || '');
    setFormRtiFeeMode(c.rtiFeeMode || 'IPO (Postal Order)');
    setFormRtiIpoNo(c.rtiIpoNo || '');
    setFormRtiFaaName(c.rtiFaaName || '');
    setFormRtiDeadline(c.rtiDeadlineDate || '');

    setFormRemarks(c.remarks || '');
    setIsCaseModalOpen(true);
  };

  const handleSaveCaseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCaseNo.trim() || !formTitle.trim()) return;

    const party = parties.find((p) => p.id === formPartyId);

    const caseData: LegalCase = {
      id: editingCase ? editingCase.id : `case_${Date.now()}`,
      caseNo: formCaseNo.trim(),
      type: formType,
      title: formTitle.trim(),
      partyId: formPartyId,
      partyName: party?.name || 'Client',
      partyPhone: party?.phone,
      oppositeParty: formOppositeParty.trim(),
      courtOrAuthority: formCourt.trim(),
      filingDate: formFilingDate,
      nextHearingDate: formNextHearingDate || undefined,
      status: formStatus,

      // Broker & Intermediary
      brokerName: formBrokerName.trim() || undefined,
      brokerPhone: formBrokerPhone.trim() || undefined,

      // Mutation & General
      applicationNo: formType === 'mutation' ? formApplicationNo.trim() || undefined : undefined,
      mutationType: formType === 'mutation' ? formMutationType : undefined,
      roName: formRoName.trim() || undefined,
      riName: formRiName.trim() || undefined,
      deedNo: formDeedNo.trim() || undefined,
      deedYear: formDeedYear.trim() || undefined,
      landArea: formLandArea.trim() || undefined,
      landClassification: formLandClassification,

      // Misc Case specific: Docket No instead of Application No, Date of Docket
      docketNo: formType === 'misc_case' ? formDocketNo.trim() || undefined : undefined,
      docketDate: formType === 'misc_case' ? formDocketDate : undefined,
      miscNature: formType === 'misc_case' ? formMiscNature : undefined,

      // Land & Mouza
      mouza: formMouza.trim() || undefined,
      jlNo: formJlNo.trim() || undefined,
      khatianNo: formKhatianNo.trim() || undefined,
      plotNo: formPlotNo.trim() || undefined,

      // LR Appeal specific
      appealMemoNo: formType === 'lr_appeal' ? formAppealMemoNo.trim() || undefined : undefined,
      lowerCourtCaseNo: formType === 'lr_appeal' ? formLowerCourtCaseNo.trim() || undefined : undefined,
      lowerCourtOrderDate: formType === 'lr_appeal' ? formLowerCourtOrderDate || undefined : undefined,
      stayOrderStatus: formType === 'lr_appeal' ? formStayOrderStatus : undefined,

      // RTI specific
      rtiOfficerOrPio: formType === 'rti' ? formRtiOfficerOrPio.trim() || undefined : undefined,
      rtiMemoNo: formType === 'rti' ? formRtiMemoNo.trim() || undefined : undefined,
      rtiFeeMode: formType === 'rti' ? formRtiFeeMode : undefined,
      rtiIpoNo: formType === 'rti' ? formRtiIpoNo.trim() || undefined : undefined,
      rtiDeadlineDate: formType === 'rti' ? formRtiDeadline : undefined,
      rtiFaaName: formType === 'rti' ? formRtiFaaName.trim() || undefined : undefined,

      remarks: formRemarks.trim() || undefined,
      hearings: editingCase ? editingCase.hearings : [],
      createdAt: editingCase?.createdAt || new Date().toISOString(),
    };

    onSaveCase(caseData);
    setIsCaseModalOpen(false);

    // If we were inspecting this case, refresh
    if (selectedCase && selectedCase.id === caseData.id) {
      setSelectedCase(caseData);
    }
  };

  const handleOpenHearingModal = (c: LegalCase) => {
    setHearingTargetCase(c);
    setHearingDate(todayStr);
    setHearingPurpose('Hearing on Merit / Report Scrutiny');
    setHearingOutcome('');
    setHearingNextDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setHearingAttendedBy('Advocate / Authorized Representative');
    setIsHearingModalOpen(true);
  };

  const handleSaveHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingTargetCase) return;

    const hearing: HearingLog = {
      id: `h_${Date.now()}`,
      date: hearingDate,
      purpose: hearingPurpose.trim(),
      outcome: hearingOutcome.trim(),
      nextHearingDate: hearingNextDate,
      attendedBy: hearingAttendedBy.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddHearing(hearingTargetCase.id, hearing, hearingNextDate);
    setIsHearingModalOpen(false);

    if (selectedCase && selectedCase.id === hearingTargetCase.id) {
      setSelectedCase({
        ...selectedCase,
        nextHearingDate: hearingNextDate,
        hearings: [hearing, ...selectedCase.hearings],
      });
    }
  };

  const handleShareWhatsAppStatus = (c: LegalCase) => {
    const isToday = c.nextHearingDate === todayStr;
    const dateNotice = c.nextHearingDate
      ? `Next Hearing Date: ${c.nextHearingDate}${isToday ? ' (SCHEDULED FOR TODAY)' : ''}`
      : 'Hearing date will be notified soon';

    const refNo = c.type === 'mutation' && c.applicationNo
      ? `\nApplication No: ${c.applicationNo}`
      : c.type === 'misc_case' && c.docketNo
      ? `\nDocket No: ${c.docketNo} (Dt: ${c.docketDate || ''})`
      : '';

    const brokerText = c.brokerName ? `\nBroker / Agent: ${c.brokerName}` : '';

    const text = `Dear ${c.partyName},\n\nCase Status Update from ${company.name}:\n\nCase No: ${c.caseNo} (${c.type.toUpperCase()})${refNo}${brokerText}\nTitle: ${c.title}\nCourt / Authority: ${c.courtOrAuthority}\nStatus: ${c.status.toUpperCase()}\n${dateNotice}\n\nFor any queries or document submissions, please contact us.\n\nThank you!`;
    const cleanPhone = (c.partyPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Export cases to Excel (.xls XML format) with full fields
  const handleExportExcel = () => {
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
          <tr><td colspan="16" class="header-title">${company.name} — SRK ERP Legal Case Register</td></tr>
          <tr><td colspan="16">Category: ${activeMenu.toUpperCase()} | Generated: ${new Date().toLocaleString()}</td></tr>
          <tr></tr>
          <tr>
            <th>Case No</th>
            <th>Type</th>
            <th>App # / Docket #</th>
            <th>Docket Date</th>
            <th>Party / Client</th>
            <th>Client Mobile</th>
            <th>Broker Name</th>
            <th>Opposite Party</th>
            <th>Court / Authority</th>
            <th>R.O. Name</th>
            <th>R.I. Name</th>
            <th>Deed # & Year</th>
            <th>Mouza, J.L. & Plot</th>
            <th>Land Area</th>
            <th>Next Hearing Date</th>
            <th>Status</th>
          </tr>
    `;

    filteredCases.forEach((c) => {
      const refCol = c.type === 'mutation' ? (c.applicationNo || '-') : c.type === 'misc_case' ? (c.docketNo || '-') : (c.rtiMemoNo || c.appealMemoNo || '-');
      const deedDesc = [c.deedNo ? `Deed: ${c.deedNo}` : '', c.deedYear ? `Yr: ${c.deedYear}` : ''].filter(Boolean).join(' / ');
      const landDesc = [c.mouza ? `Mouza: ${c.mouza}` : '', c.jlNo ? `JL: ${c.jlNo}` : '', c.plotNo ? `Plot: ${c.plotNo}` : '', c.khatianNo ? `Kh: ${c.khatianNo}` : ''].filter(Boolean).join(', ');

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
          <td>${landDesc || '-'}</td>
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
    link.download = `SRK_Cases_${activeMenu}_${todayStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPrintDossier = (c: LegalCase) => {
    setPrintModalTargetCase(c);
    setPrintModalMode('dossier');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintCauseList = () => {
    setPrintModalTargetCase(null);
    setPrintModalMode('cause_list');
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('Legal & Land Revenue Case Tracker', 'ভূমি রাজস্ব ও আইনি মামলা ট্র্যাকিং')}
            </h1>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              SRK ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Mutation, Misc Cases (Docket No/Date), RTI Applications & LR Appeals linked with CRM Parties',
              'মিউটেশন (খারিজ), মিস কেস ডকেট, আরটিআই ও এল.আর. আপিল খতিয়ান'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel (.xls) */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t('Export Excel (.xls)', 'এক্সেলে ডাউনলোড (.xls)')}</span>
          </button>

          {/* Print / PDF Cause List */}
          <button
            onClick={handleOpenPrintCauseList}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('Cause List PDF', 'কজ লিস্ট প্রিন্ট')}</span>
          </button>

          {/* + New Case Entry */}
          <button
            onClick={() => openNewCaseModal()}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('+ New Case Entry (F3)', '+ নতুন মামলা যোগ (F3)')}</span>
          </button>
        </div>
      </div>

      {/* Today's / Urgent Hearing Alert Banner if any */}
      {todayHearings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-900 shrink-0 shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/90 text-amber-900">
                  Critical Hearing Alert Today
                </span>
                <span className="text-xs font-mono font-semibold text-amber-800">
                  {todayStr}
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-950 mt-1">
                {todayHearings.length} Case Hearing(s) Scheduled for Today
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                {todayHearings
                  .map((c) => `${c.caseNo} (${c.type.toUpperCase()}) — ${c.courtOrAuthority} [${c.partyName}${c.brokerName ? ` / Broker: ${c.brokerName}` : ''}]`)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                NotificationService.playAlertChime();
              }}
              title="Play Alert Chime"
              className="p-2 text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const first = todayHearings[0];
                if (first) setSelectedCase(first);
              }}
              className="h-8 px-3 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Inspect Hearing & Order Sheet →
            </button>
          </div>
        </div>
      )}

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Mutation */}
        <div
          onClick={() => setActiveMenu('mutation')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMenu === 'mutation'
              ? 'bg-purple-50/80 border-purple-400 shadow-xs ring-1 ring-purple-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold uppercase text-[11px] text-purple-900 font-mono">
              {t('Mutation', 'মিউটেশন')}
            </span>
            <span className="text-[10px] text-purple-700 font-mono font-bold">Sec 50 RoR</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-purple-950 tabular-nums">
            {totalMutation}
          </div>
          <span className="text-[11px] text-purple-700/80 block mt-0.5">
            {t('Broker, R.O. & R.I. records', 'দালাল, আর.ও. ও আর.আই.')}
          </span>
        </div>

        {/* Misc Case */}
        <div
          onClick={() => setActiveMenu('misc_case')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMenu === 'misc_case'
              ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold uppercase text-[11px] text-blue-900 font-mono">
              {t('Misc Case', 'মিস কেস')}
            </span>
            <span className="text-[10px] text-blue-700 font-mono font-bold">Docket System</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-blue-950 tabular-nums">
            {totalMisc}
          </div>
          <span className="text-[11px] text-blue-700/80 block mt-0.5">
            {t('Docket No & Date tracking', 'ডকেট নং ও তারিখ ট্র্যাকিং')}
          </span>
        </div>

        {/* RTI */}
        <div
          onClick={() => setActiveMenu('rti')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMenu === 'rti'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-1 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold uppercase text-[11px] text-amber-900 font-mono">
              {t('RTI Application', 'তথ্য অধিকার')}
            </span>
            <span className="text-[10px] text-amber-700 font-mono font-bold">30-Day Timer</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-950 tabular-nums">
            {totalRti}
          </div>
          <span className="text-[11px] text-amber-700/80 block mt-0.5">
            {t('Memo & SPIO monitoring', 'মেমো ও তথ্য কর্মকর্তা')}
          </span>
        </div>

        {/* LR Appeal */}
        <div
          onClick={() => setActiveMenu('lr_appeal')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMenu === 'lr_appeal'
              ? 'bg-rose-50/80 border-rose-400 shadow-xs ring-1 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold uppercase text-[11px] text-rose-900 font-mono">
              {t('LR Appeal', 'এল.আর. আপিল')}
            </span>
            <span className="text-[10px] text-rose-700 font-mono font-bold">Tribunal & SDO</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-950 tabular-nums">
            {totalLrAppeal}
          </div>
          <span className="text-[11px] text-rose-700/80 block mt-0.5">
            {t('Stay orders & lower court', 'স্থগিতাদেশ ও আপিল নির্দেশ')}
          </span>
        </div>
      </div>

      {/* Menu Sub-tabs & Advanced Filters Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Primary Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setActiveMenu('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeMenu === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('All Tracking', 'সমস্ত মামলা')} ({cases.length})
          </button>

          <button
            onClick={() => setActiveMenu('mutation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeMenu === 'mutation'
                ? 'bg-purple-700 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('Mutation', 'মিউটেশন')} ({totalMutation})
          </button>

          <button
            onClick={() => setActiveMenu('misc_case')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeMenu === 'misc_case'
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('Misc Case', 'মিস কেস')} ({totalMisc})
          </button>

          <button
            onClick={() => setActiveMenu('rti')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeMenu === 'rti'
                ? 'bg-amber-700 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('RTI', 'আরটিআই')} ({totalRti})
          </button>

          <button
            onClick={() => setActiveMenu('lr_appeal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeMenu === 'lr_appeal'
                ? 'bg-rose-700 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('LR Appeal', 'এল.আর. আপিল')} ({totalLrAppeal})
          </button>

          <button
            onClick={() => setActiveMenu('cause_list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeMenu === 'cause_list'
                ? 'bg-indigo-700 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>{t('Daily Cause List', 'দৈনিক কজ লিস্ট')}</span>
          </button>

          {/* Quick "+ New Case" Tab */}
          <button
            onClick={() => openNewCaseModal()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('+ New Case', '+ নতুন মামলা')}</span>
          </button>
        </div>

        {/* Right Filters: Party & Status */}
        <div className="flex items-center gap-2">
          {/* Party Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="h-8 max-w-[160px] px-2 text-xs bg-white border border-slate-300 rounded-lg outline-none font-medium truncate"
            >
              <option value="all">All Parties / Clients</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg outline-none font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="hearing_scheduled">Hearing Scheduled</option>
              <option value="filed">Filed / Under Process</option>
              <option value="scrutiny">Under Scrutiny</option>
              <option value="order_reserved">Order Reserved</option>
              <option value="disposed">Disposed / Allowed</option>
              <option value="dismissed">Dismissed</option>
              <option value="appealed">Appealed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Scannable Cases Table with Category-Tailored Columns */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by case #, app #, docket #, party, broker, deed..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>Showing {filteredCases.length} records</span>
            {urgentHearings.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                {urgentHearings.length} due this week
              </span>
            )}
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-12 text-center">
            <Scale className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">No case records found</div>
            <p className="text-xs text-slate-500 mt-1">
              Click below to record your first {activeMenu.replace('_', ' ')} tracking file.
            </p>
            <button
              onClick={() => openNewCaseModal()}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              + Add Case Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">{t('Case # & Ref', 'কেস ও রেফারেন্স নং')}</th>
                  <th className="py-2.5 px-3">{t('Party & Broker', 'মক্কেল ও দালাল')}</th>
                  <th className="py-2.5 px-3">
                    {activeMenu === 'mutation'
                      ? t('R.O. / R.I. Incharge', 'রেভিনিউ অফিসার ও ইন্সপেক্টর')
                      : activeMenu === 'misc_case'
                      ? t('Docket Date & Court', 'ডকেটের তারিখ ও আদালত')
                      : activeMenu === 'rti'
                      ? t('SPIO & IPO / Fee', 'তথ্য আধিকারিক ও ফি')
                      : t('Court / Authority', 'আদালত বা কর্তৃপক্ষ')}
                  </th>
                  <th className="py-2.5 px-3">
                    {activeMenu === 'mutation'
                      ? t('Deed # & Year / Area', 'দলিল নং, সন ও পরিমাণ')
                      : activeMenu === 'misc_case'
                      ? t('Opposite Party / Nature', 'বিবাদী ও মামলার ধরণ')
                      : activeMenu === 'rti'
                      ? t('30-Day Expiry', '৩০ দিনের সময়সীমা')
                      : t('Land / Impugned Ref', 'জমির বিবরণ ও নির্দেশ')}
                  </th>
                  <th className="py-2.5 px-3">{t('Mouza & Plot / JL', 'মৌজা, দাগ ও জে.এল.')}</th>
                  <th className="py-2.5 px-3">{t('Next Hearing / Alert', 'পরবর্তী শুনানি / সতর্কতা')}</th>
                  <th className="py-2.5 px-3 text-center">{t('Status', 'অবস্থা')}</th>
                  <th className="py-2.5 px-4 text-right">{t('Actions', 'পদক্ষেপ')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => {
                  const alert = getHearingAlert(c);
                  const rtiAlert = getRtiAlert(c);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        alert.status === 'today' ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Case No & Application / Docket Ref */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="font-mono font-bold text-indigo-700 hover:underline text-left block text-sm"
                        >
                          {c.caseNo}
                        </button>

                        {/* Mutation shows Application No */}
                        {c.type === 'mutation' && c.applicationNo && (
                          <span className="font-mono text-[10px] text-purple-700 font-semibold block">
                            App: {c.applicationNo}
                          </span>
                        )}

                        {/* Misc Case shows Docket No */}
                        {c.type === 'misc_case' && c.docketNo && (
                          <span className="font-mono text-[10px] text-blue-700 font-bold block">
                            Docket: {c.docketNo}
                          </span>
                        )}

                        {/* RTI shows Memo No */}
                        {c.type === 'rti' && c.rtiMemoNo && (
                          <span className="font-mono text-[10px] text-amber-700 font-semibold block">
                            Memo: {c.rtiMemoNo}
                          </span>
                        )}

                        {/* LR Appeal shows Appeal Memo */}
                        {c.type === 'lr_appeal' && c.appealMemoNo && (
                          <span className="font-mono text-[10px] text-rose-700 font-semibold block">
                            Memo: {c.appealMemoNo}
                          </span>
                        )}

                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                            c.type === 'mutation'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : c.type === 'misc_case'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : c.type === 'rti'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {c.type.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Party & Broker */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.partyName}</span>
                        </div>
                        {c.partyPhone && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Ph: {c.partyPhone}
                          </span>
                        )}

                        {/* Broker Name & Mobile */}
                        {c.brokerName && (
                          <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-indigo-700 font-medium flex items-center gap-1">
                            <Briefcase className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                            <span className="truncate">Broker: <b>{c.brokerName}</b></span>
                            {c.brokerPhone && <span className="font-mono text-slate-400">({c.brokerPhone})</span>}
                          </div>
                        )}
                      </td>

                      {/* Column 3: Context-aware (RO/RI for Mutation, Docket Date for Misc, SPIO for RTI) */}
                      <td className="py-3 px-3">
                        {c.type === 'mutation' ? (
                          <div>
                            <div className="font-medium text-slate-800 truncate max-w-[170px]" title={c.roName}>
                              <span className="text-slate-400 text-[10px]">RO:</span> {c.roName || 'Not designated'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[170px]" title={c.riName}>
                              <span className="text-slate-400">RI:</span> {c.riName || 'Not designated'}
                            </div>
                            <span className="text-[10px] text-purple-700 font-medium block">
                              {c.mutationType || 'Purchase'}
                            </span>
                          </div>
                        ) : c.type === 'misc_case' ? (
                          <div>
                            {c.docketDate && (
                              <div className="font-mono text-[11px] font-bold text-blue-900">
                                Docket Dt: {c.docketDate}
                              </div>
                            )}
                            <div className="text-slate-700 font-medium truncate max-w-[170px]" title={c.courtOrAuthority}>
                              {c.courtOrAuthority}
                            </div>
                          </div>
                        ) : c.type === 'rti' ? (
                          <div>
                            <div className="text-slate-800 font-medium truncate max-w-[170px]" title={c.rtiOfficerOrPio}>
                              {c.rtiOfficerOrPio || 'Designated SPIO'}
                            </div>
                            {c.rtiIpoNo && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                {c.rtiIpoNo}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-slate-800 font-medium truncate max-w-[170px]">
                              {c.courtOrAuthority}
                            </div>
                            {c.stayOrderStatus && (
                              <span className="text-[10px] font-bold text-rose-700 block">
                                {c.stayOrderStatus}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Context-aware (Deed # & Year for Mutation, Opp Party for Misc, 30D for RTI) */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {c.type === 'mutation' ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              Deed: {c.deedNo || '—'} {c.deedYear ? `(${c.deedYear})` : ''}
                            </div>
                            {c.landArea && (
                              <div className="text-[10px] text-slate-600">
                                Area: <b>{c.landArea}</b>
                              </div>
                            )}
                            {c.landClassification && (
                              <span className="text-[9px] uppercase px-1 rounded bg-slate-100 text-slate-600">
                                {c.landClassification}
                              </span>
                            )}
                          </div>
                        ) : c.type === 'misc_case' ? (
                          <div>
                            {c.oppositeParty && (
                              <div className="text-slate-800 font-sans font-semibold truncate max-w-[170px]">
                                vs {c.oppositeParty}
                              </div>
                            )}
                            {c.miscNature && (
                              <span className="text-[10px] font-sans text-slate-500 block truncate">
                                {c.miscNature}
                              </span>
                            )}
                          </div>
                        ) : c.type === 'rti' ? (
                          <div>
                            {c.rtiDeadlineDate && (
                              <span
                                className={`font-bold block ${
                                  rtiAlert?.isExpired
                                    ? 'text-rose-700'
                                    : rtiAlert?.isUrgent
                                    ? 'text-amber-700'
                                    : 'text-slate-800'
                                }`}
                              >
                                {c.rtiDeadlineDate}
                              </span>
                            )}
                            {rtiAlert && (
                              <span
                                className={`text-[10px] font-bold block ${
                                  rtiAlert.isExpired ? 'text-rose-600' : 'text-slate-500'
                                }`}
                              >
                                {rtiAlert.isExpired ? 'OVERDUE (File 1st Appeal)' : `${rtiAlert.daysLeft}d left`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            {c.lowerCourtCaseNo && (
                              <div className="text-[10px] text-slate-600">
                                L.Court: <b>{c.lowerCourtCaseNo}</b>
                              </div>
                            )}
                            {c.oppositeParty && (
                              <div className="text-slate-800 font-sans truncate max-w-[160px]">
                                vs {c.oppositeParty}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Mouza & Plot / J.L. No */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {c.mouza ? (
                          <div>
                            <div>Mouza: <span className="font-bold text-slate-900">{c.mouza}</span></div>
                            {c.jlNo && <div className="text-[10px] text-slate-500">J.L. No: {c.jlNo}</div>}
                            {c.plotNo && <div className="text-[10px] text-slate-800">Plot: {c.plotNo}</div>}
                            {c.khatianNo && <div className="text-[10px] text-slate-500">Kh: {c.khatianNo}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No land schedule</span>
                        )}
                      </td>

                      {/* Next Hearing / Alert */}
                      <td className="py-3 px-3 font-mono tabular-nums">
                        {c.nextHearingDate ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold ${
                                  alert.status === 'today'
                                    ? 'text-rose-700 text-sm'
                                    : alert.status === 'overdue'
                                    ? 'text-amber-800'
                                    : 'text-slate-900'
                                }`}
                              >
                                {c.nextHearingDate}
                              </span>
                            </div>

                            {/* Hearing Alert Pill */}
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 uppercase ${
                                alert.status === 'today'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : alert.status === 'overdue'
                                  ? 'bg-amber-100 text-amber-800'
                                  : alert.status === 'urgent'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {alert.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not Scheduled</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            c.status === 'disposed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'order_reserved'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : c.status === 'hearing_scheduled'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : c.status === 'dismissed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedCase(c)}
                            title="Inspect Case Details & Hearing Dates Alert"
                            className="px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleOpenHearingModal(c)}
                            title="Add Hearing Order / Next Date"
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                          >
                            + Hearing
                          </button>

                          <button
                            onClick={() => handleOpenPrintDossier(c)}
                            title="Print / Save PDF Case Dossier"
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleShareWhatsAppStatus(c)}
                            title="Send WhatsApp update to party"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => openEditCaseModal(c)}
                            title="Edit Case"
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete case #${c.caseNo}?`)) {
                                onDeleteCase(c.id);
                              }
                            }}
                            title="Delete Case"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL CASE DETAILS & HEARING DATES ALERT INSPECTOR MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-indigo-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-mono">
                      {selectedCase.caseNo}
                    </h3>
                    <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                      {selectedCase.type.replace('_', ' ')}
                    </span>
                    {selectedCase.type === 'mutation' && selectedCase.applicationNo && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                        App: {selectedCase.applicationNo}
                      </span>
                    )}
                    {selectedCase.type === 'misc_case' && selectedCase.docketNo && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        Docket: {selectedCase.docketNo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCase.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenBillingForCase && (
                  <button
                    onClick={() => {
                      onOpenBillingForCase(selectedCase);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs"
                    title={t('Generate Sale Bill / Fee Invoice for this Case in ERP Portion', 'ইআরপি অংশে এই মামলার জন্য সেল বিল বা ফি ইনভয়েস তৈরি করুন')}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>{t('+ Bill for Case (ERP)', '+ মামলার বিল (ইআরপি)')}</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenPrintDossier(selectedCase)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>{t('Print Dossier (PDF)', 'নথি প্রিন্ট (PDF)')}</span>
                </button>

                <button
                  onClick={() => handleShareWhatsAppStatus(selectedCase)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{t('WhatsApp Notice', 'হোয়াটসঅ্যাপ নোটিশ')}</span>
                </button>

                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* PROMINENT HEARING DATES ALERT BANNER */}
              {(() => {
                const alert = getHearingAlert(selectedCase);
                const rtiAlert = getRtiAlert(selectedCase);

                return (
                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alert.status === 'today'
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : alert.status === 'overdue'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : alert.status === 'urgent'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                          alert.status === 'today'
                            ? 'bg-rose-200 text-rose-900'
                            : alert.status === 'overdue'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-indigo-200 text-indigo-900'
                        }`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 font-mono">
                            {t('Hearing Alert System', 'শুনানির সতর্কতা সংকেত')}
                          </span>
                          <span className="text-xs font-mono font-bold">
                            {alert.label}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold mt-1">
                          {selectedCase.nextHearingDate
                            ? `${t('Next Hearing Date:', 'পরবর্তী শুনানির তারিখ:')} ${selectedCase.nextHearingDate} at ${selectedCase.courtOrAuthority}`
                            : t('Next hearing date has not been fixed yet', 'পরবর্তী শুনানির তারিখ এখনো নির্ধারিত হয়নি')}
                        </h4>
                        {selectedCase.type === 'misc_case' && selectedCase.docketDate && (
                          <p className="text-[11px] font-mono text-blue-900 font-semibold mt-0.5">
                            {t('Docket Registered on:', 'ডকেট দাখিলের তারিখ:')} {selectedCase.docketDate}
                          </p>
                        )}
                        {rtiAlert && (
                          <p className="text-[11px] mt-0.5 font-mono">
                            {t('RTI 30-Day Statutory Expiry:', 'আরটিআই ৩০ দিনের সংবিধিবদ্ধ সময়সীমা:')} <b>{selectedCase.rtiDeadlineDate}</b>{' '}
                            {rtiAlert.isExpired
                              ? t('(EXPIRED - First Appeal Required)', '(মেয়াদ উত্তীর্ণ - প্রথম আপিল প্রয়োজন)')
                              : `(${rtiAlert.daysLeft} ${t('days remaining', 'দিন বাকি')})`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => handleOpenHearingModal(selectedCase)}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                      >
                        {t('+ Record Hearing Order', '+ শুনানির আদেশ লিপিবদ্ধ করুন')}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Party & Broker Box */}
                <div>
                  <span className="text-slate-400 block font-medium">Party / Client Particulars:</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">{selectedCase.partyName}</span>
                  {selectedCase.partyPhone && (
                    <span className="text-slate-600 font-mono block">Mobile: {selectedCase.partyPhone}</span>
                  )}
                  {selectedCase.brokerName && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Broker / Middleman:</span>
                      <span className="font-bold text-indigo-900 block">{selectedCase.brokerName}</span>
                      {selectedCase.brokerPhone && (
                        <span className="text-slate-500 font-mono text-[10px]">Ph: {selectedCase.brokerPhone}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {onOpenPartyLedger && (
                      <button
                        onClick={() => {
                          setSelectedCase(null);
                          onOpenPartyLedger(selectedCase.partyId);
                        }}
                        className="text-indigo-600 hover:underline font-semibold text-[11px] inline-block"
                      >
                        View Party Ledger & Balance →
                      </button>
                    )}
                    {onOpenBillingForCase && (
                      <button
                        onClick={() => {
                          onOpenBillingForCase(selectedCase);
                        }}
                        className="text-emerald-700 hover:underline font-semibold text-[11px] inline-block"
                      >
                        + Create Bill for this Case →
                      </button>
                    )}
                  </div>
                </div>

                {/* Authority & Officers */}
                <div>
                  <span className="text-slate-400 block font-medium">Court / Forum / Officers:</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedCase.courtOrAuthority}</span>
                  <span className="text-slate-500 font-mono block">Filing Date: {selectedCase.filingDate}</span>

                  {selectedCase.roName && (
                    <div className="mt-1 text-slate-700">
                      <span className="text-slate-400">R.O. Name:</span> <b>{selectedCase.roName}</b>
                    </div>
                  )}
                  {selectedCase.riName && (
                    <div className="text-slate-700">
                      <span className="text-slate-400">R.I. Name:</span> <b>{selectedCase.riName}</b>
                    </div>
                  )}

                  {selectedCase.oppositeParty && (
                    <div className="text-slate-700 mt-1">
                      Opposite Party: <b>{selectedCase.oppositeParty}</b>
                    </div>
                  )}
                </div>

                {/* Case Numbers & Identifiers */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                    {selectedCase.type === 'mutation' && (
                      <>
                        <div>
                          <span className="text-slate-400 block font-sans">Application No:</span>
                          <span className="font-bold text-purple-900">{selectedCase.applicationNo || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Deed No & Year:</span>
                          <span className="font-bold text-slate-900">
                            {selectedCase.deedNo || '—'} {selectedCase.deedYear ? `(${selectedCase.deedYear})` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Land Area:</span>
                          <span className="font-bold text-slate-900">{selectedCase.landArea || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Classification:</span>
                          <span className="font-bold text-slate-900">{selectedCase.landClassification || 'Bastu'}</span>
                        </div>
                      </>
                    )}

                    {selectedCase.type === 'misc_case' && (
                      <>
                        <div>
                          <span className="text-slate-400 block font-sans">Docket No:</span>
                          <span className="font-bold text-blue-900">{selectedCase.docketNo || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Date of Docket:</span>
                          <span className="font-bold text-slate-900">{selectedCase.docketDate || selectedCase.filingDate}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block font-sans">Misc Case Nature:</span>
                          <span className="font-sans font-semibold text-slate-800">{selectedCase.miscNature || 'Demarcation'}</span>
                        </div>
                      </>
                    )}

                    {selectedCase.type === 'rti' && (
                      <>
                        <div>
                          <span className="text-slate-400 block font-sans">RTI Memo No:</span>
                          <span className="font-bold text-amber-900">{selectedCase.rtiMemoNo || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Fee / IPO No:</span>
                          <span className="font-bold text-slate-900">{selectedCase.rtiIpoNo || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">SPIO Officer:</span>
                          <span className="font-bold text-slate-900">{selectedCase.rtiOfficerOrPio || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">First Appellate Auth:</span>
                          <span className="font-bold text-slate-900">{selectedCase.rtiFaaName || '—'}</span>
                        </div>
                      </>
                    )}

                    {selectedCase.type === 'lr_appeal' && (
                      <>
                        <div>
                          <span className="text-slate-400 block font-sans">Appeal Memo No:</span>
                          <span className="font-bold text-rose-900">{selectedCase.appealMemoNo || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Lower Court Case:</span>
                          <span className="font-bold text-slate-900">{selectedCase.lowerCourtCaseNo || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Lower Court Order Dt:</span>
                          <span className="font-bold text-slate-900">{selectedCase.lowerCourtOrderDate || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Stay Status:</span>
                          <span className="font-bold text-rose-700">{selectedCase.stayOrderStatus || 'Granted'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Land Records */}
                {(selectedCase.mouza || selectedCase.plotNo || selectedCase.khatianNo) && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block font-medium">Land & Revenue Schedule:</span>
                    <div className="flex flex-wrap gap-4 font-mono text-slate-800 mt-1">
                      {selectedCase.mouza && (
                        <span>
                          Mouza: <b>{selectedCase.mouza}</b>
                        </span>
                      )}
                      {selectedCase.jlNo && (
                        <span>
                          J.L. No: <b>{selectedCase.jlNo}</b>
                        </span>
                      )}
                      {selectedCase.plotNo && (
                        <span>
                          Plot/Dag No: <b>{selectedCase.plotNo}</b>
                        </span>
                      )}
                      {selectedCase.khatianNo && (
                        <span>
                          Khatian No: <b>{selectedCase.khatianNo}</b>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedCase.remarks && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Remarks / Case Background:</span>
                  {selectedCase.remarks}
                </div>
              )}

              {/* Complete Hearing Dates Timeline & Order Log */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="h-4 w-4 text-indigo-600" />
                    <span>Chronological Hearing Dates & Order History</span>
                  </h4>

                  <button
                    onClick={() => handleOpenHearingModal(selectedCase)}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    + Record Hearing
                  </button>
                </div>

                {selectedCase.hearings.length === 0 ? (
                  <div className="p-6 rounded-lg border border-dashed border-slate-300 text-center text-slate-400 italic">
                    No hearings recorded yet. Click "+ Record Hearing" to enter initial scrutiny or hearing order.
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedCase.hearings.map((h, i) => (
                      <div key={h.id || i} className="relative pl-8 space-y-1">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-xs"></div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{h.date}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-indigo-700">{h.purpose}</span>
                        </div>
                        {h.outcome && (
                          <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                            {h.outcome}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          {h.attendedBy && <span>Attended: {h.attendedBy}</span>}
                          {h.nextHearingDate && (
                            <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                              Next Date Fixed: {h.nextHearingDate}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Case Modal */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingCase ? `Edit Case: ${editingCase.caseNo}` : 'Add New Case Tracking File'}
                </h3>
              </div>
              <button
                onClick={() => setIsCaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaseForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Case Category *</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const newT = e.target.value as CaseType;
                      setFormType(newT);
                      if (newT === 'misc_case' && !formDocketNo) {
                        setFormDocketNo(`DKT/SDO/2026/${Math.floor(100 + Math.random() * 900)}`);
                        setFormDocketDate(todayStr);
                      }
                      if (newT === 'mutation' && !formApplicationNo) {
                        setFormApplicationNo(`2026/01/MUT/${Math.floor(1000 + Math.random() * 9000)}`);
                      }
                    }}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
                  >
                    <option value="mutation">Mutation Case (Land Record)</option>
                    <option value="misc_case">Misc Revenue Case (SDO Docket)</option>
                    <option value="rti">RTI Application (Survey / Records)</option>
                    <option value="lr_appeal">LR Appeal (Tribunal / DL&LRO)</option>
                  </select>
                </div>

                {/* Case Number */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Case Number *</label>
                  <input
                    type="text"
                    required
                    value={formCaseNo}
                    onChange={(e) => setFormCaseNo(e.target.value)}
                    placeholder="e.g. MUT/2026/0842"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-bold"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CaseStatus)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="hearing_scheduled">Hearing Scheduled</option>
                    <option value="filed">Filed / Under Process</option>
                    <option value="scrutiny">Under Scrutiny</option>
                    <option value="order_reserved">Order Reserved</option>
                    <option value="disposed">Disposed / Allowed</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="appealed">Appealed</option>
                  </select>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Subject / Case Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Mutation & Correction of Record-of-Rights"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                {/* Party / Client */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Party / Client (CRM) *</label>
                  <select
                    value={formPartyId}
                    onChange={(e) => setFormPartyId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-medium"
                  >
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone || p.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Broker Name ("brocker name") */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Broker / Agent / Mohurrir Name
                  </label>
                  <input
                    type="text"
                    value={formBrokerName}
                    onChange={(e) => setFormBrokerName(e.target.value)}
                    placeholder="e.g. Subhasish Mandal"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                {/* Broker Phone */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Broker Contact Mobile
                  </label>
                  <input
                    type="text"
                    value={formBrokerPhone}
                    onChange={(e) => setFormBrokerPhone(e.target.value)}
                    placeholder="e.g. 9830114477"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>

                {/* Authority */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Court / Forum / Authority *</label>
                  <input
                    type="text"
                    required
                    value={formCourt}
                    onChange={(e) => setFormCourt(e.target.value)}
                    placeholder="e.g. Office of the BL&LRO (Circle 2)"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                {/* Filing Date */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={formFilingDate}
                    onChange={(e) => setFormFilingDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>

                {/* Next Hearing Date */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next Hearing Date</label>
                  <input
                    type="date"
                    value={formNextHearingDate}
                    onChange={(e) => setFormNextHearingDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-bold text-indigo-700"
                  />
                </div>

                {/* Opposite Party */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Opposite Party (If any)</label>
                  <input
                    type="text"
                    value={formOppositeParty}
                    onChange={(e) => setFormOppositeParty(e.target.value)}
                    placeholder="e.g. State or Co-sharers"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* MUTATION SPECIFIC SECTION */}
              {formType === 'mutation' && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                  <div className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-purple-700" />
                    <span>Mutation Application & Officer Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Application Number *
                      </label>
                      <input
                        type="text"
                        value={formApplicationNo}
                        onChange={(e) => setFormApplicationNo(e.target.value)}
                        placeholder="e.g. 2026/01/MUT/0842"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold text-purple-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        R.O. Name (Revenue Officer)
                      </label>
                      <input
                        type="text"
                        value={formRoName}
                        onChange={(e) => setFormRoName(e.target.value)}
                        placeholder="e.g. Sri Animesh Roy, WBLS"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        R.I. Name (Revenue Inspector)
                      </label>
                      <input
                        type="text"
                        value={formRiName}
                        onChange={(e) => setFormRiName(e.target.value)}
                        placeholder="e.g. Kalyanpur GP RI Office"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Registered Deed No.
                      </label>
                      <input
                        type="text"
                        value={formDeedNo}
                        onChange={(e) => setFormDeedNo(e.target.value)}
                        placeholder="e.g. I-4921"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Deed Registration Year
                      </label>
                      <input
                        type="text"
                        value={formDeedYear}
                        onChange={(e) => setFormDeedYear(e.target.value)}
                        placeholder="e.g. 2025"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Land Area / Share
                      </label>
                      <input
                        type="text"
                        value={formLandArea}
                        onChange={(e) => setFormLandArea(e.target.value)}
                        placeholder="e.g. 0.08 Acre (5.5 Dec)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MISC CASE SPECIFIC: DOCKET NO INSTEAD OF APPLICATION NO, DATE OF DOCKET */}
              {formType === 'misc_case' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                  <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-700" />
                    <span>Misc Case Docket Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Docket Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formDocketNo}
                        onChange={(e) => setFormDocketNo(e.target.value)}
                        placeholder="e.g. DKT/SDO/2026/0914"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold text-blue-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Date of Docket *
                      </label>
                      <input
                        type="date"
                        required
                        value={formDocketDate}
                        onChange={(e) => setFormDocketDate(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Nature of Misc Case
                      </label>
                      <input
                        type="text"
                        value={formMiscNature}
                        onChange={(e) => setFormMiscNature(e.target.value)}
                        placeholder="e.g. Demarcation / 144 CrPC / Sec 4C"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RTI SPECIFIC SECTION */}
              {formType === 'rti' && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                  <div className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-700" />
                    <span>RTI Application & Statutory Window</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        RTI Application / Memo No.
                      </label>
                      <input
                        type="text"
                        value={formRtiMemoNo}
                        onChange={(e) => setFormRtiMemoNo(e.target.value)}
                        placeholder="e.g. MEMO/SPIO/2026/81"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Designated SPIO Officer Name
                      </label>
                      <input
                        type="text"
                        value={formRtiOfficerOrPio}
                        onChange={(e) => setFormRtiOfficerOrPio(e.target.value)}
                        placeholder="e.g. Sri P.K. Das, SPIO & Dy DL&LRO"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Statutory 30-Day Deadline *
                      </label>
                      <input
                        type="date"
                        value={formRtiDeadline}
                        onChange={(e) => setFormRtiDeadline(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold text-amber-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        IPO / Fee Stamp Number
                      </label>
                      <input
                        type="text"
                        value={formRtiIpoNo}
                        onChange={(e) => setFormRtiIpoNo(e.target.value)}
                        placeholder="e.g. IPO-64F-982144 (₹10)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        First Appellate Authority (FAA)
                      </label>
                      <input
                        type="text"
                        value={formRtiFaaName}
                        onChange={(e) => setFormRtiFaaName(e.target.value)}
                        placeholder="e.g. Additional District Magistrate (LR) / Appellate Authority"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* LR APPEAL SPECIFIC SECTION */}
              {formType === 'lr_appeal' && (
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3">
                  <div className="font-bold text-rose-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-rose-700" />
                    <span>LR Appeal & Impugned Case Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Memo of Appeal No.
                      </label>
                      <input
                        type="text"
                        value={formAppealMemoNo}
                        onChange={(e) => setFormAppealMemoNo(e.target.value)}
                        placeholder="e.g. APL-MEMO/2026/22"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono font-bold text-rose-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Lower Court Impugned Case No.
                      </label>
                      <input
                        type="text"
                        value={formLowerCourtCaseNo}
                        onChange={(e) => setFormLowerCourtCaseNo(e.target.value)}
                        placeholder="e.g. BL&LRO Mutation Case MUT/2025/1102"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Lower Court Order Date
                      </label>
                      <input
                        type="date"
                        value={formLowerCourtOrderDate}
                        onChange={(e) => setFormLowerCourtOrderDate(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Ad-Interim Stay Status
                      </label>
                      <select
                        value={formStayOrderStatus}
                        onChange={(e) => setFormStayOrderStatus(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded outline-none font-semibold text-rose-800"
                      >
                        <option value="Ad-Interim Stay Granted">Ad-Interim Stay Granted</option>
                        <option value="Stay Pending Hearing">Stay Pending Hearing</option>
                        <option value="Stay Rejected">Stay Rejected</option>
                        <option value="Vacated">Vacated</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Land Records: Mouza, JL, Khatian, Plot */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Land & Revenue Identification (Mouza, J.L. No, Plot, Khatian)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Mouza Name</label>
                    <input
                      type="text"
                      value={formMouza}
                      onChange={(e) => setFormMouza(e.target.value)}
                      placeholder="e.g. Kalyanpur"
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">J.L. No. *</label>
                    <input
                      type="text"
                      value={formJlNo}
                      onChange={(e) => setFormJlNo(e.target.value)}
                      placeholder="e.g. 42"
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Plot / Dag No.</label>
                    <input
                      type="text"
                      value={formPlotNo}
                      onChange={(e) => setFormPlotNo(e.target.value)}
                      placeholder="e.g. 714/1208"
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Khatian No.</label>
                    <input
                      type="text"
                      value={formKhatianNo}
                      onChange={(e) => setFormKhatianNo(e.target.value)}
                      placeholder="e.g. LR 389"
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks / Case Background Notes</label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Record summary, order sheet instructions, broker notes, or advocate remarks..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Hearing Outcome Modal */}
      {isHearingModalOpen && hearingTargetCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Hearing & Order</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {hearingTargetCase.caseNo} — {hearingTargetCase.courtOrAuthority}
                </p>
              </div>
              <button
                onClick={() => setIsHearingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHearing} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hearing Date *</label>
                  <input
                    type="date"
                    required
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next Hearing Date</label>
                  <input
                    type="date"
                    value={hearingNextDate}
                    onChange={(e) => setHearingNextDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Purpose / Stage *</label>
                <input
                  type="text"
                  required
                  value={hearingPurpose}
                  onChange={(e) => setHearingPurpose(e.target.value)}
                  placeholder="e.g. Scrutiny, Spot Verification, Rejoinder, Argument"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Outcome / Order Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={hearingOutcome}
                  onChange={(e) => setHearingOutcome(e.target.value)}
                  placeholder="Summary of bench order, directions to Amin/parties, or judgment..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Attended By</label>
                <input
                  type="text"
                  value={hearingAttendedBy}
                  onChange={(e) => setHearingAttendedBy(e.target.value)}
                  placeholder="e.g. Adv. Sengupta / Authorized Agent"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHearingModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Hearing Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Print / PDF Modal */}
      <CasePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedCase={printModalTargetCase}
        cases={cases}
        company={company}
        initialMode={printModalMode}
      />
    </div>
  );
};
