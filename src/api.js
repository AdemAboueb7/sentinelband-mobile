/**
 * @file api.js
 * Client HTTP pour l'API SentinelBand.
 *
 * - Jeton JWT stocké exclusivement dans SecureStore.
 * - Timeout de 8 secondes sur chaque requête.
 * - Un 401 déclenche la déconnexion via le callback onUnauthorized.
 * - Aucune donnée sensible dans les logs.
 */

import * as SecureStore from 'expo-secure-store';
import { DEFAULT_API_URL } from './config';

const TOKEN_KEY = 'sentinelband_token';
const API_URL_KEY = 'sentinelband_api_url';
const TIMEOUT_MS = 8000;

// ─── Callback de déconnexion (injecté par AuthContext) ───────────────────────
let _onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

// ─── URL de l'API ────────────────────────────────────────────────────────────
let _apiUrl = DEFAULT_API_URL;

export async function loadApiUrl() {
  try {
    const stored = await SecureStore.getItemAsync(API_URL_KEY);
    if (stored) _apiUrl = stored;
  } catch {
    // SecureStore indisponible : utiliser la valeur par défaut
  }
  return _apiUrl;
}

export async function saveApiUrl(url) {
  const trimmed = url.trim().replace(/\/$/, '');
  _apiUrl = trimmed;
  await SecureStore.setItemAsync(API_URL_KEY, trimmed);
}

export function getApiUrl() {
  return _apiUrl;
}

// ─── Jeton JWT ───────────────────────────────────────────────────────────────

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Ignorer
  }
}

// ─── Requête de base ─────────────────────────────────────────────────────────

/**
 * Effectue une requête vers l'API avec timeout et gestion du 401.
 * @param {string} path - Chemin relatif (ex: '/api/colleagues')
 * @param {RequestInit} options - Options fetch
 * @returns {Promise<any>} Corps JSON de la réponse
 * @throws {ApiError}
 */
export async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    const token = await loadToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    response = await fetch(`${_apiUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new ApiError('Délai dépassé (timeout 8 s)', 0);
    }
    throw new ApiError('Impossible de joindre le serveur', 0);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401) {
    await clearToken();
    _onUnauthorized?.();
    throw new ApiError('Session expirée, veuillez vous reconnecter', 401);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(`Réponse invalide du serveur (${response.status})`, response.status);
  }

  if (!response.ok) {
    throw new ApiError(body?.error || `Erreur serveur (${response.status})`, response.status);
  }

  return body;
}

// ─── Classe d'erreur ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  /** @param {string} message @param {number} status */
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

// Auth
export const auth = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name, email, password) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
};

// Profil
export const me = {
  get: () => request('/api/me'),
  pushToken: (token) => request('/api/me/push-token', { method: 'POST', body: JSON.stringify({ token }) }),
  device: () => request('/api/me/device'),
  regenerateKey: () => request('/api/me/device/regenerate-key', { method: 'POST' }),
};

// Collègues
export const colleagues = {
  list: () => request('/api/colleagues'),
  add: (email) => request('/api/colleagues', { method: 'POST', body: JSON.stringify({ email }) }),
  history: (id, limit = 50) => request(`/api/colleagues/${id}/history?limit=${limit}`),
  alerts: (id) => request(`/api/colleagues/${id}/alerts`),
};

// Demandes
export const links = {
  requests: () => request('/api/links/requests'),
  accept: (viewerId) => request(`/api/links/${viewerId}/accept`, { method: 'POST' }),
};

// Alertes
export const alerts = {
  ack: (alertId) => request(`/api/alerts/${alertId}/ack`, { method: 'POST' }),
};

// Santé
export const health = {
  check: () => request('/health'),
};
