/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_FAST_TRAVEL_API_URL: process.env.FAST_TRAVEL_API_URL,
    NEXT_PUBLIC_PHONE_NUMBER_KEY_SECRET: process.env.PHONE_NUMBER_KEY_SECRET,
    NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
      process.env.PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
    NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
      process.env.PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
    NEXT_PUBLIC_ENV: process.env.VERCEL_ENV,
  },
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
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};
