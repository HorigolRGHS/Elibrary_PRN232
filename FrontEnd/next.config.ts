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
    ],
  },
};

export default nextConfig;
