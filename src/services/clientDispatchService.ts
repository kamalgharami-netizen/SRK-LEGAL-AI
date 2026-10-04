/**
 * Client Notification & Internet Dispatch Service
 * Automatically sends Bills (Invoices) and Case Status updates
 * to the client's registered mobile / WhatsApp via internet,
 * including a live view & print link.
 */

import { Transaction, LegalCase, Party, CompanyProfile } from '../types/erp';

export interface ClientNotificationLog {
  id: string;
  type: 'billing' | 'case_status';
  referenceNo: string;
  partyName: string;
  partyPhone: string;
  formattedDate: string;
  channel: 'WhatsApp & Internet SMS' | 'Internet Gateway';
  status: 'sent' | 'pending' | 'delivered';
  viewUrl: string;
  previewMessage: string;
}

const STORAGE_KEYS = {
  CLIENT_LOGS: 'srk_client_dispatch_logs',
  GATEWAY_URL: 'srk_sms_gateway_webhook_url',
  AUTO_SEND_ENABLED: 'srk_auto_send_client_notifications',
};

export class ClientDispatchService {
  /**
   * Check if auto-send is enabled (defaults to true)
   */
  static isAutoSendEnabled(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SEND_ENABLED);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  }

  static setAutoSendEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_SEND_ENABLED, enabled ? 'true' : 'false');
    } catch {}
  }

  /**
   * Get all dispatch logs
   */
  static getDispatchLogs(): ClientNotificationLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Append dispatch log
   */
  static appendLog(log: ClientNotificationLog): void {
    try {
      const logs = this.getDispatchLogs();
      const updated = [log, ...logs].slice(0, 300);
      localStorage.setItem(STORAGE_KEYS.CLIENT_LOGS, JSON.stringify(updated));
    } catch {}
  }

  /**
   * Get configured SMS/Internet gateway URL
   */
  static getGatewayUrl(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.GATEWAY_URL) || '';
    } catch {
      return '';
    }
  }

  static setGatewayUrl(url: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GATEWAY_URL, url.trim());
    } catch {}
  }

  /**
   * Generate clean Public View Link for client
   */
  static generateClientViewUrl(type: 'invoice' | 'case', id: string): string {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?view=${type}&id=${encodeURIComponent(id)}`;
  }

  /**
   * Clean and normalize phone number for WhatsApp / SMS
   */
  static normalizePhone(rawPhone?: string): string {
    if (!rawPhone) return '';
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  }

  /**
   * Automatically dispatch Bill / Invoice to registered mobile & WhatsApp
   */
  static async dispatchInvoiceNotification(
    tx: Transaction,
    party?: Party,
    company?: CompanyProfile,
    openWhatsAppDirect: boolean = true
  ): Promise<{ success: boolean; url: string; waUrl: string; message: string; log: ClientNotificationLog }> {
    const partyName = party?.name || tx.partyName || 'Valued Client';
    const rawPhone = party?.phone || tx.partyPhone || '';
    const cleanPhone = this.normalizePhone(rawPhone);
    const viewUrl = this.generateClientViewUrl('invoice', tx.id);
    const compName = company?.name || 'SRK ERP AND DAILY MANAGEMENT SOFTWARE';
    const currency = company?.currencySymbol || '₹';

    const textLines = [
      `*${compName}*`,
      `_Official Bill & Tax Invoice Receipt_`,
      ``,
      `Dear *${partyName}*,`,
      `Thank you for your business! Your bill has been generated successfully.`,
      ``,
      `📄 *Invoice No:* ${tx.invoiceNo}`,
      `📅 *Date:* ${tx.date}`,
      `💰 *Net Amount:* ${currency}${tx.grandTotal.toLocaleString('en-IN')}`,
      `💳 *Paid Amount:* ${currency}${tx.paidAmount.toLocaleString('en-IN')}`,
      `⚠️ *Balance Due:* ${currency}${tx.balanceDue.toLocaleString('en-IN')}`,
      tx.dueDate ? `⏳ *Due Date:* ${tx.dueDate}` : '',
      ``,
      `🔗 *Click below to View & Print your Official Bill:*`,
      `${viewUrl}`,
      ``,
      `For any queries or payments, please contact ${company?.phone || compName}.`,
    ].filter(Boolean);

    const message = textLines.join('\n');
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    const log: ClientNotificationLog = {
      id: `dispatch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'billing',
      referenceNo: tx.invoiceNo,
      partyName,
      partyPhone: cleanPhone || rawPhone || 'Registered Mobile',
      formattedDate: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      channel: 'WhatsApp & Internet SMS',
      status: 'sent',
      viewUrl,
      previewMessage: message,
    };

    this.appendLog(log);

    // 1. Send via Internet Gateway Webhook if configured
    const gatewayUrl = this.getGatewayUrl();
    if (gatewayUrl && gatewayUrl.startsWith('http')) {
      try {
        fetch(gatewayUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'invoice_billing',
            phone: cleanPhone,
            client: partyName,
            invoiceNo: tx.invoiceNo,
            total: tx.grandTotal,
            balance: tx.balanceDue,
            viewUrl,
            message,
          }),
        }).catch(() => {});
      } catch {}
    }

    // 2. Open WhatsApp Web or Mobile Client with pre-filled message & live print link
    if (openWhatsAppDirect && cleanPhone) {
      try {
        const a = document.createElement('a');
        a.href = waUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {}
    }

    return { success: true, url: viewUrl, waUrl, message, log };
  }

  /**
   * Automatically dispatch Case Status update to registered mobile & WhatsApp
   */
  static async dispatchCaseNotification(
    c: LegalCase,
    party?: Party,
    company?: CompanyProfile,
    openWhatsAppDirect: boolean = true
  ): Promise<{ success: boolean; url: string; waUrl: string; message: string; log: ClientNotificationLog }> {
    const partyName = party?.name || c.partyName || 'Client';
    const rawPhone = party?.phone || c.partyPhone || '';
    const cleanPhone = this.normalizePhone(rawPhone);
    const viewUrl = this.generateClientViewUrl('case', c.id);
    const compName = company?.name || 'SRK ERP AND DAILY MANAGEMENT SOFTWARE';

    // Status label formatting
    let statusLabel = c.status.toUpperCase();
    if (c.status === 'case_registered') statusLabel = '1) CASE REGISTERED (আবেদন নথিভুক্ত)';
    else if (c.status === 'hearing') statusLabel = '2) HEARING SCHEDULED (শুনানি নির্ধারিত)';
    else if (c.status === 'under_inquiry') statusLabel = '3) UNDER INQUIRY (আর.আই তদন্তাধীন)';
    else if (c.status === 'hearing_completed') statusLabel = '4) HEARING COMPLETED (শুনানি সম্পন্ন)';
    else if (c.status === 'disposed') statusLabel = '5) DISPOSED / ALLOWED (মিউটেশন নিষ্পত্তি)';
    else if (c.status === 'rejected') statusLabel = '6) REJECTED (আবেদন খারিজ)';

    const textLines = [
      `*${compName}*`,
      `_Legal Case & Mutation Status Update_`,
      ``,
      `Dear *${partyName}*,`,
      `Here is the latest live status update regarding your legal case:`,
      ``,
      `⚖️ *Case No:* ${c.caseNo}`,
      c.type === 'mutation' && c.applicationNo ? `📄 *Mutation App No:* ${c.applicationNo}` : '',
      `🏛️ *Authority / Forum:* ${c.courtOrAuthority}`,
      `📌 *Current Status:* ${statusLabel}`,
      c.status === 'hearing' && c.nextHearingDate ? `📅 *Date of Hearing:* ${c.nextHearingDate}` : '',
      c.status === 'under_inquiry' && c.riName ? `🔍 *Revenue Inspector (RI):* ${c.riName}` : '',
      c.status === 'under_inquiry' && c.riInquiryDate ? `🗓️ *Date of Inquiry by RI:* ${c.riInquiryDate}` : '',
      c.status === 'disposed' && c.khatianNo ? `📜 *Allotted Khatian No:* ${c.khatianNo}` : '',
      c.status === 'rejected' && c.rejectionReason ? `⚠️ *Reason of Rejection:* ${c.rejectionReason}` : '',
      c.mouza ? `📍 *Mouza & Plot:* ${c.mouza} (Plot: ${c.plotNo || '—'})` : '',
      ``,
      `🔗 *Click below to View & Print your Complete Case Dossier:*`,
      `${viewUrl}`,
      ``,
      `Thank you,`,
      `${compName}`,
    ].filter(Boolean);

    const message = textLines.join('\n');
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    const log: ClientNotificationLog = {
      id: `dispatch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'case_status',
      referenceNo: c.caseNo,
      partyName,
      partyPhone: cleanPhone || rawPhone || 'Registered Mobile',
      formattedDate: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      channel: 'WhatsApp & Internet SMS',
      status: 'sent',
      viewUrl,
      previewMessage: message,
    };

    this.appendLog(log);

    // 1. Post to Internet Gateway Webhook if configured
    const gatewayUrl = this.getGatewayUrl();
    if (gatewayUrl && gatewayUrl.startsWith('http')) {
      try {
        fetch(gatewayUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'case_status_update',
            phone: cleanPhone,
            client: partyName,
            caseNo: c.caseNo,
            status: c.status,
            viewUrl,
            message,
          }),
        }).catch(() => {});
      } catch {}
    }

    // 2. Open WhatsApp Web or Mobile Client with pre-filled message & live print link
    if (openWhatsAppDirect && cleanPhone) {
      try {
        const a = document.createElement('a');
        a.href = waUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {}
    }

    return { success: true, url: viewUrl, waUrl, message, log };
  }
}
