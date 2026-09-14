export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.remove();
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Не удалось определить длительность видео.'));
        return;
      }

      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Не удалось прочитать видео.'));
    };
    video.src = url;
  });
}
