import { ConsoleCapture } from './console-capture';

describe('ConsoleCapture', () => {
  let capture: ConsoleCapture;
  const origLog = console.log;
  const origError = console.error;

  beforeEach(() => {
    capture = new ConsoleCapture({ max: 5, maxBytes: 10_000, redact: false });
  });

  afterEach(() => {
    capture.restore();
    console.log = origLog;
    console.error = origError;
  });

  it('captures console.log entries', () => {
    capture.install();
    console.log('hello', 'world');
    const logs = capture.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('log');
    expect(logs[0].msg).toContain('hello');
  });

  it('respects max ring buffer size', () => {
    capture.install();
    for (let i = 0; i < 10; i++) console.log(`msg${i}`);
    expect(capture.getLogs().length).toBeLessThanOrEqual(5);
  });

  it('captures uncaught errors in errors array', () => {
    capture.install();
    const event = new ErrorEvent('error', {
      message: 'Oops',
      filename: 'app.js',
      lineno: 42,
    });
    window.dispatchEvent(event);
    expect(capture.getErrors()).toHaveLength(1);
    expect(capture.getErrors()[0].message).toBe('Oops');
  });
});
