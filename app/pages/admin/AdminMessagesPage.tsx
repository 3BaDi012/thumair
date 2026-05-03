import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Inbox, Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

type Participant = { user_id: string };
type ConvoRow = {
  id: string;
  created_at: string;
  conversation_participants: Participant[] | null;
};

export function AdminMessagesPage() {
  const navigate = useNavigate();
  const [convos, setConvos] = useState<ConvoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await supabase
      .from('conversations')
      .select('id, created_at, conversation_participants(user_id)')
      .eq('is_admin_thread', true)
      .order('created_at', { ascending: false })
      .limit(100);
    if (qErr) setError(qErr.message);
    setConvos((data ?? []) as unknown as ConvoRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!targetUserId.trim() || !message.trim()) {
      setError('أدخل معرّف المستخدم والرسالة.');
      return;
    }
    setSending(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('admin_send_message', {
        body: { targetUserId: targetUserId.trim(), message: message.trim() },
      });
      if (fnErr) throw fnErr;
      const payload = data as { error?: string; conversationId?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      setMessage('');
      setTargetUserId('');
      await load();
      if (payload?.conversationId) {
        navigate(`/messages/${payload.conversationId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر الإرسال');
    } finally {
      setSending(false);
    }
  }

  function participantSummary(c: ConvoRow): string {
    const parts = c.conversation_participants ?? [];
    return parts.map((p) => p.user_id.slice(0, 8) + '…').join(' · ');
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Inbox className="size-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">رسائل الإدارة</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">محادثات الدعم مع المستخدمين.</p>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <form onSubmit={(e) => void sendMessage(e)} className="mb-10 space-y-4 max-w-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white">بدء محادثة</h2>
        <input
          placeholder="معرّف المستخدم (UUID)"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 font-mono text-sm"
        />
        <textarea
          placeholder="نص الرسالة الأولى"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="size-4" />
          {sending ? 'جارٍ الإرسال...' : 'إرسال وفتح المحادثة'}
        </button>
      </form>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">المحادثات</h2>
      {loading ? (
        <p className="text-gray-500">جارٍ التحميل...</p>
      ) : convos.length === 0 ? (
        <p className="text-gray-500">لا توجد محادثات بعد.</p>
      ) : (
        <ul className="space-y-2">
          {convos.map((c) => (
            <li key={c.id}>
              <Link
                to={`/messages/${c.id}`}
                className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 hover:border-emerald-400"
              >
                <span className="font-mono text-xs text-gray-500">{c.id.slice(0, 8)}…</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{participantSummary(c)}</p>
                <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString('ar-SA')}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
