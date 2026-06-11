// widget/src/types.ts
export interface FeedbackTheme {
  accent: string;
  text: string;
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
    sendOn: string[];
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
