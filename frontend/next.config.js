/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is default in Next.js 15, no config needed
  // Server Actions are default in Next.js 15, no config needed

  // typedRoutes moved out of experimental in Next.js 15
  typedRoutes: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
