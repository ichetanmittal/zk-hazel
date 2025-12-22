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
  {
    value: 'JET_A1',
    label: 'Jet A1',
    description: 'Aviation turbine fuel for commercial and military aircraft. High flash point, low freezing point.'
  },
  {
    value: 'EN590',
    label: 'EN590 Diesel',
    description: 'European standard automotive diesel fuel with max 10ppm sulfur. Used for road vehicles and machinery.'
  },
  {
    value: 'D6',
    label: 'D6 Fuel Oil',
    description: 'Heavy residual fuel oil for large engines and power generation. Requires preheating before use.'
  },
  {
    value: 'LNG',
    label: 'LNG',
    description: 'Liquefied Natural Gas cooled to -162°C. Used for power generation, shipping fuel, and heating.'
  },
  {
    value: 'CRUDE',
    label: 'Crude Oil',
    description: 'Unrefined petroleum extracted from wells. Processed in refineries to produce various fuels.'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other petroleum products or commodities not listed above.'
  },
]

// Quantity units
export const QUANTITY_UNITS = [
  {
    value: 'MT',
    label: 'Metric Tons (MT)',
    description: 'Standard unit for oil products. 1 MT = 1,000 kg. Typically 7-8 barrels per MT depending on product density.'
  },
  {
    value: 'BBL',
    label: 'Barrels (BBL)',
    description: 'Common unit for crude oil. 1 BBL = 42 US gallons or 159 liters. About 7.33 BBL per MT for crude oil.'
  },
  {
    value: 'MMBTU',
    label: 'MMBtu',
    description: 'Million British Thermal Units. Standard unit for LNG and natural gas energy content.'
  },
]

// Delivery terms (INCOTERMS)
export const DELIVERY_TERMS = [
  {
    value: 'FOB',
    label: 'FOB (Free on Board)',
    description: 'Seller delivers goods on board vessel at named port. Buyer pays shipping, insurance, and import costs. Risk transfers when goods are loaded on ship.'
  },
  {
    value: 'CIF',
    label: 'CIF (Cost, Insurance & Freight)',
    description: 'Seller pays shipping and insurance to destination port. Risk transfers when goods are loaded. Buyer handles import clearance and delivery from port.'
  },
  {
    value: 'EX_TANK',
    label: 'Ex-Tank',
    description: 'Buyer collects product directly from seller\'s storage tank. Seller\'s responsibility ends at tank outlet valve. Buyer arranges all transport and insurance.'
  },
  {
    value: 'DES',
    label: 'DES (Delivered Ex Ship)',
    description: 'Seller delivers to destination port on ship. Risk transfers when goods are available for unloading. Buyer pays unloading costs and import duties.'
  },
  {
    value: 'DAP',
    label: 'DAP (Delivered at Place)',
    description: 'Seller delivers to named place (terminal/warehouse). Seller pays transport but not import duties. Risk transfers on arrival at destination.'
  },
]

// POF document types
export const POF_TYPES = [
  {
    value: 'POF_MT799',
    label: 'MT799 (Pre-advice of funds)',
    description: 'SWIFT message from buyer\'s bank confirming funds exist. Non-binding but shows serious intent and financial capacity.'
  },
  {
    value: 'POF_MT760',
    label: 'MT760 (Standby Letter of Credit)',
    description: 'Bank guarantee to pay if buyer defaults. Binding commitment from issuing bank. Strongest proof of funds available.'
  },
  {
    value: 'POF_BCL',
    label: 'Bank Comfort Letter (BCL)',
    description: 'Letter from bank confirming client relationship and general financial standing. Less formal than MT799 but widely accepted.'
  },
  {
    value: 'POF_MT199',
    label: 'MT199 (General bank message)',
    description: 'Free-format SWIFT message for general bank communications. Can be used for fund confirmations or special arrangements.'
  },
  {
    value: 'POF_FINANCIAL_STATEMENT',
    label: 'Audited Financial Statement',
    description: 'Certified financial statements showing company assets and liquidity. Must be audited by recognized accounting firm.'
  },
]

// POP document types
export const POP_TYPES = [
  {
    value: 'POP_TSA',
    label: 'Tank Storage Agreement (TSA)',
    description: 'Contract with terminal operator proving product is in storage. Shows exact tank location and quantity available.'
  },
  {
    value: 'POP_SGS',
    label: 'Product Passport / SGS Report',
    description: 'Independent lab analysis of product quality. SGS, Bureau Veritas, or similar certified inspector. Shows specifications meet standards.'
  },
  {
    value: 'POP_ATSC',
    label: 'Authorization to Sell (ATSC)',
    description: 'Legal document proving seller has authority to sell the product. May be from refinery, tank owner, or product owner.'
  },
  {
    value: 'POP_CERTIFICATE_ORIGIN',
    label: 'Certificate of Origin',
    description: 'Official document stating where product was produced/refined. Required for customs and may affect pricing.'
  },
  {
    value: 'POP_INJECTION_REPORT',
    label: 'Injection Report',
    description: 'Record showing when and how much product was injected into storage tank. Proves custody and timeline.'
  },
  {
    value: 'POP_EXPORT_LICENSE',
    label: 'Export License',
    description: 'Government authorization to export product. Required for controlled commodities or restricted destinations.'
  },
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
  {
    value: 'PERCENTAGE',
    label: '% of deal value',
    description: 'Commission calculated as a percentage of total deal value. Example: 1% of $10M deal = $100,000 commission.'
  },
  {
    value: 'FIXED',
    label: 'Fixed amount',
    description: 'Set commission amount regardless of deal size. Example: $50,000 flat fee per transaction.'
  },
  {
    value: 'PER_UNIT',
    label: '$ per MT/BBL',
    description: 'Commission per unit of product. Example: $2 per MT on 50,000 MT = $100,000 commission.'
  },
]

// Payment methods
export const PAYMENT_METHODS = [
  {
    value: 'TT',
    label: 'TT (Telegraphic Transfer / Wire)',
    description: 'Direct bank-to-bank electronic transfer. Fast but payment before inspection. Requires high trust or escrow arrangement.'
  },
  {
    value: 'SBLC',
    label: 'SBLC (Standby Letter of Credit)',
    description: 'Bank guarantee activated if seller doesn\'t perform. Protects buyer. Bank pays seller after document verification.'
  },
  {
    value: 'DLC',
    label: 'DLC (Documentary Letter of Credit)',
    description: 'Bank pays seller upon presentation of required documents. Most secure method. Bank acts as intermediary ensuring both sides fulfill obligations.'
  },
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
