import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ShoppingCart, Store, Eye, EyeOff } from 'lucide-react';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import { dashboardPathForUser } from '../lib/dashboardPath';
import { supabase } from '../lib/supabaseClient';
import { bi } from '../i18n/bilingual';

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithPassword, isAuthenticated, user, refreshProfile } = useAuth();
  const { locale, t } = useT();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userType: '',
    email: '',
    password: '',
  });

  const handleUserTypeSelect = (type: string) => {
    setFormData({ ...formData, userType: type });
    setStep(2);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(dashboardPathForUser(user), { replace: true });
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithPassword({ email: formData.email, password: formData.password });
      const refreshed = await refreshProfile();

      const desired = formData.userType === 'farmer' ? 'farmer' : 'buyer';
      const actual = refreshed?.userType;
      if (actual && actual !== desired) {
        await supabase.auth.signOut().catch(() => undefined);
        setError(t('auth.accountDoesNotExist'));
        setIsSubmitting(false);
        return;
      }

      navigate(dashboardPathForUser(refreshed), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block hover:opacity-80 transition mb-6">
            <ThumairLogoWithText />
          </Link>
          <h1 className="text-3xl font-bold mt-4" style={{ color: '#0C4A6E' }}>
            {t('auth.login')}
          </h1>
          <p className="text-gray-600 mt-2">
            {bi(locale, 'مرحباً بك مجدداً في منصة ثمير', 'Welcome back to Thumair')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ color: '#0C4A6E' }}>
                {bi(locale, 'اختر نوع الحساب', 'Choose account type')}
              </h2>
              <p className="text-gray-600 text-center mb-8">
                {bi(locale, 'كيف تريد تسجيل الدخول؟', 'How would you like to log in?')}
              </p>

              <div className="grid gap-6">
                <button
                  onClick={() => handleUserTypeSelect('buyer')}
                  className="group p-6 border-2 border-sky-200 rounded-xl hover:border-sky-600 hover:bg-sky-50 hover:shadow-lg transition-all duration-300 text-center hover:scale-105"
                >
                  <div className="size-16 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform">
                    <ShoppingCart className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {bi(locale, 'مشتري', 'Buyer')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {bi(locale, 'تسجيل الدخول كمشتري للمنتجات', 'Log in to buy products')}
                  </p>
                </button>

                <button
                  onClick={() => handleUserTypeSelect('farmer')}
                  className="group p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 hover:shadow-lg transition-all duration-300 text-center hover:scale-105"
                >
                  <div className="size-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform">
                    <Store className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {bi(locale, 'تاجر / مزارع', 'Farmer / Seller')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {bi(locale, 'تسجيل الدخول لإدارة منتجاتك', 'Log in to manage your listings')}
                  </p>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {bi(locale, 'ليس لديك حساب؟', "Don't have an account?")}{' '}
                  <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    {bi(locale, 'إنشاء حساب جديد', 'Create a new account')}
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <button
                onClick={() => setStep(1)}
                className="text-sky-600 hover:text-sky-700 mb-6 flex items-center gap-2 text-sm font-semibold"
              >
                {bi(locale, '← العودة', '← Back')}
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pr-12 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showPassword
                          ? bi(locale, 'إخفاء كلمة المرور', 'Hide password')
                          : bi(locale, 'إظهار كلمة المرور', 'Show password')
                      }
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="size-4 text-emerald-600 rounded" />
            <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
                  </label>
                  <a href="#" className="text-sm text-sky-600 hover:text-sky-700">
            {t('auth.forgotPassword')}
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-white rounded-lg hover:opacity-90 transition-all duration-300 font-semibold shadow-lg hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
                >
        {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
