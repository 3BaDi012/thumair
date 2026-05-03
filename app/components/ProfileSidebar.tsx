import { Link, useNavigate } from 'react-router';
import { X, Heart, User, Settings, Trash2, LogOut } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const { favorites, removeFromFavorites } = useFavorites();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/home', { replace: true });
    onClose();
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
        className={`fixed top-0 left-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header - Account Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-900 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">الحساب الشخصي</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 bg-white rounded-full flex items-center justify-center">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="size-8 text-sky-900" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{user?.name || 'مستخدم'}</h3>
                <p className="text-emerald-200 text-sm">
                  {user?.userType === 'buyer' ? 'مشتري' : user?.userType === 'farmer' ? 'مزارع' : 'مورد'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/profile/edit"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
              >
                <User className="size-4" />
                <span className="text-sm font-semibold">الملف الشخصي</span>
              </Link>
              <Link
                to="/settings"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
              >
                <Settings className="size-4" />
                <span className="text-sm font-semibold">الإعدادات</span>
              </Link>
            </div>
          </div>

          {/* Favorites Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="size-5 text-red-500 fill-red-500" />
              المنتجات المفضلة ({favorites.length})
            </h3>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  لا توجد منتجات مفضلة بعد
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  ابدأ بإضافة منتجاتك المفضلة لتظهر هنا
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:shadow-md transition group"
                  >
                    <div className="flex gap-3">
                      <div className="size-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={listing.imageUrl ?? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80'}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {listing.orgName ?? 'مزرعة'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {listing.priceMin ?? listing.priceMax ?? '—'} {listing.currency}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => void removeFromFavorites(listing.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
            >
              <LogOut className="size-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
