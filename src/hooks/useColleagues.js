/**
 * @file hooks/useColleagues.js
 * Hook de polling des collègues.
 *
 * - Polling toutes les 3 s quand l'app est au premier plan.
 * - Arrêt automatique en arrière-plan (AppState).
 * - Pas de requêtes concurrentes.
 * - Annulation propre au démontage.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { colleagues as colleaguesApi } from '../api';
import { sortColleagues } from '../utils/format';
import { POLL_INTERVAL_MS } from '../config';

/**
 * @returns {{
 *   data: Array<object>,
 *   isLoading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 *   lastUpdated: Date|null,
 * }}
 */
export function useColleagues() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isFetchingRef = useRef(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);

  const fetchNow = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const list = await colleaguesApi.list();
      if (!mountedRef.current) return;
      setData(sortColleagues(list));
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Erreur réseau');
    } finally {
      isFetchingRef.current = false;
      if (!mountedRef.current) return;
      setIsLoading(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (timerRef.current) return;
    fetchNow();
    timerRef.current = setInterval(fetchNow, POLL_INTERVAL_MS);
  }, [fetchNow]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Gestion AppState
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        // Retour au premier plan : reprendre immédiatement
        startPolling();
      } else if (nextState.match(/inactive|background/)) {
        // Arrière-plan : stopper
        stopPolling();
      }
      appStateRef.current = nextState;
    });

    // Démarrage initial
    startPolling();

    return () => {
      mountedRef.current = false;
      stopPolling();
      subscription.remove();
    };
  }, [startPolling, stopPolling]);

  // Refresh manuel (pull-to-refresh)
  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchNow();
  }, [fetchNow]);

  return { data, isLoading, error, refresh, lastUpdated };
}
