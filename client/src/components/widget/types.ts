/** What the Widget page lets you change. Mirrors the widget's own options (widget/src/types.ts). */
export type WidgetMode = 'auto' | 'light' | 'dark';
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface WidgetProject {
  key: string;
  name: string;
  prefix: string;
}

export interface WidgetSettings {
  project: string;
  mode: WidgetMode;
  accent: string;
  radius: number;
  position: WidgetPosition;
}

/** The global the widget script defines (only the parts this page uses). */
export interface FeedbackGlobal {
  init(config: Record<string, unknown>): void;
  destroy(): void;
  show(): void;
  setTheme(theme: Record<string, unknown>): void;
}

declare global {
  interface Window {
    Feedback?: FeedbackGlobal;
  }
}
