import { AuthResponse, User } from '../../types';
import { CATALOG_BASE, getAuthHeader } from './common';

export const authApi = {
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
      headers: { ...getAuthHeader() },
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('kc_access_token');
      localStorage.removeItem('kc_id_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eauction:unauthorized'));
      }
      throw new Error('UNAUTHORIZED_TOKEN_INVALID');
    }
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

  async validateSession(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return await this.getMe();
    } catch {
      return null;
    }
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
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async resetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
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
      throw new Error(err.message || 'Failed to reset password');
    }
    return res.json();
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    return this.resetPassword(userId, newPassword);
  },

  async sendWhatsAppOtp(phoneNumber: string): Promise<{ success: boolean; otpCode: string; message: string; channel: string }> {
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

  async sendEmailOtp(email: string, fullName: string = 'Valued Bidder'): Promise<{ success: boolean; otpCode: string; message: string; channel: string }> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/auth/otp/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send Email OTP');
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
      throw new Error(err.message || 'Invalid or expired OTP');
    }
    return res.json();
  },
};
