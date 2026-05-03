import { Plus, TrendingUp, Users, DollarSign, Star } from 'lucide-react';

export function SupplierDashboard() {
  const stats = [
    { label: 'الخدمات المعروضة', value: '8', icon: Star, color: 'bg-blue-500' },
    { label: 'العملاء', value: '45', icon: Users, color: 'bg-green-500' },
    { label: 'الطلبات النشطة', value: '12', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'الإيرادات', value: '85,000 ر.س', icon: DollarSign, color: 'bg-orange-500' },
  ];

  const services = [
    { id: 1, name: 'خدمات الحصاد', description: 'حصاد المحاصيل بآليات حديثة', price: '150 ر.س/ساعة', requests: 8, image: '🚜' },
    { id: 2, name: 'نقل المنتجات', description: 'نقل وتوصيل المحاصيل للأسواق', price: '200 ر.س/رحلة', requests: 15, image: '🚛' },
    { id: 3, name: 'الري الحديث', description: 'تركيب وصيانة أنظمة الري', price: '300 ر.س/يوم', requests: 5, image: '💧' },
    { id: 4, name: 'الأسمدة العضوية', description: 'توريد أسمدة عضوية طبيعية', price: '50 ر.س/كيس', requests: 20, image: '🌱' },
  ];

  const recentRequests = [
    { id: 1, client: 'مزرعة الخير', service: 'خدمات الحصاد', date: '2026-04-28', status: 'جديد' },
    { id: 2, client: 'مزرعة النور', service: 'نقل المنتجات', date: '2026-04-27', status: 'قيد التنفيذ' },
    { id: 3, client: 'مزرعة الوادي', service: 'الأسمدة العضوية', date: '2026-04-26', status: 'مكتمل' },
    { id: 4, client: 'مزرعة البركة', service: 'الري الحديث', date: '2026-04-25', status: 'قيد التنفيذ' },
  ];

  const reviews = [
    { id: 1, client: 'أحمد محمد', rating: 5, comment: 'خدمة ممتازة وسريعة', date: '2026-04-20' },
    { id: 2, client: 'فاطمة علي', rating: 4.5, comment: 'جودة عالية وأسعار مناسبة', date: '2026-04-18' },
    { id: 3, client: 'خالد سعيد', rating: 5, comment: 'محترفون جداً، أنصح بالتعامل معهم', date: '2026-04-15' },
  ];

  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900">
        بيانات تجريبية — لا تعكس بيانات حقيقية من المنصة بعد.
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">إدارة خدماتك ومنتجاتك</p>
        </div>
        <button
          type="button"
          disabled
          title="قريباً — إدارة الخدمات من لوحة واحدة قيد التطوير"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg opacity-50 cursor-not-allowed"
        >
          <Plus className="size-5" />
          <span>إضافة خدمة جديدة</span>
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
              <h2 className="text-xl font-bold text-gray-900">خدماتي</h2>
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
                      <span className="text-sm text-gray-500">{service.requests} طلب</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">التقييمات</h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6 p-4 bg-emerald-50 rounded-lg">
              <div className="text-4xl font-bold text-emerald-600 mb-1">4.8</div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600">من 48 تقييم</p>
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
          <h2 className="text-xl font-bold text-gray-900">الطلبات الأخيرة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخدمة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراء</th>
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
                      عرض التفاصيل
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
