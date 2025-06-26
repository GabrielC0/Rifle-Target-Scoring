/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Désactiver les warnings de modules en double
    config.stats = {
      ...config.stats,
      warningsFilter: [
        /multiple modules with names that only differ in casing/i,
        /There are multiple modules with names that only differ in casing/i,
      ],
    };

    return config;
  },
};

export default nextConfig;
