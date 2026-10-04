/**
 * Device Authentication & Login Notification Service
 * Manages first-time mobile registration, login audit trail,
 * and forwarding login alerts to kamalgharami@gmail.com & Google Sheets.
 */

export interface DeviceLoginRecord {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // "04 Oct 2026, 03:15:30 PM"
  mobile: string;
  userName: string;
  deviceType: string;
  os: string;
  browser: string;
  screen: string;
  ip: string;
  location: string;
  timezone: string;
  notificationStatus: 'sent' | 'pending' | 'failed' | 'offline';
  emailTarget: string; // "kamalgharami@gmail.com"
  sheetSyncStatus: 'synced' | 'local_only' | 'pending';
}

export interface RegisteredUser {
  mobile: string;
  name: string;
  businessName?: string;
  deviceId: string;
  registeredAt: string;
}

const STORAGE_KEYS = {
  REGISTERED: 'srk_device_registered',
  USER: 'srk_registered_user',
  LOGIN_LOGS: 'srk_device_login_logs',
  SHEET_WEBHOOK: 'srk_google_sheet_webhook_url',
};

const TARGET_EMAIL = 'kamalgharami@gmail.com';

export class DeviceAuthService {
  /**
   * Check if device has been registered on first run
   */
  static isRegistered(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.REGISTERED) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Get registered user details
   */
  static getRegisteredUser(): RegisteredUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get all login history records (row-wise stored for Google Sheets)
   */
  static getLoginHistory(): DeviceLoginRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get configured Google Sheets Webhook URL
   */
  static getGoogleSheetWebhook(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.SHEET_WEBHOOK) || '';
    } catch {
      return '';
    }
  }

  /**
   * Set Google Sheets Webhook URL
   */
  static setGoogleSheetWebhook(url: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SHEET_WEBHOOK, url.trim());
    } catch {}
  }

  /**
   * Auto-detect environment, OS, browser, screen & device fingerprint
   */
  static detectDeviceInfo(): {
    os: string;
    browser: string;
    deviceType: string;
    screen: string;
    timezone: string;
    deviceId: string;
  } {
    const ua = navigator.userAgent || '';
    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    let browser = 'Browser';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';

    // Electron check
    if (ua.includes('Electron')) {
      browser = 'Electron Windows Desktop App';
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const deviceType = isMobile ? 'Mobile Phone / Tablet' : 'Desktop / PC';
    const screen = `${window.screen.width}x${window.screen.height} (${window.innerWidth}x${window.innerHeight} viewport)`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    let deviceId = '';
    try {
      deviceId = localStorage.getItem('srk_device_unique_id') || '';
      if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem('srk_device_unique_id', deviceId);
      }
    } catch {
      deviceId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    return { os, browser, deviceType, screen, timezone, deviceId };
  }

  /**
   * Fetch current public IP and location details
   */
  static async fetchIpAndLocation(): Promise<{ ip: string; location: string }> {
    try {
      // Try fast IP fetch with 2.5s timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const ip = data.ip || 'Local/Network';
        const locParts = [data.city, data.region, data.country_name].filter(Boolean);
        return {
          ip,
          location: locParts.join(', ') || 'West Bengal, India',
        };
      }
    } catch {}

    // Fallback IP check
    try {
      const res2 = await fetch('https://api.ipify.org?format=json');
      if (res2.ok) {
        const data2 = await res2.json();
        return { ip: data2.ip || 'Online/Connected', location: 'India (Detected)' };
      }
    } catch {}

    return { ip: 'Offline / Intranet', location: 'Local Device' };
  }

  /**
   * Register device on first time run
   */
  static async registerDevice(
    mobile: string,
    name: string = 'SRK User / Advocate',
    businessName: string = 'Advocate Office'
  ): Promise<DeviceLoginRecord> {
    const cleanMobile = mobile.trim().replace(/\s+/g, '');
    const cleanName = name.trim() || 'Advocate / Business User';
    const deviceInfo = this.detectDeviceInfo();
    const { ip, location } = await this.fetchIpAndLocation();

    const user: RegisteredUser = {
      mobile: cleanMobile,
      name: cleanName,
      businessName: businessName.trim(),
      deviceId: deviceInfo.deviceId,
      registeredAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}

    // Create login record
    const record: DeviceLoginRecord = {
      id: `login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
      mobile: cleanMobile,
      userName: cleanName,
      deviceType: deviceInfo.deviceType,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      screen: deviceInfo.screen,
      ip,
      location,
      timezone: deviceInfo.timezone,
      notificationStatus: 'pending',
      emailTarget: TARGET_EMAIL,
      sheetSyncStatus: 'local_only',
    };

    // Save record to local login audit history
    this.appendLoginRecord(record);

    // Forward notification to kamalgharami@gmail.com
    this.dispatchLoginNotification(record);

    return record;
  }

  /**
   * Record every login session
   */
  static async recordLoginSession(): Promise<DeviceLoginRecord | null> {
    const user = this.getRegisteredUser();
    if (!user) return null;

    const deviceInfo = this.detectDeviceInfo();
    const { ip, location } = await this.fetchIpAndLocation();

    const record: DeviceLoginRecord = {
      id: `login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
      mobile: user.mobile,
      userName: user.name || 'Advocate / Business User',
      deviceType: deviceInfo.deviceType,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      screen: deviceInfo.screen,
      ip,
      location,
      timezone: deviceInfo.timezone,
      notificationStatus: 'pending',
      emailTarget: TARGET_EMAIL,
      sheetSyncStatus: 'local_only',
    };

    this.appendLoginRecord(record);
    this.dispatchLoginNotification(record);
    return record;
  }

  /**
   * Append login record to local history
   */
  private static appendLoginRecord(record: DeviceLoginRecord): void {
    try {
      const history = this.getLoginHistory();
      // Keep up to 500 recent login sessions
      const updated = [record, ...history].slice(0, 500);
      localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(updated));
    } catch {}
  }

  /**
   * Update status of a specific login record
   */
  static updateRecordStatus(
    id: string,
    notificationStatus: 'sent' | 'failed' | 'offline',
    sheetSyncStatus: 'synced' | 'local_only' | 'pending'
  ): void {
    try {
      const history = this.getLoginHistory();
      const idx = history.findIndex((h) => h.id === id);
      if (idx >= 0) {
        history[idx].notificationStatus = notificationStatus;
        history[idx].sheetSyncStatus = sheetSyncStatus;
        localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(history));
      }
    } catch {}
  }

  /**
   * Forward login notification to kamalgharami@gmail.com and post to Google Sheets
   */
  static async dispatchLoginNotification(record: DeviceLoginRecord): Promise<void> {
    // 1. Send Email Notification to kamalgharami@gmail.com via FormSubmit AJAX service
    try {
      const emailPayload = {
        _subject: `🚨 New Login Alert: SRK Legal AI / Vyapar (Mobile: ${record.mobile})`,
        _replyto: 'no-reply@srklegal.ai',
        _template: 'table',
        'Mobile Number': record.mobile,
        'User / Advocate Name': record.userName,
        'Login Date & Time': record.formattedDate,
        'Device Type': record.deviceType,
        'Operating System': record.os,
        'Browser / Client': record.browser,
        'IP Address': record.ip,
        'Approx Location': record.location,
        'Screen Viewport': record.screen,
        'Timezone': record.timezone,
        'Software Version': 'SRK Legal AI 2.0 (Windows/Web)',
      };

      const emailPromise = fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      // 2. Post to Google Sheet Webhook if configured
      const sheetWebhook = this.getGoogleSheetWebhook();
      let sheetPromise: Promise<any> | null = null;
      if (sheetWebhook && sheetWebhook.startsWith('http')) {
        sheetPromise = fetch(sheetWebhook, {
          method: 'POST',
          mode: 'no-cors', // allows posting to Google Apps Script web apps without CORS block
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: record.formattedDate,
            mobile: record.mobile,
            name: record.userName,
            device: record.deviceType,
            os: record.os,
            browser: record.browser,
            ip: record.ip,
            location: record.location,
            screen: record.screen,
            status: 'Authorized Login',
          }),
        });
      }

      // Await email
      const emailRes = await emailPromise;
      if (emailRes.ok) {
        this.updateRecordStatus(record.id, 'sent', sheetWebhook ? 'synced' : 'local_only');
      } else {
        this.updateRecordStatus(record.id, 'offline', sheetWebhook ? 'synced' : 'local_only');
      }

      if (sheetPromise) {
        await sheetPromise.catch(() => {});
        this.updateRecordStatus(record.id, 'sent', 'synced');
      }
    } catch (err) {
      this.updateRecordStatus(record.id, 'offline', 'local_only');
    }
  }

  /**
   * Export all login rows formatted for Google Sheets (CSV)
   */
  static exportLoginsToCsv(): void {
    const history = this.getLoginHistory();
    if (history.length === 0) return;

    const headers = [
      'Timestamp (IST)',
      'Mobile Number',
      'User / Advocate Name',
      'Device Type',
      'Operating System',
      'Browser / Runtime',
      'IP Address',
      'Location',
      'Email Alert Sent To',
      'Status',
    ];

    const rows = history.map((h) => [
      `"${h.formattedDate}"`,
      `"${h.mobile}"`,
      `"${h.userName}"`,
      `"${h.deviceType}"`,
      `"${h.os}"`,
      `"${h.browser}"`,
      `"${h.ip}"`,
      `"${h.location}"`,
      `"${h.emailTarget}"`,
      `"${h.notificationStatus === 'sent' ? 'Notified kamalgharami@gmail.com' : 'Recorded Locally'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SRK_Legal_AI_Login_Records_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Clear registration for testing / device change
   */
  static resetRegistration(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.REGISTERED);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  }
}
