import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React Strict Mode 활성화
  reactStrictMode: true,

  // 실험적 기능 설정
  experimental: {
    // Server Actions 비활성화 (현재 사용하지 않음)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 보안 헤더 설정 (Firebase 팝업 로그인 경고 해결)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
