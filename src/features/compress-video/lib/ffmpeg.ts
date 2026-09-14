import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
  FFMPEG_CORE_PACKAGE,
  FFMPEG_CORE_VERSION,
  FFMPEG_MULTITHREAD_ENABLED,
  MAX_OUTPUT_VIDEO_SIZE,
} from '@/shared/config/compression';

const multithreadBaseUrl = `https://unpkg.com/${FFMPEG_CORE_PACKAGE}@${FFMPEG_CORE_VERSION}/dist/esm`;
const singleThreadBaseUrl = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

export async function loadFfmpeg(ffmpeg: FFmpeg): Promise<void> {
  if (ffmpeg.loaded) {
    return;
  }

  const isMultithreadAvailable =
    FFMPEG_MULTITHREAD_ENABLED &&
    typeof crossOriginIsolated !== 'undefined' &&
    crossOriginIsolated;

  const loadCore = async (baseUrl: string, multithread: boolean) => {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, 'application/wasm'),
      ...(multithread
        ? {
            workerURL: await toBlobURL(`${baseUrl}/ffmpeg-core.worker.js`, 'text/javascript'),
          }
        : {}),
    });
  };

  try {
    await loadCore(
      isMultithreadAvailable ? multithreadBaseUrl : singleThreadBaseUrl,
      isMultithreadAvailable,
    );
  } catch (error) {
    if (!isMultithreadAvailable) {
      throw error;
    }

    ffmpeg.terminate();
    await loadCore(singleThreadBaseUrl, false);
  }
}

export async function compressVideo(
  ffmpeg: FFmpeg,
  file: File,
  duration: number,
  signal: AbortSignal,
): Promise<Uint8Array> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `input.${extension}`;
  const totalBitrate = Math.floor((MAX_OUTPUT_VIDEO_SIZE * 8 * 0.9) / duration);
  const audioBitrate = 64_000;
  const baseVideoBitrate = Math.max(100_000, totalBitrate - audioBitrate);
  const bitrateFactors = [1, 0.8, 0.6];

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file), { signal });

    for (let attempt = 0; attempt < bitrateFactors.length; attempt += 1) {
      const outputName = `output-${attempt}.mp4`;
      const videoBitrate = Math.floor(baseVideoBitrate * bitrateFactors[attempt]);
      const exitCode = await ffmpeg.exec(
        [
          '-i',
          inputName,
          '-vf',
          "scale='min(1280,iw)':-2",
          '-c:v',
          'libx264',
          '-threads',
          '0',
          '-preset',
          'veryfast',
          '-b:v',
          `${videoBitrate}`,
          '-maxrate',
          `${videoBitrate}`,
          '-bufsize',
          `${videoBitrate * 2}`,
          '-c:a',
          'aac',
          '-b:a',
          `${audioBitrate}`,
          '-movflags',
          '+faststart',
          outputName,
        ],
        -1,
        { signal },
      );

      if (exitCode !== 0) {
        throw new Error('FFmpeg не смог обработать видео.');
      }

      const data = (await ffmpeg.readFile(outputName, 'binary', { signal })) as Uint8Array;
      await ffmpeg.deleteFile(outputName, { signal });

      if (data.byteLength <= MAX_OUTPUT_VIDEO_SIZE) {
        return data;
      }
    }

    throw new Error('Не удалось получить видео размером до 10 МБ. Попробуйте более короткий ролик.');
  } finally {
    await Promise.allSettled([ffmpeg.deleteFile(inputName, { signal })]);
  }
}
