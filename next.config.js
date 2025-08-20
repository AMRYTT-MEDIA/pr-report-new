/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // static HTML export - commented out for now
  // trailingSlash: true, // better for Apache hosting - commented out for now

  // Webpack configuration for better file watching
  webpack: (config, { dev, isServer }) => {
    // Add alias for better module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname),
    };

    // Better file watching in development
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

    return config;
  },

  images: {
    domains: ["via.placeholder.com", "localhost"],
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
