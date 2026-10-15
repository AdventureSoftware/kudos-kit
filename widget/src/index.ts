
import { FeedbackConfig, FeedbackPayload, FeedbackTheme } from './types';
import { ConsoleCapture } from './console-capture';
import { mergeTheme } from './theme';
import { FeedbackUI } from './ui';


const SCRIPT_ORIGIN: string | null = (() => {
  const src = (document.currentScript as HTMLScriptElement | null)?.src;
  try { return src ? new URL(src).origin : null; } catch { return null; }
})();

function resolveIngestUrl(cfg: FeedbackConfig): string | null {
  const base = cfg.apiUrl ?? SCRIPT_ORIGIN;
  if (!base) return null;
  return base.replace(/\/+$/, '') + '/v1/feedback';
}

let ingestUrl: string | null = null;

let ui: FeedbackUI | null = null;
let capture: ConsoleCapture | null = null;
let config: FeedbackConfig | null = null;
let listeners: Record<string, Array<(v: unknown) => void>> = {};
let turnstileWidgetId: string | null = null;

function on(event: string, cb: (v: unknown) => void): void {
  (listeners[event] ??= []).push(cb);
}

function emit(event: string, value: unknown): void {
  listeners[event]?.forEach(cb => cb(value));
}

function isVisible(): boolean { return ui?.isVisible() ?? false; }

function show(): void {
  if (!ui) return;
  ui.showButton();
  ui.showPanel();
  emit('visibilitychange', true);
}

function hide(): void {
  if (!ui) return;
  ui.hideButton();
  ui.hidePanel();
  emit('visibilitychange', false);
}

function toggle(): void { isVisible() ? hide() : show(); }

function removeTurnstile(): void {
  if (turnstileWidgetId !== null) {
    try { (window as any).turnstile?.remove(turnstileWidgetId); } catch { /* already gone */ }
    turnstileWidgetId = null;
  }
}

function destroy(): void {
  removeTurnstile();
  ui?.destroy(); ui = null;
  capture?.restore(); capture = null;
  config = null; listeners = {}; ingestUrl = null;
}

/** Change theme at runtime, e.g. when the host app toggles dark mode. */
function setTheme(theme: FeedbackTheme): void {
  if (!ui || !config) return;
  config = { ...config, theme: mergeTheme(config.theme, theme) };
  ui.setTheme(theme);
}

async function submitFeedback(): Promise<void> {
  if (!ui || !config || !ingestUrl) return;
  const type = ui.getSelectedType();
  if (!type) return; // still on the first step
  const message = ui.getMessage();
  if (!message) { ui.showMessage('Please enter a message.', true); return; }

  ui.setSubmitState(true);
  ui.showMessage('');

  let turnstileToken = '';
  try {
    turnstileToken = await new Promise<string>((resolve, reject) => {
      const container = ui!.getTurnstileContainer();
      if (!container) return reject(new Error('No Turnstile container'));
      if (!(window as any).turnstile) return reject(new Error('Turnstile not loaded'));
      removeTurnstile(); // a token can be used only once
      turnstileWidgetId = (window as any).turnstile.render(container, {
        sitekey: config!.turnstileSiteKey,
        theme: ui!.getThemeMode(),
        callback: resolve,
        'error-callback': reject,
      });
    });
  } catch (err) {
    const msg = (err as Error).message === 'Turnstile not loaded'
      ? 'Please wait a moment and try again.'
      : 'CAPTCHA failed. Please try again.';
    ui.showMessage(msg, true);
    ui.setSubmitState(false);
    return;
  }

  const testimonial = ui.getTestimonial();
  const rating = ui.getRating();
  const payload: FeedbackPayload = {
    project: config.project,
    type,
    message,
    email: ui.getEmail() || undefined,
    user: config.user,
    context: {
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      language: navigator.language,
      build: (window as any).__APP_VERSION__,
      ts: new Date().toISOString(),
    },
    ...(rating ? { rating } : {}),
    ...(testimonial.ok ? { testimonialOk: true, testimonialName: testimonial.name || undefined } : {}),
    hp: ui.getHoneypot(),
    turnstileToken,
  };

  if (capture && config.console?.sendOn.includes(type)) {
    payload.console = capture.getLogs();
    payload.errors = capture.getErrors();
  }

  try {
    const res = await fetch(ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    removeTurnstile();
    capture?.clear();
    ui.setSubmitState(false);
    ui.showDone();
    emit('submit', { type });
  } catch {
    ui.showMessage('Failed to send. Please try again.', true);
    ui.setSubmitState(false);
  }
}

export function init(cfg: FeedbackConfig): void {
  if (ui) return;
  ingestUrl = resolveIngestUrl(cfg);
  if (!ingestUrl) {
    console.warn('[kkw] Could not determine the API URL. Pass apiUrl to Feedback.init().');
    return;
  }
  config = cfg;

  if (cfg.console?.enabled) {
    capture = new ConsoleCapture({
      max: cfg.console.max,
      maxBytes: cfg.console.maxBytes,
      redact: cfg.console.redact,
    });
    capture.install();
  }

  ui = new FeedbackUI(cfg);
  ui.mount();

  ui.getSubmitButton()?.addEventListener('click', submitFeedback);

  if (cfg.startHidden) hide();

  // Load Turnstile script if not already present
  if (!(window as any).turnstile && !document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);
  }
}

export { show, hide, toggle, isVisible, on, destroy, setTheme };
