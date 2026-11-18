import { Auction, Bid, BidResponse, PaymentOrderResponse } from '../../types';
import { CATALOG_BASE, PAYMENT_BASE, getAuthHeader } from './common';

export const auctionApi = {
  async getAuctions(status?: string): Promise<Auction[]> {
    const url = status
      ? `${CATALOG_BASE}/api/v1/auctions?status=${encodeURIComponent(status)}`
      : `${CATALOG_BASE}/api/v1/auctions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch auctions');
    return res.json();
  },

  async getAuctionById(id: string): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${id}`);
    if (!res.ok) throw new Error('Auction not found');
    return res.json();
  },

  async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/bids`);
    if (!res.ok) throw new Error('Failed to fetch bid ledger');
    return res.json();
  },

  async placeBid(auctionId: string, bidAmount: number, confirmSelfOutbid: boolean = false): Promise<BidResponse> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        auctionId,
        bidAmount,
        confirmSelfOutbid,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const isOutage = res.status === 502 || res.status === 503 || res.status === 504 || res.status === 500;
      const errorObj = new Error(err.message || (isOutage ? 'Live bidding service is temporarily re-synchronizing' : 'Failed to place bid'));
      (errorObj as any).code = err.code || (isOutage ? 'HTTP_503_DEGRADED' : 'BID_FAILED');
      (errorObj as any).status = res.status;
      (errorObj as any).isServiceOutage = isOutage;
      throw errorObj;
    }
    return res.json();
  },

  async createAuction(payload: {
    vehicleId: string;
    startPrice: number;
    reservePrice: number;
    minBidIncrement: number;
    startTime: string;
    endTime: string;
  }): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create auction');
    }
    return res.json();
  },

  async activateAuction(auctionId: string): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/activate`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to activate auction');
    return res.json();
  },

  async closeAuction(auctionId: string): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/close`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to close auction');
    return res.json();
  },

  async updateAuctionStatus(id: string, status: string): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to update auction status');
    return res.json();
  },

  async extendAuction(id: string, extraMinutes: number = 2): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${id}/extend?extraMinutes=${extraMinutes}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to extend auction');
    return res.json();
  },

  async createDepositOrder(auctionId: string, amount: number, gateway: string): Promise<PaymentOrderResponse> {
    const res = await fetch(`${PAYMENT_BASE}/api/v1/payments/orders/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ auctionId, amount, gateway }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create payment order');
    }
    return res.json();
  },

  async simulateRazorpayWebhook(payload: any, signature: string): Promise<any> {
    const res = await fetch(`${PAYMENT_BASE}/api/v1/payments/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async initiateDeposit(auctionId: string, amount: number, gateway: string = 'INTERNAL_BROKER'): Promise<PaymentOrderResponse> {
    return this.createDepositOrder(auctionId, amount, gateway);
  },

  async submitInternalDeposit(data: {
    auctionId?: string;
    amount: number;
    payerId?: string;
    paymentMethod?: string;
  }): Promise<any> {
    const res = await fetch(`${PAYMENT_BASE}/api/v1/payments/internal/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        auctionId: data.auctionId || 'GLOBAL_ESCROW_DEPOSIT',
        amount: data.amount,
        payerId: data.payerId,
        paymentMethod: data.paymentMethod || 'AJ_INTERNAL_ESCROW',
        currency: 'AED',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to process deposit via internal broker');
    }
    return res.json();
  },

  // ================= ADMIN AUCTION BATCHES =================
  async getAuctionBatches(): Promise<any[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auction-batches`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to load auction batches (HTTP ${res.status})`);
    }
    return res.json();
  },

  async createAuctionBatch(payload: {
    title: string;
    auctionType: 'ONLINE' | 'SILENT';
    startTime: string;
    endTime: string;
    minBidIncrement?: number;
  }): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auction-batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create auction batch (HTTP ${res.status})`);
    }
    return res.json();
  },

  async addVehiclesToBatch(batchId: string, vehicleIds: string[]): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auction-batches/${batchId}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ vehicleIds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to add vehicles to batch (HTTP ${res.status})`);
    }
    return res.json();
  },

  async removeVehicleFromBatch(batchId: string, vehicleId: string): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auction-batches/${batchId}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to remove vehicle from batch (HTTP ${res.status})`);
    }
    return res.json();
  },

  async publishAuctionBatch(batchId: string): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auction-batches/${batchId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to publish batch (HTTP ${res.status})`);
    }
    return res.json();
  },

  async deleteAuctionBatch(batchId: string): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auction-batches/${batchId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to delete batch (HTTP ${res.status})`);
    }
    return res.json();
  },

  // ================= SILENT AUCTION SEALED BIDS =================
  async submitSilentBid(auctionId: string, bidAmount: number): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/silent-bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ bidAmount }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to submit sealed bid (HTTP ${res.status})`);
    }
    return res.json();
  },

  async getMySilentBid(auctionId: string): Promise<{ hasBid: boolean; bidAmount?: number; status?: string; updatedAt?: string }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/silent-bids/my-bid`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return { hasBid: false };
    return res.json();
  },

  async getAdminSilentBids(auctionId: string): Promise<any[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auctions/${auctionId}/silent-bids`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch sealed bids (HTTP ${res.status})`);
    }
    return res.json();
  },

  async awardSilentBid(auctionId: string, bidId: string): Promise<any> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/admin/auctions/${auctionId}/silent-bids/${bidId}/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to award silent auction (HTTP ${res.status})`);
    }
    return res.json();
  },

  // ================= BUYER PORTAL (FAVORITES, PURCHASES, PAYMENTS, BIDS) =================
  async getBuyerFavorites(): Promise<string[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/buyer/favorites`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.vehicleIds) ? data.vehicleIds : [];
  },

  async addBuyerFavorite(vehicleId: string): Promise<string[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/buyer/favorites/${vehicleId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to add to watchlist');
    const data = await res.json();
    return Array.isArray(data.vehicleIds) ? data.vehicleIds : [];
  },

  async removeBuyerFavorite(vehicleId: string): Promise<string[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/buyer/favorites/${vehicleId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to remove from watchlist');
    const data = await res.json();
    return Array.isArray(data.vehicleIds) ? data.vehicleIds : [];
  },

  async getBuyerPurchases(): Promise<any[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/buyer/purchases`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load purchased vehicles');
    return res.json();
  },

  async getBuyerPayments(): Promise<any[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/buyer/payments`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load payment history');
    return res.json();
  },

  async getBuyerBids(): Promise<any[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/buyer/bids`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load bids');
    return res.json();
  },
};
