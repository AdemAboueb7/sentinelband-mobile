/**
 * @file components/FormInput.jsx
 * Champ de formulaire - Dark Industrial Edition.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

/**
 * @param {{
 *   label: string,
 *   value: string,
 *   onChangeText: (v: string) => void,
 *   error?: string|null,
 *   placeholder?: string,
 *   secureTextEntry?: boolean,
 *   keyboardType?: string,
 *   autoCapitalize?: string,
 *   autoComplete?: string,
 *   testID?: string,
 * }} props
 */
export function FormInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  testID,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error  && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        testID={testID}
        accessibilityLabel={label}
        accessibilityHint={error || undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: colors.rouge,
    backgroundColor: colors.rougeBg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.rouge,
    marginTop: spacing.xs,
  },
});
