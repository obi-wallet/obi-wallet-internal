import { SecretJsHomeChains } from "../home-chains/secret-js";

/** @deprecated */
export const SecretJsChainIds = {
  PULSAR_TESTNET: "pulsar-3",
  MAINNET: "secret-4",
} as const;

/** @deprecated */
export const SecretJsChains = SecretJsHomeChains;

/** @deprecated */
export type SecretJsChainId =
  (typeof SecretJsChainIds)[keyof typeof SecretJsChainIds];
