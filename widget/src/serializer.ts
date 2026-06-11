// widget/src/serializer.ts
const REDACT_PATTERN = /authorization|bearer\s+|password|secret|api[_-]?key|token|set-cookie/i;

function safeStringify(value: unknown, depth = 0): string {
  if (depth > 4) return '[truncated]';
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value.slice(0, 2048);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Error) return value.stack ?? value.message;
  if (typeof Element !== 'undefined' && value instanceof Element) {
    return `<${value.tagName.toLowerCase()}>`;
  }
  if (typeof value === 'function') return '[Function]';
  if (Array.isArray(value)) {
    return '[' + value.slice(0, 20).map(v => safeStringify(v, depth + 1)).join(',') + ']';
  }
  if (typeof value === 'object') {
    const seen = new Set<unknown>();
    try {
      return JSON.stringify(value, (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[circular]';
          seen.add(val);
        }
        return val;
      });
    } catch {
      return '[unserializable]';
    }
  }
  return String(value);
}

export function serializeArgs(args: unknown[]): string {
  return args.map(a => safeStringify(a)).join(' ').slice(0, 2048);
}

export function redactString(value: string): string {
  return value.replace(
    /("(?:authorization|password|secret|api[_-]?key|token|set-cookie)":\s*)"([^"]*)"/gi,
    (_, key) => `${key}"[redacted]"`,
  );
}
