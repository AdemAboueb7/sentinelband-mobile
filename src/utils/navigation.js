/**
 * @file utils/navigation.js
 * Référence globale de navigation pour permettre la redirection
 * directe depuis l'alarme d'urgence.
 */

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
