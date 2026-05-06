import { useState } from 'react';
import { Link } from 'react-router';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { Mail, Phone, MapPin, Send, X, Instagram, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useLocale } from '../context/LocaleContext';
import { bi } from '../i18n/bilingual';

export function ContactPage() {
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectToType = (s: string): 'complaint' | 'suggestion' | 'general' => {
    if (s === 'complaint') return 'complaint';
    if (s === 'suggestion') return 'suggestion';
    return 'general';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const subjectLine = formData.name
        ? `${formData.name}${formData.phone ? ' · ' + formData.phone : ''}`
        : null;
      const { data, error: fnErr } = await supabase.functions.invoke('submit_feedback', {
        body: {
          type: subjectToType(formData.subject),
          subject: subjectLine,
          body: formData.message,
          email: formData.email || null,
        },
      });
      if (fnErr) throw fnErr;
      const payload = data as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : bi(locale, 'تعذر إرسال الرسالة', "Couldn't send the message"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/home" className="hover:opacity-80 transition hover:scale-105 duration-300">
              <ThumairLogoWithText />
            </Link>
            <Link to="/home" className="text-gray-600 hover:text-sky-900 transition">
              {bi(locale, 'العودة للرئيسية ←', 'Back to home ←')}
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
              {bi(locale, 'تواصل معنا', 'Contact us')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {bi(locale, 'نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت', "We're here to answer your questions and help anytime")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0C4A6E' }}>
                {bi(locale, 'أرسل لنا رسالة', 'Send us a message')}
              </h2>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="size-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-3">
                    {bi(locale, 'تم الإرسال بنجاح!', 'Sent successfully!')}
                  </h3>
                  <p className="text-gray-600">
                    {bi(locale, 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.', "Thanks for reaching out. We'll reply as soon as possible.")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {bi(locale, 'الاسم الكامل *', 'Full name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      placeholder={bi(locale, 'أدخل اسمك الكامل', 'Enter your full name')}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {bi(locale, 'البريد الإلكتروني *', 'Email *')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {bi(locale, 'رقم الجوال', 'Phone number')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        placeholder="05XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {bi(locale, 'الموضوع *', 'Subject *')}
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    >
                      <option value="">{bi(locale, 'اختر الموضوع', 'Choose a subject')}</option>
                      <option value="general">{bi(locale, 'استفسار عام', 'General inquiry')}</option>
                      <option value="technical">{bi(locale, 'دعم فني', 'Technical support')}</option>
                      <option value="business">{bi(locale, 'شراكة تجارية', 'Business partnership')}</option>
                      <option value="complaint">{bi(locale, 'شكوى', 'Complaint')}</option>
                      <option value="suggestion">{bi(locale, 'اقتراح', 'Suggestion')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {bi(locale, 'الرسالة *', 'Message *')}
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                      placeholder={bi(locale, 'اكتب رسالتك هنا...', 'Write your message here...')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 text-white rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #10B981 100%)' }}
                  >
                    <Send className="size-5" />
                    {submitting ? bi(locale, 'جارٍ الإرسال...', 'Sending...') : bi(locale, 'إرسال الرسالة', 'Send message')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <div className="bg-gradient-to-br from-sky-900 to-sky-800 text-white rounded-2xl p-8 md:p-10 mb-8">
                <h2 className="text-2xl font-bold mb-8">{bi(locale, 'معلومات التواصل', 'Contact information')}</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="size-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{bi(locale, 'البريد الإلكتروني', 'Email')}</h3>
                      <a href="mailto:thumair.sa@hotmail.com" className="text-sky-200 hover:text-emerald-400 transition">
                        thumair.sa@hotmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="size-12 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="size-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{bi(locale, 'الهاتف', 'Phone')}</h3>
                      <a href="tel:+966505650213" className="text-sky-200 hover:text-emerald-400 transition" dir="ltr">
                        +966 50 565 0213
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="size-12 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{bi(locale, 'الموقع', 'Location')}</h3>
                      <p className="text-sky-200">{bi(locale, 'المملكة العربية السعودية', 'Saudi Arabia')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <h3 className="font-semibold mb-4">{bi(locale, 'تابعنا على', 'Follow us')}</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://x.com/thumair_sa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-12 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center hover:bg-emerald-500 transition"
                    >
                      <X className="size-6" />
                    </a>
                    <a
                      href="https://instagram.com/thumair.sa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-12 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center hover:bg-emerald-500 transition"
                    >
                      <Instagram className="size-6" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#0C4A6E' }}>
                  {bi(locale, 'ساعات العمل', 'Working hours')}
                </h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{bi(locale, 'الأحد - الخميس', 'Sunday - Thursday')}</span>
                    <span>{bi(locale, '8:00 ص - 5:00 م', '8:00 AM - 5:00 PM')}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="font-semibold">{bi(locale, 'الجمعة - السبت', 'Friday - Saturday')}</span>
                    <span>{bi(locale, 'مغلق', 'Closed')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
