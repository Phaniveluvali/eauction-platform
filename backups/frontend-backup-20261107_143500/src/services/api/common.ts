export const CATALOG_BASE = import.meta.env.VITE_CATALOG_API_URL || '';
export const PAYMENT_BASE = import.meta.env.VITE_PAYMENT_API_URL || '';
export const AI_BASE = import.meta.env.VITE_AI_API_URL || '';

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
