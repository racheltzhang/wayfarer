/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    // Leaflet accesses `fs` at build time — tell webpack to ignore it
    config.resolve.fallback = { ...config.resolve.fallback, fs: false }
    return config
  },
}

export default nextConfig
