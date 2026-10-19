/**
 * @file components/SimBadge.jsx
 * Indicateur "Valeurs simulees" - Dark Industrial Edition.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';

/** @param {{ visible?: boolean, style?: object }} props */
export function SimBadge({ visible, style }) {
  if (!visible) return null;
  return (
    <View
      style={[styles.badge, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel="Valeurs simulees"
    >
      <View style={styles.dot} />
      <Text style={styles.text}>SIM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.simBg,
    borderColor: colors.sim,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.sim,
  },
  text: {
    ...typography.caption,
    color: colors.sim,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
