import { Plus, TrendingUp, Users, DollarSign, Star } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

export function SupplierDashboard() {
  const { locale } = useLocale();
  const stats = [
    { label: bi(locale, 'الخدمات المعروضة', 'Services'), value: '8', icon: Star, color: 'bg-blue-500' },
    { label: bi(locale, 'العملاء', 'Clients'), value: '45', icon: Users, color: 'bg-green-500' },
    { label: bi(locale, 'الطلبات النشطة', 'Active requests'), value: '12', icon: TrendingUp, color: 'bg-purple-500' },
    { label: bi(locale, 'الإيرادات', 'Revenue'), value: bi(locale, '85,000 ر.س', 'SAR 85,000'), icon: DollarSign, color: 'bg-orange-500' },
  ];

  const services = [
    { id: 1, name: bi(locale, 'خدمات الحصاد', 'Harvesting services'), description: bi(locale, 'حصاد المحاصيل بآليات حديثة', 'Modern machinery crop harvesting'), price: bi(locale, '150 ر.س/ساعة', 'SAR 150/hour'), requests: 8, image: '🚜' },
    { id: 2, name: bi(locale, 'نقل المنتجات', 'Product transport'), description: bi(locale, 'نقل وتوصيل المحاصيل للأسواق', 'Transport and deliver crops to markets'), price: bi(locale, '200 ر.س/رحلة', 'SAR 200/trip'), requests: 15, image: '🚛' },
    { id: 3, name: bi(locale, 'الري الحديث', 'Irrigation systems'), description: bi(locale, 'تركيب وصيانة أنظمة الري', 'Install & maintain irrigation systems'), price: bi(locale, '300 ر.س/يوم', 'SAR 300/day'), requests: 5, image: '💧' },
    { id: 4, name: bi(locale, 'الأسمدة العضوية', 'Organic fertilizers'), description: bi(locale, 'توريد أسمدة عضوية طبيعية', 'Supply natural organic fertilizers'), price: bi(locale, '50 ر.س/كيس', 'SAR 50/bag'), requests: 20, image: '🌱' },
  ];

  const recentRequests = [
    { id: 1, client: bi(locale, 'مزرعة الخير', 'Al Khair Farm'), service: bi(locale, 'خدمات الحصاد', 'Harvesting services'), date: '2026-04-28', status: bi(locale, 'جديد', 'New') },
    { id: 2, client: bi(locale, 'مزرعة النور', 'Al Noor Farm'), service: bi(locale, 'نقل المنتجات', 'Product transport'), date: '2026-04-27', status: bi(locale, 'قيد التنفيذ', 'In progress') },
    { id: 3, client: bi(locale, 'مزرعة الوادي', 'Al Wadi Farm'), service: bi(locale, 'الأسمدة العضوية', 'Organic fertilizers'), date: '2026-04-26', status: bi(locale, 'مكتمل', 'Completed') },
    { id: 4, client: bi(locale, 'مزرعة البركة', 'Al Barakah Farm'), service: bi(locale, 'الري الحديث', 'Irrigation systems'), date: '2026-04-25', status: bi(locale, 'قيد التنفيذ', 'In progress') },
  ];

  const reviews = [
    { id: 1, client: bi(locale, 'أحمد محمد', 'Ahmed Mohammed'), rating: 5, comment: bi(locale, 'خدمة ممتازة وسريعة', 'Excellent and fast service'), date: '2026-04-20' },
    { id: 2, client: bi(locale, 'فاطمة علي', 'Fatimah Ali'), rating: 4.5, comment: bi(locale, 'جودة عالية وأسعار مناسبة', 'Great quality and fair prices'), date: '2026-04-18' },
    { id: 3, client: bi(locale, 'خالد سعيد', 'Khalid Saeed'), rating: 5, comment: bi(locale, 'محترفون جداً، أنصح بالتعامل معهم', 'Very professional — highly recommended'), date: '2026-04-15' },
  ];

  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900">
        {bi(locale, 'بيانات تجريبية — لا تعكس بيانات حقيقية من المنصة بعد.', 'Sample data — not reflecting real platform data yet.')}
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bi(locale, 'لوحة التحكم', 'Dashboard')}</h1>
          <p className="text-gray-600 mt-1">{bi(locale, 'إدارة خدماتك ومنتجاتك', 'Manage your services and products')}</p>
        </div>
        <button
          type="button"
          disabled
          title={bi(locale, 'قريباً — إدارة الخدمات من لوحة واحدة قيد التطوير', 'Coming soon — manage services from one dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg opacity-50 cursor-not-allowed"
        >
          <Plus className="size-5" />
          <span>{bi(locale, 'إضافة خدمة جديدة', 'Add new service')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon className="size-6" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{bi(locale, 'خدماتي', 'My services')}</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{service.image}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-semibold">{service.price}</span>
                      <span className="text-sm text-gray-500">{service.requests} {bi(locale, 'طلب', 'requests')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{bi(locale, 'التقييمات', 'Reviews')}</h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6 p-4 bg-emerald-50 rounded-lg">
              <div className="text-4xl font-bold text-emerald-600 mb-1">4.8</div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600">{bi(locale, 'من 48 تقييم', 'From 48 reviews')}</p>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{review.client}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{bi(locale, 'الطلبات الأخيرة', 'Recent requests')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{bi(locale, 'العميل', 'Client')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{bi(locale, 'الخدمة', 'Service')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{bi(locale, 'التاريخ', 'Date')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{bi(locale, 'الحالة', 'Status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{bi(locale, 'الإجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      request.status === 'مكتمل' ? 'bg-green-100 text-green-700' :
                      request.status === 'قيد التنفيذ' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                      {bi(locale, 'عرض التفاصيل', 'View details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
