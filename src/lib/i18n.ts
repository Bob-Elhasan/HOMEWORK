import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// English-first. Arabic resources are added when the full Arabic UI ships.
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: {
    translation: {
      app: {
        name: 'Study Companion',
        tagline: 'Think it through. Your tutor is right here.',
      },
      home: {
        title: 'Today',
        startLesson: 'Start lesson',
      },
    },
  },
} as const;

let initialized = false;

export function initI18n(language: AppLanguage = 'en') {
  if (initialized) return i18next;
  i18next.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  initialized = true;
  return i18next;
}

export default i18next;
