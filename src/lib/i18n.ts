import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '@/src/locales/en.json';
import esTranslations from '@/src/locales/es.json';

/**
 * i18next configuration for internationalization
 * Supports English and Spanish languages
 */
const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

/**
 * Initialize i18next with configuration
 * Sets up language detection and translation resources
 */
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;

/**
 * Get available languages
 * @returns Array of language codes
 */
export function getAvailableLanguages(): string[] {
  return Object.keys(resources);
}

/**
 * Change application language
 * @param language - Language code to switch to
 */
export function changeLanguage(language: string): void {
  i18n.changeLanguage(language);
}