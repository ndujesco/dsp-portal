/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",           // fully static -> host anywhere (Vercel, Netlify, GitHub Pages)
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
