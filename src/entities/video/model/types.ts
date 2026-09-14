export type CompressionStatus = 'idle' | 'loading' | 'compressing' | 'success' | 'error';

export interface CompressedVideo {
  blob: Blob;
  fileName: string;
  originalFileName: string;
}
