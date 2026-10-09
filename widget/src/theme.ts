// widget/src/theme.ts
import { FeedbackConfig, FeedbackTheme, ThemeColors, ThemeMode } from './types';

/** Strip characters that could break out of a CSS declaration. */
export const sanitizeCss = (v: string): string => v.replace(/[{};'"\\<>]/g, '');

export function resolveMode(theme?: FeedbackTheme): ThemeMode {
  const m = theme?.mode;
  return m === 'dark' || m === 'auto' ? m : 'light';
}

/** Shallow-merge a theme, but merge the nested light/dark color objects too. */
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

  // Order inside each block: built-in palette → global accent → per-mode overrides.
  const light = `${LIGHT} ${accentRule} ${colorVars(t.light)}`;
  const dark = `${DARK} ${accentRule} ${colorVars(t.dark)}`;

  return `
    :where(.kkw-root) {
      --kkw-radius: ${radius}px;
      --kkw-radius-sm: ${Math.round(radius / 2)}px;
      --kkw-font: ${font};
      ${light}
    }
    :where(.kkw-root[data-kkw-mode="dark"]) { ${dark} }
    @media (prefers-color-scheme: dark) {
      :where(.kkw-root[data-kkw-mode="auto"]) { ${dark} }
    }

    .kkw-root, .kkw-root * { box-sizing: border-box; }

    .kkw-btn {
      position: fixed; z-index: 2147483000;
      ${vertical}: ${vOff}px; ${horizontal}: ${hOff}px;
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; cursor: pointer; margin: 0;
      font: 600 13px/1.2 var(--kkw-font);
      padding: 10px 16px; border-radius: var(--kkw-radius);
      box-shadow: var(--kkw-shadow);
    }
    .kkw-panel {
      position: fixed; z-index: 2147483001;
      ${vertical}: ${vOff + 48}px; ${horizontal}: ${hOff}px;
      width: 320px; max-width: calc(100vw - 32px);
      background: var(--kkw-bg); color: var(--kkw-text);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius);
      box-shadow: var(--kkw-shadow);
      padding: 20px; font: 13px/1.4 var(--kkw-font); text-align: left;
    }
    .kkw-title { display: block; font-size: 15px; font-weight: 600; color: var(--kkw-text); }
    .kkw-chips { display: flex; gap: 6px; margin: 12px 0; }
    .kkw-chip {
      padding: 5px 12px; margin: 0; cursor: pointer;
      font: 500 12px/1.2 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius-sm);
    }
    .kkw-chip.active { background: var(--kkw-accent); color: var(--kkw-accent-text); border-color: var(--kkw-accent); }
    .kkw-label { display: block; margin: 0 0 4px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-textarea, .kkw-input {
      display: block; width: 100%; margin: 0 0 12px; padding: 8px 10px;
      font: 13px/1.4 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius-sm);
    }
    .kkw-textarea { min-height: 88px; resize: vertical; }
    .kkw-textarea::placeholder, .kkw-input::placeholder { color: var(--kkw-muted); opacity: 1; }
    .kkw-textarea:focus, .kkw-input:focus { outline: none; border-color: var(--kkw-accent); }
    .kkw-submit {
      display: block; width: 100%; margin: 8px 0 0; padding: 9px; cursor: pointer;
      font: 600 13px/1.2 var(--kkw-font);
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; border-radius: var(--kkw-radius-sm);
    }
    .kkw-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .kkw-btn:focus-visible, .kkw-chip:focus-visible, .kkw-submit:focus-visible {
      outline: 2px solid var(--kkw-accent); outline-offset: 2px;
    }
    .kkw-msg { font-size: 12px; margin-top: 8px; min-height: 0; }
    .kkw-msg.kkw-ok { color: var(--kkw-success); }
    .kkw-msg.kkw-err { color: var(--kkw-error); }
    .kkw-privacy { font-size: 11px; color: var(--kkw-muted); margin: 10px 0 0; }
    .kkw-privacy a { color: var(--kkw-accent); }
  `;
}
