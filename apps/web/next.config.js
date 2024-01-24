/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: [
    "@obi-wallet/config",
    "@obi-wallet/headless-ui",
    "@obi-wallet/sdk",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};
