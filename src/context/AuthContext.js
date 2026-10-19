/**
 * @file context/AuthContext.js
 * Contexte d'authentification global.
 * Fournit : user, token, login(), logout(), isLoading.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, me, saveToken, loadToken, clearToken, loadApiUrl, setUnauthorizedHandler } from '../api';
import { registerPushTokenSilently } from '../push';

/** @typedef {{ id: number, name: string, email: string }} User */
/** @typedef {{ user: User|null, token: string|null, isLoading: boolean, login: Function, register: Function, logout: Function }} AuthContextValue */

const AuthContext = createContext(/** @type {AuthContextValue} */ (null));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Déconnexion (aussi appelée par le handler 401)
  const logout = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  // Initialisation : charger token existant et profil
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Enregistrer le handler 401 avant toute requête
      setUnauthorizedHandler(logout);

      try {
        await loadApiUrl();
        const storedToken = await loadToken();
        if (!storedToken) return;

        setToken(storedToken);
        const profile = await me.get();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        // Token invalide ou serveur inaccessible
        await clearToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [logout]);

  // Connexion
  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    await saveToken(data.token);
    setToken(data.token);
    const profile = await me.get();
    setUser(profile);
    // Enregistrement push silencieux après connexion
    registerPushTokenSilently().catch(() => {});
    return data;
  }, []);

  // Inscription
  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    await saveToken(data.token);
    setToken(data.token);
    const profile = await me.get();
    setUser(profile);
    registerPushTokenSilently().catch(() => {});
    // Retourne deviceKey (affiché une seule fois)
    return data;
  }, []);

  const value = { user, token, isLoading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @returns {AuthContextValue} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
