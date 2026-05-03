import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'ar' | 'en';

interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = 'locale';

function localeToDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const dir = localeToDir(locale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, locale]);

  const value = useMemo<LocaleContextValue>(() => {
    return {
      locale,
      dir,
      setLocale: (next) => setLocaleState(next),
      toggleLocale: () => setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar')),
    };
  }, [dir, locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}

