/**
 * @file screens/AuthScreen.jsx
 * Ecran de connexion / inscription - Dark Industrial Edition.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';
import { colors, spacing, typography, radii, shadows } from '../theme';

// ─── Validation ───────────────────────────────────────────────────────────────

function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = "L'adresse e-mail est requise.";
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Adresse e-mail invalide.';
  if (!password) errors.password = 'Le mot de passe est requis.';
  return errors;
}

function validateRegister(name, email, password) {
  const errors = validateLogin(email, password);
  if (!name.trim()) errors.name = 'Le nom est requis.';
  if (password && password.length < 6) errors.password = 'Le mot de passe doit contenir au moins 6 caracteres.';
  return errors;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const validationErrors = mode === 'login'
      ? validateLogin(email, password)
      : validateRegister(name, email, password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim().toLowerCase(), password);
      } else {
        const data = await register(name.trim(), email.trim().toLowerCase(), password);
        if (data?.deviceKey) {
          Alert.alert(
            'Cle du boitier',
            `Notez cette cle, elle ne sera plus affichee :\n\n${data.deviceKey}\n\nCette cle s'utilise dans le simulateur : node simulate.js <CLE> <URL>`,
            [{ text: "J'ai note la cle", style: 'default' }]
          );
        }
      }
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, name, email, password, login, register]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── En-tete ───────────────────────────────────── */}
        <View style={styles.header}>
          {/* Logo vectoriel simplifie (shield shape) */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>⬡</Text>
            <View style={styles.logoInner}>
              <Text style={styles.logoIcon}>🛡️</Text>
            </View>
          </View>
          <Text style={styles.appName}>SENTINELBAND</Text>
          <Text style={styles.tagline}>Securite des travailleurs isoles</Text>
        </View>

        {/* ── Carte formulaire ────────────────────────────── */}
        <View style={styles.card}>
          {/* Indicateur de mode */}
          <View style={styles.modeSwitch}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
              onPress={() => { setMode('login'); setErrors({}); }}
            >
              <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
                CONNEXION
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
              onPress={() => { setMode('register'); setErrors({}); }}
            >
              <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
                INSCRIPTION
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <FormInput
              label="Nom complet"
              value={name}
              onChangeText={setName}
              error={errors.name}
              placeholder="Jean Dupont"
              autoCapitalize="words"
              autoComplete="name"
              testID="input-name"
            />
          )}

          <FormInput
            label="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="jean@exemple.fr"
            keyboardType="email-address"
            autoComplete="email"
            testID="input-email"
          />

          <FormInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder={mode === 'register' ? '6 caracteres minimum' : '••••••••'}
            secureTextEntry
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            testID="input-password"
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={mode === 'login' ? 'Se connecter' : 'Creer le compte'}
            testID="btn-submit"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'login' ? 'SE CONNECTER' : 'CREER LE COMPTE'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Note securite ─────────────────────────────────── */}
        <Text style={styles.note}>
          Les SMS d'urgence fonctionnent meme sans cette application.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  // En-tete
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    position: 'absolute',
    fontSize: 80,
    color: colors.primary,
    opacity: 0.15,
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 28,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Carte
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  // Selecteur de mode
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.bgInput,
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  modeTabTextActive: {
    color: '#ffffff',
  },
  // Bouton submit
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitText: {
    ...typography.h4,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  // Note
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
