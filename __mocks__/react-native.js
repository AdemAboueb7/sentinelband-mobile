// Mock minimal de react-native pour les tests unitaires purs
// (format.js n'importe pas react-native, ce mock est là pour les futurs tests)
module.exports = {
  Platform: { OS: 'android', select: (obj) => obj.android || obj.default },
  StyleSheet: { create: (s) => s },
  AppState: { currentState: 'active', addEventListener: () => ({ remove: () => {} }) },
  Vibration: { vibrate: () => {} },
};
