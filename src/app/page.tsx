'use client';
import styles from '../styles/page.module.scss';
import Dropzone from '@/app/Dropzone';
import NoSSRWrapper from '@/app/NoSSRWrapper';

export default function Home() {
  return (
    <NoSSRWrapper>
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>diskord video sjimalka 🐸</h1>
          <Dropzone />
        </main>
      </div>
    </NoSSRWrapper>
  );
}
