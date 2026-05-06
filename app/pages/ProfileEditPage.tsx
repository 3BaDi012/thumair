import { useState } from 'react';
import { Link } from 'react-router';
import { User, Mail, Phone, Camera, ArrowRight, Save, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import { uploadAvatar } from '../lib/avatarStorage';
import { supabase } from '../lib/supabaseClient';
import { bi } from '../i18n/bilingual';

export function ProfileEditPage() {
  const { user, refreshProfile } = useAuth();
  const { locale, t } = useT();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || bi(locale, 'أحمد محمد', 'Ahmed Mohammed'),
    email: user?.email || 'ahmed@example.com',
    phone: '0501234567',
    image: user?.image || '',
    location: bi(locale, 'الرياض', 'Riyadh'),
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      let avatarUrlToSave: string | null = null;
      if (avatarFile) {
        const uploaded = await uploadAvatar({ userId: user.id, file: avatarFile });
        avatarUrlToSave = uploaded.publicUrl;
      }

      const update: Record<string, unknown> = {
        display_name: profileData.name,
        phone: profileData.phone || null,
      };
      if (avatarUrlToSave) update.avatar_url = avatarUrlToSave;

      const { error: upErr } = await supabase.from('profiles').update(update).eq('id', user.id);
      if (upErr) throw upErr;

      await refreshProfile();
      setAvatarFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : bi(locale, 'تعذر حفظ الملف الشخصي', 'Failed to save profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const dashboardPath = user?.userType === 'buyer' ? '/dashboard/buyer' : '/dashboard/farmer';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-2 text-sky-900 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition mb-4"
          >
            <ArrowRight className="size-5" />
            {bi(locale, 'العودة للوحة التحكم', 'Back to dashboard')}
          </Link>
          <h1 className="text-4xl font-bold text-sky-900 dark:text-white">{t('profile.editTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {bi(locale, 'قم بتحديث معلوماتك الشخصية', 'Update your personal info')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* Profile Image Section */}
          <div className="text-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="relative inline-block">
              <div className="size-32 bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900 dark:to-emerald-900 rounded-full flex items-center justify-center overflow-hidden">
                {profileData.image ? (
                  <img
                    src={profileData.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="size-16 text-sky-900 dark:text-sky-400" />
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 size-10 bg-emerald-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition shadow-lg"
              >
                <Camera className="size-5" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {bi(locale, 'انقر على أيقونة الكاميرا لتحديث صورة الملف الشخصي', 'Click the camera icon to update your profile picture')}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {bi(locale, 'الاسم الكامل', 'Full name')}
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {bi(locale, 'نوع الحساب', 'Account type')}
                </label>
                <div className="relative">
                  <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {user?.userType === 'buyer'
                      ? bi(locale, 'مشتري', 'Buyer')
                      : user?.userType === 'farmer'
                        ? bi(locale, 'مزارع', 'Farmer')
                        : bi(locale, 'مورد', 'Supplier')}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {bi(locale, 'لا يمكن تغيير نوع الحساب', "Account type can't be changed")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {bi(locale, 'البريد الإلكتروني', 'Email')}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {bi(locale, 'رقم الجوال', 'Phone number')}
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {bi(locale, 'الموقع', 'Location')}
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({ ...profileData, location: e.target.value })
                    }
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={bi(locale, 'المدينة، المنطقة', 'City, region')}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-900 to-emerald-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
              >
                <Save className="size-5" />
                {isSaving ? bi(locale, 'جارٍ الحفظ...', 'Saving…') : bi(locale, 'حفظ التغييرات', 'Save changes')}
              </button>
              <Link
                to={dashboardPath}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
              >
                {bi(locale, 'إلغاء', 'Cancel')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
