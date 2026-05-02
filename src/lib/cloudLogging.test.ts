// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloudLog, type StructuredLogEntry } from './cloudLogging';

describe('Cloud Logging', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('emits structured INFO logs as JSON', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cloudLog.info('Test info message', { userId: 'u1' });

    expect(spy).toHaveBeenCalledOnce();
    const entry: StructuredLogEntry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry.severity).toBe('INFO');
    expect(entry.message).toBe('Test info message');
    expect(entry.component).toBe('elected-frontend');
    expect(entry.userId).toBe('u1');
    expect(entry.timestamp).toBeDefined();
  });

  it('emits structured WARNING logs', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    cloudLog.warn('Popup blocked', { code: 'auth/popup-blocked' });

    const entry: StructuredLogEntry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry.severity).toBe('WARNING');
    expect(entry.message).toBe('Popup blocked');
    expect(entry.code).toBe('auth/popup-blocked');
  });

  it('emits structured ERROR logs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    cloudLog.error('Something broke', { stack: 'line 42' });

    const entry: StructuredLogEntry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry.severity).toBe('ERROR');
    expect(entry.message).toBe('Something broke');
  });

  it('includes ISO timestamp in all log entries', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cloudLog.info('Timestamp check');

    const entry: StructuredLogEntry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(() => new Date(entry.timestamp)).not.toThrow();
    expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
  });

  it('works without extra metadata', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cloudLog.info('Bare message');

    const entry: StructuredLogEntry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry.message).toBe('Bare message');
    expect(entry.severity).toBe('INFO');
  });
});
