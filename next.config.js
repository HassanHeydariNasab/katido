/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, context) => {
    config.resolve.alias.fs = "memfs";
    return config;
  },
};

module.exports = nextConfig;
