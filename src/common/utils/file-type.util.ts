/**
 * Platform-agnostic file type detection utility
 */
export class FileTypeUtil {
  /**
   * Detect file type from MIME type and filename
   */
  static detectFileType(
    mimeType?: string | null,
    filename?: string | null,
  ): 'image' | 'video' | 'audio' | 'document' | 'other' {
    if (mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      if (
        mimeType.startsWith('application/pdf') ||
        mimeType.startsWith('application/msword') ||
        mimeType.startsWith('application/vnd.openxmlformats-officedocument') ||
        mimeType.startsWith('text/')
      ) {
        return 'document';
      }
    }

    // Fallback to extension detection
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) {
        return 'image';
      }
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
        return 'video';
      }
      if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || '')) {
        return 'audio';
      }
      if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext || '')) {
        return 'document';
      }
    }

    return 'other';
  }
}
