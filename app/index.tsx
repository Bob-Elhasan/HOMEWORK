import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>{t('app.name')}</Text>
      <Text style={styles.tagline}>{t('app.tagline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F5FF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1B3A',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#4B4670',
    textAlign: 'center',
  },
});
