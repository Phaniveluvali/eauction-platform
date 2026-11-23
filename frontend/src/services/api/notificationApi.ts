import { CATALOG_BASE, getAuthHeader } from './common';

export interface NotificationSettings {
  globalEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  auctionStartedEnabled: boolean;
  auctionClosingSoonEnabled: boolean;
  outbidEnabled: boolean;
  auctionWonEnabled: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export const notificationApi = {
  async getNotificationSettings(): Promise<NotificationSettings> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/notifications/settings`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch notification settings');
    return res.json();
  },

  async updateNotificationSettings(settings: NotificationSettings, updatedBy?: string): Promise<NotificationSettings> {
    const actor = updatedBy || 'admin';
    const res = await fetch(`${CATALOG_BASE}/api/v1/notifications/settings?updatedBy=${encodeURIComponent(actor)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update notification settings');
    return res.json();
  },

  async toggleGlobalNotifications(updatedBy?: string): Promise<NotificationSettings> {
    const actor = updatedBy || 'admin';
    const res = await fetch(`${CATALOG_BASE}/api/v1/notifications/toggle-global?updatedBy=${encodeURIComponent(actor)}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to toggle notifications');
    return res.json();
  },

  async stopAllNotifications(updatedBy?: string): Promise<NotificationSettings> {
    const actor = updatedBy || 'admin';
    const res = await fetch(`${CATALOG_BASE}/api/v1/notifications/stop-all?updatedBy=${encodeURIComponent(actor)}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to stop all notifications');
    return res.json();
  },
};
