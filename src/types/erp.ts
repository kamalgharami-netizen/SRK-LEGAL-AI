export type PartyType = 'customer' | 'supplier' | 'both';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: string;
  shippingAddress?: string;
  city: string;
  state: string;
  pincode?: string;
  openingBalance: number; // positive = receivable (they owe us), negative = payable (we owe them)
  currentBalance: number;
  creditLimit?: number;
  createdAt: string;
}

export type ItemType = 'product' | 'service';
export type UnitType = 'PCS' | 'BOX' | 'KG' | 'LTR' | 'MTR' | 'SET' | 'NOS' | 'BAG' | 'SERVICE';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  sku: string; // barcode / item code
  hsnCode: string;
  category: string;
  unit: UnitType;
  salePrice: number; // excluding or including tax based on config
  purchasePrice: number;
  taxRate: number; // e.g. 0, 5, 12, 18, 28
  stockQty: number;
  minStockAlert: number;
  description?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  itemId?: string;
  itemName: string;
  sku?: string;
  hsnCode: string;
  qty: number;
  unit: UnitType;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export type TransactionType =
  | 'sale_invoice'
  | 'estimate'
  | 'sale_return'
  | 'purchase_bill'
  | 'purchase_return'
  | 'payment_in'
  | 'payment_out'
  | 'expense';

export type PaymentMode = 'cash' | 'bank' | 'upi' | 'cheque' | 'credit';

export type InvoiceStatus = 'paid' | 'unpaid' | 'partial' | 'draft' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  partyId?: string;
  partyName: string;
  partyPhone?: string;
  partyGstin?: string;
  partyAddress?: string;
  partyState?: string;
  
  items: InvoiceItem[];
  
  subtotal: number;
  discountTotal: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  
  paidAmount: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  paymentAccountId?: string;
  status: InvoiceStatus;
  
  notes?: string;
  terms?: string;
  referenceId?: string; // e.g. if created from estimate or return of invoice
  createdAt: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  accountNumber?: string;
  bankName?: string;
  ifsc?: string;
  upiId?: string;
  openingBalance: number;
  currentBalance: number;
  isDefault?: boolean;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  amount: number;
  paidVia: PaymentMode;
  bankAccountId?: string;
  recipientName?: string;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  website?: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  currencySymbol: string;
  taxSystem: 'GST' | 'VAT' | 'SALES_TAX';
  defaultInvoiceTerms: string;
  invoicePrefix: string;
  estimatePrefix: string;
  purchasePrefix: string;
}

export interface StockAdjustment {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'add' | 'reduce';
  qty: number;
  reason: string;
  createdAt: string;
}

export type CaseType = 'mutation' | 'misc_case' | 'rti' | 'lr_appeal';

export type CaseStatus =
  | 'filed'
  | 'scrutiny'
  | 'hearing_scheduled'
  | 'order_reserved'
  | 'disposed'
  | 'dismissed'
  | 'appealed';

export interface HearingLog {
  id: string;
  date: string; // YYYY-MM-DD
  purpose: string;
  outcome?: string;
  nextHearingDate?: string;
  attendedBy?: string;
  createdAt: string;
}

export interface LegalCase {
  id: string;
  caseNo: string;
  type: CaseType;
  title: string;
  partyId: string; // Linked Party / Client
  partyName: string;
  partyPhone?: string;
  oppositeParty?: string;
  courtOrAuthority: string; // e.g. "BL&LRO Office", "DL&LRO", "ADM Court", "State Information Commission"
  filingDate: string;
  nextHearingDate?: string;
  status: CaseStatus;

  // Intermediary / Broker / Agent details:
  brokerName?: string;
  brokerPhone?: string;

  // Mutation & General Application:
  applicationNo?: string; // Banglarbhumi / Portal Application No.
  mutationType?: string; // e.g. 'Sale Deed Purchase', 'Warishan / Succession', 'Gift Deed', 'Hebanama'
  roName?: string; // Revenue Officer (R.O.)
  riName?: string; // Revenue Inspector (R.I.) / Gram Panchayat Block
  deedNo?: string; // Registered Deed No.
  deedYear?: string; // Deed Year (e.g. 2025, 2024)
  landArea?: string; // e.g. 0.06 Acre / 4 Decimal / 2 Cottah
  landClassification?: string; // e.g. Bastu, Sali, Danga

  // Misc Case specific:
  docketNo?: string; // Docket No (replaces Application No in Misc Case)
  docketDate?: string; // Date of Docket entry
  miscNature?: string; // e.g. Demarcation, 144 CrPC, Section 4C conversion, Boundary Dispute

  // Land & Revenue / Mouza details:
  mouza?: string;
  jlNo?: string;
  khatianNo?: string;
  plotNo?: string; // Dag / Plot No.

  // LR Appeal specific:
  appealMemoNo?: string; // Memo of Appeal No.
  lowerCourtCaseNo?: string; // for LR Appeal (Impugned case)
  lowerCourtOrderDate?: string; // Date of Lower Court order
  stayOrderStatus?: string; // 'Stay Granted', 'Interim Stay Pending', 'Vacated', 'N/A'

  // RTI specific:
  rtiOfficerOrPio?: string;
  rtiMemoNo?: string; // RTI Memo / Reference No.
  rtiFeeMode?: string; // IPO / Court Fee / Online
  rtiIpoNo?: string; // IPO / Postal Order No.
  rtiDeadlineDate?: string; // 30-day statutory response countdown
  rtiFaaName?: string; // First Appellate Authority (FAA)

  remarks?: string;
  hearings: HearingLog[];
  createdAt: string;
}

export interface DailyTask {
  id: string;
  caseId?: string;
  caseNo?: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  assignedTo?: string;
  createdAt: string;
}
