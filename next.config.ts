import type { NextConfig } from 'next';
const nextConfig: NextConfig = { reactStrictMode: false }; // Avoid binding the one-time legacy controller twice in development.
export default nextConfig;
