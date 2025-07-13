/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Disable webpack caching to prevent ENOENT cache file errors
    config.cache = false;
    
    // Exclude server-side libraries from the client-side bundle
    if (!isServer) {
      config.externals.push('bufferutil', 'utf-8-validate');
    }

    return config;
  },
};

module.exports = nextConfig;