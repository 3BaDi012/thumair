import { Link } from 'react-router';
import { ThumairLogoWithText, ThumairLogo } from '../components/ThumairLogo';
import { Target, Eye, Award, Users, TrendingUp, Shield, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AboutPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/home" className="hover:opacity-80 transition hover:scale-105 duration-300">
              <ThumairLogoWithText />
            </Link>
            <Link to="/home" className="text-gray-600 hover:text-sky-900 transition">
              العودة للرئيسية ←
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block mb-8">
              <ThumairLogo className="size-32 mx-auto" />
            </div>
            <h1 className="text-5xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
              عن منصة ثمير
            </h1>
            <p className="text-2xl font-semibold mb-4" style={{ color: '#10B981' }}>
              ربط .. تمكين .. استدامة
            </p>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              منصة ثمير هي المنصة الرقمية السعودية الرائدة للتسويق الزراعي، نربط المزارعين مباشرة بالأسواق،
              نمكّن التجارة العادلة، ونساهم في استدامة القطاع الزراعي في المملكة العربية السعودية
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-900 rounded-full text-sm font-semibold mb-6">
                <Target className="size-4" />
                رؤيتنا
              </div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
                نحو قطاع زراعي مستدام ومزدهر
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                نسعى لأن نكون المنصة الرقمية الأولى في المملكة العربية السعودية للتسويق الزراعي،
                نربط جميع أطراف السلسلة الزراعية في بيئة رقمية موثوقة وآمنة، ونساهم في تحقيق الأمن الغذائي
                ودعم رؤية المملكة 2030 في تنمية القطاع الزراعي.
              </p>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-3xl p-12">
                <ThumairLogo className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-6 -left-6 size-64 bg-gradient-to-br from-emerald-200 to-sky-200 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="bg-gradient-to-br from-emerald-500 to-sky-600 rounded-3xl p-12 text-white">
                <Eye className="size-16 mb-6" />
                <h3 className="text-3xl font-bold mb-4">رسالتنا</h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-200 font-bold">✓</span>
                    <span>تمكين المزارعين من الوصول المباشر للأسواق</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-200 font-bold">✓</span>
                    <span>توفير أسعار عادلة لجميع الأطراف</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-200 font-bold">✓</span>
                    <span>ضمان الشفافية والموثوقية</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-200 font-bold">✓</span>
                    <span>دعم الاستدامة الزراعية</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-900 rounded-full text-sm font-semibold mb-6">
                <Eye className="size-4" />
                رسالتنا
              </div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
                نربط .. نمكّن .. نستدام
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                نعمل على إنشاء جسر رقمي يربط المزارعين بالمشترين والموردين، نلغي الوسطاء غير الضروريين،
                ونضمن وصول المنتجات الزراعية الطازجة من المزرعة مباشرة إلى المستهلك بأفضل الأسعار وأعلى جودة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-sky-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
              لماذا ثمير؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نوفر بيئة رقمية آمنة وموثوقة تربط جميع أطراف السوق الزراعي
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="size-20 bg-gradient-to-br from-sky-900 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-4 text-center">ربط مباشر</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                نربط المزارعين مباشرة مع المشترين والموردين، نلغي الوسطاء غير الضروريين
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="size-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-4 text-center">أمان وثقة</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                نظام توثيق شامل وتقييم متبادل يضمن موثوقية جميع المستخدمين
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="size-20 bg-gradient-to-br from-cyan-500 to-sky-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-4 text-center">شفافية كاملة</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                أسعار واضحة، إمكانية التفاوض المباشر، ومعلومات شاملة عن جميع المنتجات
              </p>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
              قيمنا الأساسية
            </h2>
            <p className="text-xl text-gray-600">المبادئ التي نؤمن بها ونعمل من خلالها</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center">
              <div className="size-20 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-3">الموثوقية</h3>
              <p className="text-gray-600">
                نبني الثقة من خلال التوثيق الكامل والشفافية في جميع المعاملات
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center">
              <div className="size-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-3">الاستدامة</h3>
              <p className="text-gray-600">
                نساهم في تحقيق استدامة القطاع الزراعي للأجيال القادمة
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center">
              <div className="size-20 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-3">الشفافية</h3>
              <p className="text-gray-600">
                أسعار واضحة ومعلومات دقيقة لجميع المنتجات والخدمات
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center">
              <div className="size-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-sky-900 mb-3">التعاون</h3>
              <p className="text-gray-600">
                نؤمن بقوة التعاون بين جميع أطراف السلسلة الزراعية
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-sky-900 to-sky-800 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">إنجازاتنا</h2>
            <p className="text-xl text-sky-200">أرقام تعكس نجاحنا ونموّنا المستمر</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="size-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="size-12 text-emerald-400" />
              </div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-sky-200 text-lg">مزارع نشط</p>
            </div>

            <div className="text-center">
              <div className="size-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="size-12 text-emerald-400" />
              </div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <p className="text-sky-200 text-lg">منتج متنوع</p>
            </div>

            <div className="text-center">
              <div className="size-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="size-12 text-emerald-400" />
              </div>
              <div className="text-5xl font-bold mb-2">2000+</div>
              <p className="text-sky-200 text-lg">معاملة ناجحة</p>
            </div>

            <div className="text-center">
              <div className="size-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="size-12 text-emerald-400" />
              </div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <p className="text-sky-200 text-lg">نسبة الرضا</p>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-sky-50 to-emerald-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
              انضم إلى ثمير اليوم
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              كن جزءاً من التحول الرقمي في القطاع الزراعي السعودي
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 text-white rounded-lg hover:opacity-90 transition text-xl font-semibold shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
            >
              إنشاء حساب مجاني
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
