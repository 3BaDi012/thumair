import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User, Phone, MapPin, ShoppingCart, Store } from 'lucide-react';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import { dashboardPathForUser } from '../lib/dashboardPath';
import { bi } from '../i18n/bilingual';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated, refreshProfile, user } = useAuth();
  const { locale, t } = useT();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userType: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        phone: formData.phone,
        locale: locale === 'en' ? 'en' : 'ar',
        userType: formData.userType === 'farmer' ? 'farmer' : 'buyer',
      });
      const refreshed = await refreshProfile();
      navigate(dashboardPathForUser(refreshed), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signupError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block hover:opacity-80 transition mb-6">
            <ThumairLogoWithText />
          </Link>
          <h1 className="text-3xl font-bold mt-4" style={{ color: '#0C4A6E' }}>
            {bi(locale, 'إنشاء حساب جديد', 'Create a new account')}
          </h1>
          <p className="text-gray-600 mt-2">
            {bi(locale, 'انضم إلى منصة ثمير الزراعية', 'Join Thumair marketplace')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ color: '#0C4A6E' }}>
                {bi(locale, 'اختر نوع الحساب', 'Choose account type')}
              </h2>
              <p className="text-gray-600 text-center mb-8">
                {bi(locale, 'اختر النوع الذي يناسبك للاستمتاع بتجربة ثمير', 'Choose the type that fits you')}
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <button
                  onClick={() => handleUserTypeSelect('buyer')}
                  className="group p-8 border-2 border-sky-200 rounded-2xl hover:border-sky-600 hover:bg-sky-50 hover:shadow-xl transition-all duration-300 text-center hover:scale-105"
                >
                  <div className="size-24 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                    <ShoppingCart className="size-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {bi(locale, 'مشتري', 'Buyer')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {bi(locale, 'أنا مهتم بشراء المنتجات الزراعية الطازجة مباشرة من المزارعين', 'I want to buy fresh produce directly from farms')}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sky-600 font-semibold">
                    {bi(locale, 'اختر هذا الخيار', 'Choose')}
                    <svg className="size-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => handleUserTypeSelect('farmer')}
                  className="group p-8 border-2 border-emerald-200 rounded-2xl hover:border-emerald-600 hover:bg-emerald-50 hover:shadow-xl transition-all duration-300 text-center hover:scale-105"
                >
                  <div className="size-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                    <Store className="size-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {bi(locale, 'تاجر / مزارع', 'Farmer / Seller')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {bi(locale, 'أنا أملك مزرعة أو أبيع منتجات زراعية وأريد عرضها على المنصة', 'I want to sell products and manage my listings')}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold">
                    {bi(locale, 'اختر هذا الخيار', 'Choose')}
                    <svg className="size-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  {bi(locale, 'لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    {t('auth.login')}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-emerald-600 hover:text-emerald-700 mb-6 flex items-center gap-2"
              >
                {bi(locale, '← العودة', '← Back')}
              </button>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {bi(locale, 'الاسم الكامل', 'Full name')}
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder={bi(locale, 'أحمد محمد', 'Ahmed Mohammed')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {bi(locale, 'رقم الجوال', 'Phone number')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="05XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {bi(locale, 'البريد الإلكتروني', 'Email')}
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
                    {bi(locale, 'الموقع', 'Location')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder={bi(locale, 'المدينة، المنطقة', 'City, region')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {bi(locale, 'كلمة المرور', 'Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {bi(locale, 'تأكيد كلمة المرور', 'Confirm password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 size-4 text-emerald-600 rounded" />
                  <p className="text-sm text-gray-600">
                    {bi(locale, 'أوافق على', 'I agree to')}{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                      {bi(locale, 'الشروط والأحكام', 'Terms & Conditions')}
                    </a>{' '}
                    {bi(locale, 'و', 'and')}{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                      {bi(locale, 'سياسة الخصوصية', 'Privacy Policy')}
                    </a>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-white rounded-lg hover:opacity-90 transition font-semibold shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
                >
                  {isSubmitting ? t('auth.creatingAccount') : t('auth.signup')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {bi(locale, 'لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    {bi(locale, 'تسجيل الدخول', 'Log in')}
                  </Link>
                </p>
              </div>
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
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
