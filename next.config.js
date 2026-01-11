/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.builder.io',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
