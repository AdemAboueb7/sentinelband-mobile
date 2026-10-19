/**
 * @file theme/index.js
 * Design System SentinelBand — Dark Industrial Edition
 * Références : Linear, Apple Health, Uber Driver, monitoring médical
 */

import { Platform } from 'react-native';

// ─── Palette principale ───────────────────────────────────────────────────────

export const colors = {
  // ── Fonds ──────────────────────────────────────────────────────────────────
  bg:         '#0A0E1A',
  bgElevated: '#111827',
  bgCard:     '#161D2E',
  bgInput:    '#1C2537',
  bgModal:    '#0D1220',

  // ── Textes ─────────────────────────────────────────────────────────────────
  textPrimary:   '#F0F4FF',
  textSecondary: '#8A9AB5',
  textMuted:     '#4E5E78',
  textOnDark:    '#FFFFFF',

  // ── Bords ─────────────────────────────────────────────────────────────────
  border:      '#1E2D45',
  borderFocus: '#3B82F6',

  // ── Accent principal ───────────────────────────────────────────────────────
  primary:      '#3B82F6',
  primaryDark:  '#1D4ED8',
  primaryLight: '#93C5FD',
  primaryGlow:  'rgba(59,130,246,0.18)',

  // ── États boîtier ─────────────────────────────────────────────────────────
  normal:      '#10B981',
  normalDark:  '#059669',
  normalGlow:  'rgba(16,185,129,0.20)',
  normalBg:    'rgba(16,185,129,0.10)',
  normalLight: 'rgba(16,185,129,0.10)',

  jaune:       '#F59E0B',
  jauneDark:   '#D97706',
  jauneGlow:   'rgba(245,158,11,0.20)',
  jauneBg:     'rgba(245,158,11,0.10)',
  jauneLight:  'rgba(245,158,11,0.10)',

  rouge:       '#EF4444',
  rougeDark:   '#DC2626',
  rougeGlow:   'rgba(239,68,68,0.25)',
  rougeBg:     'rgba(239,68,68,0.12)',
  rougeLight:  'rgba(239,68,68,0.12)',

  offline:     '#6B7280',
  offlineBg:   'rgba(107,114,128,0.10)',
  offlineLight:'rgba(107,114,128,0.10)',

  // ── Utilitaires ───────────────────────────────────────────────────────────
  success:  '#10B981',
  warning:  '#F59E0B',
  danger:   '#EF4444',
  info:     '#3B82F6',
  sim:      '#A78BFA',
  simLight: 'rgba(167,139,250,0.12)',
  simBg:    'rgba(167,139,250,0.12)',

  // ── Ombres ────────────────────────────────────────────────────────────────
  shadowBlue:  'rgba(59,130,246,0.3)',
  shadowBlack: 'rgba(0,0,0,0.5)',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.82)',

  // Aliases legacy
  card:         '#161D2E',
  bg_legacy:    '#0A0E1A',
  text:         '#F0F4FF',
  textLight:    '#4E5E78',
  accent:       '#10B981',
};

// ─── Typographie ─────────────────────────────────────────────────────────────

export const fonts = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium:  Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold:    Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
  mono:    Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
};

export const typography = {
  display:   { fontSize: 34, fontWeight: '800', letterSpacing: -1.0, lineHeight: 40 },
  h1:        { fontSize: 26, fontWeight: '700', letterSpacing: -0.6, lineHeight: 32 },
  h2:        { fontSize: 21, fontWeight: '700', letterSpacing: -0.4, lineHeight: 26 },
  h3:        { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 22 },
  h4:        { fontSize: 15, fontWeight: '600', letterSpacing: -0.1, lineHeight: 20 },
  body:      { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyMd:    { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption:   { fontSize: 11, fontWeight: '500', letterSpacing: 0.2, lineHeight: 15 },
  label:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, lineHeight: 14 },
  mono:      { fontSize: 13, lineHeight: 18, fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }) },
};

// ─── Espacements ─────────────────────────────────────────────────────────────

export const spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── Rayons ──────────────────────────────────────────────────────────────────

export const radii = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 9999,
};

// ─── Ombres ──────────────────────────────────────────────────────────────────

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 20,
    elevation: 12,
  },
};

// ─── Utilitaires d'état ──────────────────────────────────────────────────────

/**
 * Retourne les tokens complets pour un état donné.
 * @param {string|null} state  'NORMAL' | 'JAUNE' | 'ROUGE' | null
 * @param {boolean}     online
 * @returns {{ main: string, bg: string, glow: string, text: string, border: string, icon: string, label: string }}
 */
export function stateColors(state, online = true) {
  if (!online || state === null) {
    return {
      main:   colors.offline,
      bg:     colors.offlineBg,
      glow:   'rgba(107,114,128,0.2)',
      text:   colors.offline,
      border: colors.offline,
      icon:   '⏸',
      label:  'Hors ligne',
    };
  }
  switch (state) {
    case 'ROUGE':
      return {
        main:   colors.rouge,
        bg:     colors.rougeBg,
        glow:   colors.rougeGlow,
        text:   colors.rouge,
        border: colors.rouge,
        icon:   '🚨',
        label:  'DANGER',
      };
    case 'JAUNE':
      return {
        main:   colors.jaune,
        bg:     colors.jauneBg,
        glow:   colors.jauneGlow,
        text:   colors.jaune,
        border: colors.jaune,
        icon:   '⚠️',
        label:  'Attention',
      };
    case 'NORMAL':
    default:
      return {
        main:   colors.normal,
        bg:     colors.normalBg,
        glow:   colors.normalGlow,
        text:   colors.normal,
        border: colors.normal,
        icon:   '✓',
        label:  'Normal',
      };
  }
}

/**
 * Libellé textuel d'un état pour l'accessibilité.
 */
export function stateLabel(state, online = true) {
  if (!online || state === null) return 'Hors ligne';
  switch (state) {
    case 'ROUGE': return 'DANGER — Alerte rouge';
    case 'JAUNE': return 'Attention — Alerte jaune';
    case 'NORMAL': return 'Normal';
    default: return 'Inconnu';
  }
}

// ─── Constantes d'accessibilité ──────────────────────────────────────────────

export const MIN_TOUCH_TARGET = 48; // px
