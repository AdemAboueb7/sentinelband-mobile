/**
 * @file config.js
 * Configuration centrale. L'URL de l'API peut être remplacée
 * via l'écran Profil (stockée dans SecureStore).
 */

/** URL de l'API par défaut (IP Wi-Fi de votre PC pour test sur téléphone réel) */
export const DEFAULT_API_URL = 'http://10.226.238.169:3000';

/** Intervalle de polling en millisecondes */
export const POLL_INTERVAL_MS = 3000;

/** Délai avant de considérer un boîtier hors ligne (secondes) */
export const OFFLINE_THRESHOLD_S = 30;

/** Nombre d'entrées d'historique à charger */
export const HISTORY_LIMIT = 50;
