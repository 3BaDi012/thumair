import { CATEGORIES } from '../../lib/categories';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

export type ListingFormValues = {
  title: string;
  description: string;
  category: string;
  city: string;
  unit: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  availableQuantity: string;
};

export function ListingForm({
  values,
  onChange,
}: {
  values: ListingFormValues;
  onChange: (next: ListingFormValues) => void;
}) {
  const { locale } = useLocale();

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          {bi(locale, 'العنوان', 'Title')}
        </label>
        <input
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
          placeholder={bi(locale, 'مثال: تمر سكري فاخر', 'Example: Premium Sukkari dates')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          {bi(locale, 'الوصف', 'Description')}
        </label>
        <textarea
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
          placeholder={bi(locale, 'اكتب وصفاً واضحاً للمنتج (النوع، الجودة، التوصيل...)', 'Write a clear description (type, quality, delivery...)')}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'التصنيف', 'Category')}
          </label>
          <select
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
          >
            <option value="">—</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label[locale]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'المدينة', 'City')}
          </label>
          <input
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
            placeholder={bi(locale, 'مثال: القصيم', 'Example: Al Qassim')}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'الوحدة', 'Unit')}
          </label>
          <input
            value={values.unit}
            onChange={(e) => onChange({ ...values, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
            placeholder={bi(locale, 'مثال: كجم', 'Example: kg')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'الكمية المتاحة', 'Available quantity')}
          </label>
          <input
            type="number"
            value={values.availableQuantity}
            onChange={(e) => onChange({ ...values, availableQuantity: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
            placeholder={bi(locale, 'مثال: 100', 'Example: 100')}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'العملة', 'Currency')}
          </label>
          <select
            value={values.currency}
            onChange={(e) => onChange({ ...values, currency: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
          >
            <option value="SAR">SAR</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'السعر الأدنى', 'Minimum price')}
          </label>
          <input
            type="number"
            value={values.priceMin}
            onChange={(e) => onChange({ ...values, priceMin: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            {bi(locale, 'السعر الأعلى', 'Maximum price')}
          </label>
          <input
            type="number"
            value={values.priceMax}
            onChange={(e) => onChange({ ...values, priceMax: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}

