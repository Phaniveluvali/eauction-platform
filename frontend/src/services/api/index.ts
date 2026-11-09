import { authApi } from './authApi';
import { catalogApi } from './catalogApi';
import { auctionApi } from './auctionApi';
import { sessionApi } from './sessionApi';
import { aiMarketingApi } from './aiMarketingApi';

export { authApi } from './authApi';
export { catalogApi } from './catalogApi';
export { auctionApi } from './auctionApi';
export { sessionApi } from './sessionApi';
export { aiMarketingApi } from './aiMarketingApi';

export const api = {
  ...authApi,
  ...catalogApi,
  ...auctionApi,
  ...sessionApi,
  ...aiMarketingApi,
};

export function isServiceDegraded(err: any): boolean {
  if (!err) return false;
  if (err.isServiceOutage) return true;
  if (err.status === 502 || err.status === 503 || err.status === 504) return true;
  if (err.code === 'HTTP_503_DEGRADED' || err.code === 'ERR_BID_ENGINE_DEGRADED_503') return true;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('502') || msg.includes('503') || msg.includes('504') || msg.includes('degraded') || msg.includes('synchronizing') || msg.includes('networkerror') || msg.includes('failed to fetch');
}

export default api;
