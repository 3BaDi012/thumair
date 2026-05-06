import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/index.css';

const rootEl = document.getElementById('root')!;

function showMissingEnvUi(): void {
  rootEl.innerHTML = `
<div dir="rtl" style="font-family: system-ui, -apple-system, Segoe UI, sans-serif; padding: 2rem; max-width: 36rem; margin: 2rem auto; line-height: 1.65; color: #111827;">
  <h1 style="font-size: 1.35rem; margin-bottom: 1rem;">متغيرات البيئة مفقودة</h1>
  <p style="color: #374151; margin-bottom: 0.75rem;">
    لم يُعثر على <code style="background:#f3f4f6;padding:0.12em 0.4em;border-radius:6px;font-size:0.9em;">VITE_SUPABASE_URL</code>
    أو <code style="background:#f3f4f6;padding:0.12em 0.4em;border-radius:6px;font-size:0.9em;">VITE_SUPABASE_ANON_KEY</code>.
    بدونها يتوقف التطبيق فور التحميل (صفحة بيضاء).
  </p>
  <p style="color: #374151; margin-bottom: 0.5rem; font-weight: 600;">على Vercel:</p>
  <ol style="color: #374151; padding-right: 1.25rem; margin: 0 0 1rem 0;">
    <li>Project → Settings → Environment Variables</li>
    <li>أضف المفتاحين أعلاه (انسخهما من Supabase → Project Settings → API)</li>
    <li>فعّلهما لـ Production و Preview إن لزم</li>
    <li>Deployments → … → Redeploy</li>
  </ol>
  <p style="color: #6b7280; font-size: 0.9rem;">محلياً: انسخ <code style="background:#f3f4f6;padding:0.1em 0.35em;border-radius:4px;">.env.example</code> إلى <code style="background:#f3f4f6;padding:0.1em 0.35em;border-radius:4px;">.env</code> وعبّئ القيم.</p>
</div>`;
}

void (async () => {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url || !key) {
    showMissingEnvUi();
    return;
  }

  const [{ default: App }, SentryMod] = await Promise.all([import('./App'), import('@sentry/react')]);
  const sentryDsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim();
  if (sentryDsn) {
    SentryMod.init({ dsn: sentryDsn, tracesSampleRate: 0.1 });
  }

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
