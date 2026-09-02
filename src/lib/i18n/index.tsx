'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { vi } from './vi';
import { en } from './en';

export type Language = 'vi' | 'en';

type Dictionary = typeof vi;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('hub_language') as Language;
    if (saved === 'vi' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hub_language', lang);
  };

  const t = language === 'vi' ? vi : en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
