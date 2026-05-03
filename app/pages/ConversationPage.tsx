import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Send, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

type Message = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

export function ConversationPage() {
  const { conversationId } = useParams();
  const { supabaseUser, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!conversationId) return;
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_user_id, body, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(500);
      if (cancelled) return;
      if (error) setError(error.message);
      setMessages((data ?? []) as Message[]);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseUser || !conversationId) return;
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_user_id: supabaseUser.id,
      body: text,
    });
    if (error) {
      setError(error.message);
    } else {
      setBody('');
    }
    setSending(false);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Link to="/login" className="text-emerald-600 hover:underline">سجّل الدخول لعرض المحادثة</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/messages" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">المحادثة</h1>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto container mx-auto px-6 py-6 max-w-3xl">
        {loading ? (
          <p className="text-gray-500 text-center">جارٍ التحميل...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-12">ابدأ المحادثة بكتابة رسالة في الأسفل.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = m.sender_user_id === supabaseUser?.id;
              return (
                <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      mine ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-emerald-100' : 'text-gray-500'}`}>
                      {new Date(m.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form onSubmit={send} className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-3 max-w-3xl flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="px-4 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
        {error && <p className="text-xs text-red-600 text-center pb-2">{error}</p>}
      </form>
    </div>
  );
}
