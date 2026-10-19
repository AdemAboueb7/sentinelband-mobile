import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent appelle AppRegistry.registerComponent('main', () => App);
// et s'assure également que si l'application est chargée dans Expo Go ou dans un APK natif,
// l'environnement est correctement configuré.
registerRootComponent(App);
