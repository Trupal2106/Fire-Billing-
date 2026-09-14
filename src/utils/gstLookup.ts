import { INDIAN_STATES } from './gstCalculations';

export interface GstDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  pan: string;
  state: string;
  stateCode: string;
  address: string;
  city: string;
  pin: string;
  status: 'Active' | 'Inactive' | 'Cancelled';
  taxpayerType: 'Regular' | 'Composition' | 'SEZ';
  registrationDate: string;
}

// Known GSTIN directory of realistic Indian enterprises, institutions, and industrial plants
const KNOWN_GST_DATABASE: Record<string, Partial<GstDetails>> = {
  '24AAACT2727Q1ZG': {
    legalName: 'TORRENT POWER LIMITED',
    tradeName: 'TORRENT POWER LTD',
    address: 'Samanvay, 600 Tapovan, Ambawadi',
    city: 'Ahmedabad',
    pin: '380015',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '01/07/2017'
  },
  '24AAACL2799Q1ZQ': {
    legalName: 'LARSEN AND TOUBRO LIMITED',
    tradeName: 'L&T HEAVY ENGINEERING',
    address: 'Gate No 1, Hazira Manufacturing Complex, Surat - Hazira Road',
    city: 'Surat',
    pin: '394510',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '01/07/2017'
  },
  '24AABCR0417L1Z9': {
    legalName: 'RELIANCE INDUSTRIES LIMITED',
    tradeName: 'RELIANCE REFINERY COMPLEX',
    address: 'Village Motikhavdi, Digvijaygram, Jamnagar',
    city: 'Jamnagar',
    pin: '361140',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '01/07/2017'
  },
  '24AAACD1030F1Z4': {
    legalName: 'CADILA HEALTHCARE LIMITED',
    tradeName: 'ZYDUS LIFECARE PLANT',
    address: 'Plot No. 26-29, Changodar Industrial Estate, Sarkhej-Bavla Road',
    city: 'Ahmedabad',
    pin: '382213',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '01/07/2017'
  },
  '24AAACC1234F1Z1': {
    legalName: 'APEX CHEMICALS & SAFETY PVT LTD',
    tradeName: 'APEX CHEMICALS',
    address: 'Phase-4, Plot No. 112/B, GIDC Vatva Industrial Area',
    city: 'Ahmedabad',
    pin: '382445',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '15/08/2018'
  },
  '24AABCS5566K1Z8': {
    legalName: 'SHREE RAM DYES AND CHEMICALS',
    tradeName: 'SHREE RAM CHEMTECH',
    address: 'Survey No. 45/A, Naroda GIDC Phase 2, Near Fire Station',
    city: 'Ahmedabad',
    pin: '382330',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '10/02/2019'
  },
  '24AAGCP1122D1Z3': {
    legalName: 'PATEL CERAMICS & SANITARYWARE LLP',
    tradeName: 'PATEL CERAMIC TILES',
    address: '8-A National Highway, Old Ghuntu Road, Morbi',
    city: 'Morbi',
    pin: '363642',
    state: 'Gujarat',
    stateCode: '24',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '12/04/2020'
  },
  '27AAACT9988H1ZV': {
    legalName: 'TATA MOTORS LIMITED',
    tradeName: 'TATA MOTORS AUTO PLANT',
    address: 'Sector 10, Bhosari Industrial Area, Pimpri Chinchwad',
    city: 'Pune',
    pin: '411018',
    state: 'Maharashtra',
    stateCode: '27',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '01/07/2017'
  },
  '07AABCS1234M1ZX': {
    legalName: 'STAR GLOBAL SAFETY & FIRE SYSTEMS',
    tradeName: 'STAR FIRE SOLUTIONS',
    address: 'B-45, Okhla Industrial Area Phase 1',
    city: 'New Delhi',
    pin: '110020',
    state: 'Delhi',
    stateCode: '07',
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '20/11/2019'
  }
};

// Common city / area mappings by state code for smart auto-synthesis
const STATE_DEFAULT_CITIES: Record<string, { city: string; pin: string; area: string }> = {
  '24': { city: 'Ahmedabad', pin: '382445', area: 'GIDC Industrial Estate, Phase 3' },
  '27': { city: 'Mumbai', pin: '400072', area: 'Andheri East, MIDC Area' },
  '07': { city: 'New Delhi', pin: '110020', area: 'Okhla Industrial Area Phase-2' },
  '29': { city: 'Bengaluru', pin: '560058', area: 'Peenya Industrial Area' },
  '33': { city: 'Chennai', pin: '600058', area: 'Ambattur Industrial Estate' },
  '08': { city: 'Jaipur', pin: '302013', area: 'VKIA Industrial Area' },
  '23': { city: 'Indore', pin: '452010', area: 'Sanwer Road Industrial Area' },
  '09': { city: 'Noida', pin: '201301', area: 'Sector 62, Electronic City' },
  '19': { city: 'Kolkata', pin: '700091', area: 'Salt Lake Sector V' },
  '36': { city: 'Hyderabad', pin: '500037', area: 'Jeedimetla Industrial Estate' },
  '37': { city: 'Visakhapatnam', pin: '530012', area: 'Auto Nagar, Gajuwaka' },
  '03': { city: 'Ludhiana', pin: '141003', area: 'Focal Point Industrial Area' },
  '06': { city: 'Gurugram', pin: '122016', area: 'Udyog Vihar Phase 4' },
  '32': { city: 'Kochi', pin: '682024', area: 'Kalamassery Industrial Belt' }
};

/**
 * Validates whether string conforms to standard Indian 15-char GSTIN format:
 * 2 digits (State) + 5 letters + 4 digits + 1 letter (PAN) + 1 entity num + 'Z' + 1 checksum
 */
export function isValidGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  const clean = gstin.trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(clean);
}

/**
 * Parses PAN from 15-digit GSTIN (positions 2 to 12)
 */
export function extractPanFromGstin(gstin: string): string {
  const clean = gstin.trim().toUpperCase();
  if (clean.length >= 12) {
    return clean.substring(2, 12);
  }
  return '';
}

/**
 * Parses State from first 2 digits of GSTIN
 */
export function extractStateFromGstin(gstin: string): { state: string; stateCode: string } {
  const clean = gstin.trim().toUpperCase();
  const code = clean.substring(0, 2);
  const matched = INDIAN_STATES.find(s => s.code === code);
  return {
    state: matched ? matched.name : 'Gujarat',
    stateCode: code || '24'
  };
}

/**
 * Simulates real-time GST Portal API lookup:
 * Returns verified legal name, trade name, registered address, PAN, and state
 */
export async function lookupGstDetails(gstinInput: string): Promise<GstDetails> {
  // Add brief 400ms delay to simulate real API network lookup
  await new Promise(res => setTimeout(res, 400));

  const gstin = gstinInput.trim().toUpperCase();
  if (gstin.length < 10) {
    throw new Error('Please enter a valid 15-digit GSTIN (e.g. 24AAACC1234F1Z1)');
  }

  const pan = extractPanFromGstin(gstin);
  const { state, stateCode } = extractStateFromGstin(gstin);

  // Check known database first
  if (KNOWN_GST_DATABASE[gstin]) {
    const record = KNOWN_GST_DATABASE[gstin];
    return {
      gstin,
      legalName: record.legalName || 'REGISTERED ENTERPRISE PVT LTD',
      tradeName: record.tradeName || record.legalName || 'REGISTERED ENTERPRISE',
      pan: record.pan || pan,
      state: record.state || state,
      stateCode: record.stateCode || stateCode,
      address: record.address || `Plot No. 42, ${record.city} Industrial Area`,
      city: record.city || 'Ahmedabad',
      pin: record.pin || '382445',
      status: record.status || 'Active',
      taxpayerType: record.taxpayerType || 'Regular',
      registrationDate: record.registrationDate || '01/07/2017'
    };
  }

  // Derive realistic entity structure based on 4th character of PAN (C=Company, P=Person, F=Firm, H=HUF, L=LLP)
  const entityType = pan.charAt(3) || 'C';
  const defaults = STATE_DEFAULT_CITIES[stateCode] || { city: 'Ahmedabad', pin: '380001', area: 'GIDC Industrial Zone' };

  let generatedLegalName = '';
  let generatedTradeName = '';

  const prefix = pan.substring(0, 4);
  if (entityType === 'C') {
    generatedLegalName = `${prefix} INDUSTRIAL SOLUTIONS PRIVATE LIMITED`;
    generatedTradeName = `${prefix} INDUSTRIES`;
  } else if (entityType === 'P') {
    generatedLegalName = `${prefix} TRADING CO.`;
    generatedTradeName = `${prefix} ENTERPRISES`;
  } else if (entityType === 'F' || entityType === 'L') {
    generatedLegalName = `${prefix} ENGINEERING & SAFETY LLP`;
    generatedTradeName = `${prefix} SAFETY ASSOCIATES`;
  } else {
    generatedLegalName = `${prefix} COMMERCIAL CORPORATION`;
    generatedTradeName = `${prefix} ENTERPRISES`;
  }

  return {
    gstin,
    legalName: generatedLegalName,
    tradeName: generatedTradeName,
    pan,
    state,
    stateCode,
    address: `Plot No. ${Math.floor(10 + Math.random() * 90)}, Road No. 4, ${defaults.area}`,
    city: defaults.city,
    pin: defaults.pin,
    status: 'Active',
    taxpayerType: 'Regular',
    registrationDate: '01/04/2018'
  };
}
