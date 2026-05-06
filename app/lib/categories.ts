export type CategoryDef = {
  name: string;
  emoji: string;
};

export const CATEGORIES: readonly CategoryDef[] = [
  { name: 'الفواكه', emoji: '🍎' },
  { name: 'الخضروات', emoji: '🥬' },
  { name: 'البذور', emoji: '🌱' },
  { name: 'التمور', emoji: '🌴' },
  { name: 'النخيل', emoji: '🌴' },
  { name: 'الأعلاف', emoji: '🌾' },
  { name: 'العسل', emoji: '🍯' },
  { name: 'الأسمدة والمبيدات', emoji: '🧪' },
  { name: 'تأجير المزارع', emoji: '🏡' },
  { name: 'الخدمات', emoji: '🚜' },
] as const;

