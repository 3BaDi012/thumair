import type { Locale } from '../context/LocaleContext';

export type MessageKey =
  | 'nav.products'
  | 'nav.dashboard'
  | 'nav.login'
  | 'nav.register'
  | 'nav.home'
  | 'common.loading'
  | 'common.save'
  | 'common.cancel'
  | 'common.back'
  | 'common.signOut'
  | 'common.unauthorizedTitle'
  | 'common.verifyingPermissions'
  | 'common.refreshingPermissions'
  | 'common.loadingAdmin'
  | 'common.loadingProducts'
  | 'common.loadingNotifications'
  | 'common.noNotifications'
  | 'common.comingSoon'
  | 'auth.email'
  | 'auth.password'
  | 'auth.accountDoesNotExist'
  | 'auth.rememberMe'
  | 'auth.forgotPassword'
  | 'auth.loggingIn'
  | 'auth.creatingAccount'
  | 'auth.passwordsDoNotMatch'
  | 'auth.loginError'
  | 'auth.signupError'
  | 'auth.login'
  | 'auth.signup'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.darkMode'
  | 'settings.darkModeOn'
  | 'settings.lightModeOn'
  | 'profile.editTitle';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  ar: {
    'nav.products': 'المنتجات',
    'nav.dashboard': 'لوحة التحكم',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.home': 'الرئيسية',
    'common.loading': 'جارٍ التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.back': 'العودة',
    'common.signOut': 'تسجيل الخروج',
    'common.unauthorizedTitle': 'غير مصرح',
    'common.verifyingPermissions': 'جارٍ التحقق من الصلاحيات...',
    'common.refreshingPermissions': 'جارٍ تحديث صلاحياتك...',
    'common.loadingAdmin': 'جارٍ تحميل لوحة الإدارة...',
    'common.loadingProducts': 'جارٍ تحميل المنتجات...',
    'common.loadingNotifications': 'جارٍ تحميل الإشعارات...',
    'common.noNotifications': 'لا توجد إشعارات',
    'common.comingSoon': 'قريباً',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.accountDoesNotExist': 'هذا الحساب غير موجود',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.loggingIn': 'جارٍ تسجيل الدخول...',
    'auth.creatingAccount': 'جارٍ إنشاء الحساب...',
    'auth.passwordsDoNotMatch': 'كلمتا المرور غير متطابقتين',
    'auth.loginError': 'حدث خطأ أثناء تسجيل الدخول',
    'auth.signupError': 'حدث خطأ أثناء إنشاء الحساب',
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء الحساب',
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'إدارة إعدادات حسابك والتفضيلات',
    'settings.darkMode': 'الوضع الداكن',
    'settings.darkModeOn': 'الوضع الداكن مفعّل حالياً',
    'settings.lightModeOn': 'الوضع الفاتح مفعّل حالياً',
    'profile.editTitle': 'تعديل الملف الشخصي',
  },
  en: {
    'nav.products': 'Products',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log in',
    'nav.register': 'Sign up',
    'nav.home': 'Home',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.signOut': 'Sign out',
    'common.unauthorizedTitle': 'Unauthorized',
    'common.verifyingPermissions': 'Verifying permissions...',
    'common.refreshingPermissions': 'Refreshing permissions...',
    'common.loadingAdmin': 'Loading admin dashboard...',
    'common.loadingProducts': 'Loading products...',
    'common.loadingNotifications': 'Loading notifications...',
    'common.noNotifications': 'No notifications',
    'common.comingSoon': 'Coming soon',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.accountDoesNotExist': "This account doesn't exist",
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.loggingIn': 'Logging in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.passwordsDoNotMatch': 'Passwords do not match',
    'auth.loginError': 'An error occurred while logging in',
    'auth.signupError': 'An error occurred while creating the account',
    'auth.login': 'Log in',
    'auth.signup': 'Create account',
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and preferences',
    'settings.darkMode': 'Dark mode',
    'settings.darkModeOn': 'Dark mode is on',
    'settings.lightModeOn': 'Light mode is on',
    'profile.editTitle': 'Edit profile',
  },
};

export function t(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key] ?? MESSAGES.ar[key] ?? key;
}

