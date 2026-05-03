import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClick: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className }: Props) {
  const { supabaseUser } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseUser) {
        setUnread(0);
        return;
      }
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_user_id', supabaseUser.id)
        .is('read_at', null);
      if (!cancelled) setUnread(count ?? 0);
    }
    void load();

    if (!supabaseUser) return;

    const channel = supabase
      .channel(`notifications:${supabaseUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `recipient_user_id=eq.${supabaseUser.id}` },
        () => void load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition ${className ?? ''}`}
      aria-label="الإشعارات"
    >
      <Bell className="size-6" />
      {unread > 0 && (
        <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}
