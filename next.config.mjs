/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs')

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'content.fantacalcio.it',
        port: '',
        pathname: '/web/campioncini/**',
      },
      {
        protocol: 'https',
        hostname: '6518wln9g69xjwcm.public.blob.vercel-storage.com',
        port: '',
        pathname: '/fotoprofili',
      },
      {
        protocol: 'https',
        hostname: '6518wln9g69xjwcm.public.blob.vercel-storage.com',
        port: '',
        pathname: '/voti',
      },
    ],
  },
  transpilePackages: ['@mui/x-charts'],
  /* distDir: 'dist',
  output: 'standalone' */
}

export default config
