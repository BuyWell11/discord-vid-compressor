'use client';

import { DropzoneProps, useDropzone } from 'react-dropzone';
import styles from '../styles/dropzone.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function Dropzone(props: DropzoneProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [compressPercent, setCompressPercent] = useState(0);

  useEffect(() => {
    const load = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
        if (messageRef.current) messageRef.current.innerHTML = message;
      });
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
    };
    load();
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    setCompressPercent(0);
    const file = acceptedFiles[0];
    setIsCompressing(true);
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.mp4', await fetchFile(file));
    ffmpeg.on('progress', (event) => setCompressPercent(Math.round(event.progress * 100)));
    await ffmpeg.exec([
      '-f',
      'mp4', // Формат входного файла
      '-i',
      'input.mp4', // Входной файл
      '-s',
      '1280x720', // Установка размера видео
      '-vcodec',
      'libx264', // Кодек видео
      '-acodec',
      'aac', // Кодек аудио
      '-b:v',
      '500k', // Битрейт видео
      '-crf',
      '35', // CRF для управления качеством
      'output.mp4', // Имя выходного файла
    ]);
    const data = (await ffmpeg.readFile('output.mp4')) as any;
    const compressedVideoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    const a = document.createElement('a');
    a.href = compressedVideoUrl;
    a.download = 'compressed-video.mp4';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Освобождаем URL
    URL.revokeObjectURL(compressedVideoUrl);
    setIsCompressing(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    ...props,
    accept: { 'video/*': ['.mp4', '.ogv', '.webm'] },
    maxFiles: 1,
    maxSize: 52428800,
    multiple: false,
    onDrop: onDrop,
  });

  return loaded ? (
    <div className={styles.dropzone}>
      <div {...getRootProps()} className={styles.zone}>
        <input {...getInputProps()} />
        <p>Drag &#39;n&#39; drop video file here, or click to select</p>
      </div>
      {isCompressing && <h1>Compressing {compressPercent}%</h1>}
    </div>
  ) : (
    <h1>Load ffmpeg-core</h1>
  );
}
