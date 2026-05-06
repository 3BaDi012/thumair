import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

const AUDIENCES = [
  { value: 'all', labelAr: 'جميع المستخدمين', labelEn: 'All users' },
  { value: 'farmers', labelAr: 'المزارعون', labelEn: 'Farmers' },
  { value: 'suppliers', labelAr: 'الموردون', labelEn: 'Suppliers' },
  { value: 'buyers', labelAr: 'المشترون', labelEn: 'Buyers' },
] as const;

export function AdminBroadcastPage() {
  const { locale } = useLocale();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]['value']>('all');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!title.trim() || !content.trim()) {
      setError(bi(locale, 'أدخل العنوان والنص.', 'Enter a title and content.'));
      return;
    }
    setSending(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('admin_broadcast', {
        body: { title: title.trim(), content: content.trim(), audience },
      });
      if (fnErr) throw fnErr;
      const payload = data as { error?: string; sent?: number } | null;
      if (payload?.error) throw new Error(payload.error);
      setResult(bi(locale, `تم إرسال الإشعار إلى ${payload?.sent ?? 0} مستخدم.`, `Notification sent to ${payload?.sent ?? 0} users.`));
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : bi(locale, 'تعذر الإرسال', "Couldn't send"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Megaphone className="size-8 text-sky-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{bi(locale, 'إشعار جماعي', 'Broadcast')}</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {bi(locale, 'يُنشئ إشعاراً في صندوق كل مستخدم ضمن الفئة المختارة.', 'Creates a notification in each user inbox for the selected audience.')}
      </p>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
      {result && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 mb-4">{result}</div>}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{bi(locale, 'الفئة', 'Audience')}</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as (typeof AUDIENCES)[number]['value'])}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {bi(locale, a.labelAr, a.labelEn)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{bi(locale, 'عنوان الإشعار', 'Title')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{bi(locale, 'المحتوى', 'Content')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 rounded-lg bg-sky-700 text-white font-semibold hover:bg-sky-800 disabled:opacity-50"
        >
          {sending ? bi(locale, 'جارٍ الإرسال...', 'Sending...') : bi(locale, 'إرسال', 'Send')}
        </button>
      </form>
    </div>
  );
}
