import type { Locale } from '../context/LocaleContext';

export function bi(locale: Locale, ar: string, en: string): string {
  return locale === 'en' ? en : ar;
}

