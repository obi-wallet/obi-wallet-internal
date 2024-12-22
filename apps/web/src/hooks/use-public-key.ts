import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { useQuery } from "@obi-wallet/headless-ui";
import { makeNamespacedQueryParamsOptional } from "@obi-wallet/query-client";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";

export function useSecp256k1PublicKeyQueryOptions() {
  const { wallet, homeChain } = useWalletAndHomeChain();
  const query = makeNamespacedQueryParamsOptional(
    homeChain.secp256k1PublicKeyQuery,
  );
  return query(wallet?.userEntryAddress ?? undefined);
}

export function useSecp256k1PublicKeyQuery() {
  const query = useSecp256k1PublicKeyQueryOptions();
  return useQuery(query);
}

export function useEd25519PublicKeyQueryOptions() {
  const { wallet, homeChain } = useWalletAndHomeChain();
  const query = makeNamespacedQueryParamsOptional(
    homeChain.ed25519PublicKeyQuery,
  );
  return query(wallet?.userEntryAddress ?? undefined);
}

export function useEd25519PublicKeyQuery() {
  const query = useEd25519PublicKeyQueryOptions();
  return useQuery(query);
}

function useWalletAndHomeChain() {
  const wallet = useCurrentWallet();
  return {
    wallet,
    homeChain: HomeChain.chainId(
      wallet?.homeChainId ?? SecretJsHomeChainId.MAINNET,
    ),
  };
}
