import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en';
import ptTranslations from './locales/pt';

// Initialize i18n synchronously first
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      pt: {
        translation: ptTranslations
      }
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferred-language',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Async country detection and language update
const updateLanguageFromCountry = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Check if we already have a language preference
    const storedLang = localStorage.getItem('preferred-language');
    if (storedLang) return;

    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const countryCode = data.country_code;

    // List of Portuguese-speaking countries
    const portugueseSpeakingCountries = ['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'];
    
    // Set language based on country
    const detectedLang = portugueseSpeakingCountries.includes(countryCode) ? 'pt' : 'en';
    
    // Update i18n language
    await i18n.changeLanguage(detectedLang);
    
    // Store the detected language
    localStorage.setItem('preferred-language', detectedLang);
  } catch (error) {
    console.warn('Language detection failed:', error);
    // Fallback to browser language or 'en'
    const browserLang = navigator.language.split('-')[0];
    const fallbackLang = ['en', 'pt'].includes(browserLang) ? browserLang : 'en';
    await i18n.changeLanguage(fallbackLang);
    localStorage.setItem('preferred-language', fallbackLang);
  }
};

export { updateLanguageFromCountry };
export default i18n;