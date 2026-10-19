/**
 * @file context/AlertContext.js
 * Contexte global pour les alertes rouges actives et l'alarme de téléphone.
 * Déclenche une vibration d'alarme continue (mode sonnerie / alarme de réveil),
 * des impulsions haptiques d'urgence et une fenêtre d'alerte plein écran clignotante.
 */

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EmergencyAlarmModal } from '../components/EmergencyAlarmModal';
import { navigate } from '../utils/navigation';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [redAlerts, setRedAlerts] = useState([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  // Suivi des IDs notifiés et boucle d'alarme
  const notifiedRef = useRef(new Set());
  const alarmPulseTimer = useRef(null);

  // Couper l'alarme
  const silenceAlarm = useCallback(() => {
    Vibration.cancel();
    if (alarmPulseTimer.current) {
      clearInterval(alarmPulseTimer.current);
      alarmPulseTimer.current = null;
    }
    setIsAlarmActive(false);
  }, []);

  // Déclencher l'alarme téléphonique (vibration continue + haptique fort)
  const triggerAlarm = useCallback((colleague) => {
    setIsAlarmActive(true);
    setActiveAlert(colleague);

    // Vibration continue (comme un appel téléphonique ou alarme de réveil)
    Vibration.cancel();
    Vibration.vibrate([0, 1000, 300, 1000, 300, 1000, 300, 1000], true);

    const pulse = () => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    };

    pulse();
    if (alarmPulseTimer.current) clearInterval(alarmPulseTimer.current);
    alarmPulseTimer.current = setInterval(pulse, 2000);
  }, []);

  // Mise à jour périodique depuis la liste des collègues
  const updateFromColleagues = useCallback((colleagueList) => {
    const currentRed = colleagueList.filter((c) => c.online && c.state === 'ROUGE');
    setRedAlerts(currentRed.map((c) => ({
      id: c.id,
      name: c.name,
      state: c.state,
      reason: c.reason,
      lat: c.lat,
      lon: c.lon,
    })));

    const newRedIds = new Set(currentRed.map((c) => c.id));

    // Déclencher l'alarme pour les collègues nouvellement en danger
    for (const c of currentRed) {
      if (!notifiedRef.current.has(c.id)) {
        notifiedRef.current.add(c.id);
        triggerAlarm(c);
      }
    }

    // Si plus aucun collègue n'est en rouge, couper automatiquement l'alarme
    if (currentRed.length === 0) {
      silenceAlarm();
    }

    // Nettoyer les collègues revenus à la normale
    for (const id of notifiedRef.current) {
      if (!newRedIds.has(id)) {
        notifiedRef.current.delete(id);
      }
    }
  }, [triggerAlarm, silenceAlarm]);

  useEffect(() => {
    return () => {
      Vibration.cancel();
      if (alarmPulseTimer.current) clearInterval(alarmPulseTimer.current);
    };
  }, []);

  const value = {
    redAlerts,
    updateFromColleagues,
    isAlarmActive,
    activeAlert,
    silenceAlarm,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {/* Pop-up d'alarme prioritaire par-dessus toutes les vues */}
      <EmergencyAlarmModal
        visible={isAlarmActive && Boolean(activeAlert)}
        alert={activeAlert}
        onSilence={silenceAlarm}
        onViewDetails={(c) => {
          silenceAlarm();
          navigate('ColleagueDetail', { colleague: c });
        }}
      />
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts doit être utilisé dans AlertProvider');
  return ctx;
}
