import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '@forge/common/src/i18n/en.json';
import pt from '@forge/common/src/i18n/pt.json';
import es from '@forge/common/src/i18n/es.json';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLang = ['en', 'pt', 'es'].includes(deviceLang) ? deviceLang : 'en';

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
  },
  lng: supportedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18next;
