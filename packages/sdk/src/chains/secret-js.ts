import {
  SecretJsHomeChainId,
  SecretJsHomeChains,
} from "../home-chains/secret-js";

/** @deprecated */
export const SecretJsChainIds = {
  PULSAR_TESTNET: SecretJsHomeChainId.PULSAR_TESTNET,
  MAINNET: SecretJsHomeChainId.MAINNET,
} as const;

/** @deprecated */
export const SecretJsChains = SecretJsHomeChains;

/** @deprecated */
export type SecretJsChainId = SecretJsHomeChainId;
