'use client';
import styles from '../styles/page.module.scss';
import VideoCompressor from '@/widgets/video-compressor/ui/VideoCompressor';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>DISCORD VIDEO COMPRESSOR</p>
        <h1>diskord video sjimalka 🐸</h1>
        <p className={styles.description}>Быстрая обработка прямо в браузере. Файлы никуда не отправляются.</p>
        <VideoCompressor />
      </main>
    </div>
  );
}
