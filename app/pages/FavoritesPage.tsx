import { useLocale } from '../context/LocaleContext';
import { bi } from '../i18n/bilingual';

export function FavoritesPage() {
  const { locale } = useLocale();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {bi(locale, 'المفضلة', 'Favorites')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {bi(locale, 'قريباً: مزامنة المفضلة مع Supabase.', 'Coming soon: Sync favorites with Supabase.')}
        </p>
      </div>
    </div>
  );
}

