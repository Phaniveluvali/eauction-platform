export interface SeedUserRecord {
  id: string;
  email: string;
  fullName: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  phoneNumber: string;
  panNumber: string;
  gstNumber: string;
  kycVerified: boolean;
}

const buyerNames = [
  'Sharma Transport',
  'Patel Logistics',
  'Verma Carriers',
  'Gupta Cargo',
  'Singh Express',
  'Kumar Freights',
  'Reddy Roadways',
  'Choudhury Fleet',
  'Nair Movers',
  'Mishra Haulage',
];

const sellerNames = [
  'Tata Fleet Logistics',
  'Ashok Leyland Certified',
  'Bharat Fleet Yard',
  'Mahindra Heavy Sales',
  'Eicher Commercial Hub',
];

const adminNames = [
  'Operations Supervisor',
  'Chief Auctioneer',
  'RTO Fleet Inspector',
  'Settlement Controller',
  'Platform Auditor',
];

// Pre-compile list of all 504 users matching PostgreSQL database records
export const SEED_USERS: SeedUserRecord[] = [
  // Original defaults
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    email: 'admin@eauction.in',
    fullName: 'System Administrator',
    role: 'ADMIN',
    phoneNumber: '+919000000001',
    panNumber: 'AAACT1234F',
    gstNumber: '27AAACT1234F1Z5',
    kycVerified: true,
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    email: 'seller@tatafleet.in',
    fullName: 'Tata Fleet Logistics Pvt Ltd',
    role: 'SELLER',
    phoneNumber: '+919876543210',
    panNumber: 'AAACT1234F',
    gstNumber: '27AAACT1234F1Z5',
    kycVerified: true,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    email: 'buyer@sharmatransport.in',
    fullName: 'Sharma Transport Logistics',
    role: 'BUYER',
    phoneNumber: '+919876543211',
    panNumber: 'ABCDE1234F',
    gstNumber: '27ABCDE1234F1Z9',
    kycVerified: true,
  },
];

// Generate the 450 buyers
for (let i = 1; i <= 450; i++) {
  const nameBase = buyerNames[(i - 1) % buyerNames.length];
  const numPad = String(i).padStart(6, '0');
  const panPad = String(1000 + i).padStart(4, '0');
  SEED_USERS.push({
    id: `buyer-uuid-${i}`,
    email: `buyer${i}@eauction.in`,
    fullName: `${nameBase} #${i}`,
    role: 'BUYER',
    phoneNumber: `+919800${numPad}`,
    panNumber: `ABCDE${panPad}F`,
    gstNumber: `27ABCDE${panPad}F1Z5`,
    kycVerified: true,
  });
}

// Generate the 40 sellers
for (let i = 1; i <= 40; i++) {
  const nameBase = sellerNames[(i - 1) % sellerNames.length];
  const numPad = String(i).padStart(6, '0');
  const panPad = String(2000 + i).padStart(4, '0');
  SEED_USERS.push({
    id: `seller-uuid-${i}`,
    email: `seller${i}@eauction.in`,
    fullName: `${nameBase} #${i}`,
    role: 'SELLER',
    phoneNumber: `+919810${numPad}`,
    panNumber: `BCDEF${panPad}G`,
    gstNumber: `27BCDEF${panPad}G1Z5`,
    kycVerified: true,
  });
}

// Generate the 10 admins
for (let i = 1; i <= 10; i++) {
  const nameBase = adminNames[(i - 1) % adminNames.length];
  const numPad = String(i).padStart(6, '0');
  const panPad = String(3000 + i).padStart(4, '0');
  SEED_USERS.push({
    id: `admin-uuid-${i}`,
    email: `admin${i}@eauction.in`,
    fullName: `${nameBase} #${i}`,
    role: 'ADMIN',
    phoneNumber: `+919820${numPad}`,
    panNumber: `CDEFG${panPad}H`,
    gstNumber: `27CDEFG${panPad}H1Z5`,
    kycVerified: true,
  });
}
