import { AI_BASE, getAuthHeader } from './common';

export const aiMarketingApi = {
  async getFinancialOverview(fiscalYear: number = 2026): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/finance/overview?fiscal_year=${fiscalYear}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch financial overview');
    return res.json();
  },

  async getFinanceOverview(fiscalYear: number = 2026): Promise<any> {
    return this.getFinancialOverview(fiscalYear);
  },

  async getFailedTransactions(): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/finance/failed-transactions`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch failed transactions intelligence');
    return res.json();
  },

  async generateBoardroomReport(): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/finance/generate-boardroom-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to generate AI boardroom report');
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
    if (!res.ok) throw new Error('Failed to broadcast promo campaign');
    return res.json();
  },

  async getActivePromo(): Promise<{ active_promotion: any }> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/marketing/active-promo`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch active promo');
    return res.json();
  },

  async dismissPromo(): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/marketing/dismiss`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to dismiss promo');
    return res.json();
  },

  async sendConciergeChat(messages: Array<{ role: string; content: string }>, userContext?: any): Promise<any> {
    const res = await fetch(`${AI_BASE}/api/v1/ai/concierge/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ messages, user_context: userContext }),
    });
    if (!res.ok) throw new Error('AI Concierge assistant unavailable');
    return res.json();
  },

  async conciergeChat(messages: Array<{ role: string; content: string }>, userContext?: any): Promise<any> {
    return this.sendConciergeChat(messages, userContext);
  },
};
