/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 't3.storage.dev',
      },
      {
        protocol: 'https',
        hostname: '*.storage.tigris.dev',
      },
    ],
  },
  // Disable React Strict Mode to prevent double-mounting issues
  reactStrictMode: false,
  // Ensure proper handling of static assets
  poweredByHeader: false,
  // Configure webpack for better HMR support
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;