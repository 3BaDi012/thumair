import type { Locale } from '../context/LocaleContext';

export type MessageKey =
  | 'nav.products'
  | 'nav.dashboard'
  | 'nav.login'
  | 'nav.register'
  | 'common.loading'
  | 'common.save'
  | 'common.cancel'
  | 'auth.email'
  | 'auth.password'
  | 'auth.accountDoesNotExist'
  | 'auth.login'
  | 'auth.signup'
  | 'settings.title'
  | 'profile.editTitle';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  ar: {
    'nav.products': 'المنتجات',
    'nav.dashboard': 'لوحة التحكم',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'common.loading': 'جارٍ التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.accountDoesNotExist': 'هذا الحساب غير موجود',
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء الحساب',
    'settings.title': 'الإعدادات',
    'profile.editTitle': 'تعديل الملف الشخصي',
  },
  en: {
    'nav.products': 'Products',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log in',
    'nav.register': 'Sign up',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.accountDoesNotExist': "This account doesn't exist",
    'auth.login': 'Log in',
    'auth.signup': 'Create account',
    'settings.title': 'Settings',
    'profile.editTitle': 'Edit profile',
  },
};

export function t(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key] ?? MESSAGES.ar[key] ?? key;
}

