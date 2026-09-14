export const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogv', '.ogg'],
} as const;

export const MAX_INPUT_VIDEO_SIZE = 50 * 1024 * 1024;
export const MAX_OUTPUT_VIDEO_SIZE = 10 * 1024 * 1024;
export const FFMPEG_CORE_VERSION = '0.12.6';
export const FFMPEG_CORE_PACKAGE = '@ffmpeg/core-mt';
export const FFMPEG_MULTITHREAD_ENABLED = process.env.NEXT_PUBLIC_FFMPEG_MULTITHREAD === 'true';
