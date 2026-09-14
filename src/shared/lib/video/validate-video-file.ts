import { MAX_INPUT_VIDEO_SIZE } from '@/shared/config/compression';

const allowedExtensions = new Set(['.mp4', '.webm', '.ogv', '.ogg']);

export function validateVideoFile(file: File): string | null {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;

  if (!allowedExtensions.has(extension) || (file.type && !file.type.startsWith('video/'))) {
    return 'Поддерживаются видео в форматах MP4, WebM и OGV.';
  }

  if (file.size > MAX_INPUT_VIDEO_SIZE) {
    return 'Размер исходного видео не должен превышать 50 МБ.';
  }

  return null;
}
