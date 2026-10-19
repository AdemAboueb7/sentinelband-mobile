/**
 * @file components/SensorCard.jsx
 * Carte affichant une valeur capteur — Dark Industrial Edition.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../theme';

/**
 * @param {{
 *   icon: string,
 *   label: string,
 *   value: string,
 *   unit?: string,
 *   accent?: string,
 *   style?: object,
 * }} props
 */
export function SensorCard({ icon, label, value, unit, accent, style }) {
  const valueColor = accent || colors.textPrimary;
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
          {value}
        </Text>
        {unit ? <Text style={[styles.unit, { color: valueColor }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    minWidth: 90,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  icon: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  value: {
    ...typography.h3,
    fontWeight: '700',
    textAlign: 'center',
  },
  unit: {
    ...typography.caption,
    marginBottom: 3,
  },
});
