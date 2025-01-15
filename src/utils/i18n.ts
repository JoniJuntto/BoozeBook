import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en';
import es from './locales/es';
import fi from './locales/fi';
import sv from './locales/sv';

const resources = {
  en,
  es,
  fi,
  sv,
};

i18next
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Handle language changes
export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem('user-language', lang);
  await i18next.changeLanguage(lang);
};

// Initialize with stored language
AsyncStorage.getItem('user-language').then(lang => {
  if (lang) i18next.changeLanguage(lang);
});

export default i18next; 