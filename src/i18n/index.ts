import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import sw from './locales/sw.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  pt: { translation: pt },
  ru: { translation: ru },
  de: { translation: de },
  ja: { translation: ja },
  ko: { translation: ko },
  sw: { translation: sw },
};

// RTL languages
export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

export const isRtlLanguage = (langCode: string): boolean => {
  return rtlLanguages.includes(langCode);
};

// Get stored language or detect from browser
const getInitialLanguage = (): string => {
  const stored = localStorage.getItem('userLanguage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.code || 'en';
    } catch {
      return 'en';
    }
  }
  
  // Detect from browser
  const browserLang = navigator.language.split('-')[0];
  return resources[browserLang as keyof typeof resources] ? browserLang : 'en';
};

// Apply RTL direction to document
export const applyRtlDirection = (langCode: string) => {
  const isRtl = isRtlLanguage(langCode);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = langCode;
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Apply initial direction
applyRtlDirection(getInitialLanguage());

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  applyRtlDirection(lng);
});

export default i18n;
