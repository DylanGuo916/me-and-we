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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nvjjvaz0vrgpc2nx.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
