'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Get user's country using axios
        const { data } = await axios.get('https://ipapi.co/json/');
        
        // List of Portuguese-speaking countries
        const portugueseSpeakingCountries = ['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'];
        
        // Determine language based on country
        const detectedLang = portugueseSpeakingCountries.includes(data.country_code) ? 'pt' : 'en';
        
        // Check if there's a stored language preference
        const storedLang = localStorage.getItem('preferred-language');
        
        // Use stored language if available, otherwise use detected language
        const finalLang = storedLang || detectedLang;
        
        if (finalLang !== currentLang) {
          setCurrentLang(finalLang);
          i18n.changeLanguage(finalLang);
        }
      } catch (error) {
        console.error('Error detecting language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const languages = [
    { 
      code: 'en', 
      flag: 'https://openmoji.org/data/color/svg/1F1FA-1F1F8.svg',
      name: 'English',
      alt: 'US Flag'
    },
    { 
      code: 'pt', 
      flag: 'https://openmoji.org/data/color/svg/1F1E7-1F1F7.svg',
      name: 'Português',
      alt: 'BR Flag'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
    localStorage.setItem('preferred-language', langCode);
    setIsOpen(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <div className="flex items-center space-x-2">
          <img 
            src={currentLanguage.flag} 
            alt={currentLanguage.alt}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600">{currentLanguage.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px] z-50"
            >
              {languages.map(language => (
                <motion.button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors ${
                    language.code === currentLang ? 'bg-gray-50' : ''
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <img 
                    src={language.flag} 
                    alt={language.alt}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">{language.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;