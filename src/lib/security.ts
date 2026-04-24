import type { Citation } from './gemini';

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['http:', 'https:']);
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.webp'];

export const sanitizeExternalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const candidate = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);

    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol) || !parsed.hostname) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

export const sanitizeCitations = (citations: Citation[] = []) =>
  citations
    .map((citation) => {
      const uri = sanitizeExternalUrl(citation.uri);
      if (!uri) {
        return null;
      }

      return {
        title: citation.title.trim() || 'Source',
        uri,
      } satisfies Citation;
    })
    .filter((citation): citation is Citation => Boolean(citation));

export const validateUploadedDocument = (file: File) => {
  if (file.size > MAX_DOCUMENT_BYTES) {
    return 'Please choose a file smaller than 10 MB.';
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_DOCUMENT_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  const hasAllowedMimeType = !file.type || ALLOWED_DOCUMENT_MIME_TYPES.has(file.type);

  if (!hasAllowedExtension || !hasAllowedMimeType) {
    return 'Please choose a PDF, TXT, PNG, JPG, JPEG, or WEBP file.';
  }

  return null;
};

export const sanitizeDownloadFilename = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'download.txt';
};
