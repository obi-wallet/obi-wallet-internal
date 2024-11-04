import { TargetChain, TargetChainId } from "@/target-chain";
import { useNamespacedQueryWithOptionalParams } from "@obi-wallet/headless-ui";

import { usePublicKeys } from "./use-public-keys";

export function useAddressQuery(chainId: TargetChainId) {
  const publicKeys = usePublicKeys();
  const targetChain = TargetChain.chainId(chainId);
  return useNamespacedQueryWithOptionalParams({
    query: targetChain.obiAccountAddressQuery,
    params: publicKeys,
  });
}
