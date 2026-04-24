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

    expect(validateUploadedDocument(validFile)).toBeNull();
    expect(validateUploadedDocument(invalidFile)).toContain('PDF');
  });
});
