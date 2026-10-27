import { AuthResponse, User, Vehicle, Auction, Bid, BidResponse, PaymentOrderResponse, UserStats } from '../types';

const CATALOG_BASE = import.meta.env.VITE_CATALOG_API_URL || '';
const PAYMENT_BASE = import.meta.env.VITE_PAYMENT_API_URL || '';
const AI_BASE = import.meta.env.VITE_AI_API_URL || '';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // --- AUTH DOMAIN ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    panNumber?: string;
    gstNumber?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/me`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const user: User = await res.json();
    
    // Enrich with local deposit & 200x limit arbiter
    const storedDeposit = localStorage.getItem('user_deposit_' + user.id);
    const storedLimit = localStorage.getItem('user_limit_' + user.id);
    const storedUsed = localStorage.getItem('user_used_limit_' + user.id);
    const storedBank = localStorage.getItem('user_bank_' + user.id);
    const storedIban = localStorage.getItem('user_iban_' + user.id);

    const depositNum = storedDeposit !== null ? Number(storedDeposit) : (user.securityDeposit ?? 4000);
    const limitNum = storedLimit !== null ? Number(storedLimit) : (user.biddingLimit ?? (depositNum * 200));
    const usedNum = storedUsed !== null ? Number(storedUsed) : (user.usedBiddingLimit ?? 0);

    user.securityDeposit = depositNum;
    user.biddingLimit = limitNum;
    user.usedBiddingLimit = usedNum;
    user.bankName = storedBank || user.bankName || 'Emirates NBD';
    user.iban = storedIban || user.iban || 'AE070330000000012345678';

    return user;
  },

  async azureB2cLogin(payload: {
    idToken?: string;
    code?: string;
    redirectUri?: string;
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    b2cObjectId?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/azure-b2c`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Azure B2C authentication failed');
    }
    return res.json();
  },

  async keycloakLogin(payload: {
    accessToken?: string;
    idToken?: string;
    email?: string;
    username?: string;
    fullName?: string;
    phoneNumber?: string;
    keycloakUserId?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/keycloak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Keycloak authentication failed');
    }
    return res.json();
  },

  async getUsers(params: {
    page?: number;
    size?: number;
    role?: string;
    search?: string;
  }): Promise<{ content: User[]; totalElements: number; totalPages: number; number: number }> {
    const q = new URLSearchParams();
    if (params.page !== undefined) q.set('page', String(params.page));
    if (params.size !== undefined) q.set('size', String(params.size));
    if (params.role && params.role !== 'ALL') q.set('role', params.role);
    if (params.search) q.set('search', params.search);

    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/users?${q.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch user directory');
    return res.json();
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to reset password');
    }
    return res.json();
  },

  async sendWhatsAppOtp(phoneNumber: string): Promise<{ success: boolean; message: string; otpCode?: string }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/otp/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to dispatch WhatsApp OTP');
    }
    return res.json();
  },

  async sendEmailOtp(email: string, fullName?: string): Promise<{ success: boolean; message: string; otpCode?: string }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/otp/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to dispatch Email OTP');
    }
    return res.json();
  },

  async verifyOtp(destination: string, code: string): Promise<{ verified: boolean; message: string }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'OTP verification failed');
    }
    return res.json();
  },

  // --- CATALOG DOMAIN ---
  async getVehicles(type?: string): Promise<Vehicle[]> {
    const url = type
      ? `${CATALOG_BASE}/api/v1/catalog/vehicles?type=${encodeURIComponent(type)}`
      : `${CATALOG_BASE}/api/v1/catalog/vehicles`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch vehicle catalog');
    return res.json();
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${id}`);
    if (!res.ok) throw new Error('Vehicle not found');
    return res.json();
  },

  async createVehicle(payload: {
    vin?: string;
    registrationNumber?: string;
    engineNumber?: string;
    vehicleType?: string;
    make: string;
    model: string;
    manufacturingYear: number;
    odometerReadingKm?: number;
    fuelType?: string;
    mediaPaths?: string[];
    inspectionReportUrl?: string;
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
  }): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to register vehicle');
    }
    return res.json();
  },

  async approveVehicle(vehicleId: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/approve`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to approve vehicle');
    }
    return res.json();
  },

  async sendToWash(vehicleId: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/send-to-wash`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send vehicle to washing');
    }
    return res.json();
  },

  async markWashingComplete(vehicleId: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/wash-complete`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to complete washing');
    }
    return res.json();
  },

  async submitPhotoVehicle(vehicleId: string, mediaPaths?: string[]): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/photo-submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ mediaPaths: mediaPaths || [] }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit photo vehicle');
    }
    return res.json();
  },

  async updateTechnicalReport(vehicleId: string, reportUrl: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/technical-report`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reportUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update technical report');
    }
    return res.json();
  },

  async submitTechnicalTest(vehicleId: string, comment?: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/technical-submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ comment: comment || '' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit technical test');
    }
    return res.json();
  },

  async batchApproveVehicles(vehicleIds: string[]): Promise<Vehicle[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/batch-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(vehicleIds),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to batch approve vehicles');
    }
    return res.json();
  },

  async batchArchiveVehicles(vehicleIds: string[]): Promise<Vehicle[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/batch-archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(vehicleIds),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to batch archive vehicles');
    }
    return res.json();
  },

  async getUserStats(): Promise<UserStats> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/stats/users`);
    if (!res.ok) throw new Error('Failed to fetch user stats');
    return res.json();
  },

  async batchCreateVehicles(vehicles: any[]): Promise<Vehicle[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(vehicles),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to batch upload vehicles');
    }
    return res.json();
  },

  // --- AUCTION DOMAIN ---
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
      const errorObj = new Error(err.message || 'Failed to place bid');
      (errorObj as any).code = err.code;
      (errorObj as any).status = res.status;
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
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to activate auction');
    return res.json();
  },

  async closeAuction(auctionId: string): Promise<Auction> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auctions/${auctionId}/close`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to close auction');
    return res.json();
  },

  // --- PAYMENT DOMAIN ---
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

  // --- REAL-TIME LIVE SESSIONS DOMAIN ---
  async sendSessionHeartbeat(sessionData: {
    userId: string;
    userName?: string;
    email?: string;
    role?: string;
    currentScreen?: string;
    securityDeposit?: number;
    usedBiddingLimit?: number;
    bidsPlacedInSession?: number;
    deviceType?: string;
    browser?: string;
    os?: string;
    protocol?: string;
    clientIp?: string;
    clientPrivateIp?: string;
    publicIp?: string;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await fetch(`${CATALOG_BASE}/api/v1/sessions/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(sessionData),
      });
    } catch {
      // Heartbeat fails silently
    }
  },

  async getLiveSessions(): Promise<{ sessions: any[]; totalUsers: number; activeBidders: number }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/sessions/live`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch live sessions');
    return res.json();
  },

  async logoutSession(userId: string, deviceType?: string): Promise<void> {
    try {
      await fetch(`${CATALOG_BASE}/api/v1/sessions/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ userId, deviceType }),
      });
    } catch {
      // Ignore
    }
  },

  // --- AI DOMAIN: MARKETING, FINANCE & CONCIERGE ---
  async getFinanceOverview(year?: number): Promise<any> {
    const url = year ? `${AI_BASE}/api/v1/ai/finance/overview?fiscal_year=${year}` : `${AI_BASE}/api/v1/ai/finance/overview`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch finance overview');
    return res.json();
  },

  async getFailedTransactions(): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/finance/failed-transactions`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch failed transactions');
    return res.json();
  },

  async generateBoardroomReport(): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/finance/generate-boardroom-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to generate boardroom report');
    return res.json();
  },

  async generatePromoVariants(data: {
    raw_intent: string;
    category?: string;
    discount_pct?: number;
    duration_hours?: number;
  }): Promise<{ variants: any[] }> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/marketing/generate-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate promo variants');
    return res.json();
  },

  async broadcastPromo(campaign: any): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/marketing/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(campaign),
    });
    if (!res.ok) throw new Error('Failed to broadcast promo');
    return res.json();
  },

  async getActivePromo(): Promise<{ active_promotion: any }> {
    try {
      const res = await fetch(`${AI_BASE}/api/v1/ai/marketing/active-promo`);
      if (!res.ok) return { active_promotion: null };
      return res.json();
    } catch {
      return { active_promotion: null };
    }
  },

  async dismissPromo(): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/marketing/dismiss`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async conciergeChat(messages: Array<{ role: string; content: string }>, userContext?: any): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/concierge/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ messages, user_context: userContext }),
    });
    if (!res.ok) throw new Error('Failed to chat with AI Concierge');
    return res.json();
  },
};

