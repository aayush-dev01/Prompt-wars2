import { describe, expect, it } from 'vitest';
import { sanitizeCitations, sanitizeExternalUrl, validateUploadedDocument } from './security';

describe('Security Utility Additions', () => {
  describe('sanitizeExternalUrl', () => {
    it('returns null for empty strings', () => {
      expect(sanitizeExternalUrl('')).toBeNull();
      expect(sanitizeExternalUrl('   ')).toBeNull();
    });

    it('returns null for unallowed explicit schemes like ftp:// or file://', () => {
      expect(sanitizeExternalUrl('ftp://example.com')).toBeNull();
      expect(sanitizeExternalUrl('file:///etc/passwd')).toBeNull();
      expect(sanitizeExternalUrl('javascript:alert(1)')).toBeNull();
    });

    it('returns null for invalid URLs that throw in URL constructor', () => {
      // Something that can't be parsed even with https:// prepended
      expect(sanitizeExternalUrl('http://%')).toBeNull();
    });
  });

  describe('sanitizeCitations', () => {
    it('filters out citations with invalid URIs', () => {
      const citations = [
        { title: 'Valid', uri: 'https://example.com' },
        { title: 'Invalid', uri: 'javascript:alert(1)' }
      ];
      const result = sanitizeCitations(citations);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Valid');
    });
  });

  describe('validateUploadedDocument', () => {
    it('rejects files larger than 10MB', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
      
      const error = validateUploadedDocument(file);
      expect(error).toBe('Please choose a file smaller than 10 MB.');
    });
    
    it('rejects files with allowed extension but wrong mime type', () => {
      // In many implementations, type can be empty. If it has a type, it must be allowed.
      const file = new File([''], 'test.pdf', { type: 'application/x-msdownload' });
      const error = validateUploadedDocument(file);
      expect(error).toBe('Please choose a PDF, TXT, PNG, JPG, JPEG, or WEBP file.');
    });
  });
});
