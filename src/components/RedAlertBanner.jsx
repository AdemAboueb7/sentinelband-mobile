/**
 * @file components/RedAlertBanner.jsx
 * Bandeau d'alerte rouge global - Dark Industrial Edition.
 * Fond rouge plein + animation de pulsation subtile.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useAlerts } from '../context/AlertContext';
import { colors, spacing, typography, radii } from '../theme';
import { formatReason } from '../utils/format';

/** @param {{ onPress: (colleague: object) => void }} props */
export function RedAlertBanner({ onPress }) {
  const { redAlerts, isAlarmActive, silenceAlarm } = useAlerts();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (redAlerts.length > 0) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.75, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [redAlerts.length, pulseAnim]);

  if (!redAlerts.length) return null;

  const first = redAlerts[0];
  const count = redAlerts.length;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => onPress(first)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Alerte rouge : ${first.name}${count > 1 ? ` et ${count - 1} autre(s)` : ''}. Appuyer pour voir le detail.`}
      >
        {/* Indicateur gauche animé */}
        <Animated.View style={[styles.indicator, { opacity: pulseAnim }]} />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            DANGER — {first.name}
            {count > 1 ? ` +${count - 1}` : ''}
          </Text>
          {first.reason ? (
            <Text style={styles.reason} numberOfLines={1}>
              {formatReason(first.reason)}
            </Text>
          ) : null}
        </View>

        {isAlarmActive ? (
          <TouchableOpacity
            style={styles.silenceBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              silenceAlarm();
            }}
            accessibilityRole="button"
            accessibilityLabel="Couper l'alarme sonore"
          >
            <Text style={styles.silenceBtnText}>COUPER</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  banner: {
    backgroundColor: colors.rouge,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  reason: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 1,
  },
  silenceBtn: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  silenceBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  chevron: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '700',
  },
});
