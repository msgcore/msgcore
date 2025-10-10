export interface MessageAttachment {
  id: string;
  messageId: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  filename?: string;
  size?: number; // bytes
  mimeType?: string;
}

/**
 * Platform attachment data (before database storage)
 * Each platform provider extracts attachments into this format
 */
export interface PlatformAttachment {
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
}
