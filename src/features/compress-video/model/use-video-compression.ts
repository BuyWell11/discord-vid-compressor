'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { CompressedVideo, CompressionStatus } from '@/entities/video/model/types';
import { compressVideo, loadFfmpeg } from '@/features/compress-video/lib/ffmpeg';
import { getVideoDuration } from '@/shared/lib/video/get-video-duration';

interface UseVideoCompressionResult {
  status: CompressionStatus;
  progress: number;
  error: string | null;
  result: CompressedVideo | null;
  compress: (file: File) => Promise<void>;
  cancel: () => void;
}

export function useVideoCompression(): UseVideoCompressionResult {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<CompressionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressedVideo | null>(null);

  const compress = useCallback(async (file: File) => {
    if (abortControllerRef.current) {
      return;
    }

    const ffmpeg = ffmpegRef.current ?? new FFmpeg();
    ffmpegRef.current = ffmpeg;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const onProgress = ({ progress: value }: { progress: number }) => {
      setProgress(Math.min(100, Math.max(0, Math.round(value * 100))));
    };

    setStatus('loading');
    setProgress(0);
    setError(null);
    setResult(null);
    ffmpeg.on('progress', onProgress);

    try {
      await loadFfmpeg(ffmpeg);
      setStatus('compressing');
      const duration = await getVideoDuration(file);
      const data = await compressVideo(ffmpeg, file, duration, abortController.signal);
      setResult({
        blob: new Blob([data], { type: 'video/mp4' }),
        fileName: `${file.name.replace(/\.[^/.]+$/, '')}-compressed.mp4`,
        originalFileName: file.name,
      });
      setProgress(100);
      setStatus('success');
    } catch (compressionError) {
      if ((compressionError as Error).name !== 'AbortError') {
        setError(compressionError instanceof Error ? compressionError.message : 'Не удалось сжать видео.');
        setStatus('error');
      }
    } finally {
      ffmpeg.off('progress', onProgress);
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    ffmpegRef.current?.terminate();
    ffmpegRef.current = null;
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  useEffect(() => cancel, [cancel]);

  return { status, progress, error, result, compress, cancel };
}
