// Deal workflow steps with party requirements
export const DEAL_STEPS = [
  {
    number: 1,
    name: 'NCNDA / IMFPA',
    phase: 'PRE-TRADE',
    description: 'Non-circumvention, non-disclosure, commission terms',
    requiredParties: ['BUYER', 'SELLER', 'BROKER'],
    documents: ['NCNDA Agreement', 'IMFPA Agreement'],
    requirements: [
      'All parties must sign NCNDA',
      'All parties must sign IMFPA with commission terms',
    ],
  },
  {
    number: 2,
    name: 'ICPO',
    phase: 'PRE-TRADE',
    description: 'Irrevocable Corporate Purchase Order',
    requiredParties: ['BUYER'],
    documents: ['ICPO on company letterhead', 'Company registration certificate'],
    requirements: [
      'Buyer uploads ICPO',
      'Specifies quantity, delivery terms, payment method',
    ],
  },
  {
    number: 3,
    name: "Seller's SCO",
    phase: 'PRE-TRADE',
    description: 'Soft Corporate Offer',
    requiredParties: ['SELLER'],
    documents: ['SCO (Soft Corporate Offer)'],
    requirements: [
      'Seller provides product specifications',
      'Price, quantity, delivery and payment terms',
    ],
  },
  {
    number: 4,
    name: 'Buyer Signs SCO',
    phase: 'PRE-TRADE',
    description: 'Buyer accepts seller terms',
    requiredParties: ['BUYER'],
    documents: ['Signed SCO'],
    requirements: [
      'Buyer reviews and signs SCO',
      'May request amendments',
    ],
  },
  {
    number: 5,
    name: 'SPA Draft',
    phase: 'AGREEMENT',
    description: 'Sales & Purchase Agreement draft',
    requiredParties: ['SELLER'],
    documents: ['Draft SPA'],
    requirements: [
      'Seller drafts comprehensive SPA',
      'Includes all contract terms',
    ],
  },
  {
    number: 6,
    name: 'SPA Countersign',
    phase: 'AGREEMENT',
    description: 'Both parties sign SPA',
    requiredParties: ['BUYER', 'SELLER'],
    documents: ['Signed SPA (both parties)'],
    requirements: [
      'Buyer reviews and signs SPA',
      'Seller countersigns',
      'SPA becomes binding',
    ],
  },
  {
    number: 7,
    name: 'Bank Readiness',
    phase: 'VERIFICATION',
    description: 'Exchange POF and POP via banks',
    requiredParties: ['BUYER', 'SELLER'],
    documents: ['POF (Buyer)', 'Partial POP (Seller)'],
    requirements: [
      'Buyer submits POF via bank',
      'Seller submits partial POP (TSA)',
      'Both verified by banks',
    ],
  },
  {
    number: 8,
    name: 'DTA',
    phase: 'VERIFICATION',
    description: 'Dip Test Authorization',
    requiredParties: ['SELLER', 'BUYER'],
    documents: ['DTA (Seller)', 'Inspector Appointment (Buyer)'],
    requirements: [
      'Seller issues DTA with tank access',
      'Buyer appoints inspector',
    ],
  },
  {
    number: 9,
    name: 'Dip Test / Q&Q',
    phase: 'VERIFICATION',
    description: 'Quality & Quantity inspection',
    requiredParties: ['BUYER'],
    documents: ['Inspection Report (SGS/Bureau Veritas)'],
    requirements: [
      'Inspector conducts Q&Q test',
      'Buyer uploads inspection report',
      'Quality must match specifications',
    ],
  },
  {
    number: 10,
    name: 'Payment & Title',
    phase: 'SETTLEMENT',
    description: 'Payment and title transfer',
    requiredParties: ['BUYER', 'SELLER'],
    documents: ['MT103 Payment Confirmation (Buyer)', 'Title Transfer Document (Seller)'],
    requirements: [
      'Buyer pays per agreed terms',
      'Seller transfers ownership title',
    ],
  },
  {
    number: 11,
    name: 'Lift / Delivery',
    phase: 'SETTLEMENT',
    description: 'Physical product transfer',
    requiredParties: ['SELLER'],
    documents: ['Bill of Lading', 'Delivery Receipt'],
    requirements: [
      'Product physically transferred',
      'Delivery confirmed by receiver',
    ],
  },
  {
    number: 12,
    name: 'Commission',
    phase: 'SETTLEMENT',
    description: 'Commission disbursement',
    requiredParties: ['SELLER'],
    documents: ['Commission Payment Confirmations'],
    requirements: [
      'Pay all intermediaries per IMFPA',
      'Upload payment confirmations',
    ],
  },
]

// Product types
export const PRODUCT_TYPES = [
  { value: 'JET_A1', label: 'Jet A1' },
  { value: 'EN590', label: 'EN590 Diesel' },
  { value: 'D6', label: 'D6 Fuel Oil' },
  { value: 'LNG', label: 'LNG' },
  { value: 'CRUDE', label: 'Crude Oil' },
  { value: 'OTHER', label: 'Other' },
]

// Quantity units
export const QUANTITY_UNITS = [
  { value: 'MT', label: 'Metric Tons (MT)' },
  { value: 'BBL', label: 'Barrels (BBL)' },
  { value: 'MMBTU', label: 'MMBtu' },
]

// Delivery terms
export const DELIVERY_TERMS = [
  { value: 'FOB', label: 'FOB (Free on Board)' },
  { value: 'CIF', label: 'CIF (Cost, Insurance & Freight)' },
  { value: 'EX_TANK', label: 'Ex-Tank' },
  { value: 'DES', label: 'DES (Delivered Ex Ship)' },
  { value: 'DAP', label: 'DAP (Delivered at Place)' },
]

// POF document types
export const POF_TYPES = [
  { value: 'POF_MT799', label: 'MT799 (Pre-advice of funds)' },
  { value: 'POF_MT760', label: 'MT760 (Standby Letter of Credit)' },
  { value: 'POF_BCL', label: 'Bank Comfort Letter (BCL)' },
  { value: 'POF_MT199', label: 'MT199 (General bank message)' },
  { value: 'POF_FINANCIAL_STATEMENT', label: 'Audited Financial Statement' },
]

// POP document types
export const POP_TYPES = [
  { value: 'POP_TSA', label: 'Tank Storage Agreement (TSA)' },
  { value: 'POP_SGS', label: 'Product Passport / SGS Report' },
  { value: 'POP_ATSC', label: 'Authorization to Sell (ATSC)' },
  { value: 'POP_CERTIFICATE_ORIGIN', label: 'Certificate of Origin' },
  { value: 'POP_INJECTION_REPORT', label: 'Injection Report' },
  { value: 'POP_EXPORT_LICENSE', label: 'Export License' },
]

// Inspector companies
export const INSPECTOR_COMPANIES = [
  'SGS',
  'Bureau Veritas',
  'Intertek',
  'Saybolt',
  'Alex Stewart International',
  'Inspectorate',
  'CWC Group',
  'Other',
]

// Commission types
export const COMMISSION_TYPES = [
  { value: 'PERCENTAGE', label: '% of deal value' },
  { value: 'FIXED', label: 'Fixed amount' },
  { value: 'PER_UNIT', label: '$ per MT/BBL' },
]

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'TT', label: 'TT (Telegraphic Transfer / Wire)' },
  { value: 'SBLC', label: 'SBLC (Standby Letter of Credit)' },
  { value: 'DLC', label: 'DLC (Documentary Letter of Credit)' },
]

// Company types
export const COMPANY_TYPES = [
  'Corporation',
  'LLC',
  'Limited',
  'PLC',
  'Partnership',
  'Sole Proprietorship',
  'Other',
]
