import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChain, TargetChainId } from "@/target-chain";
import { useNamespacedQueryWithOptionalParams } from "@obi-wallet/headless-ui";

export function useAddressQuery(chainId: TargetChainId) {
  const publicKey = usePublicKey();
  const targetChain = TargetChain.chainId(chainId);
  return useNamespacedQueryWithOptionalParams({
    query: targetChain.obiAccountAddressQuery,
    params: publicKey,
  });
}
