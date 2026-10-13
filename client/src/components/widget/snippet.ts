import type { WidgetSettings } from './types';

export const DEFAULT_POSITION = 'bottom-right';
export const CONSOLE_CAPTURE = { enabled: true, max: 150, maxBytes: 50000, redact: true, sendOn: ['bug'] };

/** The options passed to Feedback.init(), as used both by the live preview and the snippet. */
export function widgetConfig(s: WidgetSettings, origin: string, turnstileSiteKey: string) {
  return {
    project: s.project,
    turnstileSiteKey,
    privacyUrl: `${origin}/privacy`,
    ...(s.position !== DEFAULT_POSITION ? { position: s.position } : {}),
    theme: { mode: s.mode, accent: s.accent, radius: s.radius },
    console: CONSOLE_CAPTURE,
  };
}

/** HTML to paste before </body> on the site. */
export function installSnippet(s: WidgetSettings, origin: string, turnstileSiteKey: string): string {
  const config = JSON.stringify(widgetConfig(s, origin, turnstileSiteKey), null, 2)
    .replace(/"([a-zA-Z]+)":/g, '$1:') // plain keys read more like hand-written JavaScript
    .replace(/"/g, "'")
    .replace(/\[\s+([^\[\]{}]*?)\s+\]/g, (_, items: string) => `[${items.replace(/\s+/g, ' ')}]`) // short lists on one line
    .split('\n')
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join('\n')
    .replace(/\n  }$/, `,\n    // user: { id: currentUser.id, plan: currentUser.plan }, // optional: who sent it\n  }`);
  return `<script src="${origin}/kkw.js"></script>\n<script>\n  Feedback.init(${config});\n</script>`;
}
