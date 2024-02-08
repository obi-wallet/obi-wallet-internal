/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: [
    "@obi-wallet/config",
    "@obi-wallet/headless-ui",
    "@obi-wallet/mpc-ecdsa-wasm",
    "@obi-wallet/mpc-ecdsa-wasm-types",
    "@obi-wallet/sdk",
    "@obi-wallet/sdk-abstract-target-chain",
    "@obi-wallet/sdk-secp256k1",
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
