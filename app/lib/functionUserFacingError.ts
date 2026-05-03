import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

export type FunctionKind = 'publish_listing' | 'create_conversation_for_listing';

const EMAIL_VERIFY_AR =
  'يرجى تأكيد بريدك الإلكتروني من الرابط المرسل إليك قبل القيام بهذا الإجراء.';

const PUBLISH_AR: Record<string, string> = {
  'Missing listingId': 'بيانات غير مكتملة. أعد تحميل الصفحة ثم حاول مرة أخرى.',
  'Listing not found': 'لم يُعثر على هذا الإعلان أو لا تملك صلاحية عرضه.',
  'Listing title required': 'أضف عنواناً واضحاً للمنتج قبل النشر.',
  'At least one image required to publish': 'أضف صورة واحدة على الأقل للمنتج من قسم «صور المنتج»، ثم اضغط «نشر» من جديد.',
  EMAIL_VERIFICATION_REQUIRED: EMAIL_VERIFY_AR,
};

const CONVERSATION_AR: Record<string, string> = {
  'Missing listingId': 'بيانات غير مكتملة. أعد تحميل الصفحة ثم حاول مرة أخرى.',
  'Unauthorized': 'سجّل الدخول أولاً لبدء محادثة مع البائع.',
  'Listing not found': 'لم يُعثر على هذا المنتج.',
  'Seller not available': 'لا يوجد بائع مرتبط بهذا المنتج حالياً. جرّب لاحقاً أو تواصل مع الدعم.',
  EMAIL_VERIFICATION_REQUIRED: EMAIL_VERIFY_AR,
};

function mapBodyMessage(kind: FunctionKind, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'تعذّر إكمال الطلب. أعد المحاولة.';
  if (trimmed === 'EMAIL_VERIFICATION_REQUIRED' || trimmed.includes('EMAIL_VERIFICATION_REQUIRED')) {
    return EMAIL_VERIFY_AR;
  }
  if (trimmed === 'Too many requests' || trimmed.includes('Too many requests')) {
    return 'تم تجاوز الحد المسموح من الطلبات. انتظر قليلاً ثم أعد المحاولة.';
  }
  const table = kind === 'publish_listing' ? PUBLISH_AR : CONVERSATION_AR;
  if (table[trimmed]) return table[trimmed];
  // Edge function catch blocks use String(e) — surface a short hint for known prefixes
  if (trimmed.includes('JWT')) {
    return 'انتهت الجلسة أو غير صالحة. سجّل الخروج ثم الدخول من جديد.';
  }
  return trimmed.length > 220 ? `${trimmed.slice(0, 220)}…` : trimmed;
}

async function readHttpErrorBody(error: FunctionsHttpError): Promise<{ status: number; message: string }> {
  const res = error.context as Response;
  const status = res.status;
  try {
    const clone = res.clone();
    const ct = (clone.headers.get('Content-Type') ?? '').toLowerCase();
    if (ct.includes('application/json')) {
      const json: unknown = await clone.json();
      if (json && typeof json === 'object') {
        const err = (json as { error?: unknown; message?: unknown }).error;
        const msg = (json as { message?: unknown }).message;
        if (typeof err === 'string' && err.trim()) return { status, message: err };
        if (typeof msg === 'string' && msg.trim()) return { status, message: msg };
      }
    }
    const text = (await clone.text()).trim();
    if (text) return { status, message: text };
  } catch {
    /* ignore */
  }
  return { status, message: '' };
}

/**
 * Turns supabase.functions.invoke errors (especially non-2xx) into a single Arabic sentence for the UI.
 */
export async function userFacingFunctionError(error: unknown, kind: FunctionKind): Promise<string> {
  if (error instanceof FunctionsFetchError) {
    return 'تعذّر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.';
  }
  if (error instanceof FunctionsRelayError) {
    return 'الخدمة غير متاحة مؤقتاً. أعد المحاولة بعد قليل.';
  }
  if (error instanceof FunctionsHttpError) {
    const { status, message } = await readHttpErrorBody(error);
    if (status === 404) {
      return 'لم يُعثر على الخدمة المطلوبة. إن استمر ذلك، تحقق من إعداد المشروع أو نشر الدالة.';
    }
    if (status === 401 || status === 403) {
      const m = message.trim();
      if (m === 'EMAIL_VERIFICATION_REQUIRED' || m.includes('EMAIL_VERIFICATION_REQUIRED')) {
        return EMAIL_VERIFY_AR;
      }
      return kind === 'publish_listing'
        ? 'لا تملك صلاحية نشر هذا الإعلان. تأكد أنك مدير أو مالك المزرعة المرتبطة بالإعلان.'
        : 'لا تملك صلاحية بدء هذه المحادثة. جرّب تسجيل الدخول من جديد.';
    }
    if (status === 429) {
      return mapBodyMessage(kind, message || 'Too many requests');
    }
    if (message) return mapBodyMessage(kind, message);
    if (status >= 500) {
      return 'حدث خطأ في الخادم. أعد المحاولة بعد قليل أو تواصل مع الدعم إن استمر.';
    }
    return 'تعذّر إكمال الطلب. أعد المحاولة.';
  }
  if (error instanceof Error) return mapBodyMessage(kind, error.message);
  return 'حدث خطأ غير متوقع.';
}
