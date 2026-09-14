import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
  },
  async headers() {
    if (process.env.NEXT_PUBLIC_FFMPEG_MULTITHREAD !== 'true') {
      return [];
    }

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
