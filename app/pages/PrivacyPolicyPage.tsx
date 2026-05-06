import { Link } from 'react-router';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { Shield, Lock, Eye, Database, Users, AlertCircle } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export function PrivacyPolicyPage() {
  const { locale } = useLocale();

  if (locale === 'en') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <header className="bg-white border-b border-sky-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/home">
              <ThumairLogoWithText />
            </Link>
            <Link to="/home" className="text-sm text-sky-900 hover:text-sky-700 transition">
              Back to home ←
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-sky-900 to-emerald-600 text-white rounded-2xl mb-6">
              <Shield className="size-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
              Privacy Policy
            </h1>
            <p className="text-gray-600">Last updated: Apr 28, 2026</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Eye className="size-5 text-sky-900" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>
                  Introduction
                </h2>
              </div>
              <p className="text-sm">
                We are committed to protecting your privacy and the security of your personal information. This policy
                explains what we collect, how we use it, and how we protect it.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Database className="size-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>
                  Information we collect
                </h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="pl-6 border-l-4 border-sky-200">
                  <h3 className="font-bold text-sky-900 mb-2">1. Account information</h3>
                  <ul className="space-y-2">
                    <li>• Full name and user type</li>
                    <li>• Email address and phone number</li>
                    <li>• Location (city/region)</li>
                  </ul>
                </div>
                <div className="pl-6 border-l-4 border-sky-200">
                  <h3 className="font-bold text-sky-900 mb-2">2. Transaction information</h3>
                  <ul className="space-y-2">
                    <li>• Listing and order records</li>
                    <li>• Reviews and ratings</li>
                    <li>• Messages and support requests (when applicable)</li>
                  </ul>
                </div>
                <div className="pl-6 border-l-4 border-sky-200">
                  <h3 className="font-bold text-sky-900 mb-2">3. Technical information</h3>
                  <ul className="space-y-2">
                    <li>• Device/browser information and IP address</li>
                    <li>• Usage analytics within the platform</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="size-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>
                  How we use information
                </h2>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• Facilitate communication and transactions between users</li>
                <li>• Improve user experience and personalize content</li>
                <li>• Send important notifications and updates</li>
                <li>• Maintain platform security and prevent fraud</li>
                <li>• Analyze usage to improve services</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Lock className="size-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>
                  Data protection
                </h2>
              </div>
              <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl p-6 space-y-2 text-sm">
                <p>• We use encryption and modern security practices to protect your data.</p>
                <p>• Access to data is restricted to authorized personnel when necessary.</p>
                <p>• We periodically review our security controls.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="size-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>
                  Your rights
                </h2>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• Access and review your personal data</li>
                <li>• Update or correct your information</li>
                <li>• Request account deletion (subject to legal/operational constraints)</li>
                <li>• Object to certain processing in specific circumstances</li>
                <li>• Withdraw consent where applicable</li>
              </ul>
            </section>

            <section className="bg-sky-50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-3" style={{ color: '#0C4A6E' }}>
                Contact
              </h2>
              <p className="text-sm">
                Questions about this policy? Email:{' '}
                <a href="mailto:thumair.sa@hotmail.com" className="text-sky-900 hover:underline">
                  thumair.sa@hotmail.com
                </a>
              </p>
              <p className="text-sm mt-1">
                Phone:{' '}
                <a href="tel:+966505650213" className="text-sky-900 hover:underline" dir="ltr">
                  +966 50 565 0213
                </a>
              </p>
            </section>

            <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
              We may update this policy from time to time. Material changes will be communicated where appropriate.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="bg-white border-b border-sky-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home">
            <ThumairLogoWithText />
          </Link>
          <Link to="/home" className="text-sm text-sky-900 hover:text-sky-700 transition">
            العودة للرئيسية ←
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-sky-900 to-emerald-600 text-white rounded-2xl mb-6">
            <Shield className="size-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#0C4A6E' }}>سياسة الخصوصية</h1>
          <p className="text-gray-600">آخر تحديث: 28 أبريل 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <Eye className="size-5 text-sky-900" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>المقدمة</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              نحن في منصة ثمير نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها عند استخدام منصتنا. نحن نؤمن بالشفافية الكاملة ونلتزم بأعلى معايير حماية البيانات.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Database className="size-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>المعلومات التي نجمعها</h2>
            </div>
            <div className="space-y-4">
              <div className="pr-6 border-r-4 border-sky-200">
                <h3 className="font-bold text-sky-900 mb-2">1. معلومات الحساب</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>الاسم الكامل ونوع المستخدم (مزارع، تاجر، مستهلك، مورد)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>عنوان البريد الإلكتروني ورقم الهاتف</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>الموقع الجغرافي (المدينة والمنطقة)</span>
                  </li>
                </ul>
              </div>

              <div className="pr-6 border-r-4 border-sky-200">
                <h3 className="font-bold text-sky-900 mb-2">2. معلومات المعاملات</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>تفاصيل المنتجات والخدمات المعروضة أو المطلوبة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>سجل الطلبات والمعاملات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>التقييمات والمراجعات</span>
                  </li>
                </ul>
              </div>

              <div className="pr-6 border-r-4 border-sky-200">
                <h3 className="font-bold text-sky-900 mb-2">3. معلومات تقنية</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>عنوان IP ونوع المتصفح والجهاز المستخدم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>بيانات الاستخدام وسجل التصفح داخل المنصة</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="size-5 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>كيفية استخدام المعلومات</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span>تسهيل عمليات التواصل والتعاقد بين المزارعين والمشترين</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span>تحسين تجربة المستخدم وتخصيص المحتوى</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span>إرسال الإشعارات المهمة والتحديثات حول الطلبات والعروض</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span>ضمان أمان المنصة ومنع الاحتيال</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span>تحليل البيانات لتطوير الخدمات والمنصة</span>
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Lock className="size-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>حماية البيانات</h2>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl p-6 space-y-3 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>نستخدم تقنيات التشفير المتقدمة لحماية بياناتك</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>الوصول للبيانات محدود فقط للموظفين المصرح لهم</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>نجري مراجعات أمنية دورية لأنظمتنا</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>لن نبيع أو نشارك بياناتك مع أطراف ثالثة دون موافقتك</span>
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="size-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>حقوقك</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>لديك الحق في:</p>
              <ul className="space-y-2 pr-6">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">→</span>
                  <span>الوصول إلى بياناتك الشخصية ومراجعتها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">→</span>
                  <span>تعديل أو تحديث معلوماتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">→</span>
                  <span>طلب حذف حسابك وبياناتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">→</span>
                  <span>الاعتراض على معالجة بياناتك في ظروف معينة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">→</span>
                  <span>سحب الموافقة على استخدام بياناتك في أي وقت</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-sky-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#0C4A6E' }}>التواصل معنا</h2>
            <p className="text-gray-700 mb-4">
              إذا كان لديك أي استفسارات حول سياسة الخصوصية أو كيفية استخدامنا لبياناتك، يرجى التواصل معنا:
            </p>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">البريد الإلكتروني: <a href="mailto:thumair.sa@hotmail.com" className="text-sky-900 hover:underline">thumair.sa@hotmail.com</a></p>
              <p className="font-semibold">الهاتف: <a href="tel:+966505650213" className="text-sky-900 hover:underline" dir="ltr">+966 50 565 0213</a></p>
            </div>
          </section>

          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
            نحتفظ بالحق في تحديث هذه السياسة من وقت لآخر. سيتم إخطارك بأي تغييرات جوهرية.
          </div>
        </div>
      </div>
    </div>
  );
}
