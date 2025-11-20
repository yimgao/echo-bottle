/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['www.transparenttextures.com'],
    unoptimized: true, // Required for static export
  },
  // Use static export for Firebase Hosting
  // Change to 'standalone' if using Cloud Functions instead
  output: process.env.FIREBASE_HOSTING ? 'export' : 'standalone',
}

module.exports = nextConfig

