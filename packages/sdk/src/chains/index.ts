import { commonTwilioConfig } from "./common";
import { SecretJsChains, SecretJsChainId, SecretJsChainIds } from "./secret-js";

export * from "./secret-js";

/** @deprecated */
export type ChainId = SecretJsChainId;

/** @deprecated */
export const Chain = {
  select,
  information(chainId: SecretJsChainId) {
    return {
      ...SecretJsChains[chainId],
      ...commonTwilioConfig,
    };
  },
};

function select<T>({
  onSecretJsChain,
}: {
  onSecretJsChain(chain: (typeof SecretJsChains)[SecretJsChainId]): T;
}) {
  return onSecretJsChain(SecretJsChains[SecretJsChainIds.MAINNET]);
}
