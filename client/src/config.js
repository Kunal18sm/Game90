const trimTrailingSlash = (value) => value?.replace(/\/+$/, '') ?? '';

export const API_URL = trimTrailingSlash(import.meta.env.VITE_API_URL) || 'http://localhost:8080';
export const SOCKET_URL = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL) || API_URL;
