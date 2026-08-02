/**
 * attachmentNormalizer.js
 *
 * Production-grade Attachment Normalizer for samGPT.
 * Standardizes raw DOM Files, Electron drag-drop objects, and clipboard blobs
 * into a clean, uniform Attachment Data Model.
 */

export function getExtension(filename = '') {
  if (!filename.includes('.')) return '';
  return filename.split('.').pop().toLowerCase();
}

export function getMimeFromExtension(ext = '') {
  const mimeMap = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip',
  };
  return mimeMap[ext.toLowerCase()] || 'application/octet-stream';
}

export function normalizeAttachment(file) {
  if (!file) return null;

  const name = file.name || 'unnamed_file';
  const extension = getExtension(name);

  let mimeType = file.type || file.mimeType || '';
  if (!mimeType) {
    mimeType = getMimeFromExtension(extension);
  }

  const isImage =
    mimeType.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension);

  let previewURL = null;
  if (isImage && typeof window !== 'undefined' && file instanceof File) {
    try {
      previewURL = URL.createObjectURL(file);
    } catch (e) {
      console.warn('Failed to create ObjectURL for image preview:', e);
    }
  }

  return {
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name,
    mimeType,
    size: file.size || 0,
    extension,
    lastModified: file.lastModified || Date.now(),
    path: file.path || '',
    previewURL,
    rawFile: file instanceof File ? file : null,
  };
}
