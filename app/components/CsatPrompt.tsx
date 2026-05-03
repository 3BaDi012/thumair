import { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

type Props = {
  orderId: string;
  listingTitle: string | null;
  onSubmitted: () => void;
  onDismiss: () => void;
};

export function CsatPrompt({ orderId, listingTitle, onSubmitted, onDismiss }: Props) {
  const { supabaseUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating < 1 || rating > 5) {
      setError('اختر تقييماً من 1 إلى 5.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (!supabaseUser) throw new Error('غير مسجل');
      const { error: insErr } = await supabase.from('feedback').insert({
        user_id: supabaseUser.id,
        type: 'csat',
        rating,
        subject: listingTitle ? `طلب: ${listingTitle}` : 'تقييم بعد التسليم',
        body: comment.trim() || '—',
        metadata: { order_id: orderId },
      });
      if (insErr) throw insErr;
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر حفظ التقييم');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">كيف كانت تجربة طلبك؟</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">ساعدنا بتحسين المنصة بتقييم سريع لهذا الطلب.</p>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex gap-1 mb-4" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="p-1 rounded hover:bg-white/50"
            aria-label={`${n} stars`}
          >
            <Star className={`size-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="تعليق اختياري"
        rows={2}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm mb-4"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void submit()}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
        </button>
        <button type="button" onClick={onDismiss} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 dark:text-gray-300">
          لاحقاً
        </button>
      </div>
    </div>
  );
}
