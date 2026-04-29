/** @type {import('next').NextConfig} */

const repoName = 'canvas';
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  output: 'export',        // REQUIRED for GitHub Pages
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`

}

export default nextConfig
