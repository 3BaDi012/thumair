import { Languages } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export function LanguageToggle() {
  const { locale, toggleLocale } = useLocale();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
      aria-label={locale === 'ar' ? 'Switch language to English' : 'تغيير اللغة إلى العربية'}
    >
      <Languages className="size-4" />
      <span>{locale === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  );
}

