/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fixly/core', '@fixly/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
