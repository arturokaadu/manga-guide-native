import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MangaGuide from './components/MangaGuide';

export default function App() {
  return (
    <View style={styles.container}>
      <MangaGuide />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a15' },
});
