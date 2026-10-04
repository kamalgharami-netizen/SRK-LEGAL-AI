import {
  CompanyProfile,
  Party,
  Item,
  Transaction,
  BankAccount,
  ExpenseRecord,
  StockAdjustment,
  PaymentMode,
  LegalCase,
  DailyTask,
  HearingLog,
} from '../types/erp';

const STORAGE_KEYS = {
  COMPANY: 'openerp_company_profile',
  PARTIES: 'openerp_parties',
  ITEMS: 'openerp_items',
  TRANSACTIONS: 'openerp_transactions',
  ACCOUNTS: 'openerp_accounts',
  EXPENSES: 'openerp_expenses',
  ADJUSTMENTS: 'openerp_adjustments',
  CASES: 'srk_cases',
  TASKS: 'srk_tasks',
};

const DEFAULT_COMPANY: CompanyProfile = {
  name: 'SRK Enterprises & Co.',
  tagline: 'Wholesale, Retail & Commercial Trading',
  phone: '+91 98765 43210',
  email: 'contact@srkenterprises.in',
  website: 'www.srkenterprises.in',
  gstin: '27AABCA1234F1Z8',
  pan: 'AABCA1234F',
  address: 'Shop No. 14, Commercial Center, M.G. Road',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  bankName: 'HDFC Bank Ltd.',
  bankAccount: '50200012345678',
  bankIfsc: 'HDFC0001234',
  bankBranch: 'Fort Branch, Mumbai',
  upiId: 'srkenterprises@hdfcbank',
  currencySymbol: '₹',
  taxSystem: 'GST',
  defaultInvoiceTerms: '1. Payment due within 15 days of invoice date.\n2. Goods once sold will not be taken back without original invoice.\n3. Interest @ 18% p.a. will be charged on overdue payments.',
  invoicePrefix: 'INV-2026-',
  estimatePrefix: 'EST-2026-',
  purchasePrefix: 'PUR-2026-',
};

const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc_cash',
    name: 'Cash Register (In Hand)',
    type: 'cash',
    openingBalance: 25000,
    currentBalance: 42800,
    isDefault: true,
  },
  {
    id: 'acc_hdfc',
    name: 'HDFC Current A/C',
    type: 'bank',
    accountNumber: '50200012345678',
    bankName: 'HDFC Bank',
    ifsc: 'HDFC0001234',
    openingBalance: 150000,
    currentBalance: 215400,
  },
  {
    id: 'acc_upi',
    name: 'Business UPI (Merchant)',
    type: 'upi',
    upiId: 'apexenterprises@hdfcbank',
    openingBalance: 12000,
    currentBalance: 34500,
  },
];

const INITIAL_PARTIES: Party[] = [
  {
    id: 'pty_1',
    name: 'TechnoSys Solutions Pvt Ltd',
    type: 'customer',
    phone: '9820112233',
    email: 'accounts@technosys.com',
    gstin: '27AAACT2345M1Z2',
    billingAddress: '402, Pinnacle Business Hub, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    openingBalance: 18500,
    currentBalance: 32500,
    creditLimit: 100000,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'pty_2',
    name: 'Modern Retail Mart',
    type: 'customer',
    phone: '9819445566',
    email: 'info@modernretail.in',
    gstin: '27AABCM9988D1Z4',
    billingAddress: 'G-12, Phoenix Market Mall, Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411014',
    openingBalance: 0,
    currentBalance: 0,
    creditLimit: 50000,
    createdAt: '2026-01-15T11:30:00Z',
  },
  {
    id: 'pty_3',
    name: 'National Logistics Hub',
    type: 'customer',
    phone: '9920334411',
    email: 'billing@nationallogistics.com',
    gstin: '24AAACN1122K1Z9',
    billingAddress: 'Plot 45, Transport Nagar, Narol',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '382405',
    openingBalance: 12000,
    currentBalance: 12000,
    creditLimit: 80000,
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'pty_4',
    name: 'Zenith Global Importers',
    type: 'supplier',
    phone: '9833445522',
    email: 'sales@zenithglobal.com',
    gstin: '27AAACZ8877L1Z3',
    billingAddress: 'Warehouse 9, Nhava Sheva Port Road',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '410206',
    openingBalance: -45000,
    currentBalance: -45000, // negative means payable
    creditLimit: 250000,
    createdAt: '2026-01-05T08:30:00Z',
  },
  {
    id: 'pty_5',
    name: 'Supreme Packaging Industries',
    type: 'supplier',
    phone: '9822998877',
    email: 'orders@supremepack.co.in',
    gstin: '27AAACS4455H1Z6',
    billingAddress: 'Sector 3, MIDC Industrial Area, Bhosari',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411026',
    openingBalance: -12500,
    currentBalance: -8500,
    createdAt: '2026-01-20T14:15:00Z',
  },
];

const INITIAL_ITEMS: Item[] = [
  {
    id: 'itm_1',
    name: 'Wireless Ergonomic Keyboard & Mouse Set',
    type: 'product',
    sku: 'KB-WL-01',
    hsnCode: '8471',
    category: 'Computer Peripherals',
    unit: 'SET',
    salePrice: 1850,
    purchasePrice: 1250,
    taxRate: 18,
    stockQty: 42,
    minStockAlert: 10,
    description: '2.4GHz + Bluetooth dual wireless combo with silent click switches.',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'itm_2',
    name: 'Ultra-Fast 65W GaN Dual USB-C Charger',
    type: 'product',
    sku: 'CHG-GAN-65',
    hsnCode: '8504',
    category: 'Electronics Accessories',
    unit: 'PCS',
    salePrice: 1499,
    purchasePrice: 920,
    taxRate: 18,
    stockQty: 28,
    minStockAlert: 15,
    description: 'Universal Power Delivery 3.0 fast laptop and smartphone adapter.',
    createdAt: '2026-01-02T11:00:00Z',
  },
  {
    id: 'itm_3',
    name: 'Heavy Duty Thermal Billing Paper Rolls (80mm)',
    type: 'product',
    sku: 'ROLL-TH-80',
    hsnCode: '4802',
    category: 'Office & Stationery',
    unit: 'BOX',
    salePrice: 750,
    purchasePrice: 480,
    taxRate: 12,
    stockQty: 8, // Low stock alert!
    minStockAlert: 15,
    description: '55 GSM high clarity thermal paper roll box of 50 units.',
    createdAt: '2026-01-03T09:30:00Z',
  },
  {
    id: 'itm_4',
    name: 'Precision Barcode & QR Laser Scanner (USB)',
    type: 'product',
    sku: 'SCN-BAR-2D',
    hsnCode: '8471',
    category: 'Retail Hardware',
    unit: 'PCS',
    salePrice: 2450,
    purchasePrice: 1650,
    taxRate: 18,
    stockQty: 19,
    minStockAlert: 5,
    description: 'Plug-and-play omnidirectional 1D/2D QR scanner with auto-stand.',
    createdAt: '2026-01-05T12:00:00Z',
  },
  {
    id: 'itm_5',
    name: 'Corrugated Shipping Cartons (12x10x8 inch)',
    type: 'product',
    sku: 'BOX-CRG-12',
    hsnCode: '4819',
    category: 'Packaging Materials',
    unit: 'BAG',
    salePrice: 950,
    purchasePrice: 650,
    taxRate: 12,
    stockQty: 4, // Low stock alert!
    minStockAlert: 10,
    description: '3-ply kraft corrugated sturdy packaging boxes, pack of 100.',
    createdAt: '2026-01-10T14:00:00Z',
  },
  {
    id: 'itm_6',
    name: 'Annual Software Maintenance & POS Support',
    type: 'service',
    sku: 'SVC-AMC-POS',
    hsnCode: '9983',
    category: 'Professional Services',
    unit: 'NOS',
    salePrice: 6000,
    purchasePrice: 0,
    taxRate: 18,
    stockQty: 999,
    minStockAlert: 0,
    description: 'Comprehensive software updates, cloud database backups, and remote technician support.',
    createdAt: '2026-01-12T16:00:00Z',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_inv_01',
    type: 'sale_invoice',
    invoiceNo: 'INV-2026-001',
    date: '2026-09-28',
    dueDate: '2026-10-13',
    partyId: 'pty_1',
    partyName: 'TechnoSys Solutions Pvt Ltd',
    partyPhone: '9820112233',
    partyGstin: '27AAACT2345M1Z2',
    partyAddress: '402, Pinnacle Business Hub, Andheri East, Mumbai',
    partyState: 'Maharashtra',
    items: [
      {
        id: 'it_01',
        itemId: 'itm_1',
        itemName: 'Wireless Ergonomic Keyboard & Mouse Set',
        sku: 'KB-WL-01',
        hsnCode: '8471',
        qty: 10,
        unit: 'SET',
        unitPrice: 1850,
        discountPercent: 5,
        discountAmount: 925,
        taxRate: 18,
        taxableAmount: 17575,
        taxAmount: 3163.5,
        totalAmount: 20738.5,
      },
      {
        id: 'it_02',
        itemId: 'itm_4',
        itemName: 'Precision Barcode & QR Laser Scanner (USB)',
        sku: 'SCN-BAR-2D',
        hsnCode: '8471',
        qty: 2,
        unit: 'PCS',
        unitPrice: 2450,
        discountPercent: 0,
        discountAmount: 0,
        taxRate: 18,
        taxableAmount: 4900,
        taxAmount: 882,
        totalAmount: 5782,
      },
    ],
    subtotal: 23400,
    discountTotal: 925,
    taxableTotal: 22475,
    cgstTotal: 2022.75,
    sgstTotal: 2022.75,
    igstTotal: 0,
    totalTax: 4045.5,
    roundOff: 0.5,
    grandTotal: 26521,
    paidAmount: 12521,
    balanceDue: 14000,
    paymentMode: 'bank',
    paymentAccountId: 'acc_hdfc',
    status: 'partial',
    notes: 'Thank you for your business. Fast dispatch via local courier.',
    terms: 'Payment due within 15 days of invoice date.',
    createdAt: '2026-09-28T14:30:00Z',
  },
  {
    id: 'tx_inv_02',
    type: 'sale_invoice',
    invoiceNo: 'INV-2026-002',
    date: '2026-10-01',
    dueDate: '2026-10-16',
    partyId: 'pty_2',
    partyName: 'Modern Retail Mart',
    partyPhone: '9819445566',
    partyGstin: '27AABCM9988D1Z4',
    partyAddress: 'G-12, Phoenix Market Mall, Viman Nagar, Pune',
    partyState: 'Maharashtra',
    items: [
      {
        id: 'it_03',
        itemId: 'itm_2',
        itemName: 'Ultra-Fast 65W GaN Dual USB-C Charger',
        sku: 'CHG-GAN-65',
        hsnCode: '8504',
        qty: 12,
        unit: 'PCS',
        unitPrice: 1499,
        discountPercent: 0,
        discountAmount: 0,
        taxRate: 18,
        taxableAmount: 17988,
        taxAmount: 3237.84,
        totalAmount: 21225.84,
      },
      {
        id: 'it_04',
        itemId: 'itm_3',
        itemName: 'Heavy Duty Thermal Billing Paper Rolls (80mm)',
        sku: 'ROLL-TH-80',
        hsnCode: '4802',
        qty: 5,
        unit: 'BOX',
        unitPrice: 750,
        discountPercent: 0,
        discountAmount: 0,
        taxRate: 12,
        taxableAmount: 3750,
        taxAmount: 450,
        totalAmount: 4200,
      },
    ],
    subtotal: 21738,
    discountTotal: 0,
    taxableTotal: 21738,
    cgstTotal: 1843.92,
    sgstTotal: 1843.92,
    igstTotal: 0,
    totalTax: 3687.84,
    roundOff: 0.16,
    grandTotal: 25426,
    paidAmount: 25426,
    balanceDue: 0,
    paymentMode: 'upi',
    paymentAccountId: 'acc_upi',
    status: 'paid',
    notes: 'Paid in full via UPI QR code on delivery.',
    terms: 'Goods once sold will not be taken back.',
    createdAt: '2026-10-01T11:20:00Z',
  },
  {
    id: 'tx_est_01',
    type: 'estimate',
    invoiceNo: 'EST-2026-001',
    date: '2026-10-02',
    dueDate: '2026-10-17',
    partyId: 'pty_3',
    partyName: 'National Logistics Hub',
    partyPhone: '9920334411',
    partyGstin: '24AAACN1122K1Z9',
    partyAddress: 'Plot 45, Transport Nagar, Narol, Ahmedabad',
    partyState: 'Gujarat',
    items: [
      {
        id: 'it_05',
        itemId: 'itm_4',
        itemName: 'Precision Barcode & QR Laser Scanner (USB)',
        sku: 'SCN-BAR-2D',
        hsnCode: '8471',
        qty: 5,
        unit: 'PCS',
        unitPrice: 2450,
        discountPercent: 5,
        discountAmount: 612.5,
        taxRate: 18,
        taxableAmount: 11637.5,
        taxAmount: 2094.75,
        totalAmount: 13732.25,
      },
      {
        id: 'it_06',
        itemId: 'itm_6',
        itemName: 'Annual Software Maintenance & POS Support',
        sku: 'SVC-AMC-POS',
        hsnCode: '9983',
        qty: 1,
        unit: 'NOS',
        unitPrice: 6000,
        discountPercent: 0,
        discountAmount: 0,
        taxRate: 18,
        taxableAmount: 6000,
        taxAmount: 1080,
        totalAmount: 7080,
      },
    ],
    subtotal: 18250,
    discountTotal: 612.5,
    taxableTotal: 17637.5,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 3174.75, // Interstate Gujarat -> IGST
    totalTax: 3174.75,
    roundOff: -0.25,
    grandTotal: 20812,
    paidAmount: 0,
    balanceDue: 20812,
    paymentMode: 'credit',
    status: 'draft',
    notes: 'Quotation valid for 15 days from issue date.',
    createdAt: '2026-10-02T16:00:00Z',
  },
  {
    id: 'tx_pur_01',
    type: 'purchase_bill',
    invoiceNo: 'PUR-2026-001',
    date: '2026-09-25',
    dueDate: '2026-10-10',
    partyId: 'pty_4',
    partyName: 'Zenith Global Importers',
    partyPhone: '9833445522',
    partyGstin: '27AAACZ8877L1Z3',
    partyAddress: 'Warehouse 9, Nhava Sheva Port Road, Navi Mumbai',
    partyState: 'Maharashtra',
    items: [
      {
        id: 'it_07',
        itemId: 'itm_1',
        itemName: 'Wireless Ergonomic Keyboard & Mouse Set',
        sku: 'KB-WL-01',
        hsnCode: '8471',
        qty: 25,
        unit: 'SET',
        unitPrice: 1250,
        discountPercent: 0,
        discountAmount: 0,
        taxRate: 18,
        taxableAmount: 31250,
        taxAmount: 5625,
        totalAmount: 36875,
      },
      {
        id: 'it_08',
        itemId: 'itm_2',
        itemName: 'Ultra-Fast 65W GaN Dual USB-C Charger',
        sku: 'CHG-GAN-65',
        hsnCode: '8504',
        qty: 20,
        unit: 'PCS',
        unitPrice: 920,
        discountPercent: 0,
        discountAmount: 0,
        taxRate: 18,
        taxableAmount: 18400,
        taxAmount: 3312,
        totalAmount: 21712,
      },
    ],
    subtotal: 49650,
    discountTotal: 0,
    taxableTotal: 49650,
    cgstTotal: 4468.5,
    sgstTotal: 4468.5,
    igstTotal: 0,
    totalTax: 8937,
    roundOff: 0,
    grandTotal: 58587,
    paidAmount: 13587,
    balanceDue: 45000,
    paymentMode: 'bank',
    paymentAccountId: 'acc_hdfc',
    status: 'partial',
    notes: 'Received bulk consignment in good condition.',
    createdAt: '2026-09-25T15:00:00Z',
  },
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp_1',
    date: '2026-09-30',
    category: 'Office Rent & Maintenance',
    amount: 12000,
    paidVia: 'bank',
    bankAccountId: 'acc_hdfc',
    recipientName: 'Commercial Arcade Mgmt',
    referenceNo: 'RENT-SEP-26',
    notes: 'Monthly maintenance and shop rental',
    createdAt: '2026-09-30T10:00:00Z',
  },
  {
    id: 'exp_2',
    date: '2026-10-01',
    category: 'Electricity & Utilities',
    amount: 2450,
    paidVia: 'upi',
    bankAccountId: 'acc_upi',
    recipientName: 'MSEDCL Mumbai',
    referenceNo: 'MSED-9921',
    notes: 'Electricity bill for September',
    createdAt: '2026-10-01T09:30:00Z',
  },
  {
    id: 'exp_3',
    date: '2026-10-02',
    category: 'Tea, Pantry & Refreshments',
    amount: 680,
    paidVia: 'cash',
    bankAccountId: 'acc_cash',
    recipientName: 'Local Corner Cafe',
    notes: 'Tea and evening snacks for office staff',
    createdAt: '2026-10-02T17:00:00Z',
  },
  {
    id: 'exp_4',
    date: '2026-10-03',
    category: 'Courier & Local Logistics',
    amount: 1150,
    paidVia: 'cash',
    bankAccountId: 'acc_cash',
    recipientName: 'BlueDart Express',
    referenceNo: 'BD-88912',
    notes: 'Urgent customer parcel delivery dispatch',
    createdAt: '2026-10-03T11:45:00Z',
  },
];

const INITIAL_CASES: LegalCase[] = [
  {
    id: 'case_mut_01',
    caseNo: 'MUT/2026/0842',
    type: 'mutation',
    title: 'Mutation & Record-of-Rights (Khatian) Regularization',
    partyId: 'pty_1',
    partyName: 'TechnoSys Solutions Pvt Ltd',
    partyPhone: '9820112233',
    brokerName: 'Subhasish Mandal (Munshi & Land Agent)',
    brokerPhone: '9830114477',
    applicationNo: '2026/01/MUT/0842',
    mutationType: 'Sale Deed Purchase',
    roName: 'Sri Animesh Roy, WBLS (Revenue Officer)',
    riName: 'Kalyanpur-1 Gram Panchayat RI Office',
    deedNo: 'I-4921',
    deedYear: '2025',
    landArea: '0.08 Acre (5.5 Decimal)',
    landClassification: 'Bastu (Commercial)',
    courtOrAuthority: 'Office of the BL&LRO (Circle 2)',
    filingDate: '2026-08-14',
    nextHearingDate: '2026-10-03', // Today!
    status: 'hearing_scheduled',
    mouza: 'Kalyanpur',
    jlNo: '42',
    khatianNo: 'LR 389',
    plotNo: '714/1208',
    remarks: 'Field inspection completed by Revenue Inspector. Original deed verification scheduled.',
    hearings: [
      {
        id: 'h_1',
        date: '2026-09-12',
        purpose: 'Primary Scrutiny & Notice Generation',
        outcome: 'Notice issued to interested co-sharers under Sec 50.',
        nextHearingDate: '2026-10-03',
        attendedBy: 'Adv. S. Sengupta',
        createdAt: '2026-09-12T10:00:00Z',
      },
    ],
    createdAt: '2026-08-14T10:30:00Z',
  },
  {
    id: 'case_misc_01',
    caseNo: 'REV-MISC/2026/0119',
    type: 'misc_case',
    title: 'Demarcation of Boundary & Injunction Petition',
    partyId: 'pty_2',
    partyName: 'Modern Retail Mart',
    partyPhone: '9819445566',
    oppositeParty: 'P.K. Construction & Infra Developers',
    brokerName: 'Bikash Ghosh (Agent)',
    brokerPhone: '9822119933',
    docketNo: 'DKT/SDO/2026/0914',
    docketDate: '2026-08-28',
    miscNature: 'Demarcation & Injunction under Sec 144/145',
    courtOrAuthority: 'Court of the Sub-Divisional Officer (SDO)',
    filingDate: '2026-09-02',
    nextHearingDate: '2026-10-05',
    status: 'hearing_scheduled',
    mouza: 'Viman Nagar Urban',
    jlNo: '12',
    khatianNo: 'LR 1120',
    plotNo: '104/A',
    landArea: '0.12 Acre (8 Decimal)',
    roName: 'Executive Magistrate / SDO Revenue Bench',
    riName: 'Viman Nagar Block Land RI',
    remarks: 'Government Amin inspection report submitted. Awaiting rejoinder from opposite party.',
    hearings: [
      {
        id: 'h_2',
        date: '2026-09-20',
        purpose: 'Admission Hearing',
        outcome: 'Case admitted, Amin directed for spot survey & demarcation report.',
        nextHearingDate: '2026-10-05',
        attendedBy: 'Adv. R. Roy',
        createdAt: '2026-09-20T11:00:00Z',
      },
    ],
    createdAt: '2026-09-02T14:15:00Z',
  },
  {
    id: 'case_rti_01',
    caseNo: 'RTI/WB/2026/0411',
    type: 'rti',
    title: 'Certified Copy of RS to LR Conversion Ledger & Mouza Map',
    partyId: 'pty_3',
    partyName: 'National Logistics Hub',
    partyPhone: '9920334411',
    brokerName: 'Tapan Das (Clerk)',
    brokerPhone: '9831998822',
    courtOrAuthority: 'State Land Records & Survey Department',
    rtiOfficerOrPio: 'Sri P.K. Das, SPIO & Deputy DL&LRO',
    rtiMemoNo: 'MEMO/SPIO/LR/2026/81',
    rtiFeeMode: 'Indian Postal Order (IPO)',
    rtiIpoNo: 'IPO-64F-982144 (₹10)',
    rtiFaaName: 'Additional District Magistrate (LR) / FAA',
    filingDate: '2026-09-15',
    rtiDeadlineDate: '2026-10-15',
    nextHearingDate: '2026-10-15',
    status: 'filed',
    mouza: 'Transport Nagar',
    jlNo: '19',
    plotNo: 'Plot 45/Sector 2',
    remarks: 'Application fee ₹10 paid via postal order. Statutory 30-day response window running.',
    hearings: [],
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'case_lra_01',
    caseNo: 'LRA/2026/0054',
    type: 'lr_appeal',
    title: 'Land Revenue Appeal under Sec 54 against Mutation Rejection',
    partyId: 'pty_4',
    partyName: 'Zenith Global Importers',
    partyPhone: '9833445522',
    oppositeParty: 'State Revenue Authorities & Ors',
    brokerName: 'Alok Kumar Sen',
    brokerPhone: '9833449911',
    courtOrAuthority: 'Appellate Authority / DL&LRO Tribunal',
    appealMemoNo: 'APL-MEMO/2026/22',
    lowerCourtCaseNo: 'BL&LRO Mutation Case MUT/2025/1102',
    lowerCourtOrderDate: '2026-06-15',
    stayOrderStatus: 'Ad-Interim Stay Granted',
    deedNo: 'I-1102',
    deedYear: '2024',
    roName: 'Appellate Officer / DL&LRO Presiding Officer',
    riName: 'Nhava RI Circle',
    filingDate: '2026-07-28',
    nextHearingDate: '2026-10-08',
    status: 'order_reserved',
    mouza: 'Nhava Port Hub',
    jlNo: '08',
    khatianNo: 'LR 1420',
    plotNo: '880/2',
    landArea: '0.25 Acre',
    remarks: 'Stay on lower court rejection order granted. Final arguments concluded, order reserved for pronouncement.',
    hearings: [
      {
        id: 'h_3',
        date: '2026-09-18',
        purpose: 'Final Arguments',
        outcome: 'Arguments concluded. Case record put up for judgment order.',
        nextHearingDate: '2026-10-08',
        attendedBy: 'Sr. Adv. M. Banerjee',
        createdAt: '2026-09-18T14:00:00Z',
      },
    ],
    createdAt: '2026-07-28T16:00:00Z',
  },
];

const INITIAL_TASKS: DailyTask[] = [
  {
    id: 'task_1',
    caseId: 'case_mut_01',
    caseNo: 'MUT/2026/0842',
    title: 'Attend Mutation Hearing at BL&LRO Office with Original Registered Deed',
    dueDate: '2026-10-03', // Today!
    priority: 'high',
    isCompleted: false,
    assignedTo: 'Adv. Sengupta',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'task_2',
    caseId: 'case_misc_01',
    caseNo: 'REV-MISC/2026/0119',
    title: 'Draft & File Rejoinder Petition in SDO Misc Boundary Dispute Case',
    dueDate: '2026-10-04',
    priority: 'high',
    isCompleted: false,
    assignedTo: 'Legal Team',
    createdAt: '2026-10-02T11:00:00Z',
  },
  {
    id: 'task_3',
    caseId: 'case_lra_01',
    caseNo: 'LRA/2026/0054',
    title: 'Collect Certified Copy of Stay Order from DL&LRO Appellate Bench',
    dueDate: '2026-10-06',
    priority: 'medium',
    isCompleted: false,
    assignedTo: 'Bench Clerk',
    createdAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'task_4',
    caseId: 'case_rti_01',
    caseNo: 'RTI/WB/2026/0411',
    title: 'Track 30-Day RTI Response & Prepare First Appeal draft if not answered',
    dueDate: '2026-10-15',
    priority: 'medium',
    isCompleted: false,
    assignedTo: 'Office Assistant',
    createdAt: '2026-10-02T14:00:00Z',
  },
];

export class StorageService {
  // Initialize or read company
  static getCompany(): CompanyProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
      return DEFAULT_COMPANY;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.name === 'Apex Enterprises & Co.') {
        parsed.name = 'SRK Enterprises & Co.';
        parsed.email = 'contact@srkenterprises.in';
        parsed.website = 'www.srkenterprises.in';
        parsed.upiId = 'srkenterprises@hdfcbank';
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_COMPANY;
    }
  }

  static saveCompany(company: CompanyProfile): void {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  }

  // Parties
  static getParties(): Party[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
      return INITIAL_PARTIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PARTIES;
    }
  }

  static saveParty(party: Party): void {
    const parties = this.getParties();
    const index = parties.findIndex((p) => p.id === party.id);
    if (index >= 0) {
      parties[index] = party;
    } else {
      parties.unshift(party);
    }
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
  }

  static deleteParty(id: string): void {
    const parties = this.getParties().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
  }

  // Items
  static getItems(): Item[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ITEMS;
    }
  }

  static saveItem(item: Item): void {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  static deleteItem(id: string): void {
    const items = this.getItems().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  static adjustStock(itemId: string, qtyDelta: number, reason: string, type: 'add' | 'reduce'): void {
    const items = this.getItems();
    const item = items.find((i) => i.id === itemId);
    if (item && item.type === 'product') {
      if (type === 'add') {
        item.stockQty += Math.abs(qtyDelta);
      } else {
        item.stockQty = Math.max(0, item.stockQty - Math.abs(qtyDelta));
      }
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

      // Record adjustment log
      const adjustments = this.getStockAdjustments();
      adjustments.unshift({
        id: `adj_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        itemId: item.id,
        itemName: item.name,
        type,
        qty: Math.abs(qtyDelta),
        reason,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
    }
  }

  static getStockAdjustments(): StockAdjustment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Transactions (Sales, Purchases, Returns, Estimates)
  static getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  static saveTransaction(tx: Transaction): void {
    const transactions = this.getTransactions();
    const existingIndex = transactions.findIndex((t) => t.id === tx.id);
    const isNew = existingIndex < 0;

    if (!isNew) {
      transactions[existingIndex] = tx;
    } else {
      transactions.unshift(tx);

      // Process inventory delta if sales or purchase
      if (tx.type === 'sale_invoice') {
        // deduct stock
        const items = this.getItems();
        tx.items.forEach((line) => {
          if (line.itemId) {
            const it = items.find((i) => i.id === line.itemId);
            if (it && it.type === 'product') {
              it.stockQty = Math.max(0, it.stockQty - line.qty);
            }
          }
        });
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

        // update party balance if on credit
        if (tx.partyId && tx.balanceDue > 0) {
          const parties = this.getParties();
          const pty = parties.find((p) => p.id === tx.partyId);
          if (pty) {
            pty.currentBalance += tx.balanceDue;
            localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
          }
        }

        // update account balance if paidAmount > 0
        if (tx.paidAmount > 0 && tx.paymentAccountId) {
          this.creditAccount(tx.paymentAccountId, tx.paidAmount);
        }
      } else if (tx.type === 'purchase_bill') {
        // increase stock
        const items = this.getItems();
        tx.items.forEach((line) => {
          if (line.itemId) {
            const it = items.find((i) => i.id === line.itemId);
            if (it && it.type === 'product') {
              it.stockQty += line.qty;
            }
          }
        });
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

        // update supplier balance (more negative payable)
        if (tx.partyId && tx.balanceDue > 0) {
          const parties = this.getParties();
          const pty = parties.find((p) => p.id === tx.partyId);
          if (pty) {
            pty.currentBalance -= tx.balanceDue; // owes more to supplier
            localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
          }
        }

        // deduct bank/cash if paidAmount > 0
        if (tx.paidAmount > 0 && tx.paymentAccountId) {
          this.debitAccount(tx.paymentAccountId, tx.paidAmount);
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  static deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  // Accounts
  static getAccounts(): BankAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  }

  static saveAccount(account: BankAccount): void {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  static creditAccount(accountId: string, amount: number): void {
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.id === accountId);
    if (acc) {
      acc.currentBalance += amount;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  }

  static debitAccount(accountId: string, amount: number): void {
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.id === accountId);
    if (acc) {
      acc.currentBalance = Math.max(0, acc.currentBalance - amount);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  }

  // Expenses
  static getExpenses(): ExpenseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  static saveExpense(expense: ExpenseRecord): void {
    const expenses = this.getExpenses();
    const idx = expenses.findIndex((e) => e.id === expense.id);
    if (idx >= 0) {
      expenses[idx] = expense;
    } else {
      expenses.unshift(expense);
      if (expense.bankAccountId && expense.amount > 0) {
        this.debitAccount(expense.bankAccountId, expense.amount);
      }
    }
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  static deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // Record a payment in (customer paid) or payment out (paid supplier)
  static recordPayment({
    partyId,
    amount,
    accountId,
    mode,
    type,
    notes,
    invoiceId,
  }: {
    partyId: string;
    amount: number;
    accountId: string;
    mode: PaymentMode;
    type: 'payment_in' | 'payment_out';
    notes?: string;
    invoiceId?: string;
  }): void {
    const parties = this.getParties();
    const party = parties.find((p) => p.id === partyId);
    if (!party) return;

    if (type === 'payment_in') {
      // customer paid us -> decrease receivable
      party.currentBalance = Math.max(0, party.currentBalance - amount);
      this.creditAccount(accountId, amount);
    } else {
      // we paid supplier -> reduce negative payable (closer to zero)
      party.currentBalance += amount;
      this.debitAccount(accountId, amount);
    }
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));

    // If linked to an invoice, reduce invoice balanceDue
    if (invoiceId) {
      const txs = this.getTransactions();
      const tx = txs.find((t) => t.id === invoiceId);
      if (tx) {
        tx.paidAmount += amount;
        tx.balanceDue = Math.max(0, tx.grandTotal - tx.paidAmount);
        tx.status = tx.balanceDue <= 0 ? 'paid' : 'partial';
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      }
    }

    // Save as transaction record
    const paymentTx: Transaction = {
      id: `pay_${Date.now()}`,
      type,
      invoiceNo: `${type === 'payment_in' ? 'REC' : 'VCH'}-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      partyId: party.id,
      partyName: party.name,
      partyPhone: party.phone,
      items: [],
      subtotal: amount,
      discountTotal: 0,
      taxableTotal: amount,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      totalTax: 0,
      roundOff: 0,
      grandTotal: amount,
      paidAmount: amount,
      balanceDue: 0,
      paymentMode: mode,
      paymentAccountId: accountId,
      status: 'paid',
      notes: notes || (type === 'payment_in' ? 'Received from customer' : 'Paid to vendor'),
      referenceId: invoiceId,
      createdAt: new Date().toISOString(),
    };
    this.saveTransaction(paymentTx);
  }

  // Reset demo data
  static resetToDefaultData(): void {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.removeItem(STORAGE_KEYS.ADJUSTMENTS);
  }

  // Legal & Revenue Cases
  static getCases(): LegalCase[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
      return INITIAL_CASES;
    }
    try {
      const parsed: LegalCase[] = JSON.parse(raw);
      const enriched = parsed.map((c) => {
        const init = INITIAL_CASES.find((i) => i.id === c.id);
        if (init && (!c.brokerName || !c.applicationNo && c.type === 'mutation' || !c.docketNo && c.type === 'misc_case')) {
          return {
            ...init,
            ...c,
            brokerName: c.brokerName || init.brokerName,
            brokerPhone: c.brokerPhone || init.brokerPhone,
            applicationNo: c.applicationNo || init.applicationNo,
            docketNo: c.docketNo || init.docketNo,
            docketDate: c.docketDate || init.docketDate,
            roName: c.roName || init.roName,
            riName: c.riName || init.riName,
            deedYear: c.deedYear || init.deedYear,
            landArea: c.landArea || init.landArea,
          };
        }
        return c;
      });
      return enriched;
    } catch {
      return INITIAL_CASES;
    }
  }

  static saveCase(c: LegalCase): void {
    const cases = this.getCases();
    const idx = cases.findIndex((item) => item.id === c.id);
    if (idx >= 0) {
      cases[idx] = c;
    } else {
      cases.unshift(c);
    }
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }

  static deleteCase(id: string): void {
    const cases = this.getCases().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }

  static addHearingLog(caseId: string, hearing: HearingLog, nextHearingDate?: string): void {
    const cases = this.getCases();
    const target = cases.find((c) => c.id === caseId);
    if (target) {
      target.hearings.unshift(hearing);
      if (nextHearingDate) {
        target.nextHearingDate = nextHearingDate;
      }
      this.saveCase(target);
    }
  }

  // Daily Tasks
  static getTasks(): DailyTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TASKS;
    }
  }

  static saveTask(task: DailyTask): void {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.unshift(task);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  static deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  static toggleTask(id: string): void {
    const tasks = this.getTasks();
    const target = tasks.find((t) => t.id === id);
    if (target) {
      target.isCompleted = !target.isCompleted;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // Export full backup JSON
  static exportDatabase(): string {
    const db = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      software: 'SRK ERP AND DAILY MANAGEMENT SOFTWARE',
      company: this.getCompany(),
      parties: this.getParties(),
      items: this.getItems(),
      transactions: this.getTransactions(),
      accounts: this.getAccounts(),
      expenses: this.getExpenses(),
      adjustments: this.getStockAdjustments(),
      cases: this.getCases(),
      tasks: this.getTasks(),
    };
    return JSON.stringify(db, null, 2);
  }

  // Inspect and parse backup payload before importing
  static parseBackupStats(jsonString: string): {
    isValid: boolean;
    error?: string;
    version?: string;
    exportedAt?: string;
    companyName?: string;
    partiesCount: number;
    itemsCount: number;
    transactionsCount: number;
    casesCount: number;
    accountsCount: number;
    tasksCount: number;
  } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return {
          isValid: false,
          error: 'Invalid file format: Data is not a valid JSON object.',
          partiesCount: 0,
          itemsCount: 0,
          transactionsCount: 0,
          casesCount: 0,
          accountsCount: 0,
          tasksCount: 0,
        };
      }

      // Check if at least one core ERP key exists
      const hasCoreData =
        Boolean(data.company) ||
        Array.isArray(data.parties) ||
        Array.isArray(data.transactions) ||
        Array.isArray(data.cases) ||
        Array.isArray(data.items);

      if (!hasCoreData) {
        return {
          isValid: false,
          error: 'File does not contain valid SRK ERP backup data.',
          partiesCount: 0,
          itemsCount: 0,
          transactionsCount: 0,
          casesCount: 0,
          accountsCount: 0,
          tasksCount: 0,
        };
      }

      return {
        isValid: true,
        version: data.version || '1.0',
        exportedAt: data.exportedAt || new Date().toISOString(),
        companyName: data.company?.name || 'Unnamed Business',
        partiesCount: Array.isArray(data.parties) ? data.parties.length : 0,
        itemsCount: Array.isArray(data.items) ? data.items.length : 0,
        transactionsCount: Array.isArray(data.transactions) ? data.transactions.length : 0,
        casesCount: Array.isArray(data.cases) ? data.cases.length : 0,
        accountsCount: Array.isArray(data.accounts) ? data.accounts.length : 0,
        tasksCount: Array.isArray(data.tasks) ? data.tasks.length : 0,
      };
    } catch (e) {
      return {
        isValid: false,
        error: 'JSON parsing failed. Please verify the backup file.',
        partiesCount: 0,
        itemsCount: 0,
        transactionsCount: 0,
        casesCount: 0,
        accountsCount: 0,
        tasksCount: 0,
      };
    }
  }

  // Import full backup JSON
  static importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.company) localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(data.company));
      if (data.parties) localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(data.parties));
      if (data.items) localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items));
      if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.accounts) localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.accounts));
      if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
      if (data.adjustments) localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(data.adjustments));
      if (data.cases) localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(data.cases));
      if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
      
      // Mark company setup as completed
      this.setCompanySetupCompleted(true);
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  }

  // Check if company initial setup or data restore has been completed
  static isCompanySetupCompleted(): boolean {
    try {
      return localStorage.getItem('srk_company_setup_completed') === 'true';
    } catch {
      return false;
    }
  }

  static setCompanySetupCompleted(status: boolean = true): void {
    try {
      localStorage.setItem('srk_company_setup_completed', status ? 'true' : 'false');
    } catch {}
  }

  // Preferred Local Backup Path / Directory
  static getPreferredBackupPath(): string {
    try {
      return localStorage.getItem('srk_preferred_backup_path') || 'C:\\SRK_ERP_Backups\\';
    } catch {
      return 'C:\\SRK_ERP_Backups\\';
    }
  }

  static setPreferredBackupPath(path: string): void {
    try {
      localStorage.setItem('srk_preferred_backup_path', path.trim());
    } catch {}
  }

  // Record Backup Audit Logs (Local, Google Drive, OneDrive)
  static recordBackupLog(log: {
    destination: 'local' | 'google_drive' | 'onedrive';
    fileName: string;
    customPath?: string;
  }): void {
    try {
      const raw = localStorage.getItem('srk_backup_logs');
      const logs = raw ? JSON.parse(raw) : [];
      const entry = {
        id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'medium',
        }),
        destination: log.destination,
        fileName: log.fileName,
        customPath: log.customPath || '',
      };
      logs.unshift(entry);
      localStorage.setItem('srk_backup_logs', JSON.stringify(logs.slice(0, 50)));
    } catch {}
  }

  static getBackupLogs(): Array<{
    id: string;
    timestamp: string;
    formattedDate: string;
    destination: 'local' | 'google_drive' | 'onedrive';
    fileName: string;
    customPath?: string;
  }> {
    try {
      const raw = localStorage.getItem('srk_backup_logs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Helper to generate next invoice number
  static getNextInvoiceNumber(type: 'sale_invoice' | 'estimate' | 'purchase_bill'): string {
    const txs = this.getTransactions().filter((t) => t.type === type);
    const company = this.getCompany();
    const prefix =
      type === 'sale_invoice'
        ? company.invoicePrefix
        : type === 'estimate'
        ? company.estimatePrefix
        : company.purchasePrefix;
    const count = txs.length + 1;
    return `${prefix}${String(count).padStart(3, '0')}`;
  }
}
