// widget/src/serializer.test.ts
import { serializeArgs, redactString } from './serializer';

describe('serializeArgs', () => {
  it('serializes primitives', () => {
    expect(serializeArgs([42, true, 'hello'])).toBe('42 true hello');
  });

  it('serializes Error as stack', () => {
    const err = new Error('boom');
    const result = serializeArgs([err]);
    expect(result).toContain('boom');
  });

  it('handles circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    expect(() => serializeArgs([obj])).not.toThrow();
    expect(serializeArgs([obj])).toContain('[circular]');
  });

  it('truncates long strings to 2048 chars', () => {
    expect(serializeArgs(['x'.repeat(3000)]).length).toBeLessThanOrEqual(2048);
  });
});

describe('redactString', () => {
  it('redacts authorization header values', () => {
    const input = '{"authorization":"Bearer abc123","url":"ok"}';
    expect(redactString(input)).toContain('[redacted]');
    expect(redactString(input)).not.toContain('abc123');
  });

  it('redacts password fields', () => {
    const input = '{"password":"hunter2"}';
    expect(redactString(input)).toContain('[redacted]');
  });

  it('leaves non-sensitive fields alone', () => {
    const input = '{"url":"https://example.com","message":"hello"}';
    expect(redactString(input)).toBe(input);
  });
});
