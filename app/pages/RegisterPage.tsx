import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User, Phone, MapPin, ShoppingCart, Store } from 'lucide-react';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
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
    if (isAuthenticated) navigate('/home', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        phone: formData.phone,
        locale: 'ar',
        userType: formData.userType === 'farmer' ? 'farmer' : 'buyer',
      });
      const dashboardPath = formData.userType === 'farmer' ? 'farmer' : 'buyer';
      navigate(`/dashboard/${dashboardPath}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب');
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
          <h1 className="text-3xl font-bold mt-4" style={{ color: '#0C4A6E' }}>إنشاء حساب جديد</h1>
          <p className="text-gray-600 mt-2">انضم إلى منصة ثمير الزراعية</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ color: '#0C4A6E' }}>
                اختر نوع الحساب
              </h2>
              <p className="text-gray-600 text-center mb-8">اختر النوع الذي يناسبك للاستمتاع بتجربة ثمير</p>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <button
                  onClick={() => handleUserTypeSelect('buyer')}
                  className="group p-8 border-2 border-sky-200 rounded-2xl hover:border-sky-600 hover:bg-sky-50 hover:shadow-xl transition-all duration-300 text-center hover:scale-105"
                >
                  <div className="size-24 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                    <ShoppingCart className="size-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">مشتري</h3>
                  <p className="text-gray-600 leading-relaxed">
                    أنا مهتم بشراء المنتجات الزراعية الطازجة مباشرة من المزارعين
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sky-600 font-semibold">
                    اختر هذا الخيار
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">تاجر / مزارع</h3>
                  <p className="text-gray-600 leading-relaxed">
                    أنا أملك مزرعة أو أبيع منتجات زراعية وأريد عرضها على المنصة
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold">
                    اختر هذا الخيار
                    <svg className="size-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  لديك حساب بالفعل؟{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    تسجيل الدخول
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
                ← العودة
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
                      الاسم الكامل
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="أحمد محمد"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الجوال
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
                    البريد الإلكتروني
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
                    الموقع
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="المدينة، المنطقة"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور
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
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأكيد كلمة المرور
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
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 size-4 text-emerald-600 rounded" />
                  <p className="text-sm text-gray-600">
                    أوافق على{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                      الشروط والأحكام
                    </a>{' '}
                    و{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700">
                      سياسة الخصوصية
                    </a>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-white rounded-lg hover:opacity-90 transition font-semibold shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
                >
                  {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  لديك حساب بالفعل؟{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    تسجيل الدخول
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
