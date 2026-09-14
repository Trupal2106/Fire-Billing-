// Master Unit of Measurement (UOM) definitions as requested
// Rule: In the bill / invoice, the bracket unit value (e.g. NOS, PCS, KGS, MTR) is stored and shown.

export interface UnitDefinition {
  name: string;      // Full Name (e.g. Numbers, Pieces, Kilograms)
  code: string;      // Bracket Value to show in the bill (e.g. NOS, PCS, KGS)
  displayName: string; // "Numbers (NOS)"
  category?: string;
}

export const RAW_UNIT_LIST: { name: string; code: string }[] = [
  { name: 'Aaaaaaaaaaa', code: 'G NEX' },
  { name: 'Aana', code: 'ANA' },
  { name: 'Accessories', code: 'ACS' },
  { name: 'Acre', code: 'AC' },
  { name: 'Adult', code: 'ADL' },
  { name: 'Ampoule', code: 'AMP' },
  { name: 'Bags', code: 'BAG' },
  { name: 'Bale', code: 'BAL' },
  { name: 'Balls', code: 'BALL' },
  { name: 'Barni', code: 'BAR' },
  { name: 'Barrel', code: 'BRL' },
  { name: 'Batch', code: 'BTH' },
  { name: 'Billions Of Units', code: 'BOU' },
  { name: 'Blister', code: 'BLISTER' },
  { name: 'Bolus', code: 'BOLUS' },
  { name: 'Book', code: 'BK' },
  { name: 'Bora', code: 'BOR' },
  { name: 'Bottles', code: 'BTL' },
  { name: 'Box', code: 'BOX' },
  { name: 'Brass', code: 'BRASS' },
  { name: 'Brick', code: 'BRICK' },
  { name: 'Buckets', code: 'BCK' },
  { name: 'Buckles', code: 'BKL' },
  { name: 'Bunches', code: 'BUN' },
  { name: 'Bundles', code: 'BDL' },
  { name: 'Butts', code: 'BTS' },
  { name: 'Cable', code: 'CBL' },
  { name: 'Cans', code: 'CAN' },
  { name: 'Cap', code: 'CAP' },
  { name: 'Capsules', code: 'CPS' },
  { name: 'Carat', code: 'CT' },
  { name: 'Carats', code: 'CTS' },
  { name: 'Card', code: 'CARD' },
  { name: 'Cartons', code: 'CTN' },
  { name: 'Cartridge', code: 'CART' },
  { name: 'Case', code: 'CASE' },
  { name: 'Centimeter', code: 'CMS' },
  { name: 'Cents', code: 'CNT' },
  { name: 'Ch', code: 'CHAIN' },
  { name: 'Chain', code: 'CHN' },
  { name: 'Child', code: 'CLD' },
  { name: 'Choka', code: 'CHOKA' },
  { name: 'Chudi', code: 'CHUDI' },
  { name: 'Cloth', code: 'CLT' },
  { name: 'Coil', code: 'COIL' },
  { name: 'Cone', code: 'CN' },
  { name: 'Container', code: 'CONT' },
  { name: 'Copy', code: 'COPY' },
  { name: 'Cotton', code: 'COTT' },
  { name: 'Course', code: 'COURSE' },
  { name: 'Crate', code: 'CRT' },
  { name: 'Cream', code: 'CRM' },
  { name: 'Cubic Centimeter', code: 'CCM' },
  { name: 'Cubic Feet', code: 'CUFT' },
  { name: 'Cubic Feet Per Minute', code: 'CFM' },
  { name: 'Cubic Foot', code: 'CFT' },
  { name: 'Cubic Meter', code: 'CBM' },
  { name: 'Cubic Meters', code: 'CUM' },
  { name: 'Cup', code: 'CUP' },
  { name: 'Cv', code: 'CV' },
  { name: 'Daily', code: 'DAILY' },
  { name: 'Dangler', code: 'DANGLER' },
  { name: 'Days', code: 'DAY' },
  { name: 'Daze', code: 'DEZ' },
  { name: 'Decimeter', code: 'DMTR' },
  { name: 'Dozen', code: 'DOZ' },
  { name: 'Drop', code: 'DROP' },
  { name: 'Drum', code: 'DRM' },
  { name: 'Duty', code: 'DUTY' },
  { name: 'Ea', code: 'EA' },
  { name: 'Each', code: 'EACH' },
  { name: 'Feet', code: 'FT' },
  { name: 'Feet Square', code: 'FT2' },
  { name: 'Finger', code: 'FNGR' },
  { name: 'Fit', code: 'FIT' },
  { name: 'Flat', code: 'FLT' },
  { name: 'Fold', code: 'FLD' },
  { name: 'Fortnight', code: 'FN' },
  { name: 'Free', code: 'FREE' },
  { name: 'Fts', code: 'FTS' },
  { name: 'Full Plate', code: 'FP' },
  { name: 'Gel', code: 'GEL' },
  { name: 'Glasses', code: 'GLS' },
  { name: 'Grams', code: 'GMS' },
  { name: 'Great Gross', code: 'GGR' },
  { name: 'Gross', code: 'GRS' },
  { name: 'Gross Yards', code: 'GYD' },
  { name: 'Half', code: 'HF' },
  { name: 'Half Plate', code: 'H.P.' },
  { name: 'Hanger', code: 'HEGAR' },
  { name: 'Hangers', code: 'HANGER' },
  { name: 'Hectare', code: 'HA' },
  { name: 'Helmet', code: 'HMT' },
  { name: 'Horsepower', code: 'HP' },
  { name: 'Hours', code: 'HRS' },
  { name: 'Hundreds', code: 'HDS' },
  { name: 'Ijn', code: 'INJECTION' },
  { name: 'Inch Dia', code: 'ID' },
  { name: 'Inch-meter', code: 'IM' },
  { name: 'Inches', code: 'IN' },
  { name: 'Inj', code: 'INJECTION' },
  { name: 'Insertion', code: 'INS' },
  { name: 'Item Id', code: 'ITEM ID' },
  { name: 'Jars', code: 'JAR' },
  { name: 'Jhal', code: 'JL' },
  { name: 'Jhola', code: 'JO' },
  { name: 'Jhola Jhal', code: 'JHL' },
  { name: 'Jhudi', code: 'JHD' },
  { name: 'Job', code: 'JOB' },
  { name: 'Katta', code: 'KT' },
  { name: 'Kilograms', code: 'KGS' },
  { name: 'Kiloliter', code: 'KLR' },
  { name: 'Kilometre', code: 'KME' },
  { name: 'Kilometres', code: 'KMS' },
  { name: 'Kilovolt-amp', code: 'KVA' },
  { name: 'Kilowatt', code: 'KW' },
  { name: 'Kit', code: 'KIT' },
  { name: 'Km', code: 'KM' },
  { name: 'Ladi', code: 'LAD' },
  { name: 'Length', code: 'LENG' },
  { name: 'Libra Pondo', code: 'LBS' },
  { name: 'Line', code: 'LNE' },
  { name: 'Litre', code: 'LTR' },
  { name: 'Lot', code: 'LOT' },
  { name: 'Lump Sum', code: 'LS' },
  { name: 'M', code: 'MILLE' },
  { name: 'Man-days', code: 'MAN-DAY' },
  { name: 'Marakkal', code: 'MK' },
  { name: 'Mark', code: 'MRK' },
  { name: 'Mbps', code: 'MBPS' },
  { name: 'Megawatt', code: 'MW' },
  { name: 'Meters', code: 'MTR' },
  { name: 'Metric Million British Thermal Unit', code: 'MMBTU' },
  { name: 'Metric Ton', code: 'MTON' },
  { name: 'Metric, Ton', code: 'MTS' },
  { name: 'Microgram', code: 'ΜG' },
  { name: 'Mille', code: 'M' },
  { name: 'Millicoulomb', code: 'M/C' },
  { name: 'Milligram', code: 'MLG' },
  { name: 'Millilitre', code: 'MLT' },
  { name: 'Millimeter', code: 'MM' },
  { name: 'Minutes', code: 'MINS' },
  { name: 'Month', code: 'UOM' },
  { name: 'Months', code: 'MON' },
  { name: 'Mora', code: 'MORA' },
  { name: 'Nights', code: 'NIGHT' },
  { name: 'Non.', code: 'NON' },
  { name: 'None', code: 'NONE' },
  { name: 'Numbers', code: 'NOS' },
  { name: 'Ointment', code: 'OINT' },
  { name: 'Others', code: 'OTH' },
  { name: 'Outer', code: 'OR' },
  { name: 'Package', code: 'PKG' },
  { name: 'Packet', code: 'PACK' },
  { name: 'Packets', code: 'PKT' },
  { name: 'Packs', code: 'PAC' },
  { name: 'Pad', code: 'PAD' },
  { name: 'Pads', code: 'PADS' },
  { name: 'Pages', code: 'PAGE' },
  { name: 'Pair', code: 'PAIR' },
  { name: 'Pairs', code: 'PRS' },
  { name: 'Panel', code: 'PNL' },
  { name: 'Part', code: 'PART' },
  { name: 'Patta', code: 'PATTA' },
  { name: 'Patti', code: 'PTI' },
  { name: 'Pax', code: 'PAX' },
  { name: 'Per', code: 'PER' },
  { name: 'Per Day', code: '/DAY' },
  { name: 'Per Metric Ton', code: 'PMT' },
  { name: 'Per Trainer', code: 'PER TRAINER' },
  { name: 'Per Watt Peak', code: 'PWP' },
  { name: 'Persons', code: 'PERSON' },
  { name: 'Peti', code: 'PET' },
  { name: 'Phile', code: 'PHILE' },
  { name: 'Pieces', code: 'PCS' },
  { name: 'Pipe', code: 'PIPE' },
  { name: 'Plates', code: 'PLT' },
  { name: 'Pocket', code: 'PCKT' },
  { name: 'Point', code: 'PT' },
  { name: 'Portion', code: 'PRT' },
  { name: 'Pouch', code: 'POCH' },
  { name: 'Pound', code: 'POUND' },
  { name: 'Puda', code: 'PD' },
  { name: 'Quad', code: 'QUAD' },
  { name: 'Quantity', code: 'QTY' },
  { name: 'Quarter', code: 'QT' },
  { name: 'Quintal', code: 'QTL' },
  { name: 'Ratti', code: 'RTI' },
  { name: 'Ream', code: 'REAM' },
  { name: 'Reel', code: 'REEL' },
  { name: 'Respules', code: 'RESP' },
  { name: 'Rim', code: 'RIM' },
  { name: 'Rolls', code: 'ROL' },
  { name: 'Room', code: 'ROOM' },
  { name: 'Running Foot', code: 'RFT' },
  { name: 'Running Meter', code: 'RMT' },
  { name: 'Rupees', code: 'RS' },
  { name: 'Sachet', code: 'SAC' },
  { name: 'Seconds', code: 'SEC' },
  { name: 'Semester', code: 'SEM' },
  { name: 'Service', code: 'SERVICE' },
  { name: 'Session', code: 'SSN' },
  { name: 'Sets', code: 'SET' },
  { name: 'Sheet', code: 'SHEET' },
  { name: 'Skins', code: 'SKINS' },
  { name: 'Slants', code: 'SLT' },
  { name: 'Sleves', code: 'SLEVES' },
  { name: 'Spindles', code: 'SPLS' },
  { name: 'Spray', code: 'SPRAY' },
  { name: 'Square Centimeters', code: 'SQCM' },
  { name: 'Square Feet', code: 'SQF' },
  { name: 'Square Gaj', code: 'GAJ' },
  { name: 'Square Gaz', code: 'GAZ' },
  { name: 'Square Inches', code: 'SQIN' },
  { name: 'Square Kilometer', code: 'SQ KM' },
  { name: 'Square Meters', code: 'SQM' },
  { name: 'Square Yards', code: 'SQY' },
  { name: 'Srm', code: 'SARAM' },
  { name: 'Std Pouch', code: 'ST POUCH' },
  { name: 'Stickers', code: 'STICKER' },
  { name: 'Stone', code: 'STONE' },
  { name: 'Strips', code: 'STRP' },
  { name: 'Syrup', code: 'SYRP' },
  { name: 'Tablets', code: 'TBS' },
  { name: 'Ten Gross', code: 'TGM' },
  { name: 'Test', code: 'TEST' },
  { name: 'Than', code: 'TN' },
  { name: 'Thousands', code: 'THD' },
  { name: 'Ticket', code: 'TKT' },
  { name: 'Tin', code: 'TIN' },
  { name: 'Tonnes', code: 'TON' },
  { name: 'Trays', code: 'TRY' },
  { name: 'Trolly', code: 'TRLY' },
  { name: 'Trp', code: 'TRIP' },
  { name: 'Truck', code: 'TRK' },
  { name: 'Tubes', code: 'TUB' },
  { name: 'Units', code: 'UNT' },
  { name: 'Us Gallons', code: 'UGS' },
  { name: 'Vials', code: 'VIAL' },
  { name: 'Watt', code: 'W' },
  { name: 'Weeks', code: 'WEEK' },
  { name: 'Yards', code: 'YDS' },
  { name: 'Years', code: 'YRS' }
];

export const ALL_BILLING_UNITS: UnitDefinition[] = RAW_UNIT_LIST.map(u => ({
  name: u.name,
  code: u.code,
  displayName: `${u.name} (${u.code})`,
  category: 'All Units'
}));

// Quick access units most frequently used in billing & fire safety
export const POPULAR_UNITS: string[] = [
  'NOS',
  'PCS',
  'SET',
  'BOX',
  'KGS',
  'MTR',
  'LTR',
  'BAG',
  'PKT',
  'RMT',
  'SQF',
  'JOB',
  'MON',
  'YRS'
];

/**
 * Normalizes any unit string to its standard bracket code (to show in the bill).
 * E.g. "Numbers" -> "NOS", "Nos" -> "NOS", "nos" -> "NOS", "Pieces" -> "PCS", "Pcs" -> "PCS"
 */
export function normalizeUnit(rawUnit?: string): string {
  if (!rawUnit) return 'NOS';
  const trimmed = rawUnit.trim();

  // Direct code match (case-insensitive)
  const codeMatch = ALL_BILLING_UNITS.find(
    u => u.code.toLowerCase() === trimmed.toLowerCase()
  );
  if (codeMatch) return codeMatch.code;

  // Name match (e.g. "Numbers", "Pieces", "Kilograms")
  const nameMatch = ALL_BILLING_UNITS.find(
    u => u.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (nameMatch) return nameMatch.code;

  // Common aliases
  const lower = trimmed.toLowerCase();
  if (lower === 'nos' || lower === 'no' || lower === 'number') return 'NOS';
  if (lower === 'pcs' || lower === 'pc' || lower === 'piece') return 'PCS';
  if (lower === 'kg' || lower === 'kgs' || lower === 'kilo') return 'KGS';
  if (lower === 'meter' || lower === 'meters' || lower === 'm') return 'MTR';
  if (lower === 'ltr' || lower === 'litre' || lower === 'liter') return 'LTR';
  if (lower === 'box' || lower === 'boxes') return 'BOX';
  if (lower === 'set' || lower === 'sets') return 'SET';
  if (lower === 'bag' || lower === 'bags') return 'BAG';
  if (lower === 'packet' || lower === 'packets' || lower === 'pkt') return 'PKT';
  if (lower === 'rmt' || lower === 'running meter') return 'RMT';
  if (lower === 'sqft' || lower === 'sq.ft' || lower === 'sq ft') return 'SQF';
  if (lower === 'sqm' || lower === 'sq.mt') return 'SQM';
  if (lower === 'year' || lower === 'years' || lower === 'yr') return 'YRS';
  if (lower === 'month' || lower === 'months') return 'MON';
  if (lower === 'job' || lower === 'job work') return 'JOB';
  if (lower === 'point' || lower === 'points' || lower === 'pt') return 'PT';

  // Check if string is formatted like "Numbers(NOS)" or "Numbers (NOS)"
  const bracketMatch = trimmed.match(/\(([^)]+)\)/);
  if (bracketMatch && bracketMatch[1]) {
    const inside = bracketMatch[1].trim();
    const insideMatch = ALL_BILLING_UNITS.find(
      u => u.code.toLowerCase() === inside.toLowerCase()
    );
    if (insideMatch) return insideMatch.code;
    return inside.toUpperCase();
  }

  return trimmed;
}

/**
 * Returns the GST UQC code or bracket code for tax & invoice filing
 */
export function getUnitUqc(rawUnit?: string): string {
  const norm = normalizeUnit(rawUnit);
  return `${norm}-${norm}`;
}
