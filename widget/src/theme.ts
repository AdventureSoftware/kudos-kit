
import { FeedbackConfig, FeedbackTheme, ThemeColors, ThemeMode } from './types';


export const sanitizeCss = (v: string): string => v.replace(/[{};'"\\<>]/g, '');

export function resolveMode(theme?: FeedbackTheme): ThemeMode {
  const m = theme?.mode;
  return m === 'dark' || m === 'auto' ? m : 'light';
}

export function mergeTheme(base: FeedbackTheme = {}, patch: FeedbackTheme = {}): FeedbackTheme {
  return {
    ...base,
    ...patch,
    light: { ...base.light, ...patch.light },
    dark: { ...base.dark, ...patch.dark },
  };
}

const LIGHT = `
  --kkw-accent: #18181b;
  --kkw-accent-text: #ffffff;
  --kkw-bg: #ffffff;
  --kkw-field-bg: #ffffff;
  --kkw-text: #18181b;
  --kkw-muted: #71717a;
  --kkw-border: #e4e4e7;
  --kkw-success: #15803d;
  --kkw-error: #dc2626;
  --kkw-star: #f59e0b;
  --kkw-shadow: 0 8px 30px rgba(0,0,0,0.12);
  color-scheme: light;`;

const DARK = `
  --kkw-accent: #f4f4f5;
  --kkw-accent-text: #18181b;
  --kkw-bg: #18181b;
  --kkw-field-bg: #27272a;
  --kkw-text: #f4f4f5;
  --kkw-muted: #a1a1aa;
  --kkw-border: #3f3f46;
  --kkw-success: #4ade80;
  --kkw-error: #f87171;
  --kkw-star: #fbbf24;
  --kkw-shadow: 0 8px 30px rgba(0,0,0,0.5);
  color-scheme: dark;`;

const COLOR_VARS: Record<keyof ThemeColors, string> = {
  background: '--kkw-bg',
  fieldBackground: '--kkw-field-bg',
  text: '--kkw-text',
  mutedText: '--kkw-muted',
  border: '--kkw-border',
  accent: '--kkw-accent',
  accentText: '--kkw-accent-text',
};

/** Turn a ThemeColors object into CSS variable declarations. */
function colorVars(colors?: ThemeColors): string {
  if (!colors) return '';
  return (Object.keys(COLOR_VARS) as Array<keyof ThemeColors>)
    .filter((k) => typeof colors[k] === 'string' && colors[k])
    .map((k) => `${COLOR_VARS[k]}: ${sanitizeCss(colors[k] as string)};`)
    .join(' ');
}

/**
 * Builds the widget stylesheet.
 * All defaults live inside :where(), which has zero specificity, so a host page can
 * override any --kkw-* variable with a plain `.kkw-root { ... }` rule.
 */
export function buildCss(config: FeedbackConfig): string {
  const t = config.theme ?? {};
  // Accent colors only override the palette defaults when the app provides them.
  // A custom accent without explicit text color gets white text.
  const accentText = t.accentText ?? t.text ?? (t.accent ? '#ffffff' : undefined);
  const accentRule = [
    t.accent ? `--kkw-accent: ${sanitizeCss(t.accent)};` : '',
    accentText ? `--kkw-accent-text: ${sanitizeCss(accentText)};` : '',
  ].join(' ');
  const radius = Number.isFinite(t.radius) ? Math.max(0, Math.min(Number(t.radius), 32)) : 8;
  const font = sanitizeCss(t.fontFamily ?? 'system-ui, -apple-system, sans-serif');

  const pos = config.position ?? 'bottom-right';
  const off = config.offset ?? {};
  const vertical = pos.includes('bottom') ? 'bottom' : 'top';
  const horizontal = pos.includes('right') ? 'right' : 'left';
  const vOff = (vertical === 'bottom' ? off.bottom : off.top) ?? 24;
  const hOff = (horizontal === 'right' ? off.right : off.left) ?? 24;

  // Speech-bubble shapes: the button and the panel are rounder than the inputs, and the
  // corner pointing at the screen corner where the widget sits stays sharp, like a bubble's tail.
  // radius 0 keeps everything square.
  const btnRadius = Math.min(24, Math.round(radius * 2.5));
  const panelRadius = Math.min(24, radius * 2);
  const tail = (r: number) => Math.min(4, r);
  const tailCorner = `border-${vertical}-${horizontal}-radius`;

  // Order inside each block: built-in palette → global accent → per-mode overrides.
  const light = `${LIGHT} ${accentRule} ${colorVars(t.light)}`;
  const dark = `${DARK} ${accentRule} ${colorVars(t.dark)}`;

  return `
    :where(.kkw-root) {
      --kkw-radius: ${radius}px;
      --kkw-radius-sm: ${Math.round(radius / 2)}px;
      --kkw-font: ${font};
      /* Soft tints of the accent (header band, icon circles, chosen type). Older browsers
         without color-mix() fall back to the plain field background. */
      --kkw-tint: var(--kkw-field-bg);
      --kkw-tint-strong: var(--kkw-border);
      --kkw-ring: var(--kkw-accent);
      ${light}
    }
    @supports (background: color-mix(in srgb, red 50%, blue)) {
      :where(.kkw-root) {
        --kkw-tint: color-mix(in srgb, var(--kkw-accent) 8%, var(--kkw-bg));
        --kkw-tint-strong: color-mix(in srgb, var(--kkw-accent) 16%, var(--kkw-bg));
        --kkw-ring: color-mix(in srgb, var(--kkw-accent) 45%, transparent);
      }
    }
    :where(.kkw-root[data-kkw-mode="dark"]) { ${dark} }
    @media (prefers-color-scheme: dark) {
      :where(.kkw-root[data-kkw-mode="auto"]) { ${dark} }
    }

    .kkw-root, .kkw-root * { box-sizing: border-box; }
    .kkw-root .kkw-hidden { display: none !important; }

    .kkw-btn {
      position: fixed; z-index: 2147483000;
      ${vertical}: ${vOff}px; ${horizontal}: ${hOff}px;
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; cursor: pointer; margin: 0;
      font: 600 13px/1.2 var(--kkw-font);
      padding: 10px 16px 10px 13px;
      border-radius: ${btnRadius}px; ${tailCorner}: ${tail(btnRadius)}px;
      box-shadow: var(--kkw-shadow);
    }
    .kkw-btn-icon { width: 16px; height: 16px; flex-shrink: 0; }
    .kkw-panel {
      position: fixed; z-index: 2147483001;
      ${vertical}: ${vOff + 52}px; ${horizontal}: ${hOff}px;
      width: 340px; max-width: calc(100vw - 32px);
      max-height: calc(100vh - ${vOff + 68}px); overflow-y: auto;
      background: var(--kkw-bg); color: var(--kkw-text);
      border: 1px solid var(--kkw-border);
      border-radius: ${panelRadius}px; ${tailCorner}: ${tail(panelRadius)}px;
      box-shadow: var(--kkw-shadow);
      padding: 20px; font: 13px/1.4 var(--kkw-font); text-align: left;
    }
    .kkw-title { display: block; font-size: 15px; font-weight: 600; color: var(--kkw-text); }
    .kkw-sub { margin: 4px 0 14px; color: var(--kkw-muted); font-size: 13px; }

    /* Tinted header band at the top of the first two steps (edge to edge). */
    .kkw-band { margin: -20px -20px 16px; padding: 18px 20px 14px; background: var(--kkw-tint); }
    .kkw-band .kkw-sub { margin-bottom: 0; }

    /* Step 1: the four choices */
    .kkw-types { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .kkw-type {
      display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
      margin: 0; padding: 12px; cursor: pointer; text-align: left;
      font: 13px/1.3 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius);
      transition: border-color 120ms ease, background-color 120ms ease, transform 120ms ease;
    }
    .kkw-type:hover { border-color: var(--kkw-accent); background: var(--kkw-tint); }
    .kkw-type:active { transform: scale(0.98); }
    .kkw-type strong { font-weight: 600; }
    .kkw-type-icon {
      width: 32px; height: 32px; padding: 7px; margin-bottom: 6px;
      color: var(--kkw-accent); background: var(--kkw-tint-strong); border-radius: 999px;
      transition: background-color 120ms ease, color 120ms ease;
    }
    .kkw-hint { font-size: 11px; color: var(--kkw-muted); }
    /* The type chosen last time (seen after going back). */
    .kkw-type[aria-pressed="true"] { border-color: var(--kkw-accent); background: var(--kkw-tint); box-shadow: inset 0 0 0 1px var(--kkw-accent); }
    .kkw-type[aria-pressed="true"] .kkw-type-icon { background: var(--kkw-accent); color: var(--kkw-accent-text); }

    /* Step 2: the form */
    .kkw-head { display: flex; align-items: center; gap: 4px; }
    .kkw-head.kkw-band { padding: 12px 20px 12px 12px; }
    .kkw-back {
      margin: 0; padding: 2px 8px 4px; cursor: pointer;
      font: 500 20px/1 var(--kkw-font); color: var(--kkw-muted);
      background: none; border: none; border-radius: var(--kkw-radius-sm);
    }
    .kkw-back:hover { color: var(--kkw-text); background: var(--kkw-tint-strong); }
    .kkw-rating { border: 0; margin: 0 0 12px; padding: 0; min-width: 0; }
    .kkw-rating legend { padding: 0; }
    .kkw-stars { display: inline-flex; flex-direction: row-reverse; gap: 2px; }
    .kkw-star-input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; pointer-events: none; }
    .kkw-star { display: inline-flex; padding: 2px; cursor: pointer; color: var(--kkw-border); border-radius: var(--kkw-radius-sm); }
    .kkw-star-icon { width: 26px; height: 26px; fill: transparent; transition: fill 100ms ease, color 100ms ease, transform 100ms ease; }
    /* Chosen rating: that star and the ones to its left (DOM order is 5→1, shown reversed). */
    .kkw-star-input:checked ~ .kkw-star { color: var(--kkw-star); }
    .kkw-star-input:checked ~ .kkw-star .kkw-star-icon { fill: var(--kkw-star); }
    /* While hovering, preview the hovered star instead of the chosen one. */
    .kkw-stars:hover .kkw-star { color: var(--kkw-border); }
    .kkw-stars:hover .kkw-star .kkw-star-icon { fill: transparent; }
    .kkw-stars:hover .kkw-star:hover, .kkw-stars:hover .kkw-star:hover ~ .kkw-star { color: var(--kkw-star); }
    .kkw-stars:hover .kkw-star:hover .kkw-star-icon, .kkw-stars:hover .kkw-star:hover ~ .kkw-star .kkw-star-icon { fill: var(--kkw-star); }
    .kkw-star:hover .kkw-star-icon { transform: scale(1.12); }
    .kkw-star-input:focus-visible + .kkw-star { outline: 2px solid var(--kkw-accent); outline-offset: 1px; }
    .kkw-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .kkw-label { display: block; margin: 0 0 4px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-textarea, .kkw-input {
      display: block; width: 100%; margin: 0 0 12px; padding: 8px 10px;
      font: 13px/1.4 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius-sm);
    }
    .kkw-textarea { min-height: 96px; resize: vertical; }
    .kkw-textarea::placeholder, .kkw-input::placeholder { color: var(--kkw-muted); opacity: 1; }
    .kkw-textarea:focus, .kkw-input:focus { outline: none; border-color: var(--kkw-accent); }
    .kkw-consent {
      display: flex; gap: 8px; align-items: flex-start; margin: 0 -8px 12px; padding: 8px;
      cursor: pointer; font-size: 12px; color: var(--kkw-text);
      border-radius: var(--kkw-radius-sm); transition: background-color 200ms ease;
    }
    .kkw-consent-lead { display: none; margin-bottom: 2px; font-size: 13px; font-weight: 600; color: var(--kkw-accent); }
    /* Happy user (Praise, 4–5 stars, not ticked yet): tint + friendly line, and a short pulse. */
    .kkw-consent.kkw-consent-hi { background: var(--kkw-tint); }
    .kkw-consent.kkw-consent-hi .kkw-consent-lead { display: block; }
    .kkw-consent.kkw-pulse { animation: kkw-pulse 1.1s ease-out 2; }
    @keyframes kkw-pulse {
      0% { box-shadow: 0 0 0 0 var(--kkw-ring); }
      70% { box-shadow: 0 0 0 8px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }
    .kkw-consent input { flex-shrink: 0; width: 15px; height: 15px; margin: 1px 0 0; accent-color: var(--kkw-accent); cursor: pointer; }
    .kkw-consent small { display: block; margin-top: 2px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-note { margin: -8px 0 12px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-submit {
      display: block; width: 100%; margin: 8px 0 0; padding: 9px; cursor: pointer;
      font: 600 13px/1.2 var(--kkw-font);
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; border-radius: var(--kkw-radius-sm);
    }
    .kkw-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .kkw-msg { font-size: 12px; margin-top: 8px; min-height: 0; }
    .kkw-msg.kkw-ok { color: var(--kkw-success); }
    .kkw-msg.kkw-err { color: var(--kkw-error); }
    .kkw-privacy { font-size: 11px; color: var(--kkw-muted); margin: 10px 0 0; }
    .kkw-privacy a { color: var(--kkw-accent); }

    /* Step 3: thank you */
    .kkw-done { text-align: center; padding: 8px 0 2px; }
    .kkw-done .kkw-sub { margin-bottom: 4px; }
    .kkw-done-icon { display: block; width: 40px; height: 40px; margin: 0 auto 10px; color: var(--kkw-success); }
    .kkw-link-btn {
      margin: 6px 0 0; padding: 6px 8px; cursor: pointer;
      font: 600 13px/1.2 var(--kkw-font); color: var(--kkw-accent);
      background: none; border: none; border-radius: var(--kkw-radius-sm);
    }

    /* "Powered by Kudos Kit" (branding: false hides it) */
    .kkw-brand {
      display: flex; align-items: center; justify-content: center; gap: 5px;
      margin: 14px 0 -6px; padding: 4px; border-radius: var(--kkw-radius-sm);
      font: 11px/1.2 var(--kkw-font); color: var(--kkw-muted); text-decoration: none;
    }
    .kkw-brand:hover { color: var(--kkw-text); }
    .kkw-brand-mark { width: 12px; height: 12px; opacity: 0.7; }

    .kkw-btn:focus-visible, .kkw-type:focus-visible, .kkw-back:focus-visible,
    .kkw-submit:focus-visible, .kkw-link-btn:focus-visible, .kkw-consent input:focus-visible,
    .kkw-brand:focus-visible {
      outline: 2px solid var(--kkw-accent); outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .kkw-type, .kkw-type-icon, .kkw-star-icon, .kkw-consent { transition: none; }
      .kkw-consent.kkw-pulse { animation: none; }
    }
  `;
}
