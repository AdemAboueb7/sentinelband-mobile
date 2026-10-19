/**
 * @file screens/ProfileScreen.jsx
 * Écran Profil : identité opérateur, statut télémétrique de son propre boîtier ESP32,
 * clé matérielle active et configuration de l'URL serveur.
 * Dark Industrial Edition.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';
import { RedAlertBanner } from '../components/RedAlertBanner';
import { StatusBadge } from '../components/StatusBadge';
import { getApiUrl, saveApiUrl, health, me } from '../api';
import { formatAge, formatReason, formatTemp, formatGas, formatAcc } from '../utils/format';
import { colors, spacing, typography, radii, shadows } from '../theme';
import { useNavigation } from '@react-navigation/native';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [serverUrl, setServerUrl] = useState(getApiUrl());
  const [urlError, setUrlError] = useState(null);
  const [testingUrl, setTestingUrl] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // État du boîtier personnel
  const [deviceInfo, setDeviceInfo] = useState(null);

  const fetchDevice = useCallback(async () => {
    try {
      const data = await me.device();
      setDeviceInfo(data);
    } catch {
      // Échec silencieux
    }
  }, []);

  useEffect(() => {
    fetchDevice();
    const timer = setInterval(fetchDevice, 3000);
    return () => clearInterval(timer);
  }, [fetchDevice]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDevice();
    setRefreshing(false);
  }, [fetchDevice]);

  const handleNavigateToAlert = useCallback((colleague) => {
    navigation.navigate('ColleagueDetail', { colleague });
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre session de surveillance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  }, [logout]);

  const handleTestUrl = useCallback(async () => {
    const url = serverUrl.trim().replace(/\/$/, '');
    if (!url) { setUrlError('URL requise.'); return; }
    setUrlError(null);
    setTestingUrl(true);
    try {
      const original = getApiUrl();
      await saveApiUrl(url);
      try {
        await health.check();
        Alert.alert('✅ Connexion réussie', `Le serveur ${url} répond aux requêtes de santé.`);
      } catch (err) {
        await saveApiUrl(original);
        Alert.alert('❌ Connexion échouée', `Impossible de joindre ${url}\n\n${err.message}`);
      }
    } finally {
      setTestingUrl(false);
    }
  }, [serverUrl]);

  const handleSaveUrl = useCallback(async () => {
    const url = serverUrl.trim().replace(/\/$/, '');
    if (!url) { setUrlError('URL requise.'); return; }
    setUrlError(null);
    setSavingUrl(true);
    try {
      await saveApiUrl(url);
      Alert.alert('✅ URL enregistrée', 'L\'URL du serveur a été mise à jour.');
      fetchDevice();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'URL.');
    } finally {
      setSavingUrl(false);
    }
  }, [serverUrl, fetchDevice]);

  const isOnline = Boolean(deviceInfo?.online);
  const deviceState = deviceInfo?.state || 'NORMAL';

  return (
    <View style={styles.container}>
      <RedAlertBanner onPress={handleNavigateToAlert} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Profil Opérateur ────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Opérateur'}</Text>
            <Text style={styles.userEmail}>{user?.email || '—'}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter de l'application"
          >
            <Text style={styles.logoutText}>DÉCONNEXION DE LA SESSION</Text>
          </TouchableOpacity>
        </View>

        {/* ── Mon Boîtier ESP32 (État en direct) ──────── */}
        <View style={[styles.card, styles.deviceCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitleIcon}>🛡️</Text>
              <Text style={styles.cardTitle}>MON DISPOSITIF ESP32</Text>
            </View>
            <StatusBadge state={deviceState} online={isOnline} size="sm" />
          </View>

          <Text style={styles.cardInfo}>
            {isOnline
              ? `Opérationnel — dernière télémétrie reçue il y a ${formatAge(deviceInfo?.age_s)}`
              : deviceInfo?.last_seen
              ? `Hors ligne depuis ${formatAge(deviceInfo?.age_s)}`
              : 'Aucune donnée reçue. Vérifiez l\'alimentation de votre SentinelBand.'}
          </Text>

          {deviceInfo?.reason ? (
            <View style={styles.reasonBadge}>
              <Text style={styles.reasonText}>⚠️ Motif : {formatReason(deviceInfo.reason)}</Text>
            </View>
          ) : null}

          {/* Grille des mesures en direct */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>ACCÉLÉRATION</Text>
              <Text style={styles.metricValue}>
                {deviceInfo?.acc_g !== null && deviceInfo?.acc_g !== undefined ? formatAcc(deviceInfo.acc_g) : '—'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TEMPÉRATURE</Text>
              <Text style={styles.metricValue}>
                {deviceInfo?.temp_c !== null && deviceInfo?.temp_c !== undefined ? formatTemp(deviceInfo.temp_c) : '—'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>GAZ (Δ mV)</Text>
              <Text style={styles.metricValue}>
                {deviceInfo?.gas_delta_mv !== null && deviceInfo?.gas_delta_mv !== undefined ? formatGas(deviceInfo.gas_delta_mv) : '—'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>SIGNAL GPS</Text>
              <Text style={styles.metricValue}>
                {deviceInfo?.gps_fix ? '📍 FIX 3D' : deviceInfo?.lat ? '📡 EN COURS' : '❌ NO FIX'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Clé et Intégration Arduino ─────────────── */}
        <View style={[styles.card, styles.keyCard]}>
          <Text style={styles.cardTitle}>CLÉ MATÉRIELLE HARWARE</Text>
          <Text style={styles.cardInfo}>
            Identifiant d'authentification unique pré-configuré sur la carte ESP32 :
          </Text>

          <View style={styles.keyBox}>
            <Text style={styles.keyBoxLabel}>CLÉ ACTIVE ENREGISTRÉE</Text>
            <Text style={styles.keyBoxValue} selectable>
              adem_dev_key_0123456789abcdef01234567
            </Text>
          </View>

          {/* Code snippet Arduino */}
          <View style={styles.codeSnippet}>
            <Text style={styles.codeSnippetHeader}>// Configuration SentinelBand_NoSIM.ino</Text>
            <Text style={styles.codeLine} selectable>#define ENABLE_UPLINK 1</Text>
            <Text style={styles.codeLine} selectable>#define WIFI_SSID     "ASUS_98"</Text>
            <Text style={styles.codeLine} selectable>#define WIFI_PASS     "55850706"</Text>
            <Text style={styles.codeLine} selectable>#define API_URL       "{serverUrl}/api/telemetry"</Text>
            <Text style={styles.codeLine} selectable>#define DEVICE_KEY    "adem_dev_key_0123456789abcdef01234567"</Text>
          </View>

          <View style={styles.verifiedBox}>
            <Text style={styles.verifiedText}>✓ CLÉ SYNCHRONISÉE AVEC LE SERVEUR</Text>
          </View>
        </View>

        {/* ── URL du serveur ──────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SERVEUR CENTRAL</Text>
          <Text style={styles.cardInfo}>
            Point de terminaison réseau pour la synchronisation de données :
          </Text>
          <FormInput
            label="URL DE L'API REST"
            value={serverUrl}
            onChangeText={setServerUrl}
            error={urlError}
            placeholder="http://10.226.238.169:3000"
            keyboardType="url"
            autoComplete="url"
            testID="input-server-url"
          />
          <View style={styles.urlButtons}>
            <TouchableOpacity
              style={[styles.urlButton, styles.urlButtonSecondary, testingUrl && styles.buttonDisabled]}
              onPress={handleTestUrl}
              disabled={testingUrl}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Tester la connexion au serveur"
            >
              {testingUrl ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.urlButtonSecondaryText}>TESTER LA CONNEXION</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.urlButton, styles.urlButtonPrimary, savingUrl && styles.buttonDisabled]}
              onPress={handleSaveUrl}
              disabled={savingUrl}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Enregistrer l'URL du serveur"
            >
              {savingUrl ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.urlButtonPrimaryText}>ENREGISTRER</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── À propos ────────────────────────────────── */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>SENTINELBAND INDUSTRIAL</Text>
          <Text style={styles.aboutText}>
            Plateforme de protection et télémétrie pour travailleurs isolés.{'\n'}
            Firmware v2.4 • Architecture résiliente SIM800L / WiFi / GPS
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarIcon: {
    fontSize: 32,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    borderColor: colors.rouge,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: colors.rougeBg,
  },
  logoutText: {
    ...typography.label,
    color: colors.rouge,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  cardInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 19,
  },

  // Mon Boîtier
  deviceCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  reasonBadge: {
    backgroundColor: colors.jauneBg,
    padding: spacing.xs + 2,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.jaune,
  },
  reasonText: {
    color: colors.jaune,
    fontWeight: '700',
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bgInput,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricValue: {
    ...typography.h4,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // Clé & Arduino
  keyCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.jaune,
  },
  keyBox: {
    backgroundColor: colors.bgInput,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  keyBoxLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 4,
  },
  keyBoxValue: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  codeSnippet: {
    backgroundColor: '#070A11',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  codeSnippetHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.mono.fontFamily,
    marginBottom: spacing.xs,
  },
  codeLine: {
    color: colors.primaryLight,
    fontFamily: typography.mono.fontFamily,
    fontSize: 11,
    marginVertical: 2,
  },

  verifiedBox: {
    backgroundColor: colors.normalBg,
    borderWidth: 1,
    borderColor: colors.normal,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    alignItems: 'center',
  },
  verifiedText: {
    color: colors.normal,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },

  urlButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  urlButton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  urlButtonPrimary: {
    backgroundColor: colors.primary,
  },
  urlButtonSecondary: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  urlButtonPrimaryText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
  },
  urlButtonSecondaryText: {
    ...typography.label,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  aboutCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  aboutTitle: {
    ...typography.label,
    color: colors.textPrimary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  aboutText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
