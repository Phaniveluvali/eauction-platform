export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export type VehicleType = 'CAR' | 'TRUCK';
export type AuctionStatus = 'PENDING' | 'ACTIVE' | 'ENDED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  kycVerified: boolean;
  panNumber?: string;
  gstNumber?: string;
  isActive: boolean;
  createdAt?: string;
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
  securityDeposit?: number;
  biddingLimit?: number;
  usedBiddingLimit?: number;
  bankName?: string;
  iban?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  kycVerified: boolean;
  expiresInMs: number;
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
}

export interface UserStats {
  totalCustomers: number;
  buyers: number;
  sellers: number;
  staff: number;
}

export interface Vehicle {
  id: string;
  sellerId: string;
  vin: string;
  registrationNumber: string;
  engineNumber: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  manufacturingYear: number;
  odometerReadingKm: number;
  fuelType: string;
  mediaPaths: string[];
  inspectionReportUrl?: string;
  createdAt: string;
  lotNo?: number;
  branch?: string;
  noOfKeys?: string;
  color?: string;
  targetSellingPrice?: number;
  minimumSellingPrice?: number;
  previousNumberplate?: string;
  clientName?: string;
  mulkiyaDocumentUrl?: string;
  wfActivityId?: string;
  status?: string;
  oldId?: string;
  location?: string;
}

export interface Auction {
  id: string;
  vehicleId: string;
  startPrice: number;
  reservePrice: number;
  minBidIncrement: number;
  currentHighestBid: number;
  highestBidderId?: string;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  auctionType?: 'ONLINE' | 'SILENT';
  version: number;
  vehicle?: Vehicle;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidAmount: number;
  status: string;
  createdAt: string;
}

export interface BidResponse {
  status: 'SUCCESS' | 'REJECTED' | 'ERROR';
  message: string;
  auctionId: string;
  bidderId?: string;
  bidAmount?: number;
  currentHighestBid: number;
  timestamp: number;
}

export interface PaymentOrderResponse {
  message: string;
  orderId: string;
  auctionId: string;
  payerId: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
}
