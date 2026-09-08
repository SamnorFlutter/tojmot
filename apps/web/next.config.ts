import type { NextConfig } from 'next';

const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : '';

const nextConfig: NextConfig = {
  // Static export: the game runs fully in the browser, which is also what Capacitor needs later.
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@tojmot/engine'],
  // For hosting under a subpath (e.g. GitHub Pages): BASE_PATH=tojmot npx next build
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
