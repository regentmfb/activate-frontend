import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=*, display-capture=*, fullscreen=*'
          }
        ],
      },
    ];
  },
};

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false, // The user wants to test PWA
});

export default withPWA(nextConfig);
