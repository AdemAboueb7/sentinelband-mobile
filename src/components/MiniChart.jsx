/**
 * @file components/MiniChart.jsx
 * Graphique léger SVG (react-native-svg) pour température et gaz — Dark Industrial Edition.
 * Fallback lisible si SVG indisponible ou données vides.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography, radii } from '../theme';

const CHART_H = 84;
const CHART_W = '100%';

/**
 * @param {{
 *   data: Array<{ ts: string, temp_c?: number|null, gas_delta_mv?: number|null }>,
 *   type: 'temp'|'gas',
 *   label: string,
 *   color: string,
 * }} props
 */
export function MiniChart({ data, type, label, color }) {
  const values = useMemo(() => {
    const field = type === 'temp' ? 'temp_c' : 'gas_delta_mv';
    return data
      .map((d) => d[field])
      .filter((v) => v !== null && v !== undefined)
      .reverse(); // chronologique (ancien vers récent)
  }, [data, type]);

  if (!values.length) {
    return (
      <View style={styles.container}>
        <Text style={[styles.chartLabel, { color }]}>{label.toUpperCase()}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune donnée récente</Text>
        </View>
      </View>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 320; // largeur virtuelle SVG

  // Points normalisés pour le tracé
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (w - 24) + 12;
      const y = CHART_H - ((v - min) / range) * (CHART_H - 24) - 12;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastVal = values[values.length - 1];
  const unit = type === 'temp' ? ' °C' : ' mV';
  const formattedLast = Number(lastVal).toFixed(type === 'temp' ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.chartLabel, { color }]}>{label.toUpperCase()}</Text>
        <Text style={styles.latestValue}>
          {formattedLast}
          <Text style={styles.latestUnit}>{unit}</Text>
        </Text>
      </View>

      <Svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${w} ${CHART_H}`}>
        {/* Lignes repères horizontales (fond de grille subtil) */}
        <Line
          x1={8}
          y1={CHART_H - 12}
          x2={w - 8}
          y2={CHART_H - 12}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="2,3"
        />
        <Line
          x1={8}
          y1={12}
          x2={w - 8}
          y2={12}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="2,3"
        />

        {/* Ligne de données */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Bornes max / min */}
        <SvgText x={8} y={10} fontSize={9} fill={colors.textMuted} fontWeight="600">
          {Number(max).toFixed(type === 'temp' ? 1 : 0)}{unit}
        </SvgText>
        <SvgText x={8} y={CHART_H - 2} fontSize={9} fill={colors.textMuted} fontWeight="600">
          {Number(min).toFixed(type === 'temp' ? 1 : 0)}{unit}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  chartLabel: {
    ...typography.label,
    letterSpacing: 0.8,
  },
  latestValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  latestUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  empty: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
