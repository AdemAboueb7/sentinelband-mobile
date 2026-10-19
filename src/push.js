/**
 * @file push.js
 * Enregistrement silencieux du jeton push Expo.
 * Note : Dans Expo Go (SDK 53+), les notifications push distantes Android
 * ont été retirées par l'équipe Expo. Cette fonction est donc neutralisée
 * en toute sécurité sous Expo Go pour éviter le crash au démarrage.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { me } from './api';

// Détection d'Expo Go
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Tente d'enregistrer le jeton push et de l'envoyer au serveur.
 * Ne lève jamais d'exception.
 * @returns {Promise<void>}
 */
export async function registerPushTokenSilently() {
  if (isExpoGo) {
    // Désactivé sous Expo Go pour éviter l'erreur native Android SDK 53+
    return;
  }

  try {
    const Notifications = require('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowList: true,
      }),
    });

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    if (tokenData?.data) {
      await me.pushToken(tokenData.data).catch(() => {});
    }
  } catch {
    // Toute erreur ignorée
  }
}
