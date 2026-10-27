/**
 * Cloudflare Turnstile support for Lucky Draw's original sign-in/sign-up form.
 * Disabled unless explicitly enabled in NEXT_PUBLIC_TURNSTILE_ENABLED.
 * Supabase validates the token when Bot and Abuse Protection is configured there.
 * Never put the Turnstile SECRET in a NEXT_PUBLIC_ environment variable.
 */
export interface TurnstileConfig { enabled: boolean; siteKey: string; }

export function parseTurnstileConfig(input: { enabled?: string; siteKey?: string }): TurnstileConfig {
  return { enabled: input.enabled === 'true', siteKey: (input.siteKey || '').trim() };
}

const config = parseTurnstileConfig({
  enabled: process.env.NEXT_PUBLIC_TURNSTILE_ENABLED,
  siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
});

type WidgetOptions = {
  sitekey: string;
  theme: 'auto';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
};
interface TurnstileAPI {
  render: (container: HTMLElement, options: WidgetOptions) => string;
  reset: (widgetId?: string) => void;
}
declare global {
  interface Window { turnstile?: TurnstileAPI; }
}

let token = '';
let widgetId: string | undefined;
let loadPromise: Promise<void> | undefined;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (window.turnstile) resolve();
      else reject(new Error('ไม่สามารถเริ่ม Cloudflare Turnstile ได้'));
    };
    script.onerror = () => reject(new Error('โหลด Cloudflare Turnstile ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต'));
    document.head.append(script);
  });
  return loadPromise;
}

/** No DOM changes whatsoever while disabled. */
export async function mountTurnstile(authForm: HTMLFormElement): Promise<void> {
  if (!config.enabled) return;
  if (!config.siteKey) throw new Error('เปิด Turnstile แล้ว แต่ยังไม่ได้ตั้งค่า NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  if (document.getElementById('authTurnstile')) return;

  const anchor = authForm.querySelector('#authSubmit');
  if (!anchor) throw new Error('ไม่พบปุ่มเข้าสู่ระบบ');
  const target = document.createElement('div');
  target.id = 'authTurnstile';
  target.style.margin = '12px 0';
  authForm.insertBefore(target, anchor);

  await loadTurnstileScript();
  widgetId = window.turnstile!.render(target, {
    sitekey: config.siteKey,
    theme: 'auto',
    callback: value => { token = value; },
    'expired-callback': () => { token = ''; },
    'error-callback': () => { token = ''; }
  });
}

export function authCaptchaOptions(): { captchaToken: string } | undefined {
  if (!config.enabled) return undefined;
  if (!config.siteKey) throw new Error('ไม่ได้กำหนด Turnstile Site Key');
  if (!token) throw new Error('กรุณายืนยันการตรวจสอบ Turnstile ก่อนเข้าสู่ระบบ');
  return { captchaToken: token };
}

export function resetAuthCaptcha(): void {
  if (!config.enabled) return;
  token = '';
  if (widgetId) window.turnstile?.reset(widgetId);
}
