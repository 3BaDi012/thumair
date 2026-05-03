import { useEffect, useMemo, useState } from 'react';
import { X, Bell, MessageSquare, ShoppingBag, Newspaper, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationRow {
  id: string;
  type: 'message' | 'system' | 'listing' | 'news';
  title: string;
  content: string;
  link_url: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
  const { supabaseUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isOpen) return;
      if (!supabaseUser) {
        setNotifications([]);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, content, link_url, read_at, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) setError(error.message);
      setNotifications((data ?? []) as NotificationRow[]);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, supabaseUser]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="size-5" />;
      case 'listing':
        return <ShoppingBag className="size-5" />;
      case 'news':
        return <Newspaper className="size-5" />;
      default:
        return <Bell className="size-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'listing':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'news':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-900 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bell className="size-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">الإشعارات</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-emerald-200">
                      {unreadCount} إشعار جديد
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="size-6" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 px-6 text-gray-600 dark:text-gray-400">جارٍ تحميل الإشعارات...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Bell className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  لا توجد إشعارات
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  سنعلمك عندما يكون هناك جديد
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
                    {error}
                  </div>
                )}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer ${
                      !notification.read_at ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${getIconColor(notification.type)} flex-shrink-0 h-fit`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read_at && (
                            <div className="size-2 bg-sky-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Mark All as Read */}
          {unreadCount > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={async () => {
                  if (!supabaseUser) return;
                  const now = new Date().toISOString();
                  await supabase
                    .from('notifications')
                    .update({ read_at: now })
                    .eq('recipient_user_id', supabaseUser.id)
                    .is('read_at', null);
                  setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition font-semibold"
              >
                <Check className="size-5" />
                <span>وضع علامة مقروء على الكل</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
