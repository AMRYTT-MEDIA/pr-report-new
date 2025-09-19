/** @type {import('next').NextConfig} */
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.ENV || "development"}`),
});

const nextConfig = {
  // Output configuration for deployment
  // output: "standalone",
  output: "standalone", // ✅ Important for Dokploy/Docker
  // reactStrictMode: true,
  // swcMinify: true,

  // images: {
  //   remotePatterns: [{ protocol: "https", hostname: "**" }],
  // }, 

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GPL_BACKEND_BASE_URL:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_GPL_BACKEND_BASE_URL_STAGING
        : process.env.NEXT_PUBLIC_GPL_BACKEND_BASE_URL,
    NEXT_PUBLIC_GPL_SOCKET_BASE_URL:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_GPL_SOCKET_BASE_URL_STAGING
        : process.env.NEXT_PUBLIC_GPL_SOCKET_BASE_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_STAGING_FIREBASE_API_KEY
        : process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_STAGING_FIREBASE_AUTH_DOMAIN
        : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_STAGING_FIREBASE_PROJECT_ID
        : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_STAGING_FIREBASE_STORAGE_BUCKET
        : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_STAGING_FIREBASE_MESSAGING_SENDER_ID
        : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID:
      process.env.ENV === "staging" || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_STAGING_FIREBASE_APP_ID
        : process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ENV: process.env.ENV, // Expose ENV explicitly to the client
  },
  // Webpack configuration for better file watching
  // webpack: (config, { dev, isServer }) => {
  //   // Add alias for better module resolution
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     "@": require("path").resolve(__dirname),
  //   };

  //   // Better file watching in development
  //   if (dev && !isServer) {
  //     config.watchOptions = {
  //       poll: 1000,
  //       aggregateTimeout: 300,
  //       ignored: /node_modules/,
  //     };
  //   }

  //   return config;
  // },
};

module.exports = nextConfig;
