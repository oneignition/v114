/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Capacitor
  images: {
    unoptimized: true, // Required for static export
  },
  // Ensure paths are relative for Capacitor
  assetPrefix: './',
  trailingSlash: true,
  // Disable unnecessary features for mobile app
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
