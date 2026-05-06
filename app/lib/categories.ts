import type { Locale } from '../context/LocaleContext';

/**
 * NOTE: `value` is the canonical category string used in URLs/DB.
 * We keep it stable (Arabic) and only localize the *label*.
 */
export type CategoryDef = {
  value: string;
  label: Record<Locale, string>;
  emoji: string;
};

export const CATEGORIES: readonly CategoryDef[] = [
  { value: 'الفواكه', label: { ar: 'الفواكه', en: 'Fruits' }, emoji: '🍎' },
  { value: 'الخضروات', label: { ar: 'الخضروات', en: 'Vegetables' }, emoji: '🥬' },
  { value: 'البذور', label: { ar: 'البذور', en: 'Seeds' }, emoji: '🌱' },
  { value: 'التمور', label: { ar: 'التمور', en: 'Dates' }, emoji: '🌴' },
  { value: 'النخيل', label: { ar: 'النخيل', en: 'Palm' }, emoji: '🌴' },
  { value: 'الأعلاف', label: { ar: 'الأعلاف', en: 'Feed' }, emoji: '🌾' },
  { value: 'العسل', label: { ar: 'العسل', en: 'Honey' }, emoji: '🍯' },
  { value: 'الأسمدة والمبيدات', label: { ar: 'الأسمدة والمبيدات', en: 'Fertilizers & Pesticides' }, emoji: '🧪' },
  { value: 'تأجير المزارع', label: { ar: 'تأجير المزارع', en: 'Farm rentals' }, emoji: '🏡' },
  { value: 'الخدمات', label: { ar: 'الخدمات', en: 'Services' }, emoji: '🚜' },
] as const;

export function categoryLabel(locale: Locale, value: string): string {
  const found = CATEGORIES.find((c) => c.value === value);
  return found ? found.label[locale] : value;
}

