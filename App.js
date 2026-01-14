import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MangaGuideScreen from './src/screens/MangaGuideScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <MangaGuideScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000' // Base void color before GlassLayout loads
  },
});
