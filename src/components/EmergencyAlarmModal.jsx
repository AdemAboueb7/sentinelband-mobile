/**
 * @file components/EmergencyAlarmModal.jsx
 * Pop-up d'alarme d'urgence - Dark Industrial Edition.
 * Design sombre avec bordure rouge, animation de pulsation et boutons CTA clairs.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { colors, spacing, typography, radii } from '../theme';
import { formatReason } from '../utils/format';

/**
 * @param {{
 *   visible: boolean,
 *   alert: { id: number, name: string, state: string, reason: string|null, lat?: number, lon?: number }|null,
 *   onSilence: () => void,
 *   onViewDetails: (colleague: object) => void,
 * }} props
 */
export function EmergencyAlarmModal({ visible, alert, onSilence, onViewDetails }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      );
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1.5, duration: 700, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      ring.start();
      return () => { pulse.stop(); ring.stop(); };
    }
  }, [visible, pulseAnim, ringAnim]);

  if (!visible || !alert) return null;

  const handleOpenMap = () => {
    if (alert.lat && alert.lon) {
      const url = Platform.select({
        ios:     `maps:?q=${alert.name}&ll=${alert.lat},${alert.lon}`,
        android: `geo:${alert.lat},${alert.lon}?q=${alert.lat},${alert.lon}(${alert.name})`,
      }) || `https://maps.google.com/?q=${alert.lat},${alert.lon}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Anneau de pulsation */}
          <View style={styles.iconWrapper}>
            <Animated.View style={[styles.ring, { transform: [{ scale: ringAnim }], opacity: ringAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.4, 0] }) }]} />
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.icon}>🚨</Text>
            </Animated.View>
          </View>

          <Text style={styles.title}>ALERTE DANGER</Text>
          <Text style={styles.subtitle}>Votre collegue est en detresse</Text>

          <View style={styles.personCard}>
            <Text style={styles.personName}>{alert.name}</Text>
            <Text style={styles.reasonBadge}>
              {alert.reason ? formatReason(alert.reason) : 'DANGER DETECTE'}
            </Text>
          </View>

          {alert.lat && alert.lon ? (
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap} activeOpacity={0.8}>
              <Text style={styles.mapButtonText}>📍  OUVRIR POSITION GPS</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.silenceButton}
              onPress={onSilence}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Couper l'alarme"
            >
              <Text style={styles.silenceButtonText}>🔕  COUPER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => onViewDetails(alert)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Prendre en charge et voir les details"
            >
              <Text style={styles.detailsButtonText}>INTERVENIR  →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F1829',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.rouge,
    shadowColor: colors.rouge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.rouge,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.rougeBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.rouge,
  },
  icon: {
    fontSize: 38,
  },
  title: {
    ...typography.h1,
    color: colors.rouge,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  personCard: {
    width: '100%',
    backgroundColor: colors.rougeBg,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.rouge,
    marginBottom: spacing.md,
  },
  personName: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  reasonBadge: {
    ...typography.bodySmall,
    color: colors.rouge,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  mapButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mapButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  silenceButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silenceButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: colors.rouge,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});
