/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `npm run export` builds static files for GitHub Pages, served under NEXT_PUBLIC_BASE_PATH.
  ...(process.env.STATIC_EXPORT ? { output: "export", trailingSlash: true } : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};
export default nextConfig;
