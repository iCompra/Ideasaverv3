/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified config for WebContainer compatibility
  experimental: {
    esmExternals: 'loose'
  },
  transpilePackages: ['@supabase/supabase-js', '@supabase/ssr'],
  webpack: (config, { isServer }) => {
    // Disable webpack caching for WebContainer stability
    config.cache = false;
    
    // Add WebContainer-specific configurations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;