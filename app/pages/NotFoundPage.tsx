import { Link } from 'react-router';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-9xl mb-6">🌾</div>
        <h1 className="text-6xl font-bold text-emerald-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-8">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Home className="size-5" />
            الصفحة الرئيسية
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
          >
            <Search className="size-5" />
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  );
}
