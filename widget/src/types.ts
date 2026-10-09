// widget/src/types.ts
export type ThemeMode = 'light' | 'dark' | 'auto';

/** Colors for one mode. Any key left out keeps the built-in default. */
export interface ThemeColors {
  background?: string;       // panel background
  fieldBackground?: string;  // inputs and unselected chips
  text?: string;             // main text
  mutedText?: string;        // labels, placeholders, privacy note
  border?: string;           // panel, input and chip borders
  accent?: string;           // overrides theme.accent in this mode only
  accentText?: string;       // overrides theme.accentText in this mode only
}

export interface FeedbackTheme {
  /** 'light' (default), 'dark', or 'auto' to follow the user's OS setting. */
  mode?: ThemeMode;
  /** Primary color: launcher button, active chip, submit button, focus ring. */
  accent?: string;
  /** Text color on top of the accent color. */
  accentText?: string;
  /** @deprecated Use accentText. Kept for backwards compatibility. */
  text?: string;
  /** Corner radius of the panel in px (inputs and buttons scale from it). */
  radius?: number;
  /** CSS font-family. Use 'inherit' to match the host page. */
  fontFamily?: string;
  /** Color overrides used in light mode (and in 'auto' when the OS is light). */
  light?: ThemeColors;
  /** Color overrides used in dark mode (and in 'auto' when the OS is dark). */
  dark?: ThemeColors;
}

export interface ConsoleEntry {
  t: number;
  level: string;
  msg: string;
}

export interface ErrorEntry {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
}

export interface FeedbackConfig {
  project: string;
  turnstileSiteKey: string;
  apiUrl?: string;      // base URL of the kudos-kit server; defaults to where kkw.js was loaded from
  privacyUrl?: string;  // privacy policy link shown in the panel; hidden if omitted
  user?: { id?: string; plan?: string };
  startHidden?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: { bottom?: number; right?: number; top?: number; left?: number };
  theme?: FeedbackTheme;
  console?: {
    enabled: boolean;
    max: number;
    maxBytes: number;
    redact: boolean;
    sendOn: Array<'bug' | 'idea' | 'other'>;
  };
}

export interface FeedbackPayload {
  project: string;
  type: string;
  message: string;
  email?: string;
  user?: { id?: string; plan?: string };
  context: {
    url: string;
    referrer: string;
    userAgent: string;
    viewport: { w: number; h: number };
    language: string;
    build?: string;
    ts: string;
  };
  console?: ConsoleEntry[];
  errors?: ErrorEntry[];
  hp: string;
  turnstileToken: string;
}
