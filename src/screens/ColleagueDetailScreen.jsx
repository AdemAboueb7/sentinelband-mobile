/**
 * @file screens/ColleagueDetailScreen.jsx
 * Détail d'un collègue : état télémétrique, capteurs, localisation GPS, alertes et historique.
 * Dark Industrial Edition — Conçu pour une consultation rapide en situation critique.
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
  Linking,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBadge } from '../components/StatusBadge';
import { SensorCard } from '../components/SensorCard';
import { SimBadge } from '../components/SimBadge';
import { MiniChart } from '../components/MiniChart';
import { RedAlertBanner } from '../components/RedAlertBanner';
import { colleagues as colleaguesApi, alerts as alertsApi } from '../api';
import { formatReason, formatTemp, formatGas, formatAcc, formatAge, formatDateTime } from '../utils/format';
import { colors, spacing, typography, radii, shadows, stateColors } from '../theme';
import { HISTORY_LIMIT } from '../config';

/** @param {{ route: object, navigation: object }} props */
export function ColleagueDetailScreen({ route, navigation: _navigation }) {
  const { colleague: initial } = route.params;
  const [colleague] = useState(initial);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ackingId, setAckingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [a, h] = await Promise.all([
        colleaguesApi.alerts(colleague.id),
        colleaguesApi.history(colleague.id, HISTORY_LIMIT),
      ]);
      setAlerts(a);
      setHistory(h);
    } catch {
      // Erreur silencieuse sur le détail
    } finally {
      setLoadingAlerts(false);
      setLoadingHistory(false);
    }
  }, [colleague.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAck = useCallback(async (alertId) => {
    setAckingId(alertId);
    try {
      await alertsApi.ack(alertId);
      // Rafraîchir la liste des alertes
      const updated = await colleaguesApi.alerts(colleague.id);
      setAlerts(updated);
      Alert.alert('✅ Prise en charge enregistrée', 'L\'alerte est marquée comme prise en charge.');
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de prendre en charge.');
    } finally {
      setAckingId(null);
    }
  }, [colleague.id]);

  const handleOpenMaps = useCallback(() => {
    const { lat, lon } = colleague;
    if (!lat || !lon) return;
    const url = Platform.select({
      ios: `maps:?q=${colleague.name}&ll=${lat},${lon}`,
      android: `geo:${lat},${lon}?q=${lat},${lon}(${colleague.name})`,
    }) || `https://maps.google.com/?q=${lat},${lon}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${lat},${lon}`);
    });
  }, [colleague]);

  const { state, online, name, reason, temp_c, gas_delta_mv, acc_g, lat, lon, gps_fix, source, age_s } = colleague;
  const isOnline = Boolean(online);
  const hasPosition = lat !== null && lat !== undefined && lon !== null && lon !== undefined;
  const cfg = stateColors(state, isOnline);

  return (
    <View style={styles.container}>
      <RedAlertBanner onPress={() => {}} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={loadData}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── État principal télémétrique ───────────── */}
        <View
          style={[
            styles.stateSection,
            {
              borderTopColor: cfg.main,
              backgroundColor: state === 'ROUGE' && isOnline ? colors.rougeBg : colors.bgCard,
            },
          ]}
        >
          <Text style={styles.colleagueName}>{name}</Text>
          <StatusBadge state={state} online={isOnline} size="lg" style={styles.badge} />
          {reason && isOnline ? (
            <View style={styles.reasonBadge}>
              <Text style={styles.reasonText}>⚠️ {formatReason(reason)}</Text>
            </View>
          ) : null}
          <Text style={[styles.ageText, !isOnline && styles.ageTextOffline]}>
            {isOnline ? `Dernière télémétrie : ${formatAge(age_s)}` : '⏸ Dispositif hors ligne (> 30 s)'}
          </Text>
          <SimBadge visible={source === 'SIM'} style={styles.simBadge} />
        </View>

        {/* ── Capteurs ───────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CAPTEURS EN TEMPS RÉEL</Text>
        </View>
        <View style={styles.sensorsRow}>
          <SensorCard
            icon="🌡️"
            label="Température"
            value={formatTemp(temp_c)}
            accent={temp_c && temp_c > 40 ? colors.rouge : undefined}
          />
          <SensorCard
            icon="💨"
            label="Gaz (Δ)"
            value={formatGas(gas_delta_mv)}
            accent={gas_delta_mv && gas_delta_mv > 300 ? colors.rouge : undefined}
          />
          <SensorCard
            icon="📳"
            label="Accélération"
            value={formatAcc(acc_g)}
            accent={acc_g && acc_g > 3 ? colors.jaune : undefined}
          />
        </View>

        {/* ── Position GPS ───────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LOCALISATION GPS</Text>
        </View>
        <View style={styles.mapSection}>
          {hasPosition ? (
            <>
              {!gps_fix && (
                <View style={styles.gpsWarning}>
                  <Text style={styles.gpsWarningText}>
                    📍 Position estimée (signal GPS en cours d'acquisition)
                  </Text>
                </View>
              )}
              <View style={styles.coordsBox}>
                <Text style={styles.coordsLabel}>COORDONNÉES WGS84</Text>
                <Text style={styles.coordsText}>
                  {Number(lat).toFixed(5)}° N, {Number(lon).toFixed(5)}° E
                </Text>
              </View>
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={handleOpenMaps}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir la position dans l'application Maps"
              >
                <Text style={styles.mapsButtonText}>OUVRIR DANS LE GPS DU SYSTÈME</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noPosition}>
              <Text style={styles.noPositionText}>📍 Coordonnées satellites non transmises</Text>
            </View>
          )}
        </View>

        {/* ── Alertes ────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>JOURNAL DES ALERTES</Text>
        </View>
        {loadingAlerts ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucune alerte enregistrée sur cette session.</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onAck={handleAck}
              isAcking={ackingId === alert.id}
            />
          ))
        )}

        {/* ── Historique / Graphiques ────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HISTORIQUE DES MESURES ({history.length} PTS)</Text>
        </View>
        {loadingHistory ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun point d'historique disponible.</Text>
          </View>
        ) : (
          <>
            <MiniChart
              data={history}
              type="temp"
              label="Température (°C)"
              color={colors.rouge}
            />
            <MiniChart
              data={history}
              type="gas"
              label="Concentration Gaz Δ (mV)"
              color={colors.sim}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Ligne d'alerte avec bouton « Je prends en charge » */
function AlertRow({ alert, onAck, isAcking }) {
  const levelColor = alert.level === 'ROUGE' ? colors.rouge : colors.jaune;
  const levelIcon = alert.level === 'ROUGE' ? '🚨' : '⚠️';

  return (
    <View style={[styles.alertRow, { borderLeftColor: levelColor }]}>
      <View style={styles.alertHeader}>
        <Text style={[styles.alertLevel, { color: levelColor }]}>
          {levelIcon} {alert.level}
        </Text>
        <Text style={styles.alertDate}>{formatDateTime(alert.started_at)}</Text>
      </View>
      {alert.reason ? (
        <Text style={styles.alertReason}>{formatReason(alert.reason)}</Text>
      ) : null}
      {alert.ended_at ? (
        <Text style={styles.alertEnded}>
          Terminée : {formatDateTime(alert.ended_at)}
        </Text>
      ) : null}
      {alert.acked_at ? (
        <Text style={styles.alertAcked}>
          ✓ Pris en charge par {alert.acked_by || 'un opérateur'} — {formatDateTime(alert.acked_at)}
        </Text>
      ) : !alert.ended_at ? (
        <TouchableOpacity
          style={styles.ackButton}
          onPress={() => onAck(alert.id)}
          disabled={isAcking}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Je prends en charge cette alerte"
        >
          {isAcking ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.ackButtonText}>JE PRENDS EN CHARGE</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // État principal
  stateSection: {
    alignItems: 'center',
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  colleagueName: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '800',
  },
  badge: {
    marginBottom: spacing.md,
  },
  reasonBadge: {
    backgroundColor: colors.jauneBg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.jaune,
  },
  reasonText: {
    ...typography.bodySmall,
    color: colors.jaune,
    fontWeight: '700',
    textAlign: 'center',
  },
  ageText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ageTextOffline: {
    color: colors.offline,
  },
  simBadge: {
    marginTop: 4,
  },

  // Sections
  sectionHeader: {
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },

  // Capteurs
  sensorsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  // GPS
  mapSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  gpsWarning: {
    backgroundColor: colors.jauneBg,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.jaune,
  },
  gpsWarningText: {
    ...typography.caption,
    color: colors.jaune,
    fontWeight: '600',
  },
  coordsBox: {
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coordsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
    fontWeight: '700',
  },
  coordsText: {
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  mapsButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    ...shadows.sm,
  },
  mapsButtonText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
  },
  noPosition: {
    padding: spacing.md,
    alignItems: 'center',
  },
  noPositionText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },

  // Alertes
  alertRow: {
    backgroundColor: colors.bgCard,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertLevel: {
    ...typography.h4,
    fontWeight: '800',
  },
  alertDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  alertReason: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  alertEnded: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  alertAcked: {
    ...typography.bodySmall,
    color: colors.normal,
    fontWeight: '600',
    marginTop: 4,
  },
  ackButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  ackButtonText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
  },

  // Divers
  loader: {
    paddingVertical: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
