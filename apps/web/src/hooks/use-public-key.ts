import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { useQuery } from "@obi-wallet/headless-ui";
import { makeNamespacedQueryParamsOptional } from "@obi-wallet/query-client";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";

export function useSecp256k1PublicKeyQuery() {
  const { wallet, homeChain } = useWalletAndHomeChain();
  const query = makeNamespacedQueryParamsOptional(
    homeChain.secp256k1PublicKeyQuery,
  );
  return useQuery(query(wallet ?? undefined));
}

export function useEd25519PublicKeyQuery() {
  const { wallet, homeChain } = useWalletAndHomeChain();
  const query = makeNamespacedQueryParamsOptional(
    homeChain.ed25519PublicKeyQuery,
  );
  return useQuery(query(wallet ?? undefined));
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
