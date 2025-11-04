import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**", 
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**", 
      },
      {
        protocol: "https",
        hostname: "iecedu.vn",
        pathname: "/**",  // cho phép mọi ảnh từ domain này
      },
      {
        protocol: "https",
        hostname: "oea-vietnam.com",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
};

export default nextConfig;
