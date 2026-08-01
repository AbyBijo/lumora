/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'pdfjs-dist'],
  },
  eslint: {
    // Lint runs separately; keep builds fast and deterministic.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
