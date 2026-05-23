/**
 * Centralized API / Socket URLs for Vite (Vercel, Render, local).
 * Production fallback: Render backend when VITE_* is unset at build time.
 */
export const PRODUCTION_BACKEND_ORIGIN = 'https://ethra-ai-1.onrender.com';

const trimTrailingSlash = (value) => (value ? String(value).replace(/\/+$/, '') : '');

/** Normalize VITE_API_URL to always end with /api (no double slash). */
export const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    const base = trimTrailingSlash(fromEnv);
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  if (import.meta.env.PROD) {
    return `${PRODUCTION_BACKEND_ORIGIN}/api`;
  }
  return 'http://localhost:5000/api';
};

/** Socket.io server origin (no /api suffix). */
export const getSocketUrl = () => {
  const fromEnv = import.meta.env.VITE_SOCKET_URL?.trim();
  if (fromEnv) return trimTrailingSlash(fromEnv);
  if (import.meta.env.PROD) return PRODUCTION_BACKEND_ORIGIN;
  return 'http://localhost:5000';
};

/** Backend origin for static assets (e.g. /uploads). */
export const getBackendOrigin = () => getApiBaseUrl().replace(/\/api$/, '');
