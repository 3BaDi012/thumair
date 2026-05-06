import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Users, TrendingUp, Phone, Mail, Twitter, Instagram, ChevronRight, Package, Leaf, Award, ChevronDown, User } from 'lucide-react';
import { ThumairLogo, ThumairLogoWithText } from '../components/ThumairLogo';
import { useAuth } from '../context/AuthContext';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { NotificationsSidebar } from '../components/NotificationsSidebar';
import { NotificationBell } from '../components/NotificationBell';
import { useLocale } from '../context/LocaleContext';
import { bi } from '../i18n/bilingual';
import { CATEGORIES } from '../lib/categories';

export function LandingPage() {
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { locale } = useLocale();

  const categories = CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label[locale],
    path: `/products/${c.value}`,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/home" className="hover:opacity-80 transition hover:scale-105 duration-300">
              <ThumairLogoWithText />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/home" className="text-gray-700 hover:text-sky-900 transition font-medium">
                {bi(locale, 'الرئيسية', 'Home')}
              </Link>

              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowProductsDropdown(true)}
                onMouseLeave={() => setShowProductsDropdown(false)}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-sky-900 transition font-medium">
                  {bi(locale, 'المنتجات', 'Products')}
                  <ChevronDown className={`size-4 transition-transform ${showProductsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showProductsDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <Link
                      to="/products"
                      className="block px-4 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition font-semibold border-b border-gray-100"
                    >
                      {bi(locale, 'جميع المنتجات', 'All products')}
                    </Link>
                    {categories.map((category, index) => (
                      <Link
                        key={index}
                        to={category.path}
                        className="block px-4 py-2 text-gray-600 hover:bg-sky-50 hover:text-sky-900 transition"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/about" className="text-gray-700 hover:text-sky-900 transition font-medium">
                {bi(locale, 'عن ثمير', 'About Thumair')}
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-sky-900 transition font-medium">
                {bi(locale, 'تواصل معنا', 'Contact us')}
              </Link>
              <Link to="/terms" className="text-gray-700 hover:text-sky-900 transition font-medium">
                {bi(locale, 'الشروط والأحكام', 'Terms')}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <NotificationBell onClick={() => setIsNotificationsOpen(true)} />
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 hover:bg-gray-50 rounded-lg transition p-2"
                  >
                    <div className="size-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="size-5" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.userType === 'buyer'
                          ? bi(locale, 'مشتري', 'Buyer')
                          : user?.userType === 'farmer'
                            ? bi(locale, 'مزارع', 'Farmer')
                            : bi(locale, 'مورد', 'Supplier')}
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sky-900 border border-sky-900 rounded-lg hover:bg-sky-50 transition font-semibold"
                  >
                    {bi(locale, 'تسجيل الدخول', 'Log in')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-white rounded-lg hover:opacity-90 transition font-semibold shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
                  >
                    {bi(locale, 'إنشاء حساب', 'Sign up')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo - Smaller and Centered */}
            <div className="mb-8 animate-fade-in-down">
              <div className="inline-block">
                <ThumairLogo className="size-24 mx-auto hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* Title */}
            <div className="mb-8 animate-fade-in-up">
              <div className="inline-block px-6 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-6">
                {bi(locale, 'المنصة الرقمية السعودية للتسويق الزراعي', 'Saudi digital agricultural marketplace')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
                {bi(locale, 'منصة ثمير', 'Thumair Platform')}
              </h1>
              <p className="text-2xl font-semibold mb-4" style={{ color: '#10B981' }}>
                {bi(locale, 'ربط .. تمكين .. استدامة', 'Connect · Empower · Sustain')}
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                {bi(
                  locale,
                  'وسيط رقمي موثوق يربط المزارعين مباشرة بالأسواق، يمكّن التجارة العادلة، ويساهم في استدامة القطاع الزراعي السعودي',
                  'A trusted digital marketplace that connects farmers directly to buyers, enables fair trade, and supports a sustainable agricultural sector in Saudi Arabia.'
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up delay-200">
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="group px-8 py-4 text-white rounded-lg hover:opacity-90 transition-all duration-300 text-lg font-semibold shadow-lg flex items-center gap-2 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
                >
                  {bi(locale, 'ابدأ الآن', 'Get started')}
                  <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                to="/products"
                className="group px-8 py-4 bg-white border-2 rounded-lg hover:bg-sky-50 transition-all duration-300 text-lg font-semibold hover:scale-105"
                style={{ color: '#0C4A6E', borderColor: '#0C4A6E' }}
              >
                {bi(locale, 'استكشف المنتجات', 'Explore products')}
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 size-32 bg-emerald-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 size-40 bg-sky-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
              {bi(locale, 'ابدأ رحلتك مع ثمير', 'Start your journey with Thumair')}
            </h2>
            <p className="text-gray-600">
              {bi(locale, 'اختر ما يناسبك واستمتع بتجربة زراعية رقمية متكاملة', 'Choose what fits you and enjoy a complete digital agriculture experience')}
            </p>
          </div>
          <div className={`grid ${isAuthenticated ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8 max-w-4xl mx-auto`}>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="group bg-gradient-to-br from-white to-emerald-50 p-8 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="size-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform">
                  <Leaf className="size-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  {bi(locale, 'إنشاء حساب', 'Create an account')}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {bi(locale, 'انضم إلى ثمير كمزارع أو مشتري', 'Join Thumair as a farmer or buyer')}
                </p>
                <div className="flex items-center justify-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                  {bi(locale, 'ابدأ الآن', 'Get started')} <ChevronRight className="size-4" />
                </div>
              </Link>
            )}

            <Link
              to="/products"
              className="group bg-gradient-to-br from-white to-sky-50 p-8 rounded-2xl border-2 border-sky-100 hover:border-sky-300 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="size-20 bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform">
                <ShoppingCart className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                {bi(locale, 'تصفح المنتجات', 'Browse products')}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {bi(locale, 'استكشف مجموعة واسعة من المنتجات', 'Explore a wide range of products')}
              </p>
              <div className="flex items-center justify-center text-sky-600 font-semibold group-hover:gap-2 transition-all">
                {bi(locale, 'استكشف', 'Explore')} <ChevronRight className="size-4" />
              </div>
            </Link>

            <Link
              to="/about"
              className="group bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="size-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform">
                <Award className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                {bi(locale, 'تعرف على ثمير', 'Learn about Thumair')}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {bi(locale, 'اكتشف رؤيتنا ورسالتنا', 'Discover our vision and mission')}
              </p>
              <div className="flex items-center justify-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
                {bi(locale, 'اقرأ المزيد', 'Read more')} <ChevronRight className="size-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* Categories Section */}
      <section id="categories" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
              {bi(locale, 'التصنيفات', 'Categories')}
            </h2>
            <p className="text-xl text-gray-600">
              {bi(locale, 'استكشف مجموعة متنوعة من المنتجات والخدمات الزراعية', 'Explore a variety of agricultural products and services')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { value: 'الفواكه', image: 'https://images.unsplash.com/photo-1680835011466-6084ce4657d6?w=600&q=80', count: '150+', gradient: 'from-red-500 to-orange-500' },
              { value: 'الخضروات', image: 'https://images.unsplash.com/photo-1700064165267-8fa68ef07167?w=600&q=80', count: '200+', gradient: 'from-green-500 to-emerald-500' },
              { value: 'البذور', image: 'https://images.unsplash.com/photo-1719537524777-bcfb779aa2b4?w=600&q=80', count: '80+', gradient: 'from-yellow-600 to-green-600' },
              { value: 'التمور', image: 'https://images.unsplash.com/photo-1774334136128-bfdecc1c6446?w=600&q=80', count: '50+', gradient: 'from-amber-700 to-orange-700' },
              { value: 'النخيل', image: 'https://images.unsplash.com/photo-1757525473926-56161f2be108?w=600&q=80', count: '40+', gradient: 'from-green-600 to-teal-600' },
              { value: 'الأعلاف', image: 'https://images.unsplash.com/photo-1592049952483-1ee6199bfb37?w=600&q=80', count: '60+', gradient: 'from-yellow-500 to-amber-600' },
              { value: 'العسل', image: 'https://images.unsplash.com/photo-1676313816468-2c944d4fb27d?w=600&q=80', count: '40+', gradient: 'from-amber-500 to-yellow-600' },
              { value: 'الأسمدة والمبيدات', image: 'https://images.unsplash.com/photo-1590154743804-cf7c51dcbfd3?w=600&q=80', count: '70+', gradient: 'from-teal-600 to-green-700' },
              { value: 'تأجير المزارع', image: 'https://images.unsplash.com/photo-1688320243376-69b68a8f656f?w=600&q=80', count: '25+', gradient: 'from-emerald-700 to-green-800' },
              { value: 'الخدمات', image: 'https://images.unsplash.com/photo-1708975477074-71e2907b699f?w=600&q=80', count: '30+', gradient: 'from-blue-600 to-cyan-600' },
            ].map((category, index) => (
              <Link
                key={index}
                to={`/products/${category.value}`}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.value}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-70 transition`}></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-2xl font-bold mb-2 transform group-hover:scale-110 transition">
                      {CATEGORIES.find((c) => c.value === category.value)?.label[locale] ?? category.value}
                    </h3>
                    <p className="text-lg font-semibold">
                      {category.count} {bi(locale, 'منتج', 'products')}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-lg hover:opacity-90 transition text-lg font-semibold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
            >
              {bi(locale, 'عرض جميع المنتجات', 'View all products')}
              <ChevronRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section with Visual Enhancement */}
      <section className="py-20 bg-gradient-to-br from-sky-900 via-sky-800 to-emerald-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 size-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 size-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-4xl font-bold mb-4">{bi(locale, 'أرقامنا تتحدث عنا', 'Our numbers speak')}</h2>
            <p className="text-xl text-sky-200">
              {bi(locale, 'نمو مستمر وثقة متزايدة من مستخدمينا', 'Steady growth and increasing trust from our users')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-fade-in-up">
              <div className="size-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Users className="size-10" />
              </div>
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">500+</div>
              <p className="text-sky-200 font-semibold">{bi(locale, 'مزارع نشط', 'Active farms')}</p>
            </div>

            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-fade-in-up delay-100">
              <div className="size-20 bg-gradient-to-br from-cyan-400 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Package className="size-10" />
              </div>
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">1000+</div>
              <p className="text-sky-200 font-semibold">{bi(locale, 'منتج متنوع', 'Diverse products')}</p>
            </div>

            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-fade-in-up delay-200">
              <div className="size-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <TrendingUp className="size-10" />
              </div>
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">2000+</div>
              <p className="text-sky-200 font-semibold">{bi(locale, 'معاملة ناجحة', 'Successful transactions')}</p>
            </div>

            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-fade-in-up delay-300">
              <div className="size-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Award className="size-10" />
              </div>
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">98%</div>
              <p className="text-sky-200 font-semibold">{bi(locale, 'نسبة الرضا', 'Satisfaction rate')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-50 to-emerald-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
            {bi(locale, 'جاهز للانضمام إلى ثمير؟', 'Ready to join Thumair?')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {bi(locale, 'ابدأ رحلتك في التسويق الزراعي الرقمي اليوم', 'Start your digital agriculture journey today')}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-5 text-white rounded-lg hover:opacity-90 transition text-xl font-semibold shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
          >
            {bi(locale, 'إنشاء حساب مجاني', 'Create a free account')}
            <ChevronRight className="size-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-b from-sky-900 to-sky-950 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ThumairLogo className="size-12" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{bi(locale, 'ثمير', 'Thumair')}</span>
                  <span className="text-xs text-emerald-400">{bi(locale, 'ربط .. تمكين .. استدامة', 'Connect · Empower · Sustain')}</span>
                </div>
              </div>
              <p className="text-sky-200 leading-relaxed">
                {bi(locale, 'المنصة الرقمية السعودية للتسويق الزراعي', 'Saudi digital agricultural marketplace')}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{bi(locale, 'روابط سريعة', 'Quick links')}</h4>
              <ul className="space-y-3 text-sky-200">
                <li><Link to="/products" className="hover:text-emerald-400 transition">{bi(locale, 'المنتجات', 'Products')}</Link></li>
                {isAuthenticated ? (
                  <li>
                    <Link
                      to={user?.userType === 'buyer' ? '/dashboard/buyer' : '/dashboard/farmer'}
                      className="hover:text-emerald-400 transition"
                    >
                      {bi(locale, 'لوحة التحكم', 'Dashboard')}
                    </Link>
                  </li>
                ) : (
                  <>
                    <li><Link to="/register" className="hover:text-emerald-400 transition">{bi(locale, 'إنشاء حساب', 'Sign up')}</Link></li>
                    <li><Link to="/login" className="hover:text-emerald-400 transition">{bi(locale, 'تسجيل الدخول', 'Log in')}</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{bi(locale, 'الدعم', 'Support')}</h4>
              <ul className="space-y-3 text-sky-200">
                <li><Link to="/contact" className="hover:text-emerald-400 transition">{bi(locale, 'مركز المساعدة', 'Help center')}</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-400 transition">{bi(locale, 'الشروط والأحكام', 'Terms')}</Link></li>
                <li><Link to="/privacy" className="hover:text-emerald-400 transition">{bi(locale, 'سياسة الخصوصية', 'Privacy')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{bi(locale, 'تواصل معنا', 'Contact')}</h4>
              <ul className="space-y-3 text-sky-200">
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-emerald-400" />
                  <a href="mailto:thumair.sa@hotmail.com" className="hover:text-emerald-400 transition">
                    thumair.sa@hotmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-emerald-400" />
                  <a href="tel:+966505650213" className="hover:text-emerald-400 transition" dir="ltr">
                    +966 50 565 0213
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Twitter className="size-4 text-emerald-400" />
                  <a href="https://twitter.com/thumair_sa" target="_blank" rel="noopener" className="hover:text-emerald-400 transition">
                    @thumair_sa
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="size-4 text-emerald-400" />
                  <a href="https://instagram.com/thumair.sa" target="_blank" rel="noopener" className="hover:text-emerald-400 transition">
                    @thumair.sa
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-sky-800 pt-8 text-center text-sky-300">
            <p>
              {bi(
                locale,
                '© 2026 منصة ثمير - المنصة الرقمية السعودية للتسويق الزراعي. جميع الحقوق محفوظة.',
                '© 2026 Thumair Platform — Saudi digital agricultural marketplace. All rights reserved.'
              )}
            </p>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationsSidebar isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
}
