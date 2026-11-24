import { Stack } from 'expo-router';
import { initI18n } from '../src/lib/i18n';

// Initialise before any screen renders so t() never returns raw keys.
initI18n('en');

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F7F5FF' },
        headerTitleStyle: { color: '#1F1B3A' },
        contentStyle: { backgroundColor: '#F7F5FF' },
      }}
    />
  );
}
