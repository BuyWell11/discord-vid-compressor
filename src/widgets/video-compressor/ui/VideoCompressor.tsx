'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from '@/styles/dropzone.module.scss';
import { ACCEPTED_VIDEO_TYPES, MAX_INPUT_VIDEO_SIZE } from '@/shared/config/compression';
import { validateVideoFile } from '@/shared/lib/video/validate-video-file';
import { useVideoCompression } from '@/features/compress-video/model/use-video-compression';

export default function VideoCompressor() {
  const [validationError, setValidationError] = useState<string | null>(null);
  const { status, progress, error, result, compress, cancel } = useVideoCompression();
  const isBusy = status === 'loading' || status === 'compressing';

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;

      const fileError = validateVideoFile(file);
      setValidationError(fileError);
      if (!fileError) {
        void compress(file);
      }
    },
    [compress],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_VIDEO_TYPES,
    maxSize: MAX_INPUT_VIDEO_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: isBusy,
    onDrop,
    onDropRejected: () => setValidationError('Файл не прошёл проверку. Проверьте формат и размер видео.'),
  });

  useEffect(() => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    link.click();

    const timeoutId = window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return () => {
      window.clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
    };
  }, [result]);

  return (
    <section className={styles.compressor} aria-label="Сжатие видео">
      <div {...getRootProps()} className={`${styles.zone} ${isDragActive ? styles.active : ''}`}>
        <input {...getInputProps()} />
        <strong>{isDragActive ? 'Отпустите файл здесь' : 'Перетащите видео сюда'}</strong>
        <span>или нажмите, чтобы выбрать файл</span>
        <small>Исходник до 50 МБ · результат до 10 МБ</small>
      </div>

      {isBusy && (
        <div className={styles.progress} aria-live="polite">
          <div className={styles.progressHeader}>
            <span>{status === 'loading' ? 'Загрузка компрессора' : 'Сжатие видео'}</span>
            <span>{progress}%</span>
          </div>
          <progress value={progress} max="100" />
          <button type="button" onClick={cancel}>
            Отменить
          </button>
        </div>
      )}

      {(validationError || error) && (
        <p className={styles.error} role="alert">
          {validationError || error}
        </p>
      )}

      {status === 'success' && result && (
        <p className={styles.success} role="status">
          Видео сжато и скачивание началось: {result.fileName}
        </p>
      )}
    </section>
  );
}
