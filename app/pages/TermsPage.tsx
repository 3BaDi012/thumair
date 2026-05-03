import { Link } from 'react-router';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Users, Package } from 'lucide-react';

export function TermsPage() {
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
            <FileText className="size-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#0C4A6E' }}>الشروط والأحكام</h1>
          <p className="text-gray-600">آخر تحديث: 28 أبريل 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <FileText className="size-5 text-sky-900" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>تمهيد</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              مرحباً بك في منصة ثمير، المنصة الرقمية السعودية للتسويق الزراعي. من خلال الوصول إلى منصتنا أو استخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا.
            </p>
            <div className="mt-4 p-4 bg-emerald-50 border-r-4 border-emerald-600 rounded">
              <p className="text-emerald-900 font-semibold">شعارنا: ربط .. تمكين .. استدامة</p>
              <p className="text-sm text-emerald-700 mt-1">نربط المزارعين بالأسواق، نمكّن التجارة العادلة، ونساهم في استدامة القطاع الزراعي</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Scale className="size-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>طبيعة المنصة</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold text-sky-900">منصة ثمير هي وسيط رقمي فقط، ولا تقوم بـ:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="size-5 text-red-600" />
                    <span className="font-bold text-red-900">لا نقوم بـ</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• بيع أو شراء المنتجات مباشرة</li>
                    <li>• امتلاك المنتجات المعروضة</li>
                    <li>• ضمان جودة المنتجات</li>
                    <li>• التدخل في التفاوض التجاري</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="size-5 text-green-600" />
                    <span className="font-bold text-green-900">نقوم بـ</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• توفير منصة للعرض والطلب</li>
                    <li>• تسهيل التواصل بين الأطراف</li>
                    <li>• توثيق المستخدمين</li>
                    <li>• توفير نظام تقييم شفاف</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="size-5 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>التزامات المستخدمين</h2>
            </div>
            <div className="space-y-4">
              <div className="pr-6 border-r-4 border-sky-200">
                <h3 className="font-bold text-sky-900 mb-3">1. التزامات المزارع</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>تقديم معلومات دقيقة وصادقة عن المنتجات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>الالتزام بالكميات والأسعار المعلنة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>تحديث حالة المنتجات بشكل دوري</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>الالتزام بمعايير الجودة والسلامة الغذائية</span>
                  </li>
                </ul>
              </div>

              <div className="pr-6 border-r-4 border-sky-200">
                <h3 className="font-bold text-sky-900 mb-3">2. التزامات المشتري (تاجر/مستهلك)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>التعامل بحسن نية مع المزارعين</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>الالتزام بالاتفاقيات المبرمة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>عدم إساءة استخدام نظام التقييم</span>
                  </li>
                </ul>
              </div>

              <div className="pr-6 border-r-4 border-sky-200">
                <h3 className="font-bold text-sky-900 mb-3">3. التزامات المورد</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>تقديم خدمات ومنتجات بمواصفات احترافية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>الالتزام بالأسعار والمواعيد المحددة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>توفير ضمانات معقولة للخدمات المقدمة</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="size-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>المعاملات والدفع</h2>
            </div>
            <div className="bg-sky-50 rounded-xl p-6 space-y-3 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>جميع المعاملات المالية تتم مباشرة بين الأطراف</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>المنصة غير مسؤولة عن النزاعات المالية بين المستخدمين</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-sky-900 font-bold">•</span>
                <span>يُنصح بتوثيق الاتفاقيات كتابياً وحفظ إيصالات الدفع</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mt-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="size-10 bg-amber-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-lg">%</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg mb-2">عمولة المنصة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    تحصل منصة ثمير على عمولة قدرها <span className="font-bold text-amber-800">1% (واحد بالمائة)</span> من قيمة كل عملية بيع أو خدمة ناجحة تتم عبر المنصة. يتم احتساب العمولة من المبلغ الإجمالي للمعاملة ويتم خصمها تلقائياً عند إتمام العملية.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700 font-semibold mb-2">تفاصيل العمولة:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>يتحمل البائع/المزارع نسبة العمولة 1% من قيمة البيع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>تطبق العمولة على جميع المعاملات الناجحة التي تتم عبر المنصة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>العمولة تشمل خدمات المنصة من توثيق وتسهيل ودعم فني</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>يتم إصدار فاتورة إلكترونية لكل معاملة توضح قيمة العمولة</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>الاستخدام المحظور</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold text-red-900">يُحظر استخدام المنصة لـ:</p>
              <ul className="space-y-2 pr-6">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>نشر معلومات كاذبة أو مضللة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>عرض منتجات غير قانونية أو محظورة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>انتحال شخصية الغير أو إنشاء حسابات وهمية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>المضايقة أو التهديد أو الإساءة للمستخدمين الآخرين</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>محاولة اختراق النظام أو التلاعب بالبيانات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>استخدام المنصة لأغراض غير زراعية أو تجارية مخالفة</span>
                </li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-900 font-semibold">⚠️ قد يؤدي انتهاك هذه القواعد إلى تعليق أو إلغاء حسابك دون سابق إنذار</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Scale className="size-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>المسؤولية وحل النزاعات</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="pr-4 border-r-4 border-emerald-300">
                <span className="font-bold text-sky-900">حل النزاعات:</span> نشجع المستخدمين على حل أي خلافات بشكل ودي. في حالة عدم التوصل لحل، يمكن طلب المساعدة من فريق الدعم الذي سيحاول الوساطة دون إلزام قانوني.
              </p>
              <p className="pr-4 border-r-4 border-sky-300">
                <span className="font-bold text-sky-900">إخلاء المسؤولية:</span> المنصة غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الخدمة أو التعاملات بين المستخدمين.
              </p>
              <p className="pr-4 border-r-4 border-purple-300">
                <span className="font-bold text-sky-900">الالتزام بالأنظمة:</span> جميع التعاملات يجب أن تتم وفقاً للأنظمة والقوانين السعودية السارية.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>التعديلات على الشروط</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو الإشعارات داخل المنصة. استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
            </p>
          </section>

          <section className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#0C4A6E' }}>التواصل معنا</h2>
            <p className="text-gray-700 mb-4">
              لأي استفسارات حول الشروط والأحكام، يمكنك التواصل معنا:
            </p>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">البريد الإلكتروني: <a href="mailto:thumair.sa@hotmail.com" className="text-sky-900 hover:underline">thumair.sa@hotmail.com</a></p>
              <p className="font-semibold">الهاتف: <a href="tel:+966505650213" className="text-sky-900 hover:underline" dir="ltr">+966 50 565 0213</a></p>
              <p className="font-semibold">تويتر: <a href="https://twitter.com/thumair_sa" className="text-sky-900 hover:underline" target="_blank" rel="noopener">@thumair_sa</a></p>
              <p className="font-semibold">إنستغرام: <a href="https://instagram.com/thumair_sa" className="text-sky-900 hover:underline" target="_blank" rel="noopener">@thumair_sa</a></p>
            </div>
          </section>

          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
            بموجب استخدامك لمنصة ثمير، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط والأحكام
          </div>
        </div>
      </div>
    </div>
  );
}
