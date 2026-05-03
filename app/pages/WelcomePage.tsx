import { Link, useNavigate } from 'react-router';
import { ThumairLogo } from '../components/ThumairLogo';
import { LogIn, Eye, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/home', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-emerald-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 size-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 size-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 size-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo with Animation */}
          <div className="mb-8 animate-fade-in-down">
            <div className="inline-block p-8 bg-white rounded-full shadow-2xl mb-6 animate-float">
              <ThumairLogo className="size-32 md:size-40" />
            </div>
          </div>

          {/* Title with Animation */}
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              مرحباً بك في ثمير
            </h1>
            <p className="text-2xl md:text-3xl text-emerald-300 font-semibold mb-4">
              ربط .. تمكين .. استدامة
            </p>
            <p className="text-xl text-sky-100 max-w-2xl mx-auto leading-relaxed">
              المنصة الرقمية السعودية الرائدة للتسويق الزراعي
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-up delay-200">
            <Link
              to="/login"
              className="group w-full sm:w-auto px-10 py-5 bg-white text-sky-900 rounded-2xl hover:bg-emerald-50 transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 flex items-center justify-center gap-3"
            >
              <LogIn className="size-6 group-hover:rotate-12 transition-transform" />
              تسجيل الدخول
            </Link>

            <Link
              to="/home"
              className="group w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 flex items-center justify-center gap-3"
            >
              <Eye className="size-6 group-hover:scale-110 transition-transform" />
              التصفح كضيف
            </Link>
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up delay-300">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-400" />
                <span className="font-semibold">500+ مزارع نشط</span>
              </span>
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-400" />
                <span className="font-semibold">1000+ منتج متنوع</span>
              </span>
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-400" />
                <span className="font-semibold">98% رضا العملاء</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>

      {/* Styles for Animations */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
