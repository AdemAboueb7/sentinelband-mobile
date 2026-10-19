/**
 * App.js — Point d'entrée SentinelBand Mobile
 * Dark Industrial Edition — Thème sombre cohérent, navigation profilée et gestion des alertes.
 *
 * Architecture :
 *  - AuthProvider  : gestion du jeton JWT (SecureStore)
 *  - AlertProvider : alertes rouges globales + vibration unique
 *  - NavigationContainer → Stack navigator
 *    - Si non authentifié : AuthScreen
 *    - Si authentifié     : BottomTabs (Collègues, Demandes, Profil)
 *                           + Stack ColleagueDetail
 */

import React from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';
import { navigationRef } from './src/utils/navigation';

import { AuthScreen } from './src/screens/AuthScreen';
import { ColleaguesScreen } from './src/screens/ColleaguesScreen';
import { ColleagueDetailScreen } from './src/screens/ColleagueDetailScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

import { colors, radii, spacing, typography } from './src/theme';

// ─── Thème de Navigation Dark Industrial ─────────────────────────────────────

const navTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.rouge,
  },
};

// ─── Navigateurs ─────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** Onglets principaux (après authentification) */
function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bgElevated,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...typography.h3,
          color: colors.textPrimary,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Colleagues"
        component={ColleaguesScreen}
        options={{
          title: 'COLLÈGUES',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color, opacity: focused ? 1 : 0.65 }}>👥</Text>
          ),
          tabBarAccessibilityLabel: 'Liste des collègues et télémétrie',
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          title: 'DEMANDES',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color, opacity: focused ? 1 : 0.65 }}>📩</Text>
          ),
          tabBarAccessibilityLabel: 'Demandes de visibilité',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'PROFIL',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color, opacity: focused ? 1 : 0.65 }}>⚙️</Text>
          ),
          tabBarAccessibilityLabel: 'Profil opérateur et dispositif ESP32',
        }}
      />
    </Tab.Navigator>
  );
}

/** Navigation principale selon l'état d'authentification */
function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashLogoCircle}>
          <Text style={styles.splashLogo}>🛡️</Text>
        </View>
        <Text style={styles.splashName}>SENTINELBAND</Text>
        <Text style={styles.splashTagline}>SURVEILLANCE INDUSTRIELLE SÉCURISÉE</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bgElevated,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          ...typography.h3,
          color: colors.textPrimary,
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: colors.bg,
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ColleagueDetail"
            component={ColleagueDetailScreen}
            options={({ route }) => ({
              title: route.params?.colleague?.name || 'Télémétrie travailleur',
              headerBackTitle: 'Retour',
              headerTintColor: colors.textPrimary,
              headerStyle: {
                backgroundColor: colors.bgElevated,
              },
            })}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

// ─── Racine de l'application ─────────────────────────────────────────────────

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AlertProvider>
            <NavigationContainer ref={navigationRef} theme={navTheme}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={colors.bgElevated}
                translucent={false}
              />
              <RootNavigator />
            </NavigationContainer>
          </AlertProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoCircle: {
    width: 96,
    height: 96,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  splashLogo: {
    fontSize: 48,
  },
  splashName: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8,
  },
  splashTagline: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 6,
  },
});
