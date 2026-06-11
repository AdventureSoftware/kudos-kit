import { ConsoleEntry, ErrorEntry } from './types';
import { serializeArgs, redactString } from './serializer';

interface CaptureConfig {
  max: number;
  maxBytes: number;
  redact: boolean;
}

export class ConsoleCapture {
  private logs: ConsoleEntry[] = [];
  private errors: ErrorEntry[] = [];
  private originals: Record<string, (...args: unknown[]) => void> = {};
  private errorHandler: ((e: ErrorEvent) => void) | null = null;
  private rejectionHandler: ((e: PromiseRejectionEvent) => void) | null = null;

  constructor(private config: CaptureConfig) {}

  install(): void {
    const levels = ['log', 'info', 'warn', 'error', 'debug'] as const;
    for (const level of levels) {
      this.originals[level] = console[level].bind(console);
      console[level] = (...args: unknown[]) => {
        this.originals[level](...args);
        this.push({ t: Date.now(), level, msg: this.serialize(args) });
      };
    }

    this.errorHandler = (e: ErrorEvent) => {
      this.errors.push({
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        stack: (e.error as Error | null)?.stack,
      });
    };
    this.rejectionHandler = (e: PromiseRejectionEvent) => {
      const reason = e.reason as Error | string | null;
      this.errors.push({
        message: reason instanceof Error ? reason.message : String(reason ?? 'Unhandled rejection'),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    };

    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

  restore(): void {
    for (const [level, fn] of Object.entries(this.originals)) {
      (console as unknown as Record<string, unknown>)[level] = fn;
    }
    if (this.errorHandler) window.removeEventListener('error', this.errorHandler);
    if (this.rejectionHandler) window.removeEventListener('unhandledrejection', this.rejectionHandler);
    this.originals = {};
  }

  getLogs(): ConsoleEntry[] {
    return [...this.logs];
  }

  getErrors(): ErrorEntry[] {
    return [...this.errors];
  }

  clear(): void {
    this.logs = [];
    this.errors = [];
  }

  private push(entry: ConsoleEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.config.max) this.logs.shift();
    this.enforceBytesCap();
  }

  private enforceBytesCap(): void {
    let total = this.logs.reduce((sum, e) => sum + e.msg.length, 0);
    while (total > this.config.maxBytes && this.logs.length > 0) {
      const removed = this.logs.shift()!;
      total -= removed.msg.length;
    }
  }

  private serialize(args: unknown[]): string {
    const raw = serializeArgs(args);
    return this.config.redact ? redactString(raw) : raw;
  }
}
