// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeCitations, sanitizeDownloadFilename, sanitizeExternalUrl, validateUploadedDocument } from './security';

describe('security helpers', () => {
  it('accepts safe external urls', () => {
    expect(sanitizeExternalUrl('https://example.com/path')).toBe('https://example.com/path');
    expect(sanitizeExternalUrl('www.example.com')).toBe('https://www.example.com/');
  });

  it('rejects unsafe urls', () => {
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl('')).toBeNull();
    expect(sanitizeExternalUrl('ftp://example.com/file.txt')).toBeNull();
  });

  it('drops citations with unsafe urls', () => {
    expect(
      sanitizeCitations([
        { title: 'Safe', uri: 'https://example.com' },
        { title: 'Unsafe', uri: 'javascript:alert(1)' },
      ]),
    ).toEqual([{ title: 'Safe', uri: 'https://example.com/' }]);
  });

  it('sanitizes download filenames', () => {
    expect(sanitizeDownloadFilename('Claim Check!!.txt')).toBe('claim-check-.txt');
    expect(sanitizeDownloadFilename('')).toBe('download.txt');
  });

  it('validates uploaded documents', () => {
    const validFile = new File(['hello'], 'notice.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['hello'], 'script.exe', { type: 'application/x-msdownload' });
    const oversizedFile = new File(['hello'], 'poster.pdf', { type: 'application/pdf' });

    Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 });

    expect(validateUploadedDocument(validFile)).toBeNull();
    expect(validateUploadedDocument(invalidFile)).toContain('PDF');
    expect(validateUploadedDocument(oversizedFile)).toContain('10 MB');
  });

  it('accepts empty mime types when the file extension is allowed', () => {
    const file = new File(['hello'], 'notice.txt', { type: '' });

    expect(validateUploadedDocument(file)).toBeNull();
  });
});
