import type { Metadata } from 'next';
import { Geist_Mono, Schoolbell } from 'next/font/google';
import '../styles/globals.scss';

const schoolbell = Schoolbell({
  variable: '--schoolbell',
  subsets: ['latin'],
  weight: '400',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Video compressor',
  description: 'Сжатие видео для загрузки в Discord прямо в браузере',
  keywords: ['Discord', 'Video', 'Compress', 'Squeeze'],
  icons: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐸</text></svg>",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${schoolbell.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
