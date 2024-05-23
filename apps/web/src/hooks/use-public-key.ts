import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { useQuery } from "@obi-wallet/headless-ui";
import { makeNamespacedQueryParamsOptional } from "@obi-wallet/query-client";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";

export function usePublicKeyQuery() {
  const wallet = useCurrentWallet({});
  const query = makeNamespacedQueryParamsOptional(
    HomeChain.chainId(wallet?.homeChainId ?? SecretJsHomeChainId.MAINNET)
      .publicKeyQuery,
  );
  return useQuery(query(wallet?.userEntryAddress));
}

export function usePublicKey() {
  return usePublicKeyQuery().data;
}
