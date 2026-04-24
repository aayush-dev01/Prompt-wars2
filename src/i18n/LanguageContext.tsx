import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { geminiLanguageLabels, languageLabels, supportedLanguages, translations, type AppLanguage } from './translations';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  labels: typeof translations.en;
  languageLabel: string;
  geminiLanguageLabel: string;
  isRtl: boolean;
};

const STORAGE_KEY = 'prompt-wars-language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const detectInitialLanguage = (): AppLanguage => {
  const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
  if (saved && supportedLanguages.includes(saved)) {
    return saved;
  }

  const browserLanguage = navigator.language.slice(0, 2) as AppLanguage;
  if (supportedLanguages.includes(browserLanguage)) {
    return browserLanguage;
  }

  return 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    const nextLanguage = detectInitialLanguage();
    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      labels: translations[language],
      languageLabel: languageLabels[language],
      geminiLanguageLabel: geminiLanguageLabels[language],
      isRtl: language === 'ar',
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.');
  }

  return context;
};
