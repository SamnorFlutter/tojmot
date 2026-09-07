import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export: the game runs fully in the browser, which is also what Capacitor needs later.
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@tojmot/engine'],
  // For hosting under a subpath (e.g. GitHub Pages): BASE_PATH=tojmot npx next build
  basePath: process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : '',
};

export default nextConfig;
