/**
 * Helper to resolve static asset URLs respecting Vite base path (e.g. /seller-buyer/).
 */
export const getAssetUrl = (path: string): string => {
  const base = (import.meta.env.BASE_URL || '/seller-buyer/').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
