/**
 * @file screens/RequestsScreen.jsx
 * Gestion des demandes de visibilité :
 * - Ajouter un collègue (par e-mail)
 * - Consulter et accepter les demandes de supervision reçues
 * Dark Industrial Edition.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colleagues as colleaguesApi, links as linksApi } from '../api';
import { FormInput } from '../components/FormInput';
import { RedAlertBanner } from '../components/RedAlertBanner';
import { colors, spacing, typography, radii, shadows } from '../theme';
import { useNavigation } from '@react-navigation/native';

export function RequestsScreen() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [sending, setSending] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await linksApi.requests();
      setRequests(data);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAddColleague = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setEmailError('L\'adresse e-mail est requise.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setEmailError('Adresse e-mail invalide.');
      return;
    }
    setEmailError(null);
    setSending(true);
    try {
      await colleaguesApi.add(trimmed);
      setEmail('');
      Alert.alert(
        '✅ Demande envoyée',
        `Une demande de visibilité a été envoyée à ${trimmed}.\n\n` +
        'Votre collègue devra accepter depuis son application pour que vous puissiez voir son état.'
      );
    } catch (err) {
      const msg = err.status === 409
        ? 'Une demande est déjà en attente pour cet utilisateur.'
        : err.status === 404
        ? 'Aucun utilisateur avec cette adresse e-mail.'
        : err.message || 'Erreur lors de l\'envoi.';
      Alert.alert('Erreur', msg);
    } finally {
      setSending(false);
    }
  }, [email]);

  const handleAccept = useCallback(async (viewer) => {
    setAcceptingId(viewer.id);
    try {
      await linksApi.accept(viewer.id);
      setRequests((prev) => prev.filter((r) => r.id !== viewer.id));
      Alert.alert('✅ Demande acceptée', `${viewer.name} peut maintenant voir votre état.`);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible d\'accepter la demande.');
    } finally {
      setAcceptingId(null);
    }
  }, []);

  const handleNavigateToAlert = useCallback((colleague) => {
    navigation.navigate('ColleagueDetail', { colleague });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <RedAlertBanner onPress={handleNavigateToAlert} />
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRequests}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* ── Ajouter un collègue ─────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>➕</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>SUPERVISER UN COLLÈGUE</Text>
                  <Text style={styles.cardSubtitle}>Établir un lien de sécurité bidirectionnel</Text>
                </View>
              </View>

              <Text style={styles.info}>
                Entrez l'adresse e-mail d'un collaborateur. Dès son accord, ses données biométriques et alertes s'afficheront en temps réel.
              </Text>

              <FormInput
                label="ADRESSE E-MAIL DU COLLÈGUE"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                placeholder="collègue@entreprise.fr"
                keyboardType="email-address"
                autoComplete="email"
                testID="input-colleague-email"
              />

              <TouchableOpacity
                style={[styles.addButton, sending && styles.buttonDisabled]}
                onPress={handleAddColleague}
                disabled={sending}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Envoyer la demande au collègue"
              >
                {sending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.addButtonText}>TRANSMETTRE LA DEMANDE</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Demandes reçues ─────────────────────── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                DEMANDES EN ATTENTE
              </Text>
              {requests.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{requests.length}</Text>
                </View>
              )}
            </View>

            {!loading && requests.length === 0 && (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconCircle}>
                  <Text style={styles.emptyIconText}>📭</Text>
                </View>
                <Text style={styles.emptyText}>Aucune demande reçue</Text>
                <Text style={styles.emptySubtext}>
                  Lorsqu'un travailleur isolé vous autorise ou demande votre surveillance, sa demande apparaîtra dans cette section.
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.requestRow}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{item.name}</Text>
              <Text style={styles.requestEmail}>{item.email}</Text>
              <Text style={styles.requestNote}>
                Demande l'accès à votre télémétrie en temps réel
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.acceptButton, acceptingId === item.id && styles.buttonDisabled]}
              onPress={() => handleAccept(item)}
              disabled={acceptingId === item.id}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Accepter la demande de ${item.name}`}
            >
              {acceptingId === item.id ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.acceptButtonText}>ACCEPTER</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconText: {
    fontSize: 18,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  info: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  countBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },

  emptySection: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },

  requestRow: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  requestInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  requestName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  requestEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  acceptButton: {
    backgroundColor: colors.normal,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  acceptButtonText: {
    ...typography.label,
    color: '#ffffff',
    fontWeight: '800',
  },
});
