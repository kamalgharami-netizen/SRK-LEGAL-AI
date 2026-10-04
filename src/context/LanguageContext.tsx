import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageMode, LanguageService } from '../services/languageService';

interface LanguageContextType {
  langMode: LanguageMode;
  setLangMode: (mode: LanguageMode) => void;
  toggleLanguage: () => void;
  t: (en: string, bn: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  langMode: 'en',
  setLangMode: () => {},
  toggleLanguage: () => {},
  t: (en) => en,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [langMode, setLangModeState] = useState<LanguageMode>(LanguageService.getMode());

  const setLangMode = (mode: LanguageMode) => {
    const validMode: LanguageMode = mode === 'bn' ? 'bn' : 'en';
    LanguageService.setMode(validMode);
    setLangModeState(validMode);
  };

  const toggleLanguage = () => {
    setLangMode(langMode === 'en' ? 'bn' : 'en');
  };

  const t = (en: string, bn: string): string => {
    if (langMode === 'bn') return bn || en;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ langMode, setLangMode, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
