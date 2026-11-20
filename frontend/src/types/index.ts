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
  batchId?: string;
  version: number;
  vehicle?: Vehicle;
  hybridClosed?: boolean;
  updatedAt?: string;
  createdAt?: string;
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

export interface AuctionBatchVehicle {
  vehicleId: string;
  make: string;
  model: string;
  manufacturingYear: number;
  vin: string;
  registrationNumber: string;
  lotNo?: number;
  branch?: string;
  location?: string;
  targetSellingPrice?: number;
  minimumSellingPrice?: number;
  startPrice?: number;
  reservePrice?: number;
  vehicleStatus?: string;
  clientName?: string;
  auctionId?: string | null;
  auctionStatus?: string | null;
  currentHighestBid?: number | null;
}

export interface AuctionBatch {
  id: string;
  batchCode: string;
  title: string;
  auctionType: 'ONLINE' | 'SILENT';
  startTime: string;
  endTime: string;
  minBidIncrement: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdByEmail?: string;
  createdAt?: string;
  vehicleCount: number;
  vehicles: AuctionBatchVehicle[];
}

export interface SilentBidRecord {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderEmail: string;
  bidderName: string;
  bidAmount: number;
  status: 'SUBMITTED' | 'WON' | 'REJECTED';
  submittedAt?: string;
}

export interface BuyerPurchase {
  auctionId: string;
  auctionType: 'ONLINE' | 'SILENT';
  winningPrice: number;
  startPrice?: number;
  wonAt?: string;
  auctionStatus?: string;
  vehicleId: string;
  make: string;
  model: string;
  manufacturingYear: number;
  vin: string;
  registrationNumber: string;
  lotNo?: number;
  color?: string;
  fuelType?: string;
  odometerReadingKm?: number;
  location?: string;
  mediaPaths: string[];
  inspectionReportUrl?: string;
  paymentId?: string | null;
  paidAmount?: number | null;
  currency: string;
  gateway?: string | null;
  orderId?: string | null;
  transactionId?: string | null;
  paymentStatus: string;
  paymentDate?: string | null;
}

export interface BuyerPayment {
  id: string;
  auctionId?: string;
  vehicleId?: string;
  vehicleTitle: string;
  lotNo?: number;
  vin?: string;
  auctionType?: string;
  gateway: string;
  orderId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: string;
}

export interface BuyerBidItem {
  id: string;
  auctionId: string;
  vehicleId: string;
  auctionType: 'ONLINE' | 'SILENT';
  vehicleTitle: string;
  lotNo?: number;
  vin?: string;
  myBidAmount: number;
  currentHighestBid?: number | null;
  bidState: string;
  auctionStatus: string;
  endTime?: string;
  createdAt?: string;
  mediaPaths: string[];
}
