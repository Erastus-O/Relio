/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@relio/shared", "@relio/web-ui"],
  reactStrictMode: true,
};
export default nextConfig;
