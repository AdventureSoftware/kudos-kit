
export type ThemeMode = 'light' | 'dark' | 'auto';


export type FeedbackKind = 'bug' | 'idea' | 'praise' | 'other';


export interface ThemeColors {
  background?: string;
  fieldBackground?: string;
  text?: string;
  mutedText?: string;
  border?: string;
  accent?: string;
  accentText?: string;
}

export interface FeedbackTheme {
  mode?: ThemeMode;
  accent?: string;
  accentText?: string;
  text?: string;
  radius?: number;
  fontFamily?: string;
  light?: ThemeColors;
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
  apiUrl?: string;
  privacyUrl?: string;
  appName?: string;
  branding?: boolean;
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
    sendOn: FeedbackKind[];
  };
}

export interface FeedbackPayload {
  project: string;
  type: FeedbackKind;
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
  rating?: number;
  testimonialOk?: boolean;
  testimonialName?: string;
  hp: string;
  turnstileToken: string;
}
