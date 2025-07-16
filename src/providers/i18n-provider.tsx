'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { updateLanguageFromCountry } from '../i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Update language based on country detection
    updateLanguageFromCountry();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}