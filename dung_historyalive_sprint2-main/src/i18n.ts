import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import vi from './locales/vi/translation.json';
import en from './locales/en/translation.json';
import ja from './locales/ja/translation.json';
import ko from './locales/ko/translation.json';
import zh from './locales/zh/translation.json';
import th from './locales/th/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';
import es from './locales/es/translation.json';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
  zh: { translation: zh },
  th: { translation: th },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    debug: false,
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'user_language'
    }
  });

export default i18n;
