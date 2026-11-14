import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["ssh2-sftp-client", "ssh2"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.steamstatic.com" },
      { protocol: "https", hostname: "steamcdn-a.akamaihd.net" },
    ],
  },
};
export default nextConfig;
