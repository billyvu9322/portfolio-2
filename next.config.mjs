/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  distDir: 'build',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
