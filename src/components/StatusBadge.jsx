/**
 * @file components/StatusBadge.jsx
 * Badge d'etat - Dark Industrial Edition.
 * Indicateur lumineux (dot) + label texte, fond semi-transparent.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, typography } from '../theme';

/** @param {{ state: string|null, online: boolean, size?: 'sm'|'md'|'lg', style?: object }} props */
export function StatusBadge({ state, online = true, size = 'md', style }) {
  const cfg = getConfig(state, online);
  const sz = SIZES[size];

  return (
    <View
      style={[styles.base, sz.container, { backgroundColor: cfg.bg, borderColor: cfg.main }, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={cfg.label}
    >
      <View style={[styles.dot, sz.dot, { backgroundColor: cfg.main }]} />
      <Text style={[sz.text, { color: cfg.main }]} numberOfLines={1}>
        {cfg.label.toUpperCase()}
      </Text>
    </View>
  );
}

function getConfig(state, online) {
  if (!online || state === null) {
    return { bg: colors.offlineBg, main: colors.offline, label: 'Hors ligne' };
  }
  switch (state) {
    case 'ROUGE': return { bg: colors.rougeBg, main: colors.rouge, label: 'DANGER' };
    case 'JAUNE': return { bg: colors.jauneBg, main: colors.jaune, label: 'Attention' };
    case 'NORMAL':
    default:      return { bg: colors.normalBg, main: colors.normal, label: 'Normal' };
  }
}

const SIZES = {
  sm: {
    container: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.full, gap: 5 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { ...typography.caption, fontWeight: '700', letterSpacing: 0.6 },
  },
  md: {
    container: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, gap: 6 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    text: { ...typography.bodySmall, fontWeight: '700', letterSpacing: 0.4 },
  },
  lg: {
    container: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: radii.full, gap: 8 },
    dot: { width: 9, height: 9, borderRadius: 5 },
    text: { ...typography.h4, letterSpacing: 0.3 },
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  dot: {
    opacity: 0.95,
  },
});
