/**
 * @file screens/ColleaguesScreen.jsx
 * Liste des collègues triée par gravité — Dark Industrial Edition.
 * Pull-to-refresh, gestion des états d'alerte en direct, hors-ligne et connectivité.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useColleagues } from '../hooks/useColleagues';
import { useAlerts } from '../context/AlertContext';
import { StatusBadge } from '../components/StatusBadge';
import { SimBadge } from '../components/SimBadge';
import { RedAlertBanner } from '../components/RedAlertBanner';
import { formatReason, formatAge } from '../utils/format';
import { colors, spacing, typography, radii, shadows, stateColors } from '../theme';

/** @param {{ navigation: object }} props */
export function ColleaguesScreen({ navigation }) {
  const { data, isLoading, error, refresh } = useColleagues();
  const { updateFromColleagues } = useAlerts();

  // Mettre à jour le contexte d'alertes à chaque nouveau lot de données
  useEffect(() => {
    if (data.length > 0) updateFromColleagues(data);
  }, [data, updateFromColleagues]);

  const handleColleaguePress = (colleague) => {
    navigation.navigate('ColleagueDetail', { colleague });
  };

  const renderItem = ({ item }) => <ColleagueCard colleague={item} onPress={handleColleaguePress} />;
  const keyExtractor = (item) => String(item.id);

  return (
    <View style={styles.container}>
      <RedAlertBanner onPress={handleColleaguePress} />

      {isLoading && data.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Synchronisation des capteurs…</Text>
        </View>
      ) : error && data.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.errorIconCircle}>
            <Text style={styles.errorIcon}>📡</Text>
          </View>
          <Text style={styles.errorTitle}>Liaison serveur interrompue</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refresh}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Réessayer la connexion"
          >
            <Text style={styles.retryText}>RÉESSAYER</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={data.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>👥</Text>
              </View>
              <Text style={styles.emptyTitle}>Aucun travailleur assigné</Text>
              <Text style={styles.emptyMessage}>
                Ajoutez vos collègues via l'onglet « Demandes » pour surveiller leur état de sécurité en temps réel.
              </Text>
            </View>
          }
          ListHeaderComponent={
            error ? (
              <View style={styles.warningBanner}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>Mise à jour impossible : {error}</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

/** Carte individuelle d'un collègue */
function ColleagueCard({ colleague, onPress }) {
  const { state, online, name, reason, age_s, source } = colleague;
  const isOnline = Boolean(online);
  const cfg = stateColors(state, isOnline);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderLeftColor: cfg.main,
          backgroundColor: state === 'ROUGE' && isOnline ? colors.rougeBg : colors.bgCard,
        },
      ]}
      onPress={() => onPress(colleague)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${name}, état : ${
        !isOnline ? 'hors ligne' : state === 'ROUGE' ? 'danger' : state === 'JAUNE' ? 'attention' : 'normal'
      }${reason ? `, motif : ${formatReason(reason)}` : ''}`}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
          </View>

          {reason && isOnline ? (
            <Text style={styles.cardReason} numberOfLines={1}>
              ⚠️ {formatReason(reason)}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={[styles.cardAge, !isOnline && styles.cardAgeOffline]}>
              {isOnline ? `Dernier signal : ${formatAge(age_s)}` : '⏸ Hors ligne (> 30 s)'}
            </Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <StatusBadge state={state} online={isOnline} size="sm" />
          <SimBadge visible={source === 'SIM'} style={styles.simBadge} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyList: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  // Carte collègue
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardName: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cardReason: {
    ...typography.bodySmall,
    color: colors.jaune,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAge: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardAgeOffline: {
    color: colors.offline,
  },
  simBadge: {
    marginTop: 6,
  },
  // États globaux
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorIcon: { fontSize: 32 },
  errorTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  errorMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    minHeight: 48,
    justifyContent: 'center',
    ...shadows.md,
  },
  retryText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  emptyMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  warningBanner: {
    backgroundColor: colors.jauneBg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.jaune,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: spacing.sm,
    fontSize: 16,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.jaune,
    flex: 1,
  },
});
